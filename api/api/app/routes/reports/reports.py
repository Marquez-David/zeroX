import flask  # type: ignore
from http import HTTPStatus

from flask import request  # type: ignore
from pydantic import ValidationError  # type: ignore
from flask_jwt_extended import jwt_required  # type: ignore

from app.schemas.utils import DateFilterSchema, PaginationSchema
from app.services import reports
from app.routes.reports import BP


@BP.route("/reports", methods=["GET"])
@jwt_required()
def retrieve_reports() -> flask.make_response:
    """
    Get reports from current user, paginated by cursor and optionally filtered by year.

    Query params:
        cursor (Optional[str]): Opaque cursor for the next page.
        limit (Optional[int]): Page size (default 15, max 50).
        year (Optional[int]): Restrict reports to the given year.

    Returns:
        A Flask response object containing a page of user's reports
        plus a `next_cursor` (or null when the last page is reached).
    """
    try:
        data = DateFilterSchema(**request.args)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx", {}).get("error", e.errors()[0].get("msg")))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return reports.retrieve_reports(data.cursor, data.limit, data.year)


@BP.route("/reports/<string:uuid>", methods=["GET"])
@jwt_required()
def retrieve_report(uuid: str) -> flask.make_response:
    """
    Get a single report from current user, with operations paginated by cursor.

    Args:
        uuid (str): The UUID of the report to retrieve.

    Query params:
        cursor (Optional[str]): Opaque cursor for the next page of operations.
        limit (Optional[int]): Page size (default 15, max 50).

    Returns:
        A Flask response object containing the report and a page of its operations,
        plus a `next_cursor` (or null when the last page is reached).
    """
    try:
        params = PaginationSchema(**request.args)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx", {}).get("error", e.errors()[0].get("msg")))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return reports.retrieve_report(uuid, params.cursor, params.limit)


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
