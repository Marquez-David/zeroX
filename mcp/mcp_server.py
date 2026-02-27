import config
import utils
from mcp.server.fastmcp import FastMCP  # type: ignore

mcp = FastMCP("zeroX")


@mcp.tool()
def mcp_login(email: str, password: str) -> dict:
    """
    Login user to API. Saves the access and refresh tokens in memory for future requests.

    Args:
        email (str): User's email.
        password (str): User's password.

    Returns:
        dict: A dictionary with the login result.
    """
    data = utils.request(
        "POST", "/auth/login", json={"email": email, "password": password}
    )
    if "access_token" not in data:
        return {"msg": "KO", "detail": data}

    utils.save_tokens(data["access_token"], data["refresh_token"])
    return {"msg": "OK"}


@mcp.tool()
def mcp_logout() -> dict:
    """Logout user from API. Clears the current session tokens."""
    data = utils.request(
        "POST",
        "/auth/logout",
        headers=utils.auth_header(),
        json={"refresh_token": utils.get_refresh_token()},
    )
    utils.clear_tokens()
    return data


@mcp.tool()
@utils.with_token_refresh
def mcp_retrieve_reports() -> dict:
    """
    Retrieves all reports from the API.

    Returns:
        dict: The JSON response from the API, or an error dictionary if the request fails.
    """
    return utils.request("GET", "/reports", headers=utils.auth_header())


@mcp.tool()
@utils.with_token_refresh
def mcp_retrieve_report(uuid: str) -> dict:
    """
    Retrieves a specific report by its UUID from the API.

    Args:
        uuid (str): The UUID of the report to retrieve.

    Returns:
        dict: The JSON response from the API, or an error dictionary if the request fails.
    """
    return utils.request("GET", f"/reports/{uuid}", headers=utils.auth_header())


@mcp.tool()
@utils.with_token_refresh
def mcp_upload_report(file_name: str) -> dict:
    """
    Uploads a report file to the API.

     Args:
        file_name (str): The name of the file to upload. The file should be located in the UPLOADS_DIR.

     Returns:
        dict: The JSON response from the API, or an error dictionary if the request fails.
    """
    file_path = f"{config.UPLOADS_DIR}/{file_name}"
    with open(file_path, "rb") as f:
        return utils.request(
            "POST",
            "/reports/",
            headers=utils.auth_header(),
            files={
                "file": (
                    file_name,
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )


@mcp.tool()
@utils.with_token_refresh
def mcp_delete_report(uuid: str) -> dict:
    """
    Deletes a specific report by its UUID from the API.

    Args:
        uuid (str): The UUID of the report to delete.

    Returns:
        dict: The JSON response from the API, or an error dictionary if the request fails.
    """
    return utils.request("DELETE", f"/reports/{uuid}", headers=utils.auth_header())


if __name__ == "__main__":
    mcp.run()
