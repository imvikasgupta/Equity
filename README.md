# Equity — AI Stock Price Prediction for the Market

An end-to-end deep-learning research tool that forecasts **NSE & BSE stock prices**
using a **TensorFlow LSTM** network. Built as a portfolio-grade final-year
engineering project.

<p align="center">
  <em>React 19 · TypeScript · Tailwind CSS · Flask · TensorFlow · yfinance</em>
</p>

---

## Features

- 🔍 **Smart search** across 25+ Nifty 50 tickers (extendable)
- 📊 **Interactive charts** — historical prices with 20/50-day moving averages,
  actual-vs-predicted overlays and per-epoch training curves
- 🤖 **LSTM forecasting** for 7 / 15 / 30 / 60 / 90 trading days ahead
- 📈 **Rigorous metrics** — MAE, MSE, RMSE, MAPE, R²
- 🌐 **Live market overview** — Nifty 50, Sensex, Bank Nifty, IT indices + top movers
- ⬇️ **Export predictions** as CSV
- 🎨 **Dark-first FinTech UI** inspired by Groww / Zerodha Kite / TradingView

---

## Architecture

```
┌──────────────────────────┐         ┌────────────────────────────┐
│  React + TanStack Start  │  HTTPS  │  Flask API                 │
│  (Tailwind, Recharts,    │ ──────► │  ┌──────────────────────┐  │
│   Framer Motion)         │         │  │ data_service (yfin)  │  │
└──────────────────────────┘         │  │ predict_service      │  │
                                     │  │ model (Keras LSTM)   │  │
                                     │  └──────────────────────┘  │
                                     └────────────────────────────┘
```

The frontend uses a service layer (`src/lib/api.ts`) that automatically falls
back to seeded mock data when `VITE_API_URL` isn't set — so the UI is
usable and demo-able without the backend running.

---

## Getting started

### 1. Frontend

```bash
bun install    # or npm install
bun dev        # or npm run dev
```

Copy `.env.example` to `.env` and point `VITE_API_URL` at your backend once
it's running:

```
VITE_API_URL=http://localhost:5000
```

### 2. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py                 # dev server on :5000
```

Pre-warm the model cache for popular tickers:

```bash
python train.py RELIANCE.NS TCS.NS INFY.NS HDFCBANK.NS
```

Production:

```bash
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

---

## Model architecture

| Layer         | Units | Notes                              |
|--------------:|:-----:|:-----------------------------------|
| LSTM          | 128   | `return_sequences=True`, look-back = 60 days |
| Dropout       | 0.2   | Regularization                     |
| LSTM          | 64    |                                    |
| Dropout       | 0.2   |                                    |
| Dense (ReLU)  | 32    |                                    |
| Dense         | 1     | Next-step close (scaled)           |

- **Optimizer**: Adam
- **Loss**: Mean Squared Error
- **Metric**: MAE
- **Callbacks**: EarlyStopping (patience 6), ModelCheckpoint (best val_loss)
- **Multi-step forecast**: iterative — each prediction fed back into the window

---

## API reference

| Method | Endpoint                              | Response                                   |
|:------:|:--------------------------------------|:-------------------------------------------|
| GET    | `/api/health`                         | `{ status: "ok" }`                         |
| GET    | `/api/company/:symbol`                | `CompanyInfo`                              |
| GET    | `/api/history/:symbol?period=1y…max`  | `HistoryPoint[]`                           |
| POST   | `/api/predict`                        | `PredictionResponse`                       |
| GET    | `/api/market`                         | `MarketOverview`                           |

Contract types live in `src/lib/api.ts`.

---

## Deployment

- **Frontend** → Vercel (framework preset: TanStack Start)
- **Backend** → Render (Web Service, `gunicorn -w 2 app:app`, Python 3.11+)

Set `ALLOWED_ORIGINS` on the backend and `VITE_API_URL` on the frontend to
match your deployed URLs.

---

## Folder structure

```
├── backend/
│   ├── app.py                 # Flask entrypoint
│   ├── train.py               # Pre-warm model cache
│   ├── requirements.txt
│   └── services/
│       ├── data_service.py    # yfinance layer
│       ├── model.py           # LSTM definition + train/predict
│       └── predict_service.py # Orchestrator + metrics
└── src/
    ├── routes/                # TanStack file-based routes
    ├── components/            # UI (charts, tables, panels)
    ├── lib/                   # API client, mock fallback, stock catalog
    └── styles.css             # Design tokens
```

---

## Future scope

- Ensemble LSTM + Prophet + XGBoost
- Sentiment features from financial news via a Transformer encoder
- Attention-based Seq2Seq for direct multi-step forecasts
- Confidence bands via Monte-Carlo dropout or quantile regression

---

## Disclaimer

Educational research tool. **Not financial advice.**
