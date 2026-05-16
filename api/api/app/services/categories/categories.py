import flask  # type: ignore
from http import HTTPStatus

from app import models


def retrieve_categories() -> flask.make_response:
    """
    Retrieve all categories.

    Returns:
        A Flask response object containing the list of categories.
    """
    categories = sorted(
        models.Category.query.all(),
        key=lambda c: (c.name.lower() == "otros", c.name.lower()),
    )
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
