import flask  # type: ignore
from flask import request  # type: ignore

from app.services.reports import (
    retrieve_all_reports,
    retrieve_single_report,
    upload_report_data,
    delete_report,
)
from app.routes.reports import BP

from flask_jwt_extended import jwt_required  # type: ignore


@BP.route("/reports", methods=["GET"])
@jwt_required()
def retrieve_reports() -> flask.make_response:
    """Get reports from current user.

    Returns:
        A Flask response object containing a list of user's reports.
    """
    return retrieve_all_reports()


@BP.route("/reports/<string:uuid>", methods=["GET"])
@jwt_required()
def retrieve_report(uuid: str) -> flask.make_response:
    """Get reports from current user.

    Args:
        uuid (str): The UUID of the report to retrieve.

    Returns:
        A Flask response object containing a user's report.
    """
    return retrieve_single_report(uuid)


@BP.route("/reports", methods=["POST"])
@jwt_required()
def upload_report() -> flask.make_response:
    """Upload a new report for the current user.

    Returns:
        A Flask response object indicating the result of the upload.
    """
    file = request.files.get("file")
    return upload_report_data(file)


@BP.route("/reports/<string:uuid>", methods=["DELETE"])
@jwt_required()
def remove_report(uuid: str) -> flask.make_response:
    """Delete a report for the current user.

    Args:
        uuid (str): The UUID of the report to delete.

    Returns:
        A Flask response object indicating the result of the deletion.
    """
    return delete_report(uuid)
