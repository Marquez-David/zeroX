import uuid as uuid_gen
from app.db import DB
from datetime import datetime, timezone

from flask_login import mixins  # type: ignore
from sqlalchemy.dialects import postgresql


class User(mixins.UserMixin, DB.Model):
    """
    SQL table to store user data.

    Attributes:
        id (int): The unique identifier for the user.
        uuid (uuid.UUID): The UUID of the user.
        username (str): The username of the user.
        email (str): The email address of the user.
        categories (list[Category]): The categories associated with the user.
    """

    __tablename__ = "users"
    id: int = DB.Column(DB.Integer, primary_key=True, nullable=False, unique=True)
    uuid: uuid_gen.UUID = DB.Column(
        postgresql.UUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid_gen.uuid4,
    )
    username: str = DB.Column(DB.String(64), index=True, unique=True, nullable=False)
    email: str = DB.Column(DB.String(128), index=True, unique=True, nullable=False)
    categories = DB.relationship("Category", back_populates="user")
    reports = DB.relationship("Report", back_populates="user")

    def __init__(self, username: str, email: str) -> None:
        """
        Initialize a User instance.

        Args:
            username (str): The username of the user.
            email (str): The email address of the user.
        """
        self.username = username
        self.email = email

    def __repr__(self) -> str:
        """
        Return a string representation of the User instance.

        Returns:
            str: A string representation of the User instance.
        """
        return self._repr(
            id=self.id,
            uuid=self.uuid,
            username=self.username,
            email=self.email,
            categories=[category.name for category in self.categories],
        )


class Report(DB.Model):
    """
    SQL table to store report data.

    Attributes:
        id (int): The unique identifier for the report.
        uuid (uuid.UUID): The UUID of the report.
        date (datetime): The date of the report.
        balance (float): The balance of the report.
        url_file (str): The URL of the file associated with the report.
        user_id (int): The ID of the user associated with the report.
    """

    __tablename__ = "reports"
    id: int = DB.Column(DB.Integer, primary_key=True, nullable=False, unique=True)
    uuid: uuid_gen.UUID = DB.Column(
        postgresql.UUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid_gen.uuid4,
    )
    date: datetime = DB.Column(DB.DateTime, nullable=False)
    balance: float = DB.Column(DB.Float, nullable=False)
    url_file: str = DB.Column(DB.String(128), nullable=False, unique=True)
    user_id: int = DB.Column(DB.Integer, DB.ForeignKey("users.id"), nullable=False)
    user = DB.relationship("User", back_populates="reports")
    operations = DB.relationship("Operation", back_populates="report")

    def __init__(self, balance: float, url_file: str) -> None:
        """
        Initialize a Report instance.

        Args:
            balance (float): The balance of the report.
            url_file (str): The URL of the file associated with the report.
        """
        self.date = datetime.now(timezone.utc)
        self.balance = balance
        self.url_file = url_file

    def __repr__(self) -> str:
        """
        Return a string representation of the Report instance.

        Returns:
            str: A string representation of the Report instance.
        """
        return self._repr(
            id=self.id,
            uuid=self.uuid,
            date=self.date,
            balance=self.balance,
            url_file=self.url_file,
            user=self.user,
        )


class Operation(DB.Model):
    """
    SQL table to store operation data.

    Attributes:
        id (int): The unique identifier for the operation.
        uuid (uuid.UUID): The UUID of the operation.
        date (datetime): The date of the operation.
        amount (float): The amount of the operation.
        concept (str): The concept of the operation.
        category_id (int): The ID of the category associated with the operation.
        report_id (int): The ID of the report associated with the operation.
    """

    __tablename__ = "operations"
    id: int = DB.Column(DB.Integer, primary_key=True, nullable=False, unique=True)
    uuid: uuid_gen.UUID = DB.Column(
        postgresql.UUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid_gen.uuid4,
    )
    date: datetime = DB.Column(DB.DateTime, nullable=False)
    amount: float = DB.Column(DB.Float, nullable=False)
    concept: str = DB.Column(DB.String(128), nullable=True)
    category_id: int = DB.Column(
        DB.Integer, DB.ForeignKey("categories.id"), nullable=False
    )
    category = DB.relationship("Category", back_populates="operations")
    report_id: int = DB.Column(DB.Integer, DB.ForeignKey("reports.id"), nullable=False)
    report = DB.relationship("Report", back_populates="operations")

    def __init__(self, amount: float, concept: str) -> None:
        """
        Initialize an Operation instance.

        Args:
            amount (float): The amount of the operation.
            concept (str): The concept of the operation.
        """
        self.date = datetime.now(timezone.utc)
        self.amount = amount
        self.concept = concept

    def __repr__(self) -> str:
        """
        Return a string representation of the Operation instance.

        Returns:
            str: A string representation of the Operation instance.
        """
        return self._repr(
            id=self.id,
            uuid=self.uuid,
            date=self.date,
            amount=self.amount,
            concept=self.concept,
            category=self.category.name,
            report=self.report.url_file,
        )


class Category(DB.Model):
    """
    SQL table to store category data.

    Attributes:
        id (int): The unique identifier for the category.
        uuid (uuid.UUID): The UUID of the category.
        name (str): The name of the category.
        description (str): The description of the category.
        users (list[User]): The users associated with the category.
    """

    __tablename__ = "categories"
    id: int = DB.Column(DB.Integer, primary_key=True, nullable=False, unique=True)
    uuid: uuid_gen.UUID = DB.Column(
        postgresql.UUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid_gen.uuid4,
    )
    name: str = DB.Column(DB.String(64), unique=False, nullable=False)
    description: str = DB.Column(DB.String(128), unique=False, nullable=False)
    user_id: int = DB.Column(DB.Integer, DB.ForeignKey("users.id"), nullable=False)
    user = DB.relationship("User", back_populates="categories")
    operations = DB.relationship("Operation", back_populates="category")

    def __init__(self, name: str, description: str) -> None:
        """
        Initialize a Category instance.

        Args:
            name (str): The name of the category.
            description (str): The description of the category.
        """
        self.name = name
        self.description = description

    def __repr__(self) -> str:
        """
        Return a string representation of the Category instance.

        Returns:
            str: A string representation of the Category instance.
        """
        return self._repr(
            id=self.id,
            uuid=self.uuid,
            name=self.name,
            description=self.description,
            user=self.user.username,
        )
