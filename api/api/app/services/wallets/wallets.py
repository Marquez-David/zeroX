import flask  # type: ignore
import requests  # type: ignore
from http import HTTPStatus

from flask import current_app  # type: ignore
from flask_jwt_extended import current_user  # type: ignore

from app import models
from app.db import DB

SATOSHIS_PER_BTC = 100_000_000  # Number of satoshis in one Bitcoin


def retrieve_wallets() -> flask.make_response:
    """
    Retrieve all wallets associated with the current user.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """

    wallets = models.Wallet.query.filter_by(user_id=current_user.id).all()
    return flask.make_response(
        {
            "msg": "OK",
            "wallets": [
                {
                    "uuid": wallet.uuid,
                    "address": wallet.address,
                }
                for wallet in wallets
            ],
        },
        HTTPStatus.OK,
    )


def retrieve_wallet(uuid: str) -> flask.make_response:
    """
    Retrieve a single wallet associated with the current user.

    Args:
        uuid (str): The UUID of the wallet to retrieve.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """
    wallet = models.Wallet.query.filter_by(user_id=current_user.id, uuid=uuid).first()
    if not wallet:
        # Check if the wallet exists for the user
        return flask.make_response({"msg": "Invalid wallet."}, HTTPStatus.NOT_FOUND)

    wallet_data, error_response = _fetch_wallet_data(wallet.xpub)
    if error_response:
        # Check if there was an error fetching wallet data
        return error_response

    # wallet_txs, error_response = _fetch_wallet_txs(wallet.address)
    # if error_response:
    #     # Check if there was an error fetching transactions
    #     return error_response

    return flask.make_response(
        {
            "msg": "OK",
            # "wallet": {
            #     "uuid": wallet.uuid,
            #     "address": wallet.address,
            #     "total_received": wallet_data["total_received"],
            #     "total_sent": wallet_data["total_sent"],
            #     "current_balance": wallet_data["current_balance"],
            #     "transactions": wallet_txs,
            # },
        },
        HTTPStatus.OK,
    )


def _fetch_wallet_data(xpub: str) -> tuple[dict, flask.make_response]:
    """
    Parse wallet data from the external API response.

    Args:
        xpub (str): The wallet xpub.

    Returns:
        tuple: A tuple containing the parsed data dictionary and a Flask response object in case of error.
    """
    try:
        response = requests.get(
            f"{current_app.config['WALLET_SERVICE_URL']}/dashboards/xpub/{xpub}",
        )

    except requests.exceptions.Timeout:
        return None, flask.make_response(
            {"msg": "Wallet service timeout."}, HTTPStatus.GATEWAY_TIMEOUT
        )

    except requests.exceptions.RequestException as e:
        return None, flask.make_response(
            {"msg": "Failed to retrieve wallet information."},
            HTTPStatus.BAD_GATEWAY,
        )

    data = response.json()

    # if data.status_code != HTTPStatus.OK:
    #     return None, flask.make_response(
    #         {"msg": "Invalid wallet xpub."}, HTTPStatus.BAD_REQUEST
    #     )

    # wallet_data = data.get("data", {}).get(xpub, {})

    # address_data = wallet_data.get("address", {})
    # balance_satoshis = address_data.get("balance", 0)
    # received_satoshis = address_data.get("received", 0)
    # spent_satoshis = address_data.get("spent", 0)

    # # Parsear transacciones
    # transactions = wallet_data.get("transactions", [])
    # parsed_txs = []

    # for tx_hash in transactions[:20]:  # Limitar a las últimas 20
    #     tx_detail = _fetch_transaction_details(tx_hash)
    #     if tx_detail:
    #         parsed_txs.append(tx_detail)

    # # Convert satoshis to BTC
    # total_received_btc = received_satoshis / SATOSHIS_PER_BTC
    # total_sent_btc = spent_satoshis / SATOSHIS_PER_BTC
    # current_balance_btc = balance_satoshis / SATOSHIS_PER_BTC

    # data = {
    #     "total_received": round(total_received_btc, 8),  # Bitcoin has 8 decimals
    #     "total_sent_btc": round(total_sent_btc, 8),
    #     "current_balance_btc": round(current_balance_btc, 8),
    # }

    data = {"test": "data"}

    return data, None


