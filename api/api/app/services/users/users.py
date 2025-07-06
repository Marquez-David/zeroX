import flask  # type: ignore

from http import HTTPStatus

from app import models
from app.db import DB


def register_user(email: str, password: str) -> tuple[bool, flask.make_response]:
    """
    Register a new user with the given email and password.

    Args:
        email (str): The email of the user.
        password (str): The password of the user.

    Returns:
        tuple: A tuple containing a boolean indicating success and a Flask response object.
    """
    user = models.User.query.filter_by(email=email).first()
    if user:
        # Check if the user already exists
        return flask.make_response(
            {"message": "User already exist"}, HTTPStatus.CONFLICT
        )

    user = models.User(
        username=email.split("@")[0],
        email=email,
    )
    DB.session.add(user)
    DB.session.commit()

    return flask.make_response(
        {"message": "User created successfully."}, HTTPStatus.CREATED
    )
