import flask  # type: ignore
from http import HTTPStatus

from flask import request  # type: ignore
from pydantic import ValidationError  # type: ignore
from flask_jwt_extended import jwt_required  # type: ignore

from app.schemas.operations import YearFilterSchema
from app.schemas.utils import DateFilterSchema
from app.services import operations
from app.routes.operations import BP


@BP.route("/operations", methods=["GET"])
@jwt_required()
def retrieve_operations() -> flask.make_response:
    """
    Get current user operations, paginated by cursor and optionally filtered
    by year and/or category.

    Query params:
        cursor (Optional[str]): Opaque cursor for the next page.
        limit (Optional[int]): Page size (default 15, max 50).
        year (Optional[int]): Restrict to operations dated in the given year.
        category_uuid (Optional[str]): Restrict to operations of a given category.

    Returns:
        A Flask response object containing a page of operations plus next_cursor.
    """
    try:
        data = DateFilterSchema(**request.args)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx", {}).get("error", e.errors()[0].get("msg")))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    category_uuid = request.args.get("category_uuid")

    return operations.retrieve_operations(
        data.cursor, data.limit, data.year, category_uuid
    )


@BP.route("/operations/by-category", methods=["GET"])
@jwt_required()
def operations_by_category() -> flask.make_response:
    """
    Aggregate user expenses grouped by category.

    Query params:
        year (Optional[int]): Restrict to operations dated in the given year.

    Returns:
        A Flask response object containing categories with expense totals
        and overall totals across the filtered set.
    """
    try:
        data = YearFilterSchema(**request.args)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx", {}).get("error", e.errors()[0].get("msg")))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return operations.operations_by_category(data.year)


@BP.route("/operations/<string:uuid>", methods=["GET"])
@jwt_required()
def retrieve_operation(uuid: str) -> flask.make_response:
    """
    Retrieve a single operation by its UUID.

    Args:
        uuid (str): The UUID of the operation to retrieve.

    Returns:
        A Flask response object containing the operation details.
    """
    return operations.retrieve_operation(uuid)


@BP.route("/operations/<string:uuid>", methods=["PATCH"])
@jwt_required()
def change_category(uuid: str) -> flask.make_response:
    """
    Change the category of an operation.

    Args:
        uuid (str): The UUID of the operation to update.

    Returns:
        A Flask response object indicating the result of the update.
    """
    category = request.json.get("category")
    return operations.change_category(uuid, category)
