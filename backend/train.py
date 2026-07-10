"""Standalone training script — useful for pre-warming model caches.

Usage:
    python train.py RELIANCE.NS TCS.NS INFY.NS
"""
import sys

from services.data_service import fetch_history
from services.model import train
import numpy as np


def main(symbols: list[str]) -> None:
    for sym in symbols:
        print(f"→ training {sym}")
        hist = fetch_history(sym, "5y")
        close = np.array([h["close"] for h in hist], dtype=float)
        train(sym, close, cache=False)
        print(f"  ✓ saved model for {sym}")


if __name__ == "__main__":
    main(sys.argv[1:] or ["RELIANCE.NS"])
