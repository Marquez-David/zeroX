import typing
import requests  # type: ignore

from functools import wraps

import config

_access_token: str | None = None
_refresh_token: str | None = None


def request(method: str, endpoint: str, **kwargs) -> dict:
    """
    Makes an HTTP request to the MCP API.

    Args:
        method (str): The HTTP method (e.g., "GET", "POST").
        endpoint (str): The API endpoint (e.g., "/auth/login").
        **kwargs: Additional arguments to pass to requests.request().

    Returns:
        dict: The JSON response from the API, or an error dictionary if the request fails.
    """
    try:
        response = requests.request(method, f"{config.BASE_URL}{endpoint}", **kwargs)
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as e:
        return {"msg": "KO", "error": str(e), "status_code": e.response.status_code}
    except requests.RequestException as e:
        return {"msg": "KO", "error": str(e)}


def auth_header() -> dict[str, str]:
    """
    Returns the Authorization header with the current access token.

    Raises:
        RuntimeError: If there is no active session (no access token).

    Returns:
      dict[str, str]: A dictionary containing the Authorization header.
    """
    if not _access_token:
        raise RuntimeError("No active session. Please log in first.")
    return {"Authorization": f"Bearer {_access_token}"}


def save_tokens(access: str, refresh: str) -> None:
    """
    Saves the access and refresh tokens in memory.

    Args:
        access (str): The access token to save.
        refresh (str): The refresh token to save.
    """
    global _access_token, _refresh_token
    _access_token = access
    _refresh_token = refresh


def clear_tokens() -> None:
    """Clears the current session tokens from memory."""
    global _access_token, _refresh_token
    _access_token = None
    _refresh_token = None


def get_refresh_token() -> str | None:
    """Returns the current refresh token, or None if not set."""
    return _refresh_token


def _refresh_access_token() -> bool:
    """Refresh the access token. Returns True if successful."""
    global _access_token, _refresh_token

    if not _refresh_token:
        return False

    data = request(
        "POST",
        "/auth/refresh",
        headers={"Authorization": f"Bearer {_refresh_token}"},
    )
    if "access_token" not in data:
        return False

    _access_token = data["access_token"]
    if "refresh_token" in data:
        _refresh_token = data["refresh_token"]

    return True


def with_token_refresh(func: typing.Callable) -> typing.Callable:
    """Decorator that retries once after refreshing the token on 401."""

    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        if isinstance(result, dict) and result.get("status_code") == 401:
            if _refresh_access_token():
                return func(*args, **kwargs)
        return result

    return wrapper
