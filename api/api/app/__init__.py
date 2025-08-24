import config
import flask  # type: ignore

import flask_session  # type: ignore
import flask_sqlalchemy  # type: ignore

from sqlalchemy.orm import exc as sql_orm_exc
from sqlalchemy import create_engine
from app.db import DB, migrate
from app.jwt import jwt

from app.routes import all_bps


def connect_datatabase() -> flask_sqlalchemy.SQLAlchemy:
    """
    Connect to the database and return the connection object.

    Returns:
        flask_sqlalchemy.SQLAlchemy: The SQLAlchemy engine object.

    Raises:
        sql_orm_exc.OperationalError: If the database connection fails.
    """
    retries = 5
    for _ in range(retries):
        try:
            engine = create_engine(config.DB_URL, echo=True)
            engine.connect()
            break
        except sql_orm_exc.OperationalError as e:
            raise sql_orm_exc.OperationalError("Database initialitation failed.")

    return engine


def initialize_app(app: flask.Flask) -> None:
    """
    Initialize the Flask application with necessary configurations.

    Args:
        app (flask.Flask): The Flask application instance.

    Returns:
        None
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

    Returns:
        None
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
