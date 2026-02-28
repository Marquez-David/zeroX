import flask  # type: ignore
from http import HTTPStatus

from app import models


def retrieve_categories() -> flask.make_response:
    """
    Retrieve all categories.

    Returns:
        A Flask response object containing the list of categories.
    """
    categories = models.Category.query.all()
    return flask.make_response(
        {
            "msg": "OK",
            "categories": [
                {
                    "uuid": category.uuid,
                    "name": category.name,
                    "description": category.description,
                }
                for category in categories
            ],
        },
        HTTPStatus.OK,
    )
