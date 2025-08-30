import flask  # type: ignore

from flask import request  # type: ignore
from http import HTTPStatus
from pydantic import ValidationError  # type: ignore

from app.schemas.auth import LoginSchema
from app.services.auth import login, logout, refresh
from app.routes.users import BP

from flask_jwt_extended import jwt_required  # type: ignore


@BP.route("/login", methods=["POST"])
def login_user() -> flask.make_response:
    """Login a user.

    Returns:
        A Flask response object indicating the result of the login.
    """
    try:
        data = LoginSchema(**request.json)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return login(data.email, data.password)


@BP.route("/logout", methods=["POST"])
@jwt_required()
def logout_user() -> flask.make_response:
    """Logout a user.

    Returns:
        A Flask response object indicating the result of the logout.
    """
    refresh_token = request.get_json()["refresh_token"]
    return logout(refresh_token)


@BP.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token() -> flask.make_response:
    """Refresh access token.

    Returns:
        A Flask response object containing the new access token.
    """
    return refresh()
