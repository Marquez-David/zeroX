from pydantic import BaseModel, EmailStr, field_validator  # type: ignore


class LoginSchema(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str

    @field_validator("email", "password")
    def strip_whitespace(cls, value):
        """Strip leading and trailing whitespace from input strings before validation."""
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("password")
    def password_not_empty(cls, value):
        """Ensure password is not empty after whitespace stripping."""
        if not value:
            raise ValueError("Password must not be empty")
        return value
