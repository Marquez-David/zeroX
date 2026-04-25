import base64
import json
import typing
import uuid as uuid_gen

from datetime import datetime

from sqlalchemy import and_, or_  # type: ignore


def encode_cursor(date: datetime, uuid: uuid_gen.UUID) -> str:
    """
    Encode a (date, uuid) pair into an opaque base64 cursor.

    Args:
        date (datetime): The date component of the cursor.
        uuid (uuid.UUID): The uuid component of the cursor.

    Returns:
        str: The opaque base64-encoded cursor.
    """
    payload = json.dumps({"date": date.isoformat(), "uuid": str(uuid)})
    return base64.urlsafe_b64encode(payload.encode()).decode()


def decode_cursor(cursor: str) -> typing.Tuple[datetime, uuid_gen.UUID]:
    """
    Decode an opaque cursor back into (date, uuid).

    Args:
        cursor (str): The opaque base64-encoded cursor.

    Returns:
        Tuple[datetime, uuid.UUID]: The decoded date and uuid.

    Raises:
        ValueError: If the cursor is malformed.
    """
    try:
        # Add forgiving padding: clients that strip "=" from URL-safe base64
        # would otherwise produce undecodable cursors. Excess padding is ignored.
        raw = base64.urlsafe_b64decode(cursor.encode() + b"==").decode()
        payload = json.loads(raw)
        return (
            datetime.fromisoformat(payload["date"]),
            uuid_gen.UUID(payload["uuid"]),
        )
    except (ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise ValueError("Malformed cursor.") from exc


def apply_cursor_pagination(
    query, model, cursor: typing.Optional[str], limit: int
) -> typing.Tuple[list, typing.Optional[str]]:
    """
    Apply ORDER BY (date DESC, uuid DESC), keyset filter, and limit+1 trick.

    The ORDER BY is owned by this helper because it must agree with the
    keyset filter direction; decoupling them is a footgun.

    The model must expose `date` and `uuid` columns.

    Args:
        query: The base SQLAlchemy query (already filtered, NOT ordered).
        model: The model class (must have `date` and `uuid` columns).
        cursor (Optional[str]): The opaque cursor, or None for the first page.
        limit (int): The page size.

    Returns:
        Tuple[list, Optional[str]]: The page rows and the next_cursor (None if last page).

    Raises:
        ValueError: If the cursor is malformed.
    """
    query = query.order_by(model.date.desc(), model.uuid.desc())

    if cursor:
        cursor_date, cursor_uuid = decode_cursor(cursor)
        query = query.filter(
            or_(
                model.date < cursor_date,
                and_(model.date == cursor_date, model.uuid < cursor_uuid),
            )
        )

    rows = query.limit(limit + 1).all()
    if len(rows) > limit:
        rows = rows[:limit]
        last = rows[-1]
        return rows, encode_cursor(last.date, last.uuid)
    return rows, None
