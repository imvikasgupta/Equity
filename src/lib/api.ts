/**
 * API service layer.
 *
 * When VITE_API_URL is set, calls the Flask + TensorFlow backend under /backend.
 * Otherwise, falls back to `mock-data` so the frontend runs standalone.
 *
 * Backend contract (see /backend/app.py):
 *   GET  /api/company/:symbol                   -> CompanyInfo
 *   GET  /api/history/:symbol?period=1y|2y|5y   -> HistoryPoint[]
 *   POST /api/predict { symbol, period, horizon } -> PredictionResponse
 *   GET  /api/market                            -> MarketOverview
 */

import { generateMockCompany, generateMockHistory, generateMockPrediction, generateMockMarket } from "./mock-data";

export type Period = "1y" | "2y" | "5y" | "10y" | "max";
export type Horizon = 7 | 15 | 30 | 60 | 90;

export interface CompanyInfo {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
  marketCap: number;
  currentPrice: number;
  previousClose: number;
  dayChange: number;
  dayChangePct: number;
  weekHigh52: number;
  weekLow52: number;
  peRatio: number | null;
  dividendYield: number | null;
  volume: number;
}

export interface HistoryPoint {
  date: string;    // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PredictionPoint {
  date: string;
  predicted: number;
  confidence: number; // 0..1
  trend: "bullish" | "bearish" | "neutral";
}

export interface Metrics {
  mae: number;
  mse: number;
  rmse: number;
  mape: number;
  r2: number;
}

export interface PredictionResponse {
  symbol: string;
  horizon: Horizon;
  history: HistoryPoint[];
  predictions: PredictionPoint[];
  metrics: Metrics;
  trainingLoss: number[];
  validationLoss: number[];
}

export interface IndexQuote {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePct: number;
}

export interface MarketOverview {
  status: "open" | "closed";
  indices: IndexQuote[];
  gainers: { symbol: string; name: string; price: number; changePct: number }[];
  losers: { symbol: string; name: string; price: number; changePct: number }[];
  updatedAt: string;
}

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new Error("no-backend");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  isLive: !!BASE,

  async company(symbol: string): Promise<CompanyInfo> {
    try {
      return await apiFetch<CompanyInfo>(`/api/company/${encodeURIComponent(symbol)}`);
    } catch {
      return generateMockCompany(symbol);
    }
  },

  async history(symbol: string, period: Period = "2y"): Promise<HistoryPoint[]> {
    try {
      return await apiFetch<HistoryPoint[]>(`/api/history/${encodeURIComponent(symbol)}?period=${period}`);
    } catch {
      return generateMockHistory(symbol, period);
    }
  },

  async predict(symbol: string, period: Period, horizon: Horizon): Promise<PredictionResponse> {
    try {
      return await apiFetch<PredictionResponse>(`/api/predict`, {
        method: "POST",
        body: JSON.stringify({ symbol, period, horizon }),
      });
    } catch {
      return generateMockPrediction(symbol, period, horizon);
    }
  },

  async market(): Promise<MarketOverview> {
    try {
      return await apiFetch<MarketOverview>(`/api/market`);
    } catch {
      return generateMockMarket();
    }
  },
};
