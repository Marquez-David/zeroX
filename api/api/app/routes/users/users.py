import flask  # type: ignore

from flask import request  # type: ignore
from http import HTTPStatus
from pydantic import ValidationError  # type: ignore

from app.schemas.users import RegisterSchema
from app.services.users import register_user
from app.routes.users import BP


@BP.route("/user", methods=["POST"])
def create_user():
    """Register a new user."""
    try:
        data = RegisterSchema(**request.form)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"message": msg}, HTTPStatus.BAD_REQUEST)

    return register_user(data.email, data.password)
