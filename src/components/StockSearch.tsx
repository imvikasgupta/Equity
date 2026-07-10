import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { searchStocks, type StockMeta } from "@/lib/stocks";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onSelect: (stock: StockMeta) => void;
  placeholder?: string;
}

export function StockSearch({ value, onSelect, placeholder = "Search Reliance, TCS, INFY..." }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchStocks(query, 8), [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function commit(s: StockMeta) {
    onSelect(s);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query || (open ? "" : value)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
            else if (e.key === "Enter" && results[highlight]) { e.preventDefault(); commit(results[highlight]); }
            else if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-secondary/60 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-secondary focus:ring-2 focus:ring-ring/40"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-elevated">
          <ul className="max-h-80 overflow-y-auto scrollbar-thin">
            {results.map((s, i) => (
              <li key={s.symbol}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => commit(s)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                    highlight === i ? "bg-secondary" : "hover:bg-secondary/60",
                  )}
                >
                  <span className="flex flex-col">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.sector} • {s.industry}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {s.exchange}
                    </span>
                    <span className="font-mono text-xs text-foreground">{s.symbol.replace(/\..*/, "")}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
