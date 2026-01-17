from app.routes.users import BP as users_bp
from app.routes.auth import BP as auth_bp
from app.routes.reports import BP as reports_bp
from app.routes.operations import BP as operations_bp
from app.routes.wallets import BP as wallets_bp

all_bps = [users_bp, auth_bp, reports_bp, operations_bp, wallets_bp]
