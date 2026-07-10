
import { findStock, STOCKS } from "./stocks";
import type {
  CompanyInfo,
  HistoryPoint,
  MarketOverview,
  Period,
  PredictionResponse,
  Horizon,
} from "./api";

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PERIOD_DAYS: Record<Period, number> = {
  "1y": 252, "2y": 504, "5y": 1260, "10y": 2520, max: 2520,
};

function basePrice(symbol: string): number {
  const anchors: Record<string, number> = {
    "RELIANCE.NS": 2950, "TCS.NS": 4100, "INFY.NS": 1780, "HDFCBANK.NS": 1680,
    "ICICIBANK.NS": 1280, "SBIN.NS": 810, "AXISBANK.NS": 1120, "LT.NS": 3620,
    "BHARTIARTL.NS": 1620, "ITC.NS": 460, "MARUTI.NS": 12500, "TATAMOTORS.NS": 970,
    "TATASTEEL.NS": 152, "ASIANPAINT.NS": 2820, "SUNPHARMA.NS": 1820,
    "POWERGRID.NS": 320, "WIPRO.NS": 545, "ADANIENT.NS": 2760, "ADANIPORTS.NS": 1420,
    "NTPC.NS": 375, "HCLTECH.NS": 1690, "KOTAKBANK.NS": 1780,
    "HINDUNILVR.NS": 2450, "BAJFINANCE.NS": 7100, "TITAN.NS": 3480,
  };
  return anchors[symbol.toUpperCase()] ?? 500 + (hash(symbol) % 4000);
}

export function generateMockHistory(symbol: string, period: Period): HistoryPoint[] {
  const days = PERIOD_DAYS[period];
  const rnd = mulberry32(hash(symbol));
  const start = basePrice(symbol) * 0.75;
  let price = start;
  const drift = 0.0004 + rnd() * 0.0006;
  const vol = 0.014 + rnd() * 0.01;

  const out: HistoryPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const shock = (rnd() - 0.5) * 2 * vol;
    price = Math.max(1, price * (1 + drift + shock));
    const open = price * (1 + (rnd() - 0.5) * 0.006);
    const close = price;
    const high = Math.max(open, close) * (1 + rnd() * 0.008);
    const low = Math.min(open, close) * (1 - rnd() * 0.008);
    const volume = Math.floor(500_000 + rnd() * 5_000_000);
    out.push({
      date: d.toISOString().slice(0, 10),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
  }
  return out;
}

export function generateMockCompany(symbol: string): CompanyInfo {
  const meta = findStock(symbol) ?? {
    symbol, name: symbol.replace(/\..*/, ""), sector: "—", industry: "—",
    exchange: symbol.endsWith(".BO") ? "BSE" as const : "NSE" as const,
  };
  const history = generateMockHistory(symbol, "1y");
  const last = history[history.length - 1];
  const prev = history[history.length - 2] ?? last;
  const closes = history.map((h) => h.close);
  const weekHigh52 = Math.max(...closes);
  const weekLow52 = Math.min(...closes);
  const rnd = mulberry32(hash(symbol) ^ 0x9e3779b9);
  const currentPrice = last.close;
  const marketCap = Math.floor(currentPrice * (5_000_000 + rnd() * 5_000_000_000));

  return {
    symbol: meta.symbol,
    name: meta.name,
    sector: meta.sector,
    industry: meta.industry,
    exchange: meta.exchange,
    currency: "INR",
    marketCap,
    currentPrice,
    previousClose: prev.close,
    dayChange: +(currentPrice - prev.close).toFixed(2),
    dayChangePct: +(((currentPrice - prev.close) / prev.close) * 100).toFixed(2),
    weekHigh52: +weekHigh52.toFixed(2),
    weekLow52: +weekLow52.toFixed(2),
    peRatio: +(15 + rnd() * 40).toFixed(2),
    dividendYield: +(rnd() * 3).toFixed(2),
    volume: last.volume,
  };
}

export function generateMockPrediction(
  symbol: string,
  period: Period,
  horizon: Horizon,
): PredictionResponse {
  const history = generateMockHistory(symbol, period);
  const rnd = mulberry32(hash(symbol) ^ horizon);
  const last = history[history.length - 1];
  let price = last.close;
  // Slight bullish/bearish bias from PRNG
  const bias = (rnd() - 0.45) * 0.002;
  const vol = 0.012;

  const predictions = Array.from({ length: horizon }, (_, i) => {
    const d = new Date(last.date);
    // advance business days
    let added = 0;
    while (added <= i) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    const shock = (rnd() - 0.5) * 2 * vol;
    price = Math.max(1, price * (1 + bias + shock * 0.6));
    const confidence = Math.max(0.4, 0.95 - i * (0.5 / horizon));
    const trend: "bullish" | "bearish" | "neutral" =
      bias > 0.0003 ? "bullish" : bias < -0.0003 ? "bearish" : "neutral";
    return {
      date: d.toISOString().slice(0, 10),
      predicted: +price.toFixed(2),
      confidence: +confidence.toFixed(3),
      trend,
    };
  });

  // Simulated loss curves — a real training run would populate these.
  const epochs = 30;
  const trainingLoss = Array.from({ length: epochs }, (_, e) =>
    +(0.08 * Math.exp(-e / 8) + 0.004 + rnd() * 0.002).toFixed(5),
  );
  const validationLoss = trainingLoss.map((v) => +(v * (1.08 + rnd() * 0.1)).toFixed(5));

  const base = last.close;
  const mae = +(base * 0.012).toFixed(4);
  const rmse = +(base * 0.017).toFixed(4);
  return {
    symbol,
    horizon,
    history,
    predictions,
    metrics: {
      mae,
      mse: +(rmse * rmse).toFixed(4),
      rmse,
      mape: +(1.2 + rnd()).toFixed(3),
      r2: +(0.92 + rnd() * 0.06).toFixed(4),
    },
    trainingLoss,
    validationLoss,
  };
}

export function generateMockMarket(): MarketOverview {
  const rnd = mulberry32(Math.floor(Date.now() / (1000 * 60 * 60)));
  const mk = (name: string, symbol: string, base: number): {
    name: string; symbol: string; value: number; change: number; changePct: number;
  } => {
    const pct = (rnd() - 0.5) * 2;
    const change = base * (pct / 100);
    return {
      name, symbol,
      value: +(base + change).toFixed(2),
      change: +change.toFixed(2),
      changePct: +pct.toFixed(2),
    };
  };

  const gainers = STOCKS.slice(0, 12).map((s) => {
    const pct = 1 + rnd() * 5;
    const price = basePrice(s.symbol);
    return { symbol: s.symbol, name: s.name, price: +price.toFixed(2), changePct: +pct.toFixed(2) };
  }).sort((a, b) => b.changePct - a.changePct).slice(0, 5);

  const losers = STOCKS.slice(12, 24).map((s) => {
    const pct = -(1 + rnd() * 5);
    const price = basePrice(s.symbol);
    return { symbol: s.symbol, name: s.name, price: +price.toFixed(2), changePct: +pct.toFixed(2) };
  }).sort((a, b) => a.changePct - b.changePct).slice(0, 5);

  return {
    status: "open",
    indices: [
      mk("NIFTY 50", "^NSEI", 24800),
      mk("SENSEX", "^BSESN", 81200),
      mk("BANK NIFTY", "^NSEBANK", 54100),
      mk("NIFTY IT", "^CNXIT", 42300),
    ],
    gainers,
    losers,
    updatedAt: new Date().toISOString(),
  };
}
