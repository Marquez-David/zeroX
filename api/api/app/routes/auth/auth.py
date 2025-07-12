import flask  # type: ignore

from flask import request  # type: ignore
from http import HTTPStatus
from pydantic import ValidationError  # type: ignore

from app.schemas.auth import LoginSchema
from app.services.auth import login
from app.routes.users import BP


@BP.route("/login", methods=["POST"])
def login_user():
    """Login a user."""
    try:
        data = LoginSchema(**request.form)
    except ValidationError as e:
        msg = str(e.errors()[0].get("ctx").get("error"))
        return flask.make_response({"message": msg}, HTTPStatus.BAD_REQUEST)

    return login(data.email, data.password)
