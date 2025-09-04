import flask  # type: ignore

from http import HTTPStatus

from flask_jwt_extended import current_user  # type: ignore

from app import models
from app.db import DB


def retrieve_all_reports() -> flask.make_response:
    """Retrieve user reports from the database.

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
                    "iban": report.iban,
                    "date": report.date.isoformat(),
                    "balance": report.balance,
                }
                for report in reports
            ],
        },
        HTTPStatus.OK,
    )


def retrieve_single_report(uuid: str) -> flask.make_response:
    """Retrieve a single user report from the database.

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
                "iban": report.iban,
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


def upload_report():
    return flask.make_response({"msg": "Not implemented."}, HTTPStatus.OK)


def delete_report(uuid: str) -> flask.make_response:
    """Delete a user report from the database.

    Args:
        uuid (str): The UUID of the report to delete.

    Returns:
        A Flask response object indicating the result of the deletion.
    """
    report = models.Report.query.filter_by(user_id=current_user.id, uuid=uuid).first()
    if not report:
        # Check if the report exists for the user
        return flask.make_response({"msg": "Invalid report."}, HTTPStatus.NOT_FOUND)

    DB.session.delete(report)
    DB.session.commit()
    return flask.make_response({"msg": "Report deleted."}, HTTPStatus.OK)
