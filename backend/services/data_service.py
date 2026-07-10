"""yfinance-backed data access for company info, history and market overview."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

import pandas as pd
import yfinance as yf

PERIOD_MAP = {"1y": "1y", "2y": "2y", "5y": "5y", "10y": "10y", "max": "max"}

INDICES = [
    ("NIFTY 50", "^NSEI"),
    ("SENSEX", "^BSESN"),
    ("BANK NIFTY", "^NSEBANK"),
    ("NIFTY IT", "^CNXIT"),
]

WATCHLIST = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
    "SBIN.NS", "LT.NS", "BHARTIARTL.NS", "ITC.NS", "MARUTI.NS",
    "TATAMOTORS.NS", "TATASTEEL.NS", "ASIANPAINT.NS", "SUNPHARMA.NS",
    "AXISBANK.NS", "POWERGRID.NS", "WIPRO.NS", "ADANIENT.NS",
    "ADANIPORTS.NS", "NTPC.NS",
]


def fetch_company(symbol: str) -> dict[str, Any]:
    t = yf.Ticker(symbol)
    info = t.info or {}
    hist = t.history(period="1y")
    if hist.empty:
        raise ValueError(f"No data for {symbol}")
    current = float(hist["Close"].iloc[-1])
    prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current
    return {
        "symbol": symbol,
        "name": info.get("longName") or info.get("shortName") or symbol,
        "sector": info.get("sector") or "—",
        "industry": info.get("industry") or "—",
        "exchange": info.get("exchange") or ("BSE" if symbol.endswith(".BO") else "NSE"),
        "currency": info.get("currency", "INR"),
        "marketCap": int(info.get("marketCap") or 0),
        "currentPrice": round(current, 2),
        "previousClose": round(prev, 2),
        "dayChange": round(current - prev, 2),
        "dayChangePct": round(((current - prev) / prev) * 100, 2) if prev else 0.0,
        "weekHigh52": round(float(info.get("fiftyTwoWeekHigh") or hist["Close"].max()), 2),
        "weekLow52": round(float(info.get("fiftyTwoWeekLow") or hist["Close"].min()), 2),
        "peRatio": float(info["trailingPE"]) if info.get("trailingPE") else None,
        "dividendYield": (float(info["dividendYield"]) * 100) if info.get("dividendYield") else None,
        "volume": int(hist["Volume"].iloc[-1]),
    }


def fetch_history(symbol: str, period: str = "2y") -> list[dict[str, Any]]:
    p = PERIOD_MAP.get(period, "2y")
    df = yf.Ticker(symbol).history(period=p)
    if df.empty:
        raise ValueError(f"No history for {symbol}")
    df = df.reset_index()
    return [
        {
            "date": row["Date"].strftime("%Y-%m-%d"),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": int(row["Volume"]),
        }
        for _, row in df.iterrows()
    ]


def _quote(symbol: str, name: str) -> dict[str, Any] | None:
    df = yf.Ticker(symbol).history(period="5d")
    if df.empty or len(df) < 2:
        return None
    last = float(df["Close"].iloc[-1])
    prev = float(df["Close"].iloc[-2])
    change = last - prev
    return {
        "name": name, "symbol": symbol,
        "value": round(last, 2), "change": round(change, 2),
        "changePct": round((change / prev) * 100, 2) if prev else 0.0,
    }


def fetch_market() -> dict[str, Any]:
    indices = [q for q in (_quote(sym, name) for name, sym in INDICES) if q]
    movers = []
    for sym in WATCHLIST:
        q = _quote(sym, sym.replace(".NS", ""))
        if q:
            movers.append({"symbol": sym, "name": q["name"], "price": q["value"], "changePct": q["changePct"]})
    gainers = sorted(movers, key=lambda x: -x["changePct"])[:5]
    losers = sorted(movers, key=lambda x: x["changePct"])[:5]
    now = datetime.utcnow()
    return {
        "status": "open" if 3 <= now.hour <= 10 else "closed",
        "indices": indices,
        "gainers": gainers,
        "losers": losers,
        "updatedAt": now.isoformat() + "Z",
    }
