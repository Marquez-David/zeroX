from typing import Optional

from pydantic import BaseModel, field_validator  # type: ignore


class YearFilterSchema(BaseModel):
    """Schema for endpoints that optionally filter by calendar year."""

    year: Optional[int] = None

    @field_validator("year")
    def year_in_range(cls, v):
        """Ensure year is within a sane bound."""
        if v is not None and (v < 1900 or v > 9999):
            raise ValueError("invalid year")
        return v
