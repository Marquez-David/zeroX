from pydantic import BaseModel, field_validator  # type: ignore


class ChangeUsernameSchema(BaseModel):
    """Schema for user username change."""

    username: str

    @field_validator("username")
    def strip_whitespace(cls, value):
        """Strip leading and trailing whitespace from input strings before validation."""
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("username")
    def check_length(cls, value: str) -> str:
        """Validate username length."""
        if len(value) < 8:
            raise ValueError("Username must be at least 8 characters.")
        return value
