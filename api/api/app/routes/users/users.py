import flask  # type: ignore

from flask import request  # type: ignore
from http import HTTPStatus
from pydantic import ValidationError  # type: ignore

from app.schemas.users import RegisterSchema, ChangePasswordSchema, ChangeUsernameSchema
from app.services.users import (
    register_user,
    change_password,
    change_username,
    delete_user,
)
from app.routes.users import BP

from flask_jwt_extended import jwt_required  # type: ignore


@BP.route("/user", methods=["POST"])
def create_user():
    """Register a new user."""
    try:
        data = RegisterSchema(**request.form)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return register_user(data.email, data.password)


@BP.route("/user/update-password", methods=["PUT"])
@jwt_required()
def update_password():
    """Change the password of an existing user."""
    try:
        data = ChangePasswordSchema(**request.form)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return change_password(data.old_password, data.new_password)


@BP.route("/user/update-username", methods=["PUT"])
@jwt_required()
def update_username():
    """Change the username of an existing user."""
    try:
        data = ChangeUsernameSchema(**request.form)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return change_username(data.username)


@BP.route("/user/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    """Delete the account of an existing user."""
    refresh_token = request.get_json()["refresh_token"]
    return delete_user(refresh_token)
