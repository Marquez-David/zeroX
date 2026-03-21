from flask_cors import CORS  # type: ignore
from app import create_app

app = create_app()

# Configure CORS based on the allowed origins specified in the configuration
allowed_origins = app.config.get("CORS_ORIGINS")

CORS(
    app,
    origins=allowed_origins,
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    supports_credentials=True,
    max_age=3600,
)


@app.route("/health", methods=["GET"])
def health_check():
    return {"status": "healthy", "message": "API is running"}, 200


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
