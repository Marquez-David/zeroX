import hashlib
import requests  # type: ignore
import re

from pydantic import BaseModel, EmailStr, validator, constr  # type: ignore


class RegisterSchema(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    password: str

    @validator("password")
    def check_strength(cls, v: str) -> str:
        if len(v) < 14:
            raise ValueError("Password must be at least 14 characters.")
        elif re.search(r"(.)\1{2,}", v):
            raise ValueError("Password must not contain repetitive characters.")
        return v

    @validator("password")
    def check_pwned(cls, v: str) -> str:
        try:
            hash_ = hashlib.sha1(v.encode()).hexdigest().upper()
            prefix, suffix = hash_[:5], hash_[5:]
            url = f"https://api.pwnedpasswords.com/range/{prefix}"
            headers = {"Add-Padding": "true"}
            response = requests.get(url, headers=headers)

            if suffix in {line.split(":")[0] for line in response.text.splitlines()}:
                raise ValueError("Password unsafe, choose another one")
        except requests.RequestException:
            raise ValueError("Error checking password safety")
        return v
