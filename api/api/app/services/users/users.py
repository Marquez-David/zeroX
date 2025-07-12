import flask  # type: ignore

from http import HTTPStatus

from app import models
from app.db import DB


def register_user(email: str, password: str) -> flask.make_response:
    """
    Register a new user with the given email and password.

    Args:
        email (str): The email of the user.
        password (str): The password of the user.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """
    user = models.User.query.filter_by(email=email).first()
    if user:
        # Check if the user already exists
        return flask.make_response(
            {"message": "User already exist"}, HTTPStatus.CONFLICT
        )

    user = models.User(email=email, password=password)
    DB.session.add(user)
    DB.session.commit()

    return flask.make_response(
        {"message": "User created successfully."}, HTTPStatus.CREATED
    )
