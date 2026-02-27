import os

BASE_URL: str = os.getenv("MCP_API_URL", "http://localhost:5000")

# Default route for file uploads. Can be overridden by setting the UPLOADS_DIR environment variable.
UPLOADS_DIR: str = os.getenv("UPLOADS_DIR", "/uploads")
