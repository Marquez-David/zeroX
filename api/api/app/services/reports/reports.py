import difflib
import flask  # type: ignore
import typing
from datetime import datetime
from http import HTTPStatus
import pandas as pd  # type: ignore

from flask_jwt_extended import current_user  # type: ignore
from sqlalchemy import func  # type: ignore
from werkzeug.datastructures import FileStorage  # type: ignore

from app import models
from app.db import DB
from app.utils import (
    apply_cursor_pagination,
    is_inter_account_transfer,
    normalize_concept,
)


def retrieve_reports(
    cursor: typing.Optional[str], limit: int, year: typing.Optional[int]
) -> flask.make_response:
    """
    Retrieve a page of user reports from the database, ordered most-recent-first.

    Args:
        cursor (Optional[str]): The opaque cursor for the next page (None = first page).
        limit (int): The page size.
        year (Optional[int]): Restrict to reports dated in the given year.

    Returns:
        A Flask response object containing a page of reports plus next_cursor.
    """
    query = models.Report.query.filter_by(user_id=current_user.id)
    totals_query = models.Report.query.filter_by(user_id=current_user.id)

    if year is not None:
        # Explicit half-open range so the (user_id, date) index is used;
        year_filter = (
            models.Report.date >= datetime(year, 1, 1),
            models.Report.date < datetime(year + 1, 1, 1),
        )
        query = query.filter(*year_filter)
        totals_query = totals_query.filter(*year_filter)

    income_total, expenses_total = totals_query.with_entities(
        func.coalesce(func.sum(models.Report.income), 0),
        func.coalesce(func.sum(models.Report.expenses), 0),
    ).one()

    try:
        reports, next_cursor = apply_cursor_pagination(
            query, models.Report, cursor, limit
        )
    except ValueError:
        return flask.make_response({"msg": "Invalid cursor."}, HTTPStatus.BAD_REQUEST)

    return flask.make_response(
        {
            "msg": "OK",
            "reports": [
                {
                    "uuid": report.uuid,
                    "date": report.date,
                    "balance": report.balance,
                    "income": report.income,
                    "expenses": report.expenses,
                    "operations_count": len(report.operations),
                }
                for report in reports
            ],
            "next_cursor": next_cursor,
            "totals": {
                "balance": round(income_total - expenses_total, 2),
                "income": income_total,
                "expenses": expenses_total,
            },
        },
        HTTPStatus.OK,
    )


def retrieve_report(
    uuid: str, cursor: typing.Optional[str], limit: int
) -> flask.make_response:
    """
    Retrieve a single user report and a page of its operations.

    Args:
        uuid (str): The UUID of the report to retrieve.
        cursor (Optional[str]): The opaque cursor for the next page of operations.
        limit (int): The page size for operations.

    Returns:
        A Flask response object containing the report metadata, a page of operations,
        and next_cursor.
    """
    report = models.Report.query.filter_by(user_id=current_user.id, uuid=uuid).first()
    if not report:
        return flask.make_response({"msg": "Invalid report."}, HTTPStatus.NOT_FOUND)

    query = models.Operation.query.filter_by(report_id=report.id)

    try:
        operations, next_cursor = apply_cursor_pagination(
            query, models.Operation, cursor, limit
        )
    except ValueError:
        return flask.make_response({"msg": "Invalid cursor."}, HTTPStatus.BAD_REQUEST)

    return flask.make_response(
        {
            "msg": "OK",
            "report": {
                "uuid": report.uuid,
                "date": report.date,
                "balance": report.balance,
                "income": report.income,
                "expenses": report.expenses,
            },
            "operations": [
                {
                    "uuid": operation.uuid,
                    "amount": operation.amount,
                    "date": operation.date,
                    "concept": operation.concept,
                    "category": {
                        "uuid": operation.category.uuid,
                        "name": operation.category.name,
                    },
                }
                for operation in operations
            ],
            "next_cursor": next_cursor,
        },
        HTTPStatus.OK,
    )


def upload_report(file: FileStorage) -> flask.make_response:
    """
    Upload and process a user report file.

    Args:
        file (FileStorage): The uploaded report file.

    Returns:
        A Flask response object indicating the result of the upload.
    """
    if (df := parse_report(file)) is None:
        return flask.make_response({"msg": "Invalid file."}, HTTPStatus.BAD_REQUEST)

    try:
        # Group operations by year and month
        operations_by_month = df.groupby(df["Fecha"].dt.to_period("M"))

        # Create a report for each month
        for date, operations in operations_by_month:
            report = _create_report(date, operations)
            _create_operation(report, operations)

        DB.session.commit()

    except Exception:
        DB.session.rollback()
        return flask.make_response({"msg": "Error in file."}, HTTPStatus.BAD_REQUEST)

    return flask.make_response({"msg": "Report upload successfully."}, HTTPStatus.OK)


