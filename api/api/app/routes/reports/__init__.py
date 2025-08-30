from flask import Blueprint  # type: ignore

BP = Blueprint("reports", __name__)

from app.routes.reports import reports
