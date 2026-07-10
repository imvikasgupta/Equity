import { ArrowDown, ArrowRight, ArrowUp, Download } from "lucide-react";
import type { PredictionResponse } from "@/lib/api";
import { formatINR, formatFullDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props { data: PredictionResponse; }

export function PredictionTable({ data }: Props) {
  const lastActual = data.history[data.history.length - 1]?.close ?? 0;

  function downloadCSV() {
    const header = "date,predicted_price,confidence,trend\n";
    const rows = data.predictions
      .map((p) => `${p.date},${p.predicted},${p.confidence},${p.trend}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.symbol}-forecast-${data.horizon}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <h3 className="font-display text-base font-semibold">Forecast table</h3>
          <p className="text-xs text-muted-foreground">Next {data.horizon} trading days</p>
        </div>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
        >
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
      </div>
      <div className="max-h-[340px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Date</th>
              <th className="px-5 py-2.5 text-right font-medium">Predicted</th>
              <th className="px-5 py-2.5 text-right font-medium">Δ vs last</th>
              <th className="px-5 py-2.5 text-right font-medium">Confidence</th>
              <th className="px-5 py-2.5 text-right font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.predictions.map((p) => {
              const diff = p.predicted - lastActual;
              const pct = (diff / lastActual) * 100;
              const up = diff >= 0;
              return (
                <tr key={p.date} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="px-5 py-2.5 text-muted-foreground">{formatFullDate(p.date)}</td>
                  <td className="px-5 py-2.5 text-right font-mono font-medium num">{formatINR(p.predicted)}</td>
                  <td className={cn("px-5 py-2.5 text-right font-mono num", up ? "text-success" : "text-loss")}>
                    {up ? "+" : ""}{pct.toFixed(2)}%
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="ml-auto flex w-24 items-center justify-end gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${p.confidence * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[11px] text-muted-foreground">
                        {Math.round(p.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
                        p.trend === "bullish" && "bg-success/15 text-success",
                        p.trend === "bearish" && "bg-loss/15 text-loss",
                        p.trend === "neutral" && "bg-muted/40 text-muted-foreground",
                      )}
                    >
                      {p.trend === "bullish" ? <ArrowUp className="h-3 w-3" /> :
                       p.trend === "bearish" ? <ArrowDown className="h-3 w-3" /> :
                       <ArrowRight className="h-3 w-3" />}
                      {p.trend}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
