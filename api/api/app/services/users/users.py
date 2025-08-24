import flask  # type: ignore

from http import HTTPStatus

from flask_jwt_extended import current_user  # type: ignore

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
        return flask.make_response({"msg": "User already exist"}, HTTPStatus.CONFLICT)

    user = models.User(email=email, password=password)
    DB.session.add(user)
    DB.session.commit()

    return flask.make_response({"msg": "User created successfully."}, HTTPStatus.OK)


def change_password(old_password: str, new_password: str) -> flask.make_response:
    """
    Change the password of the current user.

    Args:
        old_password (str): The current password of the user.
        new_password (str): The new password to set.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """
    if not old_password or not new_password:
        return flask.make_response(
            {"msg": "Password required."}, HTTPStatus.BAD_REQUEST
        )

    if not current_user.check_password(old_password):
        return flask.make_response({"msg": "Invalid password."}, HTTPStatus.BAD_REQUEST)

    current_user.password_hash = current_user.hash_password(new_password)
    current_user.password_attempts = 0
    current_user.locked = None
    DB.session.commit()

    return flask.make_response({"msg": "Password changed successfully."}, HTTPStatus.OK)


def change_username(username: str) -> flask.make_response:
    """
    Change the username of the current user.

    Args:
        username (str): The new username to set.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """
    if not username:
        return flask.make_response(
            {"msg": "Username required."}, HTTPStatus.BAD_REQUEST
        )

    current_user.username = username
    DB.session.commit()

    return flask.make_response({"msg": "Username changed successfully."}, HTTPStatus.OK)
