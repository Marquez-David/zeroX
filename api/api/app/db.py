import typing
import flask_sqlalchemy  # type: ignore

from flask_sqlalchemy import model  # type: ignore
from sqlalchemy import exc as sql_orm_exc
from flask_migrate import Migrate  # type: ignore


class BaseModel(model.Model):
    """Base model class for all database models."""

    def __repr__(self) -> str:
        return self._repr(id=self.id)

    def _repr(self, **fields: typing.Dict[str, typing.Any]) -> str:
        """Return a string representation of the model."""
        field_strings = []
        for key, value in fields.items():
            try:
                field_strings.append(f"{key}={value}")
            except sql_orm_exc.DetachedInstanceError:
                field_strings.append(f"{key}=DetachedInstanceError")
        return f"<{self.__class__.__name__}({', '.join(field_strings)})>"


DB = flask_sqlalchemy.SQLAlchemy(model_class=BaseModel)
migrate = Migrate(compare_type=True)
