import flask  # type: ignore
import typing
from datetime import datetime
from http import HTTPStatus

from flask_jwt_extended import current_user  # type: ignore
from sqlalchemy import case, func  # type: ignore

from app import models
from app.db import DB


def retrieve_operation(uuid: str) -> flask.make_response:
    """
    Retrieve a single operation by its UUID.

    Args:
        uuid (str): The UUID of the operation to retrieve.

    Returns:
        A Flask response object containing the operation details.
    """
    operation = models.Operation.query.filter_by(uuid=uuid).first()
    if not operation or str(operation.report.user.uuid) != str(current_user.uuid):
        # Check if the operation exists and belongs to the current user
        return flask.make_response({"msg": "Invalid operation."}, HTTPStatus.NOT_FOUND)

    return flask.make_response(
        {
            "msg": "OK",
            "operation": {
                "uuid": operation.uuid,
                "amount": operation.amount,
                "date": operation.date,
                "concept": operation.concept,
                "category": {
                    "uuid": operation.category.uuid,
                    "name": operation.category.name,
                },
            },
        },
        HTTPStatus.OK,
    )


def operations_by_category(year: typing.Optional[int]) -> flask.make_response:
    """
    Aggregate user expenses grouped by category, optionally restricted to a year.

    Args:
        year (Optional[int]): Restrict to operations dated in the given year.

    Returns:
        A Flask response object containing categories with expense totals,
        plus overall totals across the filtered set.
    """
    expense_amount = case(
        (models.Operation.amount < 0, -models.Operation.amount), else_=0
    )
    expenses_col = func.coalesce(func.sum(expense_amount), 0)
    expense_count_col = func.count(
        case((models.Operation.amount < 0, models.Operation.id))
    )

    query = (
        DB.session.query(
            models.Category.uuid,
            models.Category.name,
            expenses_col.label("expenses"),
            expense_count_col.label("operation_count"),
        )
        .join(models.Operation, models.Operation.category_id == models.Category.id)
        .join(models.Report, models.Report.id == models.Operation.report_id)
        .filter(models.Report.user_id == current_user.id)
    )

    if year is not None:
        # Explicit half-open range so the index on Operation.date is used;
        query = query.filter(
            models.Operation.date >= datetime(year, 1, 1),
            models.Operation.date < datetime(year + 1, 1, 1),
        )

    rows = (
        query.group_by(models.Category.id, models.Category.uuid, models.Category.name)
        .order_by(expenses_col.desc())
        .all()
    )

    # Categories whose only operations are income end up with expenses=0;
    # they don't belong in an expense breakdown.
    rows = [r for r in rows if r.expenses > 0]

    total_expenses = sum(float(r.expenses) for r in rows)
    total_operation_count = sum(r.operation_count for r in rows)

    return flask.make_response(
        {
            "msg": "OK",
            "categories": [
                {
                    "uuid": r.uuid,
                    "name": r.name,
                    "expenses": round(float(r.expenses), 2),
                    "operations": r.operation_count,
                }
                for r in rows
            ],
            "total_expenses": round(total_expenses, 2),
            "total_operation_count": total_operation_count,
        },
        HTTPStatus.OK,
    )


def change_category(operation: str, category: str) -> flask.make_response:
    """
    Update the category of an operation.

    Args:
        operation (str): The operation to update.
        category (str): The new category to assign to the operation.

    Returns:
        A Flask response object indicating the result of the update.
    """
    operation = models.Operation.query.filter_by(uuid=operation).first()
    if str(operation.report.user.uuid) != str(current_user.uuid):
        # Check if the operation belongs to the current user
        return flask.make_response({"msg": "Invalid operation."}, HTTPStatus.NOT_FOUND)

    category = models.Category.query.filter_by(uuid=category).first()
    if not category:
        # Check if the category exists
        return flask.make_response({"msg": "Invalid category."}, HTTPStatus.NOT_FOUND)

    operation.category_id = category.id
    DB.session.commit()

    return flask.make_response({"msg": "Category updated."}, HTTPStatus.OK)
