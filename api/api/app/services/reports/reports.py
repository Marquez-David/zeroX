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
from app.utils import apply_cursor_pagination


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
        query = query.filter(
            models.Report.date >= datetime(year, 1, 1),
            models.Report.date < datetime(year + 1, 1, 1),
        )

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
    Parse an uploaded Excel file into a normalized DataFrame.

    Args:
        file (FileStorage): The uploaded report file.

    Returns:
        Optional[DataFrame]: The parsed DataFrame, or None if parsing failed.
    """
    if not file or not file.filename:
        # Check if a file was provided
        return None

    if not file.filename.endswith((".xls", ".xlsx")):
        # Check if the file has a valid Excel extension
        return None

    try:
        df = pd.read_excel(file)
        if df.empty:
            # Check if data frame is empty
            return None

        if len(df.columns) == 2 and ";" in df.columns[0]:
            # Check if the file contains an embedded CSV in a single column
            file.seek(0)
            df = pd.read_excel(file, header=None)

            # Extract column names and data into separate columns
            columns = df.iloc[2, 0].split(";")
            data = df.iloc[3:, 0].str.split(";", expand=True)

            # Keep only the columns that match the expected column names and drop empty rows
            df = data.iloc[:, : len(columns)]
            df = df.replace(r"^\s*$", pd.NA, regex=True).dropna(how="all")

            df.columns = columns
        else:
            df.rename(
                columns={
                    "Fecha de inicio": "Fecha",
                    "Descripción": "Concepto",
                    "DescripciÃ³n": "Concepto",
                },
                inplace=True,
            )

        df["Fecha"] = pd.to_datetime(df["Fecha"], format="%d/%m/%Y")
        df["Concepto"] = df["Concepto"].astype(str).str.strip()
        df["Importe"] = pd.to_numeric(df["Importe"]).round(2)

        return df

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


def _create_operation(report: models.Report, operations_df: pd.DataFrame) -> None:
    """
    Create operations for a given report and recompute the report's aggregates.

    Args:
        report (models.Report): The report to attach the operations to.
        operations_df (DataFrame): The DataFrame containing operations for the report.
    """

    random_cat = models.Category.query.first()

    existing_ops = set()

    operations = models.Operation.query.filter_by(report_id=report.id).all()
    for operation in operations:
        existing_ops.add((operation.date, operation.concept, operation.amount))

    for _, row in operations_df.iterrows():
        date = pd.to_datetime(row["Fecha"]).to_pydatetime()
        concept = row["Concepto"].strip()
        amount = float(row["Importe"])

        if (date, concept, amount) in existing_ops:
            # Check if operation already exists
            continue

        existing_ops.add((date, concept, amount))

        operation = models.Operation(
            amount=amount,
            concept=concept,
            date=date,
            report_id=report.id,
            category_id=random_cat.id,
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
