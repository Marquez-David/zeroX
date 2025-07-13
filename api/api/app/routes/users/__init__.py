from flask import Blueprint  # type: ignore

BP = Blueprint("users", __name__)

from app.routes.users import users
