from pydantic import BaseModel, EmailStr, validator  # type: ignore


class LoginSchema(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str

    @validator("email", "password", pre=True)
    def strip_whitespace(cls, value):
        """Strip leading and trailing whitespace from input strings before validation."""
        if isinstance(value, str):
            return value.strip()
        return value

    @validator("password")
    def password_not_empty(cls, value):
        """Ensure password is not empty after whitespace stripping."""
        if not value:
            raise ValueError("Password must not be empty")
        return value
