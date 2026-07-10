import type { Metrics } from "@/lib/api";

interface Props { metrics: Metrics; }

const ITEMS: { key: keyof Metrics; label: string; hint: string; fmt: (v: number) => string }[] = [
  { key: "mae",  label: "MAE",  hint: "Mean Absolute Error",       fmt: (v) => v.toFixed(4) },
  { key: "mse",  label: "MSE",  hint: "Mean Squared Error",        fmt: (v) => v.toFixed(4) },
  { key: "rmse", label: "RMSE", hint: "Root Mean Squared Error",   fmt: (v) => v.toFixed(4) },
  { key: "mape", label: "MAPE", hint: "Mean Absolute % Error",     fmt: (v) => `${v.toFixed(2)}%` },
  { key: "r2",   label: "R²",   hint: "Coefficient of determination", fmt: (v) => v.toFixed(4) },
];

export function MetricsGrid({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {ITEMS.map((it) => (
        <div key={it.key} className="glass-card p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{it.hint}</p>
          <p className="mt-2 font-display text-xl font-semibold num">{it.fmt(metrics[it.key])}</p>
          <p className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
            {it.label}
          </p>
        </div>
      ))}
    </div>
  );
}
