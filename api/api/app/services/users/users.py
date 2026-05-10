import flask  # type: ignore
from http import HTTPStatus

from flask_jwt_extended import current_user  # type: ignore

from app import models
from app.db import DB
from app.utils.tokens import revoke_tokens


def retrieve_user() -> flask.make_response:
    """
    Retrieve current user information from the database.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """

    user = models.User.query.filter_by(uuid=current_user.uuid).first()
    if not user:
        # Check if the user exists
        return flask.make_response({"msg": "Invalid user."}, HTTPStatus.NOT_FOUND)

    return flask.make_response(
        {
            "msg": "OK",
            "user": {
                "uuid": user.uuid,
                "email": user.email,
                "username": user.username,
            },
        },
        HTTPStatus.OK,
    )


def create_user(email: str, password: str) -> flask.make_response:
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


def change_password(
    old_password: str, new_password: str, refresh_token: str
) -> flask.make_response:
    """
    Change the password of the current user and revoke the active token pair.

    Args:
        old_password (str): The current password of the user.
        new_password (str): The new password to set.
        refresh_token (str): The refresh token of the current session, to revoke.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """
    if not old_password or not new_password:
        # Check if both passwords are provided
        return flask.make_response(
            {"msg": "Password required."}, HTTPStatus.BAD_REQUEST
        )

    if not current_user.check_password(old_password):
        # Check if the old password is correct
        return flask.make_response({"msg": "Invalid password."}, HTTPStatus.BAD_REQUEST)

    response = revoke_tokens(refresh_token)
    if response is not None:
        return response

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
        # Check if username is provided
        return flask.make_response(
            {"msg": "Username required."}, HTTPStatus.BAD_REQUEST
        )

    current_user.username = username
    DB.session.commit()

    return flask.make_response({"msg": "Username changed successfully."}, HTTPStatus.OK)


def delete_user(refresh_token: str) -> flask.make_response:
    """
    Delete the account of the current user.

    Args:
        refresh_token (str): The user's refresh token.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """
    user = models.User.query.filter_by(uuid=current_user.uuid).first()
    if not user:
        return flask.make_response({"msg": "User not found."}, HTTPStatus.NOT_FOUND)

    response = revoke_tokens(refresh_token)
    if response is not None:
        return response

    DB.session.delete(user)
    DB.session.commit()

    return flask.make_response({"msg": "User deleted successfully."}, HTTPStatus.OK)
