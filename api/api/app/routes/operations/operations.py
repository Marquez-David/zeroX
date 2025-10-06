import flask  # type: ignore

from flask import request  # type: ignore

from app.services.operations import retrieve_single_operation, change_category
from app.routes.operations import BP

from flask_jwt_extended import jwt_required  # type: ignore


@BP.route("/operations/<string:uuid>", methods=["GET"])
@jwt_required()
def retrieve_operation(uuid: str) -> flask.make_response:
    """Retrieve a single operation by its UUID.

    Args:
        uuid (str): The UUID of the operation to retrieve.

    Returns:
        A Flask response object containing the operation details.
    """
    return retrieve_single_operation(uuid)


@BP.route("/operations/<string:uuid>", methods=["PATCH"])
@jwt_required()
def update_category(uuid: str) -> flask.make_response:
    """Change the category of an operation.

    Args:
        uuid (str): The UUID of the operation to update.

    Returns:
        A Flask response object indicating the result of the update.
    """
    category = request.json.get("category")
    return change_category(uuid, category)
