import flask  # type: ignore
import requests  # type: ignore
from http import HTTPStatus
from bitcoinlib.keys import HDKey  # type: ignore

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
                    "xpub": wallet.xpub,
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

    addresses = _get_addresses_from_xpub(wallet.xpub)
    if not addresses:
        # Check if xpub is valid by trying to derive addresses
        return flask.make_response(
            {"msg": "Invalid extended public key."}, HTTPStatus.BAD_REQUEST
        )

    wallet_data = _fetch_wallet_data(addresses)
    wallet_txs = _fetch_wallet_transactions(addresses)

    return flask.make_response(
        {
            "msg": "OK",
            "wallet": {
                "uuid": wallet.uuid,
                "total_received": wallet_data["received"],
                "total_sent": wallet_data["sent"],
                "current_balance": wallet_data["balance"],
                "transactions": wallet_txs,
            },
        },
        HTTPStatus.OK,
    )


def _fetch_wallet_data(addresses: list[str]) -> dict:
    """
    Fetch and aggregate wallet data from external API.

    Args:
        addresses: List of wallet addresses to aggregate.

    Returns:
        dict: Wallet financial metrics in BTC (balance, received, sent).
    """
    total_received_satoshis = 0
    total_sent_satoshis = 0
    for address in addresses:
        try:
            response = requests.get(
                f"{current_app.config['WALLET_API_URL']}{address}",
                timeout=current_app.config["WALLET_API_TIMEOUT"],
            )
            response.raise_for_status()

            data = response.json()
            chain_stats = data.get("chain_stats", {})

            # Only aggregate if required chain stats keys are present
            if "funded_txo_sum" in chain_stats and "spent_txo_sum" in chain_stats:
                total_received_satoshis += chain_stats["funded_txo_sum"]
                total_sent_satoshis += chain_stats["spent_txo_sum"]

        except (requests.RequestException, ValueError):
            # Network/HTTP errors or JSON decode errors - continue to next address
            continue

    return {
        "balance": _satoshis_to_btc(total_received_satoshis - total_sent_satoshis),
        "received": _satoshis_to_btc(total_received_satoshis),
        "sent": _satoshis_to_btc(total_sent_satoshis),
    }


def _fetch_wallet_transactions(addresses: list[str]) -> list[dict]:
    """
    Fetch and parse wallet transactions - Ledger Live style (simplified view).

    Args:
        addresses: List of wallet addresses.

    Returns:
        list[dict]: A list of transactions with details.
    """
    all_txs = {}
    addresses_set = set(addresses)

    for address in addresses:
        try:
            response = requests.get(
                f"{current_app.config['WALLET_API_URL']}{address}/txs",
                timeout=current_app.config["WALLET_API_TIMEOUT"],
            )
            response.raise_for_status()

            transactions = response.json()
            for transaction in transactions:
                transaction_id = transaction.get("txid")

                if transaction_id in all_txs:
                    # Skip if transaction already processed
                    continue

                timestamp = transaction.get("status", {}).get("block_time")

                # Calculate net amount and determine transaction type
                wallet_sent_satoshis = 0
                wallet_received_satoshis = 0
                first_external_from = None
                first_external_to = None
                my_address = None

                # Inputs (from)
                for vin in transaction.get("vin", []):
                    addr = vin.get("prevout", {}).get("scriptpubkey_address")
                    amount = vin.get("prevout", {}).get("value", 0)

                    if addr:
                        if addr in addresses_set:
                            wallet_sent_satoshis += amount
                            if not my_address:
                                my_address = addr
                        elif not first_external_from:
                            first_external_from = addr

                # Outputs (to)
                for vout in transaction.get("vout", []):
                    addr = vout.get("scriptpubkey_address")
                    amount = vout.get("value", 0)

                    if addr:
                        if addr in addresses_set:
                            wallet_received_satoshis += amount
                            if not my_address:
                                my_address = addr
                        elif not first_external_to:
                            first_external_to = addr

                # Determine transaction type and net amount
                net = wallet_received_satoshis - wallet_sent_satoshis
                if net > 0:
                    tx_type = "received"
                    amount_satoshis = wallet_received_satoshis
                    from_addr = first_external_from or "Unknown"
                    to_addr = my_address
                elif net < 0:
                    tx_type = "sent"
                    amount_satoshis = abs(net)
                    from_addr = my_address
                    to_addr = first_external_to or "Unknown"
                else:
                    tx_type = "internal"
                    amount_satoshis = wallet_received_satoshis
                    from_addr = my_address
                    to_addr = my_address

                all_txs[transaction_id] = {
                    "uuid": transaction_id,
                    "type": tx_type,
                    "date": timestamp,
                    "confirmed": transaction.get("status", {}).get("confirmed", False),
                    "amount": _satoshis_to_btc(amount_satoshis),
                    "fee": _satoshis_to_btc(transaction.get("fee", 0)),
                    "origin_address": from_addr,
                    "destination_address": to_addr,
                }

        except (requests.RequestException, ValueError):
            # Network/HTTP errors or JSON decode errors - continue to next address
            continue

    # Sort transactions by date, newest first
    return sorted(all_txs.values(), key=lambda x: x["date"], reverse=True)


def _satoshis_to_btc(satoshis: int | float) -> float:
    """
    Convert satoshis to BTC with 8 decimal places.

    Args:
        satoshis: Amount in satoshis.

    Returns:
        float: Amount in BTC.
    """
    return round(satoshis / SATOSHIS_PER_BTC, 8)


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

    addresses = _get_addresses_from_xpub(xpub)
    if not addresses:
        # Check if xpub is valid by trying to derive addresses
        return flask.make_response(
            {"msg": "Invalid extended public key."}, HTTPStatus.BAD_REQUEST
        )

    new_wallet = models.Wallet(xpub=xpub)
    DB.session.add(new_wallet)
    DB.session.commit()

    return flask.make_response({"msg": "Wallet added successfully."}, HTTPStatus.OK)


def _get_addresses_from_xpub(xpub: str) -> list[str]:
    """
    Derive addresses from the given xpub.

    Args:
        xpub (str): The wallet extended public key.

    Returns:
        list[str]: A list of derived addresses.
    """
    try:
        key = HDKey(xpub)

        addresses = []
        for i in range(2):
            child = key.subkey_for_path(f"0/{i}")
            addresses.append(child.address(encoding="bech32"))

        return addresses
    except Exception:
        return []


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
