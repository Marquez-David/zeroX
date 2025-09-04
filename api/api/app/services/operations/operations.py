import flask  # type: ignore

from http import HTTPStatus

from flask_jwt_extended import current_user  # type: ignore

from app import models
from app.db import DB


def change_category(operation: str, category: str) -> flask.make_response:
    """Update the category of an operation.

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
