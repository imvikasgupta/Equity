"""LSTM model definition and training utilities."""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.models import Sequential, load_model

WINDOW = 60          # look-back window in trading days
EPOCHS = 40
BATCH_SIZE = 32
MODEL_DIR = Path(__file__).parent / "saved_models"
MODEL_DIR.mkdir(exist_ok=True)


def build_model(window: int = WINDOW) -> Sequential:
    model = Sequential([
        LSTM(128, return_sequences=True, input_shape=(window, 1)),
        Dropout(0.2),
        LSTM(64),
        Dropout(0.2),
        Dense(32, activation="relu"),
        Dense(1),
    ])
    model.compile(optimizer="adam", loss="mean_squared_error", metrics=["mae"])
    return model


def make_sequences(series: np.ndarray, window: int = WINDOW):
    X, y = [], []
    for i in range(window, len(series)):
        X.append(series[i - window:i])
        y.append(series[i])
    return np.array(X), np.array(y)


def train(symbol: str, close: np.ndarray, cache: bool = True):
    """Train (or load cached) LSTM for a given symbol."""
    model_path = MODEL_DIR / f"{symbol.replace('.', '_')}.keras"
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(close.reshape(-1, 1)).flatten()

    X, y = make_sequences(scaled)
    X = X.reshape(-1, WINDOW, 1)
    split = int(len(X) * 0.85)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    if cache and model_path.exists():
        model = load_model(model_path)
        # We still need loss curves for the UI — do a very short refit,
        # or skip and return zeros. Here we return zeros to keep it fast.
        history = {"loss": [], "val_loss": []}
    else:
        model = build_model()
        cb = [
            EarlyStopping(patience=6, restore_best_weights=True, monitor="val_loss"),
            ModelCheckpoint(model_path, monitor="val_loss", save_best_only=True),
        ]
        hist = model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=EPOCHS, batch_size=BATCH_SIZE, verbose=0, callbacks=cb,
        )
        history = {"loss": hist.history["loss"], "val_loss": hist.history["val_loss"]}

    return model, scaler, scaled, X_test, y_test, history


def predict_future(model, scaler: MinMaxScaler, scaled: np.ndarray, horizon: int):
    window = scaled[-WINDOW:].tolist()
    preds = []
    for _ in range(horizon):
        x = np.array(window[-WINDOW:]).reshape(1, WINDOW, 1)
        p = float(model.predict(x, verbose=0)[0, 0])
        preds.append(p)
        window.append(p)
    inv = scaler.inverse_transform(np.array(preds).reshape(-1, 1)).flatten()
    return inv
