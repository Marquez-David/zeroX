import os
from datetime import timedelta

# Redis connection credentials
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")
REDIS_PORT = os.environ.get("REDIS_PORT", 6379)
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD")

# Database connection credentials
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT")
DB_NAME = os.environ.get("DB_NAME")
DB_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"

# Password hashing credentials
PEPPER = os.environ.get("PEPPER")

# Encryption key for sensitive data
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")

# JWT credentials
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

# Blockstream API URL
WALLET_API_URL = os.environ.get("WALLET_API_URL", "https://mempool.space/api/address/")

# CORS allowed origins
ALLOWED_ORIGINS_RAW = os.getenv("ALLOWED_ORIGINS")


class config:
    """Configuration class for the Flask application."""

    # Session configuration
    SESSION_TYPE = "redis"
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_USE_SIGNER = True
    SESSION_REFRESH_EACH_REQUEST = True
    PERMANENT_SESSION_LIFETIME = int(86400)

    # Database configuration
    SQLALCHEMY_DATABASE_URI = DB_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT configuration
    JWT_SECRET_KEY = JWT_SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # Secret keys configuration
    PEPPER = PEPPER
    ENCRYPTION_KEY = ENCRYPTION_KEY

    # Account lockout configuration
    MAX_PASSWORD_ATTEMPTS = 5
    LOCKOUT_TIME = timedelta(minutes=15)

    # Wallet api configuration
    WALLET_API_URL = WALLET_API_URL
    WALLET_API_TIMEOUT = 10  # seconds
    NUM_ADDRESSES_TO_DERIVE = 25

    # CORS configuration
    CORS_ORIGINS = [
        origin.strip() for origin in ALLOWED_ORIGINS_RAW.split(",") if origin.strip()
    ]
