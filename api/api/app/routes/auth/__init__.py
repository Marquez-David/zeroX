from flask import Blueprint  # type: ignore

BP = Blueprint("auth", __name__)

from app.routes.auth import auth
