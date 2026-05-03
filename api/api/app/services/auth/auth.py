import flask  # type: ignore
from http import HTTPStatus
from datetime import datetime, timezone

from flask import current_app  # type: ignore
from flask_jwt_extended import current_user  # type: ignore

from app import DB, models
from app.utils.tokens import revoke_tokens, create_tokens, rotate_tokens


def login_user(email: str, password: str) -> flask.make_response:
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
            {"msg": "Invalid username or password"}, HTTPStatus.NOT_FOUND
        )

    if user.password_attempts >= current_app.config["MAX_PASSWORD_ATTEMPTS"]:
        # Check if user has exceeded maximum password attempts
        user.locked = datetime.now(timezone.utc) + current_app.config["LOCKOUT_TIME"]
        user.password_attempts = 0
        DB.session.commit()
        return flask.make_response(
            {"msg": "Maximum password attempts exceeded"}, HTTPStatus.FORBIDDEN
        )

    if user.locked and user.locked > datetime.now(timezone.utc):
        # Check if user is locked
        return flask.make_response({"msg": f"User is locked"}, HTTPStatus.LOCKED)

    if not user.check_password(password):
        # Check if password matches
        user.password_attempts += 1
        DB.session.commit()
        return flask.make_response(
            {"msg": "Invalid username or password"}, HTTPStatus.UNAUTHORIZED
        )

    # Reset password attempts on successful login
    user.password_attempts = 0
    user.locked = None
    DB.session.commit()

    return flask.make_response({"msg": "OK", **create_tokens(user.uuid)}, HTTPStatus.OK)


def logout_user(refresh_token: str) -> flask.make_response:
    """
    Logout a user by revoking their JWT token and clearing the session.

    Args:
        refresh_token (str): The user's refresh token.

    Returns:
        flask.Response: A Flask response object with a JSON message and HTTP status code.
    """
    user = models.User.query.filter_by(uuid=current_user.uuid).first()
    if not user:
        return flask.make_response({"msg": "User does not exist"}, HTTPStatus.NOT_FOUND)

    response = revoke_tokens(refresh_token)
    if response is not None:
        return response

    return flask.make_response({"msg": "OK"}, HTTPStatus.OK)


def refresh_token() -> flask.make_response:
    """
    Refresh the JWT token for the user.

    Returns:
        flask.Response: A Flask response object with a new access token and HTTP status code.
    """
    user = models.User.query.filter_by(uuid=current_user.uuid).first()
    if not user:
        # Check if user exists
        return flask.make_response({"msg": "User does not exist"}, HTTPStatus.NOT_FOUND)

    if user.locked and user.locked > datetime.now(timezone.utc):
        # Check if user is locked
        return flask.make_response({"msg": "User is locked"}, HTTPStatus.LOCKED)

    return flask.make_response({"msg": "OK", **rotate_tokens(user.uuid)}, HTTPStatus.OK)
