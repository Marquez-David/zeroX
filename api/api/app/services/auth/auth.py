import flask  # type: ignore

from http import HTTPStatus
from flask import current_app  # type: ignore

from app import models
from app.db import jwt, jwt_redis_blocklist

from flask_jwt_extended import get_jwt, get_jwt_identity, decode_token, create_access_token, create_refresh_token  # type: ignore


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


def logout(refresh_token: str) -> flask.make_response:
    """
    Logout a user by revoking their JWT token and clearing the session.

    Args:
        refresh_token (str): The user's refresh token.

    Returns:
        flask.Response: A Flask response object with a JSON message and HTTP status code.
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

    user_uuid = get_jwt_identity()
    user = models.User.query.filter_by(uuid=user_uuid).first()
    if not user:
        # Check if user exists
        return flask.make_response({"msg": "User does not exist"}, HTTPStatus.NOT_FOUND)

    if refresh_decoded["sub"] != user_uuid:
        # Check if the token owner matches the user
        return flask.make_response(
            {"msg": "Token owner mismatch"}, HTTPStatus.UNAUTHORIZED
        )

    # Store the access token revoked in Redis with an expiration time
    access_jti = get_jwt()["jti"]
    access_token_expires = current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    jwt_redis_blocklist.set(access_jti, "access", ex=access_token_expires)

    # Store the refresh token revoked in Redis with an expiration time
    refresh_jti = refresh_decoded["jti"]
    refresh_token_expires = current_app.config["JWT_REFRESH_TOKEN_EXPIRES"]
    jwt_redis_blocklist.set(refresh_jti, "refresh", ex=refresh_token_expires)

    return flask.make_response({"msg": "OK"}, HTTPStatus.OK)


def refresh():
    """
    Refresh the JWT token for the user.

    Returns:
        flask.Response: A Flask response object with a new access token and HTTP status code.
    """

    try:
        refresh_decoded = get_jwt()
    except Exception as e:
        return flask.make_response({"msg": str(e)}, HTTPStatus.UNAUTHORIZED)

    refresh_jti = refresh_decoded["jti"]
    if jwt_redis_blocklist.get(refresh_jti):
        # Check if the refresh token is revoked
        return flask.make_response(
            {"msg": "Refresh token revoked"}, HTTPStatus.UNAUTHORIZED
        )

    user_uuid = get_jwt_identity()
    user = models.User.query.filter_by(uuid=user_uuid).first()
    if not user:
        # Check if user exists
        return flask.make_response({"msg": "User does not exist"}, HTTPStatus.NOT_FOUND)

    if user.locked:
        # Check if user is locked
        return flask.make_response({"msg": "User is locked"}, HTTPStatus.LOCKED)

    # Store the access token revoked in Redis with an expiration time
    refresh_token_expires = current_app.config["JWT_REFRESH_TOKEN_EXPIRES"]
    jwt_redis_blocklist.set(refresh_jti, "refresh", ex=refresh_token_expires)

    return flask.make_response(
        {
            "msg": "OK",
            "access_token": create_access_token(identity=user.uuid, fresh=False),
            "refresh_token": create_refresh_token(identity=user.uuid),
        },
        HTTPStatus.OK,
    )


@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    token_in_redis = jwt_redis_blocklist.get(jwt_payload["jti"])
    return token_in_redis is not None
