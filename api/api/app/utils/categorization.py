import re
import typing


def normalize_concept(concept: typing.Optional[str]) -> str:
    """
    Normalize a concept string by removing dates, long numbers, short numbers, and standalone slashes or dashes.

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
