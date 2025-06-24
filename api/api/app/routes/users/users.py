from app.routes.users import BP

@BP.route("/users", methods=["GET"])
def get_users():
    """
    Endpoint to get a list of users.
    """
    # This is a placeholder implementation.
    # Replace with actual logic to retrieve users.
    return {"users": ["user1", "user2", "user3"]}, 200