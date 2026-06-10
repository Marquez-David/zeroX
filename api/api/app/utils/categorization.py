import re
import typing

_INTER_ACCOUNT_KEYWORDS = (
    "recarga de",
    "revolut",
    "transferencia entre cuentas",
    "autotraspaso",
    "autotransferencia",
    "paypal europe",
)


def normalize_concept(concept: typing.Optional[str]) -> str:
    """
    Normalize a concept string by removing dates, numbers and standalone slashes or dashes.

    Args:
        concept (str): The input concept string to normalize.

    Returns:
        str: The normalized concept string.
    """
    if not concept:
        return ""
    s = concept.lower()
    s = re.sub(r"\b\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}\b", "", s)
    s = re.sub(r"\b\d{5,}\b", "", s)
    s = re.sub(r"(?<![A-Za-z])\b\d{1,4}\b(?![A-Za-z])", "", s)
    s = re.sub(r"(?<!\w)[/\-]+(?!\w)", "", s)
    s = " ".join(s.split())
    return s.strip()


def is_inter_account_transfer(concept: typing.Optional[str]) -> bool:
    """
    Determine if a given concept string indicates an inter-account transfer.

    Args:
        concept (str): The input concept string to check.

    Returns:
        bool: True if the concept indicates an inter-account transfer, False otherwise.
    """
    if not concept:
        return False

    return any(kw in concept.lower() for kw in _INTER_ACCOUNT_KEYWORDS)
