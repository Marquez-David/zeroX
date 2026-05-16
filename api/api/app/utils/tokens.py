import flask  # type: ignore
import jwt  # type: ignore  # PyJWT, base library underlying flask-jwt-extended
from http import HTTPStatus
from typing import Optional

from flask import current_app  # type: ignore
from flask_jwt_extended import (  # type: ignore
    create_access_token,
    create_refresh_token,
    current_user,
    decode_token,
    get_jwt,
)
from flask_jwt_extended.exceptions import JWTExtendedException  # type: ignore

from app.jwt import jwt_redis_blocklist


def create_tokens(user_uuid: str, fresh: bool = True) -> dict:
    """
    Create a new pair of access and refresh tokens for the given user UUID.

    Args:
        user_uuid (str): The UUID of the user for whom to create tokens.
        fresh (bool): Whether the access token should be marked as fresh.

    Returns:
        dict: {"access_token": str, "refresh_token": str}
    """
    return {
        "access_token": create_access_token(identity=user_uuid, fresh=fresh),
        "refresh_token": create_refresh_token(identity=user_uuid),
    }


def revoke_tokens(refresh_token: str) -> Optional[flask.Response]:
    """
    Revoke both the refresh token and the access token.

    Args:
        refresh_token (str): The refresh token to revoke.

    Returns:
        Optional[flask.Response]: A Flask response object if the token is invalid or None if the tokens were successfully revoked.
    """
    if not refresh_token:
        return flask.make_response(
            {"msg": "Refresh token is required"}, HTTPStatus.BAD_REQUEST
        )

    try:
        decoded = decode_token(refresh_token, allow_expired=False)
    except (jwt.PyJWTError, JWTExtendedException):
        return flask.make_response({"msg": "Invalid token."}, HTTPStatus.UNAUTHORIZED)

    if decoded.get("type") != "refresh":
        return flask.make_response(
            {"msg": "Invalid token type"}, HTTPStatus.UNAUTHORIZED
        )

    if jwt_redis_blocklist.get(decoded["jti"]):
        return flask.make_response({"msg": "Token is revoked"}, HTTPStatus.UNAUTHORIZED)

    if decoded["sub"] != str(current_user.uuid):
        return flask.make_response(
            {"msg": "Token owner mismatch"}, HTTPStatus.UNAUTHORIZED
        )

    access_jti = get_jwt()["jti"]
    jwt_redis_blocklist.set(
        access_jti, "access", ex=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    )
    jwt_redis_blocklist.set(
        decoded["jti"], "refresh", ex=current_app.config["JWT_REFRESH_TOKEN_EXPIRES"]
    )
    return None


def rotate_tokens(user_uuid: str) -> dict:
    """
    Revoke the refresh JTI of the currently-presented JWT and issue a new pair.

    Args:
        user_uuid (str): The UUID of the user for whom to rotate tokens.

    Returns:
        dict: {"access_token": str, "refresh_token": str}
    """

    decoded = get_jwt()

    jwt_redis_blocklist.set(
        decoded["jti"], "refresh", ex=current_app.config["JWT_REFRESH_TOKEN_EXPIRES"]
    )
    return create_tokens(user_uuid, fresh=False)
