import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { CompanyInfo } from "@/lib/api";
import { formatINR, formatPct, formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props { info: CompanyInfo | null; loading?: boolean; }

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-medium text-foreground num">{value}</p>
    </div>
  );
}

export function CompanyDetails({ info, loading }: Props) {
  if (loading || !info) {
    return (
      <div className="glass-card animate-pulse p-6">
        <div className="h-6 w-48 rounded bg-muted/40" />
        <div className="mt-3 h-10 w-40 rounded bg-muted/40" />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  const up = info.dayChange >= 0;

  return (
    <div className="glass-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight">{info.name}</h2>
            <span className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {info.symbol}
            </span>
            <span className="rounded-md border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {info.exchange}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{info.sector} • {info.industry}</p>
        </div>

        <div className="text-right">
          <p className="font-display text-3xl font-semibold num">{formatINR(info.currentPrice)}</p>
          <p
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium num",
              up ? "bg-success/15 text-success" : "bg-loss/15 text-loss",
            )}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {formatINR(Math.abs(info.dayChange))} ({formatPct(info.dayChangePct)})
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/60 pt-6 md:grid-cols-4">
        <Stat label="Previous close" value={formatINR(info.previousClose)} />
        <Stat label="Market cap" value={`₹${formatCompact(info.marketCap)}`} />
        <Stat label="52W high" value={formatINR(info.weekHigh52)} />
        <Stat label="52W low" value={formatINR(info.weekLow52)} />
        <Stat label="Volume" value={formatCompact(info.volume)} />
        <Stat label="P / E ratio" value={info.peRatio ? info.peRatio.toFixed(2) : "—"} />
        <Stat label="Dividend yield" value={info.dividendYield ? `${info.dividendYield}%` : "—"} />
        <Stat label="Currency" value={info.currency} />
      </div>
    </div>
  );
}
