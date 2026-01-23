import flask  # type: ignore
from http import HTTPStatus
import pandas as pd  # type: ignore

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
                    "date": report.date.isoformat(),
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
                "date": report.date.isoformat(),
                "balance": report.balance,
                "operations": [
                    {
                        "uuid": operation.uuid,
                        "amount": operation.amount,
                        "date": operation.date.isoformat(),
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
    if not _check_file_format(file):
        return flask.make_response({"msg": "Invalid file."}, HTTPStatus.BAD_REQUEST)

    random_cat = models.Category.query.first()

    report = models.Report()
    DB.session.add(report)
    DB.session.flush()

    try:
        df = pd.read_excel(file, skiprows=2)  # Skip first two rows
        for _, row in df.iterrows():
            operation = models.Operation(
                amount=pd.to_numeric(row["Importe"]),
                concept=row["Concepto"],
                date=pd.to_datetime(row["Fecha"]),
            )
            operation.report_id = report.id
            operation.category_id = random_cat.id
            DB.session.add(operation)

        report.balance = round(df["Importe"].sum(), 2)
        DB.session.commit()

    except Exception as e:
        return flask.make_response({"msg": "Invalid file."}, HTTPStatus.BAD_REQUEST)

    return flask.make_response({"msg": "Report upload successfully."}, HTTPStatus.OK)


def _check_file_format(file: FileStorage) -> bool:
    """
    Check if the uploaded file is in a valid format.

    Args:
        file (FileStorage): The uploaded report file.

    Returns:
        bool: True if the file format is valid, False otherwise.
    """
    if not file:
        # Check if a file was provided
        return False

    if not file.filename.endswith((".xls", ".xlsx")):
        # Check if the file has a valid Excel extension
        return False

    try:
        df = pd.read_excel(file)
        required_columns = {"Fecha", "Importe", "Movimiento"}

        if df.empty:
            # Check if the DataFrame is empty
            return False

        if not required_columns.issubset(set(df.columns)):
            # Check if missing required columns
            return False

        return True

    except Exception:
        return False


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
