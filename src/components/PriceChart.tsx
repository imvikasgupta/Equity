import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryPoint } from "@/lib/api";
import { formatINR, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props { history: HistoryPoint[]; loading?: boolean; }

const RANGES = [
  { key: "1M", days: 22 },
  { key: "3M", days: 66 },
  { key: "6M", days: 132 },
  { key: "1Y", days: 252 },
  { key: "ALL", days: Infinity },
] as const;

function sma(values: number[], window: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= window) sum -= values[i - window];
    out.push(i >= window - 1 ? +(sum / window).toFixed(2) : null);
  }
  return out;
}

export function PriceChart({ history, loading }: Props) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("6M");
  const [showMA, setShowMA] = useState(true);

  const data = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    const slice = history.slice(-Math.min(days, history.length));
    const closes = slice.map((p) => p.close);
    const ma20 = sma(closes, 20);
    const ma50 = sma(closes, 50);
    return slice.map((p, i) => ({
      date: p.date,
      close: p.close,
      ma20: ma20[i],
      ma50: ma50[i],
    }));
  }, [history, range]);

  const first = data[0]?.close ?? 0;
  const last = data[data.length - 1]?.close ?? 0;
  const up = last >= first;
  const stroke = up ? "var(--color-success)" : "var(--color-loss)";

  if (loading || history.length === 0) {
    return <div className="glass-card h-[380px] animate-pulse" />;
  }

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">Price history</h3>
          <p className="text-xs text-muted-foreground">Close price with moving averages</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMA((v) => !v)}
            className={cn(
              "rounded-md border border-border px-2 py-1 text-[11px] font-medium transition-colors",
              showMA ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            MA 20/50
          </button>
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-secondary/40 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                  range === r.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.key}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              stroke="var(--color-muted-foreground)"
              tick={{ fontSize: 11 }}
              minTickGap={30}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              tick={{ fontSize: 11 }}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `₹${Math.round(v)}`}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(l: any) => new Date(l).toLocaleDateString("en-IN")}
              formatter={(v: any, k: any) => [formatINR(v), k.toUpperCase()]}
            />
            <Area type="monotone" dataKey="close" stroke={stroke} strokeWidth={2} fill="url(#priceFill)" />
            {showMA && (
              <>
                <Line type="monotone" dataKey="ma20" stroke="var(--color-chart-2)" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="ma50" stroke="var(--color-chart-4)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
