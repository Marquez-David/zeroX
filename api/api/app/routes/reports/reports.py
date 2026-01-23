import flask  # type: ignore

from flask import request  # type: ignore
from flask_jwt_extended import jwt_required  # type: ignore

from app.services import reports
from app.routes.reports import BP


@BP.route("/reports", methods=["GET"])
@jwt_required()
def retrieve_reports() -> flask.make_response:
    """
    Get reports from current user.

    Returns:
        A Flask response object containing a list of user's reports.
    """
    return reports.retrieve_reports()


@BP.route("/reports/<string:uuid>", methods=["GET"])
@jwt_required()
def retrieve_report(uuid: str) -> flask.make_response:
    """
    Get reports from current user.

    Args:
        uuid (str): The UUID of the report to retrieve.

    Returns:
        A Flask response object containing a user's report.
    """
    return reports.retrieve_report(uuid)


@BP.route("/reports", methods=["POST"])
@jwt_required()
def upload_report() -> flask.make_response:
    """
    Upload a new report for the current user.

    Returns:
        A Flask response object indicating the result of the upload.
    """
    file = request.files.get("file")
    return reports.upload_report(file)


@BP.route("/reports/<string:uuid>", methods=["DELETE"])
@jwt_required()
def remove_report(uuid: str) -> flask.make_response:
    """
    Delete a report for the current user.

    Args:
        uuid (str): The UUID of the report to delete.

    Returns:
        A Flask response object indicating the result of the deletion.
    """
    return reports.remove_report(uuid)
