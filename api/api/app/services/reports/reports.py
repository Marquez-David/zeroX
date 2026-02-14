import flask  # type: ignore
from http import HTTPStatus
import pandas as pd  # type: ignore
import typing

from flask_jwt_extended import current_user  # type: ignore
from werkzeug.datastructures import FileStorage  # type: ignore

from app import models
from app.db import DB


def retrieve_reports() -> flask.make_response:
    """
    Retrieve user reports from the database.

    Returns:
        A Flask response object containing the user's reports.
    """
    reports = models.Report.query.filter_by(user_id=current_user.id).all()
    return flask.make_response(
        {
            "msg": "OK",
            "reports": [
                {
                    "uuid": report.uuid,
                    "date": report.date,
                    "balance": report.balance,
                }
                for report in reports
            ],
        },
        HTTPStatus.OK,
    )


def retrieve_report(uuid: str) -> flask.make_response:
    """
    Retrieve a single user report from the database.

    Args:
        uuid (str): The UUID of the report to retrieve.

    Returns:
        A Flask response object containing a user's report.
    """
    report = models.Report.query.filter_by(user_id=current_user.id, uuid=uuid).first()
    if not report:
        # Check if the report exists for the user
        return flask.make_response({"msg": "Invalid report."}, HTTPStatus.NOT_FOUND)

    return flask.make_response(
        {
            "msg": "OK",
            "report": {
                "uuid": report.uuid,
                "date": report.date,
                "balance": report.balance,
                "operations": [
                    {
                        "uuid": operation.uuid,
                        "amount": operation.amount,
                        "date": operation.date,
                        "concept": operation.concept,
                        "category": operation.category.name,
                    }
                    for operation in report.operations
                ],
            },
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
    if (df := _parse_file(file)) is None:
        return flask.make_response({"msg": "Invalid file."}, HTTPStatus.BAD_REQUEST)

    try:
        # Group operations by year and month
        operations_by_month = df.groupby(df["Fecha"].dt.to_period("M"))

        # Create a report for each month
        for date, operations in operations_by_month:
            report = _create_report(date, operations)
            _create_operation(report.id, operations)

        DB.session.commit()

    except Exception:
        return flask.make_response({"msg": "Error in file."}, HTTPStatus.BAD_REQUEST)

    return flask.make_response({"msg": "Report upload successfully."}, HTTPStatus.OK)


def _parse_file(file: FileStorage) -> typing.Optional[pd.DataFrame]:
    """
    Parse an uploaded Excel file into a DataFrame.

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
                columns={"Fecha de inicio": "Fecha", "DescripciÃ³n": "Concepto"},
                inplace=True,
            )

        df["Fecha"] = pd.to_datetime(df["Fecha"], format="%d/%m/%Y")
        df["Conceto"] = str(df["Concepto"]).strip()
        df["Importe"] = round(pd.to_numeric(df["Importe"]), 2)

        return df

    except Exception as e:
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
        report = models.Report(
            balance=float(round(operations_df["Importe"].sum(), 2)),
            date=pd.to_datetime(operations_df["Fecha"].max()),
        )
        DB.session.add(report)
        DB.session.flush()

    return report


def _create_operation(report_id: int, operations_df: pd.DataFrame) -> None:
    """
    Create operations for a given report.

    Args:
        report_id (int): The ID of the report.
        operations_df (DataFrame): The DataFrame containing operations for the report.
    """

    random_cat = models.Category.query.first()

    existing_ops = set()

    operations = models.Operation.query.filter_by(report_id=report_id).all()
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
            report_id=report_id,
            category_id=random_cat.id,
        )
        DB.session.add(operation)


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
