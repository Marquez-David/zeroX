from flask import Flask, jsonify, request 
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "Servidor Flask en Docker activo"})

@app.route('/api/enviar', methods=['POST'])
def recibir_datos():
    data = request.get_json()
    return jsonify({"status": "ok", "data": data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)