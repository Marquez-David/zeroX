from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS # type: ignore

from app import create_app

app = create_app()
CORS(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)