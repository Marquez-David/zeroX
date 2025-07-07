import hashlib
import requests  # type: ignore
import re

from pydantic import BaseModel, EmailStr, validator, constr  # type: ignore


class RegisterSchema(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    password: str

    @validator("email", "password", pre=True)
    def strip_whitespace(cls, value):
        """Strip leading and trailing whitespace from input strings before validation."""
        if isinstance(value, str):
            return value.strip()
        return value

    @validator("password")
    def check_strength(cls, value: str) -> str:
        """Validate password strength."""
        if len(value) < 14:
            raise ValueError("Password must be at least 14 characters.")
        elif re.search(r"(.)\1{2,}", value):
            raise ValueError("Password must not contain repetitive characters.")
        return value

    @validator("password")
    def check_pwned(cls, value: str) -> str:
        """Check if the password has been exposed in known data breaches."""
        try:
            hash_ = hashlib.sha1(value.encode()).hexdigest().upper()
            prefix, suffix = hash_[:5], hash_[5:]
            url = f"https://api.pwnedpasswords.com/range/{prefix}"
            headers = {"Add-Padding": "true"}
            response = requests.get(url, headers=headers)

            if suffix in {line.split(":")[0] for line in response.text.splitlines()}:
                raise ValueError("Password unsafe, choose another one")
        except requests.RequestException:
            raise ValueError("Error checking password safety")
        return value