def parse_report(file: FileStorage) -> typing.Optional[pd.DataFrame]:
    """
    Parse an uploaded Excel file into a normalized DataFrame. Detects the file format from the first cell and delegates to the appropriate parser.

    Args:
        file (FileStorage): The uploaded report file.

    Returns:
        Optional[DataFrame]: The parsed DataFrame, or None if parsing failed.
    """
    if not file or not file.filename:
        return None

    if not file.filename.endswith(".csv"):
        return None

    try:
        # sep=None + engine='python' lets pandas sniff the delimiter automatically,
        # which handles both the semicolon-separated ledger and comma-separated statement.
        raw = pd.read_csv(
            file, header=None, sep=None, engine="python", encoding="utf-8-sig"
        )
        if raw.empty:
            return None

        first_cell = str(raw.iloc[0, 0]).strip()

        if first_cell == "Titular":
            return _parse_account_ledger(raw)
        elif first_cell == "Tipo":
            return _parse_transaction_statement(raw)
        elif first_cell == "Fecha" and "Id. de transacción" in raw.iloc[0].tolist():
            return _parse_paypal(raw)
        else:
            return None

    except Exception:
        return None


def _parse_account_ledger(raw: pd.DataFrame) -> typing.Optional[pd.DataFrame]:
    """
    Parse a semicolon-separated account ledger CSV.

    Args:
        raw (DataFrame): The raw DataFrame read from the CSV file.

    Returns:
        Optional[DataFrame]: The parsed DataFrame with columns [Concepto, Fecha, Importe], or None if parsing failed.
    """
    try:
        df = raw.iloc[3:].copy()
        df.columns = raw.iloc[2].tolist()
        df = df[["Concepto", "Fecha", "Importe"]].reset_index(drop=True)
        df = df.replace(r"^\s*$", pd.NA, regex=True).dropna(how="all")

        df["Fecha"] = pd.to_datetime(df["Fecha"], format="%d/%m/%Y")
        df["Concepto"] = df["Concepto"].astype(str).str.strip()
        df["Importe"] = pd.to_numeric(df["Importe"]).round(2)

        return df
    except Exception:
        return None


def _parse_transaction_statement(raw: pd.DataFrame) -> typing.Optional[pd.DataFrame]:
    """
    Parse a comma-separated transaction statement CSV.

    Args:
        raw (DataFrame): The raw DataFrame read from the CSV file.

    Returns:
        Optional[DataFrame]: The parsed DataFrame with columns [Concepto, Fecha, Importe], or None if parsing failed.
    """
    try:
        df = raw.iloc[1:].copy()
        df.columns = raw.iloc[0].tolist()
        df = df.reset_index(drop=True)

        desc_col = next(c for c in df.columns if str(c).startswith("Descripci"))
        fecha_col = next(c for c in df.columns if str(c).startswith("Fecha de inicio"))
        df = df.rename(columns={fecha_col: "Fecha", desc_col: "Concepto"})
        df = df[["Concepto", "Fecha", "Importe"]].copy()
        df = df.replace(r"^\s*$", pd.NA, regex=True).dropna(how="all")

        df["Fecha"] = pd.to_datetime(df["Fecha"])
        df["Concepto"] = df["Concepto"].astype(str).str.strip()
        df["Importe"] = pd.to_numeric(df["Importe"]).round(2)

        return df
    except Exception:
        return None


def _parse_paypal(raw: pd.DataFrame) -> typing.Optional[pd.DataFrame]:
    """
    Parse a PayPal activity CSV export.

    Args:
        raw (DataFrame): The raw DataFrame read from the CSV file.

    Returns:
        Optional[DataFrame]: The parsed DataFrame with columns [Concepto, Fecha, Importe], or None if parsing failed.
    """
    try:
        df = raw.iloc[1:].copy()
        df.columns = raw.iloc[0].tolist()
        df = df.reset_index(drop=True)

        fx_mask = (
            df["Tipo"].astype(str).str.contains("Conversión de divisas", na=False)
            & (df["Repercusiones en el saldo"] == "Cargo")
            & (df["Divisa"] == "EUR")
        )
        fx_map = dict(
            zip(
                df.loc[fx_mask, "Id. de referencia de trans."],
                df.loc[fx_mask, "Bruto"],
            )
        )

        nombre_present = df["Nombre"].notna() & (
            df["Nombre"].astype(str).str.strip() != ""
        )
        cargo_df = df[(df["Repercusiones en el saldo"] == "Cargo") & nombre_present]

        rows = []
        for _, row in cargo_df.iterrows():
            if row["Divisa"] == "EUR":
                bruto_str = row["Bruto"]
            else:
                tx_id = row["Id. de transacción"]
                if tx_id not in fx_map:
                    continue
                bruto_str = fx_map[tx_id]

            amount = round(
                float(str(bruto_str).strip().replace(".", "").replace(",", ".")), 2
            )
            fecha = datetime.strptime(
                f"{row['Fecha']} {row['Hora']}", "%d/%m/%Y %H:%M:%S"
            )
            concept = str(row["Nombre"]).strip()[:128]
            rows.append({"Concepto": concept, "Fecha": fecha, "Importe": amount})

        if not rows:
            return None

        return pd.DataFrame(rows)

    except Exception:
        return None