# def _fetch_wallet_txs(address: str) -> tuple[list[dict], flask.make_response]:
#     """
#     Fetch and parse wallet transactions from the external API.

#     Args:
#         address (str): The wallet address.

#     Returns:
#         tuple: A tuple containing a list of transaction dictionaries and a Flask response object in case of error.
#     """
#     try:
#         response = requests.get(
#             f"{current_app.config['WALLET_SERVICE_URL']}/address/{address}/txs"
#         )

#     except requests.exceptions.Timeout:
#         return None, flask.make_response(
#             {"msg": "Wallet service timeout."}, HTTPStatus.GATEWAY_TIMEOUT
#         )

#     except requests.exceptions.RequestException as e:
#         return None, flask.make_response(
#             {"msg": "Failed to retrieve wallet transactions."},
#             HTTPStatus.BAD_GATEWAY,
#         )

#     txs_data = response.json()

#     transactions = []
#     for tx in txs_data:
#         # Calculate BTC received in this transaction for this address
#         btc_received = 0
#         btc_sent = 0

#         # Check outputs (vout) to see what we received
#         for vout in tx.get("vout", []):
#             if vout.get("scriptpubkey_address") == address:
#                 btc_received += vout.get("value", 0)

#         # Check inputs (vin) to see what we sent
#         for vin in tx.get("vin", []):
#             if vin.get("prevout", {}).get("scriptpubkey_address") == address:
#                 btc_sent += vin.get("prevout", {}).get("value", 0)

#         # Net amount (positive = received, negative = sent)
#         net_amount = btc_received - btc_sent

#         transactions.append(
#             {
#                 "txid": tx.get("txid"),
#                 "confirmed": tx.get("status", {}).get("confirmed", False),
#                 "block_height": tx.get("status", {}).get("block_height"),
#                 "timestamp": tx.get("status", {}).get("block_time"),
#                 "btc_received": btc_received / SATOSHIS_PER_BTC,
#                 "btc_sent": btc_sent / SATOSHIS_PER_BTC,
#                 "net_amount": net_amount / SATOSHIS_PER_BTC,
#                 "fee": tx.get("fee", 0) / SATOSHIS_PER_BTC,
#             }
#         )

#     return transactions, None


def add_wallet(xpub: str) -> flask.make_response:
    """
    Add a new wallet for the current user.

    Args:
        xpub (str): The wallet xpub to add.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """
    if not xpub:
        # Check if xpub is provided
        return flask.make_response(
            {"msg": "Wallet extended public key is required."}, HTTPStatus.BAD_REQUEST
        )

    wallet = models.Wallet.get(xpub=xpub).first()
    if wallet:
        # Check if the wallet already exists for the user
        return flask.make_response(
            {"msg": "Wallet already exists."}, HTTPStatus.CONFLICT
        )

    _, error_response = _fetch_wallet_data(xpub)
    if error_response:
        # Check if address exists by fetching wallet data
        return error_response

    new_wallet = models.Wallet(xpub=xpub)
    DB.session.add(new_wallet)
    DB.session.commit()

    return flask.make_response({"msg": "Wallet added successfully."}, HTTPStatus.OK)


def remove_wallet(uuid: str) -> flask.make_response:
    """
    Remove a wallet for the current user.

    Args:
        uuid (str): The UUID of the wallet to remove.

    Returns:
        flask.Response: A Flask response object with a JSON message and appropriate HTTP status code.
    """
    wallet = models.Wallet.query.filter_by(user_id=current_user.id, uuid=uuid).first()
    if not wallet:
        # Check if the wallet exists for the user
        return flask.make_response({"msg": "Invalid wallet."}, HTTPStatus.NOT_FOUND)

    DB.session.delete(wallet)
    DB.session.commit()

    return flask.make_response({"msg": "Wallet removed successfully."}, HTTPStatus.OK)
