import flask  # type: ignore
from http import HTTPStatus

from flask import request  # type: ignore
from pydantic import ValidationError  # type: ignore
from flask_jwt_extended import jwt_required  # type: ignore

from app.schemas.users import RegisterSchema, ChangePasswordSchema, ChangeUsernameSchema
from app.services import users
from app.routes.users import BP


@BP.route("/users/me", methods=["GET"])
@jwt_required()
def retrieve_user() -> flask.make_response:
    """
    Retrieve the current user information.

    Returns:
        A Flask response object containing the user's information.
    """
    return users.retrieve_user()


@BP.route("/users", methods=["POST"])
def create_user() -> flask.make_response:
    """
    Create a new user.

    Returns:
        A Flask response object indicating the result of the registration.
    """
    try:
        data = RegisterSchema(**request.json)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return users.create_user(data.email, data.password)


@BP.route("/users/me/password", methods=["PATCH"])
@jwt_required()
def change_password() -> flask.make_response:
    """
    Change the password of an existing user.

    Returns:
        A Flask response object indicating the result of the password change.
    """
    try:
        data = ChangePasswordSchema(**request.json)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return users.change_password(data.old_password, data.new_password)


@BP.route("/users/me/username", methods=["PATCH"])
@jwt_required()
def change_username() -> flask.make_response:
    """
    Change the username of an existing user.

    Returns:
        A Flask response object indicating the result of the username change.
    """
    try:
        data = ChangeUsernameSchema(**request.json)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"msg": msg}, HTTPStatus.BAD_REQUEST)

    return users.change_username(data.username)


@BP.route("/users/me", methods=["DELETE"])
@jwt_required()
def delete_user() -> flask.make_response:
    """
    Delete the account of an existing user.

    Returns:
        A Flask response object indicating the result of the account deletion.
    """
    refresh_token = request.json.get("refresh_token")
    return users.delete_user(refresh_token)
