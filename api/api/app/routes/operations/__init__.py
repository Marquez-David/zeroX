from flask import Blueprint  # type: ignore

BP = Blueprint("operations", __name__)

from app.routes.operations import operations
