import flask  # type: ignore

from flask_jwt_extended import jwt_required  # type: ignore

from app.services import wallets
from app.routes.wallets import BP


@BP.route("/wallets", methods=["GET"])
@jwt_required()
def retrieve_wallets() -> flask.make_response:
    """
    Retrieve all wallets associated with the current user.

    Returns:
        A Flask response object containing the user's wallets.
    """
    return wallets.retrieve_wallets()


@BP.route("/wallets/<string:uuid>", methods=["GET"])
@jwt_required()
def retrieve_wallet(uuid: str) -> flask.make_response:
    """
    Retrieve a single wallet associated with the current user.

    Args:
        uuid (str): The UUID of the wallet to retrieve.

    Returns:
        A Flask response object containing the user's wallet.
    """
    return wallets.retrieve_wallet(uuid)


@BP.route("/wallets", methods=["POST"])
@jwt_required()
def add_wallet() -> flask.make_response:
    """
    Add a new wallet for the current user.

    Returns:
        A Flask response object indicating the result of the operation.
    """
    address = flask.request.json.get("address", "")
    return wallets.add_wallet(address)


@BP.route("/wallets", methods=["DELETE"])
@jwt_required()
def remove_wallet() -> flask.make_response:
    """
    Remove a wallet for the current user.

    Returns:
        A Flask response object indicating the result of the operation.
    """
    # return retrieve_single_wallet()
