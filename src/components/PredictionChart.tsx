import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PredictionResponse } from "@/lib/api";
import { formatINR, formatShortDate } from "@/lib/format";

interface Props { data: PredictionResponse | null; }

export function PredictionChart({ data }: Props) {
  if (!data) return null;

  const tailHistory = data.history.slice(-90).map((p) => ({
    date: p.date, actual: p.close, predicted: null as number | null,
  }));
  const preds = data.predictions.map((p) => ({
    date: p.date, actual: null as number | null, predicted: p.predicted,
  }));
  const combined = [...tailHistory, ...preds];
  const forecastStart = data.predictions[0]?.date;

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold">Actual vs LSTM forecast</h3>
          <p className="text-xs text-muted-foreground">
            Last 90 trading days + next {data.horizon} predicted
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-[var(--color-chart-2)]" /> Actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3 border-t border-dashed border-[var(--color-primary)]" /> Forecast
          </span>
        </div>
      </div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combined} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="date" tickFormatter={formatShortDate}
              stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }}
              minTickGap={30} axisLine={false} tickLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }}
              domain={["auto", "auto"]} tickFormatter={(v) => `₹${Math.round(v)}`}
              axisLine={false} tickLine={false} width={70}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8, fontSize: 12,
              }}
              labelFormatter={(l: any) => new Date(l).toLocaleDateString("en-IN")}
              formatter={(v: any) => (v == null ? "—" : formatINR(v))}
            />
            {forecastStart && (
              <ReferenceLine x={forecastStart} stroke="var(--color-primary)" strokeDasharray="4 4" strokeOpacity={0.5} />
            )}
            <Line type="monotone" dataKey="actual" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke="var(--color-primary)" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false} />
            <Legend wrapperStyle={{ display: "none" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
