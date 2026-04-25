"""report_attributes

Revision ID: 5cc4ce6a8703
Revises: d745061d1153
Create Date: 2026-04-25 10:57:17.507215

"""

from alembic import op
import sqlalchemy as sa


revision = "5cc4ce6a8703"
down_revision = "d745061d1153"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "reports", sa.Column("income", sa.Float(), nullable=False, server_default="0")
    )
    op.add_column(
        "reports", sa.Column("expenses", sa.Float(), nullable=False, server_default="0")
    )

    op.execute(
        """
        UPDATE reports r
        SET
            income = COALESCE(agg.income, 0),
            expenses = COALESCE(agg.expenses, 0)
        FROM (
            SELECT
                report_id,
                SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) AS expenses
            FROM operations
            GROUP BY report_id
        ) agg
        WHERE r.id = agg.report_id
    """
    )

    op.alter_column("reports", "income", server_default=None)
    op.alter_column("reports", "expenses", server_default=None)

    op.drop_column("reports", "balance")


def downgrade():
    op.add_column(
        "reports",
        sa.Column("balance", sa.Float(), nullable=False, server_default="0"),
    )
    op.execute("UPDATE reports SET balance = income - expenses")
    op.alter_column("reports", "balance", server_default=None)

    op.drop_column("reports", "expenses")
    op.drop_column("reports", "income")
