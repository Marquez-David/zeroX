import redis  # type: ignore
import config

from app import models
from flask_jwt_extended import JWTManager  # type: ignore

# JWT configuration for token management
jwt = JWTManager()


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data) -> models.User:
    """
    Callback to retrieve the user from the JWT token.

    Args:
        _jwt_header: The JWT header (not used in this function).
        jwt_data: The decoded JWT payload containing user information.

    Returns:
        models.User: The user object corresponding to the UUID in the JWT payload.
    """
    uuid = jwt_data["sub"]
    return models.User.query.filter_by(uuid=uuid).first()


@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(_jwt_header, jwt_payload: dict):
    """
    Callback to check if a JWT token has been revoked.

    Args:
        _jwt_header: The JWT header (not used in this function).
        jwt_payload (dict): The decoded JWT payload.

    Returns:
        bool: True if the token is revoked, False otherwise.
    """
    token_in_redis = jwt_redis_blocklist.get(jwt_payload["jti"])
    return token_in_redis is not None


jwt_redis_blocklist = redis.StrictRedis(
    host=config.REDIS_HOST,
    port=config.REDIS_PORT,
    password=config.REDIS_PASSWORD,
    decode_responses=True,
    db=0,
)