def _create_report(date: pd.Period, operations_df: pd.DataFrame) -> models.Report:
    """
    Create or retrieve a report for a given month and year.

    Args:
        date (Period): The year and month for the report.
        operations_df (DataFrame): The DataFrame containing operations for the month.

    Returns:
        models.Report: The created or retrieved report.
    """
    month_start = date.to_timestamp(how="start").to_pydatetime()
    next_month_start = (date + 1).to_timestamp(how="start").to_pydatetime()

    report = models.Report.query.filter(
        models.Report.user_id == current_user.id,
        models.Report.date >= month_start,
        models.Report.date < next_month_start,
    ).first()

    if not report:
        amounts = operations_df["Importe"]
        report = models.Report(
            income=float(round(amounts[amounts > 0].sum(), 2)),
            expenses=float(round(-amounts[amounts < 0].sum(), 2)),
            date=pd.to_datetime(operations_df["Fecha"].max()),
        )
        DB.session.add(report)
        DB.session.flush()

    return report


def _resolve_category(concept: str, history: dict, otros_id: int) -> int:
    """
    Resolve a category ID for a given operation concept using the user's history of categorized operations.

    Args:
        concept (str): The operation concept to categorize.
        history (dict): A mapping of normalized past concepts to category IDs.
        otros_id (int): The category ID for "Otros".

    Returns:
        int: The resolved category ID.
    """
    if not concept:
        return otros_id

    c_norm = normalize_concept(concept)

    if c_norm in history:
        return history[c_norm]

    best_ratio = 0.0
    best_cat_id = otros_id
    for h_norm, h_cat_id in history.items():
        ratio = difflib.SequenceMatcher(None, c_norm, h_norm).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_cat_id = h_cat_id

    return best_cat_id if best_ratio >= 0.75 else otros_id


def _create_operation(report: models.Report, operations_df: pd.DataFrame) -> None:
    """
    Create operations for a given report and recompute the report's aggregates.

    Args:
        report (models.Report): The report to attach the operations to.
        operations_df (DataFrame): The DataFrame containing operations for the report.
    """
    otros = models.Category.query.filter_by(name="Otros").first()
    if not otros:
        otros = models.Category.query.first()

    if not otros:
        raise RuntimeError("No categories seeded in database.")

    otros_id = otros.id

    history_rows = (
        models.Operation.query.join(
            models.Report, models.Report.id == models.Operation.report_id
        )
        .filter(
            models.Report.user_id == current_user.id,
            models.Operation.category_id != otros_id,
            models.Operation.concept.isnot(None),
        )
        .order_by(models.Operation.date.asc())  # asc: newest row overwrites in dict
        .with_entities(models.Operation.concept, models.Operation.category_id)
        .all()
    )
    history = {
        normalize_concept(row.concept): row.category_id
        for row in history_rows
        if row.concept
    }

    existing_ops = set()
    operations = models.Operation.query.filter_by(report_id=report.id).all()
    for operation in operations:
        existing_ops.add((operation.date, operation.concept, operation.amount))

    for _, row in operations_df.iterrows():
        date = pd.to_datetime(row["Fecha"]).to_pydatetime()
        concept = row["Concepto"].strip()
        amount = float(row["Importe"])

        if is_inter_account_transfer(concept):
            # Skip operation creation for inter-account transfers.
            continue

        if (date, concept, amount) in existing_ops:
            continue

        existing_ops.add((date, concept, amount))

        category_id = _resolve_category(concept, history, otros_id)

        operation = models.Operation(
            amount=amount,
            concept=concept,
            date=date,
            report_id=report.id,
            category_id=category_id,
        )
        DB.session.add(operation)

    _refresh_report(report)


def _refresh_report(report: models.Report) -> None:
    """
    Recompute and persist a report's income/expenses from its operations.

    Args:
        report (models.Report): The report whose aggregates need refreshing.
    """
    income = func.coalesce(func.sum(func.greatest(models.Operation.amount, 0)), 0)
    expenses = func.coalesce(func.sum(func.greatest(-models.Operation.amount, 0)), 0)

    income, expenses = (
        DB.session.query(income, expenses)
        .filter(models.Operation.report_id == report.id)
        .one()
    )

    report.income = float(round(income, 2))
    report.expenses = float(round(expenses, 2))


def remove_report(uuid: str) -> flask.make_response:
    """
    Remove a user report from the database.

    Args:
        uuid (str): The UUID of the report to remove.

    Returns:
        A Flask response object indicating the result of the deletion.
    """
    report = models.Report.query.filter_by(user_id=current_user.id, uuid=uuid).first()
    if not report:
        # Check if the report exists for the user
        return flask.make_response({"msg": "Invalid report."}, HTTPStatus.NOT_FOUND)

    DB.session.delete(report)
    DB.session.commit()
    return flask.make_response({"msg": "Report removed."}, HTTPStatus.OK)
