import flask  # type: ignore

from app.routes.wallets import BP

from flask_jwt_extended import jwt_required  # type: ignore

from app.services.wallets.wallets import (
    retrieve_all_wallets,
    retrieve_single_wallet,
    add_wallet_data,
)


@BP.route("/wallets", methods=["GET"])
@jwt_required()
def retrieve_wallets() -> flask.make_response:
    """Retrieve all wallets associated with the current user.

    Returns:
        A Flask response object containing the user's wallets.
    """
    return retrieve_all_wallets()


@BP.route("/wallets/<string:uuid>", methods=["GET"])
@jwt_required()
def retrieve_wallet(uuid: str) -> flask.make_response:
    """Retrieve a single wallet associated with the current user.

    Args:
        uuid (str): The UUID of the wallet to retrieve.

    Returns:
        A Flask response object containing the user's wallet.
    """
    return retrieve_single_wallet(uuid)


@BP.route("/wallets", methods=["POST"])
@jwt_required()
def add_wallet() -> flask.make_response:
    """Add a new wallet for the current user.

    Returns:
        A Flask response object indicating the result of the operation.
    """
    address = flask.request.json.get("address", "")
    return add_wallet_data(address)


@BP.route("/wallets", methods=["DELETE"])
@jwt_required()
def remove_wallet() -> flask.make_response:
    """Remove a wallet for the current user.

    Returns:
        A Flask response object indicating the result of the operation.
    """
    # return retrieve_single_wallet()
