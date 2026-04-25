from typing import Optional

from pydantic import BaseModel, field_validator  # type: ignore


class PaginationSchema(BaseModel):
    """Schema for cursor-based pagination query parameters."""

    cursor: Optional[str] = None
    limit: int = 15

    @field_validator("limit")
    def limit_in_range(cls, v):
        """Ensure limit is between 1 and 50."""
        if v < 1 or v > 50:
            raise ValueError("limit must be between 1 and 50")
        return v

    @field_validator("cursor")
    def cursor_not_empty(cls, v):
        """Strip whitespace and reject empty cursor strings."""
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("cursor must not be empty")
        return v
