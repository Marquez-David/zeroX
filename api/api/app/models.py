import typing
import uuid as uuid_gen
import config
import hmac
import hashlib

from flask_jwt_extended import current_user  # type: ignore
from argon2 import PasswordHasher  # type: ignore
from cryptography.fernet import Fernet  # type: ignore

from sqlalchemy.dialects import postgresql
from sqlalchemy.ext.hybrid import hybrid_property  # ← nuevo import
from sqlalchemy.orm import query
from datetime import datetime

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
        avatar (bytes): The avatar image of the user.
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
    avatar: typing.Optional[bytes] = DB.Column(
        DB.LargeBinary, nullable=True, default=None
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


class Wallet(DB.Model):
    """
    SQL table to store wallet data.

    Attributes:
        id (int): The unique identifier for the wallet.
        uuid (uuid.UUID): The UUID of the wallet.
        xpub (str): The extended public key of the wallet.
        xpub_hash (str): The hash of the extended public key.
        user_id (int): The ID of the user associated with the wallet.
    """

    __tablename__ = "wallets"
    id: int = DB.Column(DB.Integer, primary_key=True, nullable=False, unique=True)
    uuid: uuid_gen.UUID = DB.Column(
        postgresql.UUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid_gen.uuid4,
    )
    _xpub: str = DB.Column("xpub", DB.String(256), unique=True, nullable=False)
    xpub_hash: str = DB.Column(DB.String(128), unique=True, nullable=False)
    user_id: int = DB.Column(
        DB.Integer, DB.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user = DB.relationship("User", backref="wallets")

    def __init__(self, xpub: str) -> None:
        """
        Initialize a Wallet instance.

        Args:
            xpub (str): The hash of the extended public key.
        """
        self.user_id = current_user.id
        self._xpub = self.encrypt_xpub(xpub)
        self.xpub_hash = self.hash_xpub(xpub)

    def __repr__(self) -> str:
        """
        Return a string representation of the Wallet instance.

        Returns:
            str: A string representation of the Wallet instance.
        """
        return self._repr(
            id=self.id,
            uuid=self.uuid,
            user=self.user,
        )

    @property
    def xpub(self) -> str:
        """
        Decrypt and return the xpub.

        Returns:
            str: The decrypted extended public key.
        """
        return self.decrypt_xpub(self._xpub)

    @classmethod
    def get(cls, xpub: str) -> query.Query:
        """
        Retrieve wallets based on provided filters.

        Args:
            xpub (str): The extended public key to filter by.

        Returns:
            query.Query: A SQLAlchemy query object with the applied filters.
        """
        xpub_hash = cls.hash_xpub(xpub)
        return cls.query.filter(
            cls.user_id == current_user.id,
            cls.xpub_hash == xpub_hash,
        )

    def encrypt_xpub(self, xpub: str) -> str:
        """
        Encrypt the xpub using the encryption key.

        Args:
            xpub (str): The extended public key to encrypt.

        Returns:
            str: The encrypted extended public key.
        """
        encryption_key = config.config.ENCRYPTION_KEY

        cipher = Fernet(encryption_key.encode())
        return cipher.encrypt(xpub.encode()).decode()

    def decrypt_xpub(self, encrypted_xpub: str) -> str:
        """
        Decrypt the xpub using the encryption key.

        Args:
            encrypted_xpub (str): The encrypted extended public key to decrypt.

        Returns:
            str: The decrypted extended public key.
        """
        encryption_key = config.config.ENCRYPTION_KEY

        cipher = Fernet(encryption_key.encode())
        return cipher.decrypt(encrypted_xpub.encode()).decode()

    @staticmethod
    def hash_xpub(xpub: str) -> str:
        """
        Hash the xpub using SHA-512.

        Args:
            xpub (str): The xpub to hash.

        Returns:
            str: The hashed xpub.
        """
        return hashlib.sha512(xpub.encode()).hexdigest()


class Report(DB.Model):
    """
    SQL table to store report data.

    Attributes:
        id (int): The unique identifier for the report.
        uuid (uuid.UUID): The UUID of the report.
        date (datetime): The date of the report.
        income (float): The income of the report.
        expenses (float): The expenses of the report.
        balance (float): Derived as income - expenses.
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
    income: float = DB.Column(DB.Float, nullable=False)
    expenses: float = DB.Column(DB.Float, nullable=False)
    user_id: int = DB.Column(
        DB.Integer, DB.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user = DB.relationship("User", back_populates="reports")
    operations = DB.relationship(
        "Operation", back_populates="report", cascade="all, delete-orphan"
    )

    @hybrid_property
    def balance(self) -> float:
        """
        Calculate the balance of the report.

        Returns:
            float: The balance of the report (income - expenses).
        """
        return round(self.income - self.expenses, 2)

    def __init__(self, income: float, expenses: float, date: datetime) -> None:
        """
        Initialize a Report instance.

        Args:
            income (float): The income of the report.
            expenses (float): The expenses of the report.
            date (datetime): The date of the report.
        """
        self.user_id = current_user.id
        self.income = income
        self.expenses = expenses
        self.date = date

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
            income=self.income,
            expenses=self.expenses,
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

    def __init__(
        self,
        amount: float,
        concept: str,
        date: datetime,
        report_id: int,
        category_id: int,
    ) -> None:
        """
        Initialize an Operation instance.

        Args:
            amount (float): The amount of the operation.
            concept (str): The concept of the operation.
            date (datetime): The date of the operation.
            report_id (int): The ID of the report associated with the operation.
            category_id (int): The ID of the category associated with the operation.
        """
        self.date = date
        self.amount = amount
        self.concept = concept
        self.report_id = report_id
        self.category_id = category_id

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
