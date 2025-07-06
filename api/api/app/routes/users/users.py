import flask  # type: ignore

from flask import request  # type: ignore
from http import HTTPStatus
from pydantic import ValidationError  # type: ignore

from app.schemas.users.register import RegisterSchema

from app.services.users import register_user
from app.routes.users import BP


@BP.route("/users", methods=["GET"])
def get_users():
    """
    Endpoint to get a list of users.
    """
    # This is a placeholder implementation.
    # Replace with actual logic to retrieve users.
    return {"users": ["user1", "user2", "user3"]}, 200


@BP.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    try:
        data = RegisterSchema(**request.form)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"message": msg}, HTTPStatus.BAD_REQUEST)

    return register_user(data.email, data.password)
