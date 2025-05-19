from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS # type: ignore

from app import create_app, models, DB

app = create_app()
CORS(app)

@app.route('/')
def home():
    user = models.User.query.filter_by(id=1).first()
    if user is None:
        return jsonify({"message": "No hay usuario con id 1"})
    return jsonify({"message": "Servidor Flask en Docker activo y corriendo", "user": user.username})

@app.route('/users/create', methods=['POST'])
def create_user():
    user = models.User(username="David", email="davidmarquezminguez@gmail.com")
    DB.session.add(user)
    DB.session.commit()
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)