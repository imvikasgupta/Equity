import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type MarketOverview } from "@/lib/api";
import { formatNumber, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Equity" },
      {
        name: "description",
        content:
          "Predict NSE & BSE stock prices with a TensorFlow LSTM. Real-time data, interactive charts, model evaluation and CSV export.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <Hero />
      <MarketStrip />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden hero-bg">
      <div className="absolute inset-0 grid-backdrop opacity-70" />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-24 md:pt-32 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <HeroInitSequence />
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Forecast stocks
            <br />
            with <span className="gradient-text">deep learning.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A production-grade research tool that trains an LSTM network on live
            NSE &amp; BSE data and projects prices across 7 to 90 trading days —
            with model metrics, confidence intervals, and beautiful charts.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:brightness-110 glow-primary"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}


function HeroInitSequence() {
  const label = "AI STOCK PREDICTION";
  const letters = Array.from(label);

  // Timeline (ms)
  const DOT_HOLD = 2000;
  const TYPE_DUR = 1500;
  const HOLD = 5000;
  const ERASE_DUR = 1500;
  const perType = TYPE_DUR / letters.length;
  const perErase = ERASE_DUR / letters.length;

  const [count, setCount] = useState(0);

  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timeouts.push(t);
    };

    const runCycle = () => {
      setCount(0);
      // type in
      schedule(() => {
        for (let i = 1; i <= letters.length; i++) {
          schedule(() => setCount(i), (i - 1) * perType);
        }
        // hold + erase
        schedule(() => {
          for (let i = 1; i <= letters.length; i++) {
            schedule(
              () => setCount(letters.length - i),
              (i - 1) * perErase,
            );
          }
          // restart after final dot-only hold
          schedule(runCycle, ERASE_DUR + DOT_HOLD);
        }, TYPE_DUR + HOLD);
      }, DOT_HOLD);
    };

    runCycle();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto mb-6 flex items-center justify-center">
      <div className="flex items-center" style={{ gap: "12px" }}>
        <span
          aria-hidden
          className="relative inline-flex items-center justify-center"
          style={{ width: 14, height: 14 }}
        >
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "#22C55E" }}
            animate={{ opacity: [0.55, 0, 0.55], scale: [1, 2.2, 1] }}
            transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity }}
          />
          <motion.span
            className="relative inline-block rounded-full"
            style={{
              width: 12,
              height: 12,
              backgroundColor: "#22C55E",
              boxShadow:
                "0 0 8px #22C55E, 0 0 18px rgba(34,197,94,0.85), 0 0 34px rgba(34,197,94,0.55)",
            }}
            animate={{ opacity: [1, 0.55, 1], scale: [1, 1.18, 1] }}
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          />
        </span>

        <span
          style={{
            fontFamily:
              "Inter, 'SF Pro Display', ui-sans-serif, system-ui, sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.82)",
            whiteSpace: "pre",
            minHeight: "1em",
          }}
          aria-label={label}
        >
          {label.slice(0, count)}
        </span>
      </div>
    </div>
  );
}



/** Small decorative chart drawn with SVG paths — no data fetch needed. */
function HeroChart() {
  const pts = [
    45, 48, 44, 50, 55, 52, 60, 62, 58, 65, 70, 68, 74, 78, 82, 79, 85, 88, 92, 90,
  ];
  const W = 800, H = 200, P = 20;
  const max = Math.max(...pts), min = Math.min(...pts);
  const x = (i: number) => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = (v: number) => H - P - ((v - min) / (max - min)) * (H - 2 * P);
  const line = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  const area = `${line} L ${x(pts.length - 1)} ${H - P} L ${x(0)} ${H - P} Z`;

  return (
    <div className="glass-card overflow-hidden p-6 shadow-elevated">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            RELIANCE.NS · Forecast preview
          </p>
          <p className="mt-1 font-display text-xl font-semibold num">₹2,984.20</p>
        </div>
        <span className="rounded-md bg-success/15 px-2 py-0.5 text-xs font-medium text-success num">
          +4.82% projected · 30d
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.6 0.21 258)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.6 0.21 258)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.6 0.21 258)" />
            <stop offset="100%" stopColor="oklch(0.72 0.14 200)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#heroFill)" />
        <path d={line} fill="none" stroke="url(#heroStroke)" strokeWidth={2.5} />
        {pts.map((v, i) =>
          i === pts.length - 1 ? (
            <circle key={i} cx={x(i)} cy={y(v)} r={5} fill="oklch(0.72 0.14 200)" />
          ) : null,
        )}
      </svg>
    </div>
  );
}

function MarketStrip() {
  const [market, setMarket] = useState<MarketOverview | null>(null);
  useEffect(() => { api.market().then(setMarket).catch(() => {}); }, []);

  const items = market
    ? [
        ...market.indices.map((i) => ({ label: i.name, value: formatNumber(i.value), pct: i.changePct })),
        ...market.gainers.slice(0, 3).map((g) => ({ label: g.name, value: `₹${formatNumber(g.price)}`, pct: g.changePct })),
        ...market.losers.slice(0, 3).map((g) => ({ label: g.name, value: `₹${formatNumber(g.price)}`, pct: g.changePct })),
      ]
    : [];
  const doubled = [...items, ...items];

  return (
    <section className="border-y border-border/60 bg-card/40">
      <div className="overflow-hidden py-3">
        {items.length > 0 && (
          <div className="flex w-max animate-ticker gap-8 whitespace-nowrap">
            {doubled.map((it, i) => (
              <span key={i} className="flex items-center gap-2 text-xs">
                <span className="font-medium text-muted-foreground">{it.label}</span>
                <span className="font-mono num">{it.value}</span>
                <span className={cn("font-mono num", it.pct >= 0 ? "text-success" : "text-loss")}>
                  {formatPct(it.pct)}
                </span>
                <span className="text-border">·</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


function CTA() {
  return (
    <section className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Pick a ticker. See the forecast.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Search any 25+ stocks and generate a 7 to 90-day price projection
          with full model transparency.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:brightness-110 glow-primary"
        >
          Launch dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
