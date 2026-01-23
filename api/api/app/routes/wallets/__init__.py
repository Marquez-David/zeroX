from flask import Blueprint  # type: ignore

BP = Blueprint("wallets", __name__)

from app.routes.wallets import wallets
