import flask  # type: ignore

from http import HTTPStatus
from flask import current_app  # type: ignore

from app import models
from app.db import jwt, jwt_redis_blocklist

from flask_jwt_extended import get_jwt, get_jwt_identity, create_access_token, create_refresh_token  # type: ignore


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
        return flask.make_response({"msg": "User do not exist"}, HTTPStatus.NOT_FOUND)

    if user.locked:
        # Check if user is locked
        return flask.make_response({"msg": "User is locked"}, HTTPStatus.LOCKED)

    if not user.check_password(password):
        # Check if password matches
        return flask.make_response(
            {"msg": "Invalid username or password"}, HTTPStatus.UNAUTHORIZED
        )

    return flask.make_response(
        {
            "msg": "OK",
            "access_token": create_access_token(identity=user.uuid, fresh=False),
            "refresh_token": create_refresh_token(identity=user.uuid),
        },
        HTTPStatus.OK,
    )


def logout():
    """
    Logout a user by revoking their JWT token and clearing the session.

    Returns:
        flask.Response: A Flask response object with a JSON message and HTTP status code.
    """
    jwt = get_jwt()["jti"]
    jwt_redis_blocklist.set(jwt, "", ex=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"])
    return flask.make_response({"msg": "OK"}, HTTPStatus.OK)


def refresh():
    """
    Refresh the JWT token for the user.

    Returns:
        flask.Response: A Flask response object with a new access token and HTTP status code.
    """
    user_uuid = get_jwt_identity()
    user = models.User.query.filter_by(uuid=user_uuid).first()
    if not user:
        return flask.make_response({"msg": "User does not exist"}, HTTPStatus.NOT_FOUND)

    if user.locked:
        return flask.make_response({"msg": "User is locked"}, HTTPStatus.LOCKED)

    return flask.make_response(
        {
            "msg": "OK",
            "access_token": create_access_token(identity=user.uuid, fresh=False),
        },
        HTTPStatus.OK,
    )


@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    token_in_redis = jwt_redis_blocklist.get(jwt_payload["jti"])
    return token_in_redis is not None
