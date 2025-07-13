import flask  # type: ignore

from http import HTTPStatus

from app import models
from app.db import DB

from flask_jwt_extended import create_access_token, create_refresh_token  # type: ignore


def login(email: str, password: str) -> flask.make_response:
    """
    Authenticate a user by email and password.

    Args:
        email (str): The user's email address.
        password (str): The user's password.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """
    user = models.User.query.filter_by(email=email).first()
    if not user:
        # Check if user exists
        return flask.make_response(
            {"message": "User do not exist"}, HTTPStatus.NOT_FOUND
        )

    if user.locked:
        # Check if user is locked
        return flask.make_response({"message": "User is locked"}, HTTPStatus.LOCKED)

    if not user.check_password(password):
        # Check if password matches
        return flask.make_response(
            {"message": "Invalid username or password"}, HTTPStatus.UNAUTHORIZED
        )

    return flask.make_response(
        {
            "message": "OK",
            "access_token": create_access_token(identity=user.uuid),
            "refresh_token": create_refresh_token(identity=user.uuid),
        },
        HTTPStatus.OK,
    )
