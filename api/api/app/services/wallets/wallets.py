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


def _fetch_address_chain_stats(address: str) -> tuple[int, int] | None:
    """
    Fetch chain stats for a single address.

    Args:
        address: A wallet address.

    Returns:
        Tuple of (received_satoshis, sent_satoshis) or None if error.
    """
    try:
        response = requests.get(
            f"{current_app.config['WALLET_API_URL']}{address}",
            timeout=current_app.config["WALLET_API_TIMEOUT"],
        )
        response.raise_for_status()

        data = response.json()
        chain_stats = data.get("chain_stats", {})

        if "funded_txo_sum" in chain_stats and "spent_txo_sum" in chain_stats:
            return (chain_stats["funded_txo_sum"], chain_stats["spent_txo_sum"])
    except (requests.RequestException, ValueError):
        pass

    return None


def _fetch_wallet_data(addresses: list[str]) -> dict:
    """
    Fetch and aggregate wallet data from external API.

    Args:
        addresses: List of wallet addresses to aggregate.

    Returns:
        dict: Wallet financial metrics in BTC (balance, received, sent).
    """
    # Fetch all chain stats, filter out None values
    chain_stats_list = [
        stats
        for stats in map(_fetch_address_chain_stats, addresses)
        if stats is not None
    ]

    # Aggregate using sum() - more pythonic than manual loops
    total_received = sum(received for received, _ in chain_stats_list)
    total_sent = sum(sent for _, sent in chain_stats_list)

    return {
        "balance": _satoshis_to_btc(total_received - total_sent),
        "received": _satoshis_to_btc(total_received),
        "sent": _satoshis_to_btc(total_sent),
    }


def _fetch_wallet_transactions(addresses: list[str]) -> list[dict]:
    """
    Fetch and parse wallet transactions - Ledger Live style (simplified view).

    Args:
        addresses: List of wallet addresses.

    Returns:
        list[dict]: A list of transactions with details.
    """
    addresses_set = set(addresses)
    all_txs = {}

    for address in addresses:
        try:
            response = requests.get(
                f"{current_app.config['WALLET_API_URL']}{address}/txs",
                timeout=current_app.config["WALLET_API_TIMEOUT"],
            )
            response.raise_for_status()

            transactions = response.json()
            for transaction in transactions:
                if (transaction_id := transaction.get("txid")) in all_txs:
                    continue

                timestamp = transaction.get("status", {}).get("block_time")

                inputs = transaction.get("vin", [])
                outputs = transaction.get("vout", [])

                wallet_sent_satoshis = sum(
                    vin.get("prevout", {}).get("value", 0)
                    for vin in inputs
                    if vin.get("prevout", {}).get("scriptpubkey_address")
                    in addresses_set
                )

                wallet_received_satoshis = sum(
                    vout.get("value", 0)
                    for vout in outputs
                    if vout.get("scriptpubkey_address") in addresses_set
                )

                first_external_from = next(
                    (
                        vin.get("prevout", {}).get("scriptpubkey_address")
                        for vin in inputs
                        if vin.get("prevout", {}).get("scriptpubkey_address")
                        not in addresses_set
                    ),
                    "Unknown",
                )

                first_external_to = next(
                    (
                        vout.get("scriptpubkey_address")
                        for vout in outputs
                        if vout.get("scriptpubkey_address") not in addresses_set
                    ),
                    "Unknown",
                )

                net = wallet_received_satoshis - wallet_sent_satoshis
                if net > 0:
                    tx_type = "received"
                    amount_satoshis = wallet_received_satoshis
                    from_addr = first_external_from
                    to_addr = next(
                        (
                            vout.get("scriptpubkey_address")
                            for vout in outputs
                            if vout.get("scriptpubkey_address") in addresses_set
                        ),
                        "Unknown",
                    )
                elif net < 0:
                    tx_type = "sent"
                    amount_satoshis = abs(net)
                    from_addr = next(
                        (
                            vin.get("prevout", {}).get("scriptpubkey_address")
                            for vin in inputs
                            if vin.get("prevout", {}).get("scriptpubkey_address")
                            in addresses_set
                        ),
                        "Unknown",
                    )
                    to_addr = first_external_to
                else:
                    tx_type = "internal"
                    amount_satoshis = wallet_received_satoshis
                    from_addr = to_addr = next(
                        (
                            addr
                            for addr in addresses_set
                            if addr
                            in [
                                vin.get("prevout", {}).get("scriptpubkey_address")
                                for vin in inputs
                            ]
                        ),
                        "Unknown",
                    )

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

    # Sort transactions by date, newest first.
    return sorted(
        all_txs.values(),
        key=lambda x: x["date"] if x["date"] is not None else float("inf"),
        reverse=True,
    )


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
        num_addresses = current_app.config.get("NUM_ADDRESSES_TO_DERIVE", 20)
        return [
            key.subkey_for_path(f"0/{i}").address(encoding="bech32")
            for i in range(num_addresses)
        ]
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
