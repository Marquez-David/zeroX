import typing
import uuid as uuid_gen
import config
import hmac

from argon2 import PasswordHasher  # type: ignore

from sqlalchemy.dialects import postgresql
from datetime import datetime, timezone

from app.db import DB


class User(DB.Model):
    """
    SQL table to store user data.

    Attributes:
        id (int): The unique identifier for the user.
        uuid (uuid.UUID): The UUID of the user.
        username (str): The username of the user.
        email (str): The email address of the user.
        password_hash (str): The hashed password of the user.
        password_attempts (int): The number of password attempts made by the user.
        locked (datetime): Time until which the user is locked out.
    """

    __tablename__ = "users"
    id: int = DB.Column(DB.Integer, primary_key=True, nullable=False, unique=True)
    uuid: uuid_gen.UUID = DB.Column(
        postgresql.UUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid_gen.uuid4,
    )
    username: str = DB.Column(DB.String(64), index=True, unique=False, nullable=False)
    email: str = DB.Column(DB.String(128), index=True, unique=True, nullable=False)
    password_hash: typing.Optional[str] = DB.Column(DB.String(128), nullable=True)
    password_attempts: int = DB.Column(DB.Integer, default=0, nullable=False)
    locked: typing.Optional[datetime] = DB.Column(
        DB.DateTime(timezone=True), nullable=True, default=None
    )
    reports = DB.relationship(
        "Report", back_populates="user", cascade="all, delete-orphan"
    )

    def __init__(self, email: str, password: typing.Optional[str] = None) -> None:
        """
        Initialize a User instance.

        Args:
            email (str): The email address of the user.
            password_hash (Optional[str]): The password hash of the user.

        """
        self.username = email.split("@")[0]
        self.email = email
        if password is not None:
            self.password_hash = self.hash_password(password)

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
        )

    def hash_password(self, password: str) -> str:
        """
        Hash the password using Argon2 with a pepper for added security.

        Args:
            password (str): The password to hash.

        Returns:
            str: The hashed password.
        """
        ph = PasswordHasher()
        pepper = config.config.PEPPER

        # Use HMAC to pre-hash the password with the pepper for added security
        hmac_password = hmac.digest(
            key=pepper.encode(), msg=password.encode(), digest="SHA256"
        )

        return ph.hash(hmac_password)

    def check_password(self, password: str) -> bool:
        """
        Check if the provided password matches the stored password hash.

        Args:
            password (str): The password to check.

        Returns:
            bool: True if the password matches, False otherwise.
        """
        ph = PasswordHasher()
        pepper = config.config.PEPPER

        # Use HMAC to pre-hash the password with the pepper for added security
        hmac_password = hmac.digest(
            key=pepper.encode(), msg=password.encode(), digest="SHA256"
        )

        try:
            ph.verify(self.password_hash, hmac_password)
        except Exception:
            # If the password does not match, return False
            return False

        if ph.check_needs_rehash(self.password_hash):
            # If the password needs rehashing, rehash it
            self.password_hash = self.hash_password(password)

        return True


class Report(DB.Model):
    """
    SQL table to store report data.

    Attributes:
        id (int): The unique identifier for the report.
        uuid (uuid.UUID): The UUID of the report.
        date (datetime): The date of the report.
        balance (float): The balance of the report.
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
    user_id: int = DB.Column(
        DB.Integer, DB.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user = DB.relationship("User", back_populates="reports")
    operations = DB.relationship(
        "Operation", back_populates="report", cascade="all, delete-orphan"
    )

    def __init__(self, balance: float) -> None:
        """
        Initialize a Report instance.

        Args:
            balance (float): The balance of the report.
        """
        self.date = datetime.now(timezone.utc)
        self.balance = balance

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
    report_id: int = DB.Column(
        DB.Integer, DB.ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
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
        )


class Category(DB.Model):
    """
    SQL table to store category data.

    Attributes:
        id (int): The unique identifier for the category.
        uuid (uuid.UUID): The UUID of the category.
        name (str): The name of the category.
        description (str): The description of the category.
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
        )
