from flask import Blueprint  # type: ignore

BP = Blueprint("categories", __name__)

from app.routes.categories import categories
