import flask  # type: ignore

from flask_jwt_extended import jwt_required  # type: ignore

from app.services import categories
from app.routes.categories import BP


@BP.route("/categories", methods=["GET"])
@jwt_required()
def retrieve_categories() -> flask.make_response:
    """
    Retrieve all categories.

    Returns:
        A Flask response object containing the list of categories.
    """
    return categories.retrieve_categories()
