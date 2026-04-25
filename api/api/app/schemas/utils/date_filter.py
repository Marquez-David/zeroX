from typing import Optional

from pydantic import field_validator  # type: ignore

from app.schemas.utils.pagination import PaginationSchema


class DateFilterSchema(PaginationSchema):
    """Schema for cursor pagination plus optional year filtering."""

    year: Optional[int] = None

    @field_validator("year")
    def year_in_range(cls, v):
        """Ensure year is within a sane bound."""
        if v is not None and (v < 1900 or v > 9999):
            raise ValueError("invalid year")
        return v
