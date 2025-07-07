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

    return flask.make_response({"message": "OK"}, HTTPStatus.OK)
