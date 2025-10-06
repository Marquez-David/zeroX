import flask  # type: ignore

from http import HTTPStatus

from flask import current_app  # type: ignore

from app.jwt import jwt_redis_blocklist
from flask_jwt_extended import get_jwt, decode_token, current_user  # type: ignore

from app import models
from app.db import DB


def retrieve_current_user() -> flask.make_response:
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
                "created_at": user.created_at.isoformat(),
            },
        },
        HTTPStatus.OK,
    )


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
        # Check if both passwords are provided
        return flask.make_response(
            {"msg": "Password required."}, HTTPStatus.BAD_REQUEST
        )

    if not current_user.check_password(old_password):
        # Check if the old password is correct
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
        # Check if username is provided
        return flask.make_response(
            {"msg": "Username required."}, HTTPStatus.BAD_REQUEST
        )

    current_user.username = username
    DB.session.commit()

    return flask.make_response({"msg": "Username changed successfully."}, HTTPStatus.OK)


def delete_current_user(refresh_token: str) -> flask.make_response:
    """
    Delete the account of the current user.

    Args:
        refresh_token (str): The user's refresh token.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """

    if not refresh_token:
        # Check if refresh token is provided
        return flask.make_response(
            {"msg": "Refresh token is required"}, HTTPStatus.BAD_REQUEST
        )

    try:
        refresh_decoded = decode_token(refresh_token, allow_expired=False)
    except Exception as e:
        return flask.make_response({"msg": str(e)}, HTTPStatus.UNAUTHORIZED)

    if refresh_decoded.get("type") != "refresh":
        # Check if the token type is refresh
        return flask.make_response(
            {"msg": "Invalid token type"}, HTTPStatus.UNAUTHORIZED
        )

    if jwt_redis_blocklist.get(refresh_decoded["jti"]):
        # Check if token is not revoked
        return flask.make_response({"msg": "Token is revoked"}, HTTPStatus.UNAUTHORIZED)

    if refresh_decoded["sub"] != str(current_user.uuid):
        # Check if the token owner matches the user
        return flask.make_response(
            {"msg": "Token owner mismatch"}, HTTPStatus.UNAUTHORIZED
        )

    user = models.User.query.filter_by(uuid=current_user.uuid).first()
    if not user:
        return flask.make_response({"msg": "User not found."}, HTTPStatus.NOT_FOUND)

    # Store the access token revoked in Redis with an expiration time
    access_jti = get_jwt()["jti"]
    access_token_expires = current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    jwt_redis_blocklist.set(access_jti, "access", ex=access_token_expires)

    # Store the refresh token revoked in Redis with an expiration time
    refresh_jti = refresh_decoded["jti"]
    refresh_token_expires = current_app.config["JWT_REFRESH_TOKEN_EXPIRES"]
    jwt_redis_blocklist.set(refresh_jti, "refresh", ex=refresh_token_expires)

    DB.session.delete(user)
    DB.session.commit()

    return flask.make_response({"msg": "User deleted successfully."}, HTTPStatus.OK)
