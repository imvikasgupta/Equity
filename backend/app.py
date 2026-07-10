"""
AI Stock Prediction — Flask API
================================
Serves company info, historical prices, LSTM predictions and market overview
to the React frontend. Run with:

    pip install -r requirements.txt
    python app.py

Environment:
    PORT              default 5000
    ALLOWED_ORIGINS   comma-separated list, default "*"
"""
from __future__ import annotations

import os
from flask import Flask, jsonify, request
from flask_cors import CORS

from services.data_service import fetch_company, fetch_history, fetch_market
from services.predict_service import forecast

app = Flask(__name__)
CORS(app, origins=os.environ.get("ALLOWED_ORIGINS", "*").split(","))


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/company/<symbol>")
def api_company(symbol: str):
    try:
        return jsonify(fetch_company(symbol))
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": str(e)}), 400


@app.get("/api/history/<symbol>")
def api_history(symbol: str):
    period = request.args.get("period", "2y")
    try:
        return jsonify(fetch_history(symbol, period))
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": str(e)}), 400


@app.post("/api/predict")
def api_predict():
    body = request.get_json(force=True) or {}
    symbol = body.get("symbol")
    period = body.get("period", "2y")
    horizon = int(body.get("horizon", 30))
    if not symbol:
        return jsonify({"error": "symbol is required"}), 400
    try:
        return jsonify(forecast(symbol, period, horizon))
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": str(e)}), 500


@app.get("/api/market")
def api_market():
    return jsonify(fetch_market())


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
