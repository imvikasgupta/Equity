"""Prediction orchestrator — pulls data, trains/loads the model, computes metrics."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from .data_service import fetch_history
from .model import predict_future, train


def _next_business_days(start: datetime, n: int) -> list[str]:
    out, d = [], start
    while len(out) < n:
        d += timedelta(days=1)
        if d.weekday() < 5:
            out.append(d.strftime("%Y-%m-%d"))
    return out


def _trend(preds: np.ndarray, last_actual: float) -> list[str]:
    trends = []
    prev = last_actual
    for p in preds:
        diff = (p - prev) / prev
        if diff > 0.002:
            trends.append("bullish")
        elif diff < -0.002:
            trends.append("bearish")
        else:
            trends.append("neutral")
        prev = p
    return trends


def forecast(symbol: str, period: str, horizon: int) -> dict[str, Any]:
    history_rows = fetch_history(symbol, period)
    close = np.array([r["close"] for r in history_rows], dtype=float)
    if len(close) < 200:
        raise ValueError("Not enough history to train (need >= 200 rows)")

    model, scaler, scaled, X_test, y_test, hist = train(symbol, close)

    # Evaluation on held-out test set
    y_pred_scaled = model.predict(X_test, verbose=0).flatten()
    y_pred = scaler.inverse_transform(y_pred_scaled.reshape(-1, 1)).flatten()
    y_true = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

    mae = float(mean_absolute_error(y_true, y_pred))
    mse = float(mean_squared_error(y_true, y_pred))
    rmse = float(np.sqrt(mse))
    mape = float(np.mean(np.abs((y_true - y_pred) / y_true)) * 100)
    r2 = float(r2_score(y_true, y_pred))

    # Future forecast
    future = predict_future(model, scaler, scaled, horizon)
    last_actual = float(close[-1])
    last_date = datetime.strptime(history_rows[-1]["date"], "%Y-%m-%d")
    dates = _next_business_days(last_date, horizon)
    trends = _trend(future, last_actual)

    # Confidence decays with distance; a real model would use MC dropout / quantile regression.
    confidences = [max(0.4, 0.95 - i * (0.5 / horizon)) for i in range(horizon)]

    predictions = [
        {"date": d, "predicted": round(float(p), 2), "confidence": round(c, 3), "trend": t}
        for d, p, c, t in zip(dates, future, confidences, trends)
    ]

    return {
        "symbol": symbol,
        "horizon": horizon,
        "history": history_rows,
        "predictions": predictions,
        "metrics": {
            "mae": round(mae, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "mape": round(mape, 3),
            "r2": round(r2, 4),
        },
        "trainingLoss": [round(float(x), 5) for x in hist["loss"]],
        "validationLoss": [round(float(x), 5) for x in hist["val_loss"]],
    }
