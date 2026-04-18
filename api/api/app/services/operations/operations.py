import flask  # type: ignore
from http import HTTPStatus

from flask_jwt_extended import current_user  # type: ignore

from app import models
from app.db import DB


def retrieve_operation(uuid: str) -> flask.make_response:
    """
    Retrieve a single operation by its UUID.

    Args:
        uuid (str): The UUID of the operation to retrieve.

    Returns:
        A Flask response object containing the operation details.
    """
    operation = models.Operation.query.filter_by(uuid=uuid).first()
    if not operation or str(operation.report.user.uuid) != str(current_user.uuid):
        # Check if the operation exists and belongs to the current user
        return flask.make_response({"msg": "Invalid operation."}, HTTPStatus.NOT_FOUND)

    return flask.make_response(
        {
            "msg": "OK",
            "operation": {
                "uuid": operation.uuid,
                "amount": operation.amount,
                "date": operation.date,
                "concept": operation.concept,
                "category": {
                    "uuid": operation.category.uuid,
                    "name": operation.category.name,
                },
            },
        },
        HTTPStatus.OK,
    )


def change_category(operation: str, category: str) -> flask.make_response:
    """
    Update the category of an operation.

    Args:
        operation (str): The operation to update.
        category (str): The new category to assign to the operation.

    Returns:
        A Flask response object indicating the result of the update.
    """
    operation = models.Operation.query.filter_by(uuid=operation).first()
    if str(operation.report.user.uuid) != str(current_user.uuid):
        # Check if the operation belongs to the current user
        return flask.make_response({"msg": "Invalid operation."}, HTTPStatus.NOT_FOUND)

    category = models.Category.query.filter_by(uuid=category).first()
    if not category:
        # Check if the category exists
        return flask.make_response({"msg": "Invalid category."}, HTTPStatus.NOT_FOUND)

    operation.category_id = category.id
    DB.session.commit()

    return flask.make_response({"msg": "Category updated."}, HTTPStatus.OK)
