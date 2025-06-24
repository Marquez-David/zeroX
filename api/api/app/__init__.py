import typing
import config
import flask # type: ignore
import redis # type: ignore

import flask_login # type: ignore
import flask_session # type: ignore
import flask_sqlalchemy # type: ignore

from flask_sqlalchemy import model #type: ignore
from sqlalchemy.orm import exc as sql_orm_exc  # type: ignore
from sqlalchemy import create_engine # type: ignore

from app.routes.users import BP as users_bp

class BaseModel(model.Model):

    def __repr__(self) -> str:
        return self._repr(id=self.id)
    
    def _repr(self, **fields: typing.Dict[str, typing.Any]) -> str:
        """Return a string representation of the model."""
        field_strings = []
        for key, value in fields.items():
            try:
                field_strings.append(f"{key}={value}")
            except sql_orm_exc.DetachedInstanceError:
                field_strings.append(f"{key}=DetachedInstanceError")
        return f"<{self.__class__.__name__}({', '.join(field_strings)})>"
    
DB = flask_sqlalchemy.SQLAlchemy(model_class=BaseModel) # type: ignore

LOGIN_MANAGER = flask_login.LoginManager()

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

def initialize_database(app: flask.Flask) -> None:
    """
    Initialize the database and create tables
    
    Args:
        app (flask.Flask): The Flask application instance.
        
    Raises:
        sql_orm_exc.OperationalError: If the database connection fails.
    """
    engine = connect_datatabase()
    with app.app_context():
        retries = 10
        for _ in range(retries):
            try:
                DB.metadata.create_all(engine, checkfirst=True)
                break
            except sql_orm_exc.OperationalError:
                raise sql_orm_exc.OperationalError("Database initialization failed")        
                    
    return None

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

    LOGIN_MANAGER.init_app(app)
    # LOGIN_MANAGER.login_view = "users.login"
    # LOGIN_MANAGER.login_message = ""

    # Initialize CSRF protection
    # app_csrf = csrf.CSRFProtect()
    # app_csrf.init_app(app)

    return None

def initialize_routes(app: flask.Flask) -> None:
    """
    Initialize the routes for the Flask application.

    Args:
        app (flask.Flask): The Flask application instance.

    Returns:
        None
    """
    routes = [users_bp]
    for resource in routes:
        app.register_blueprint(resource)

    return None

def initialize_redis(app: flask.Flask) -> None:
    """
    Initialize the Redis connection.

    Args:
        app (flask.Flask): The Flask application instance.

    Returns:
        None
    """
    redis_client = redis.Redis(
        host=config.REDIS_HOST,
        port=config.REDIS_PORT,
        password=config.REDIS_PASSWORD,
        decode_responses=True
    )
    app.config['SESSION_REDIS'] = redis_client

    return None


def create_app(config_class=config.config) -> flask.Flask:
    app = flask.Flask(__name__)
    app.config.from_object(config_class)

    DB.init_app(app)

    # Initialize app
    initialize_app(app)
    initialize_routes(app)

    # Initialize database
    initialize_database(app)

    # Initialize Redis
    initialize_redis(app)

    return app



            