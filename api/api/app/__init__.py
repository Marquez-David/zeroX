import time

import config
import flask  # type: ignore

import flask_session  # type: ignore
import flask_sqlalchemy  # type: ignore

from sqlalchemy import exc as sql_exc
from sqlalchemy import create_engine
from app.db import DB, migrate
from app.jwt import jwt

from app.routes import all_bps


def connect_database(
    retries: int = 5, backoff_seconds: float = 2.0
) -> flask_sqlalchemy.SQLAlchemy:
    """
    Connect to Postgres, retrying with linear backoff.

    Args:
        retries (int): Number of retry attempts.
        backoff_seconds (float): Base number of seconds to wait between retries.

    Returns:
        flask_sqlalchemy.SQLAlchemy: A SQLAlchemy engine connected to the database.
    """
    for attempt in range(1, retries + 1):
        try:
            engine = create_engine(config.DB_URL, echo=False)
            engine.connect().close()
            return engine
        except sql_exc.DBAPIError:
            if attempt < retries:
                time.sleep(backoff_seconds * attempt)

    raise RuntimeError("Database initialization failed.")


def initialize_app(app: flask.Flask) -> None:
    """
    Initialize the Flask application with necessary configurations.

    Args:
        app (flask.Flask): The Flask application instance.
    """
    session = flask_session.Session()
    session.init_app(app)

    jwt.init_app(app)

    return None


def initialize_routes(app: flask.Flask) -> None:
    """
    Initialize the routes for the Flask application.

    Args:
        app (flask.Flask): The Flask application instance.
    """
    for bp in all_bps:
        app.register_blueprint(bp)

    return None


def create_app(config_class=config.config) -> flask.Flask:
    app = flask.Flask(__name__)
    app.config.from_object(config_class)

    DB.init_app(app)
    migrate.init_app(app, DB)

    # Initialize app
    initialize_app(app)
    initialize_routes(app)

    return app
