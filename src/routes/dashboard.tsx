import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import {
  api,
  type CompanyInfo,
  type HistoryPoint,
  type Horizon,
  type Period,
  type PredictionResponse,
} from "@/lib/api";
import { findStock, STOCKS } from "@/lib/stocks";
import { CompanyDetails } from "@/components/CompanyDetails";
import { PriceChart } from "@/components/PriceChart";
import { PredictionChart } from "@/components/PredictionChart";
import { PredictionTable } from "@/components/PredictionTable";
import { MetricsGrid } from "@/components/MetricsGrid";
import { LossChart } from "@/components/LossChart";
import { StockSearch } from "@/components/StockSearch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Equity AI Stock Prediction" },
      {
        name: "description",
        content:
          "Search any NSE or BSE stock and run an LSTM forecast for 7 to 90 trading days, with model metrics and interactive charts.",
      },
    ],
  }),
  component: DashboardPage,
});

const PERIODS: { value: Period; label: string }[] = [
  { value: "1y", label: "1Y" }, { value: "2y", label: "2Y" },
  { value: "5y", label: "5Y" }, { value: "10y", label: "10Y" }, { value: "max", label: "MAX" },
];
const HORIZONS: Horizon[] = [7, 15, 30, 60, 90];

function DashboardPage() {
  const [symbol, setSymbol] = useState<string>("RELIANCE.NS");
  const [period, setPeriod] = useState<Period>("2y");
  const [horizon, setHorizon] = useState<Horizon>(30);

  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);

  const stock = useMemo(() => findStock(symbol), [symbol]);


  // Load company + history whenever symbol/period changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPrediction(null);
    Promise.all([api.company(symbol), api.history(symbol, period)])
      .then(([c, h]) => {
        if (cancelled) return;
        setInfo(c); setHistory(h);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol, period]);

  async function runPrediction() {
    setPredicting(true);
    try {
      const res = await api.predict(symbol, period, horizon);
      setPrediction(res);
      // scroll to results
      requestAnimationFrame(() => {
        document.getElementById("prediction-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } finally {
      setPredicting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-accent">Prediction dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Forecast an stock
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Choose a ticker, pick a training window and forecast horizon, then run the LSTM
          model. All charts and metrics update in place.
        </p>

      </header>

      {/* Controls */}
      <div className="glass-card mb-8 flex flex-col gap-4 p-4 md:flex-row md:items-center">
        <div className="flex-1">
          <StockSearch value={symbol} onSelect={(s) => setSymbol(s.symbol)} />
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-secondary/40 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === p.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-secondary/40 p-0.5">
          {HORIZONS.map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                horizon === h ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {h}d
            </button>
          ))}
        </div>
        <button
          onClick={runPrediction}
          disabled={predicting || loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:brightness-110 disabled:opacity-60 glow-primary"
        >
          {predicting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {predicting ? "Predicting…" : "Run forecast"}
        </button>
      </div>

      {/* Recently viewed / suggestion chips */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Popular:
        </span>
        {STOCKS.slice(0, 8).map((s) => (
          <button
            key={s.symbol}
            onClick={() => setSymbol(s.symbol)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[11px] transition-colors",
              symbol === s.symbol
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {s.symbol.replace(/\..*/, "")}
          </button>
        ))}
      </div>

      {/* Company details */}
      <div className="mb-6">
        <CompanyDetails info={info} loading={loading} />
      </div>

      {/* Price chart */}
      <div className="mb-6">
        <PriceChart history={history} loading={loading} />
      </div>

      {/* Prediction results */}
      <div id="prediction-results" className="scroll-mt-20 space-y-6">
        {prediction ? (
          <>
            <MetricsGrid metrics={prediction.metrics} />
            <PredictionChart data={prediction} />
            <div className="grid gap-6 lg:grid-cols-2">
              <PredictionTable data={prediction} />
              <LossChart data={prediction} />
            </div>
          </>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center gap-3 p-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <p className="font-display text-lg font-semibold">Ready when you are</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Configure the parameters above and hit <span className="font-medium text-foreground">Run forecast</span>{" "}
              to train the LSTM on {stock?.name ?? symbol} and project {horizon} trading days ahead.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
