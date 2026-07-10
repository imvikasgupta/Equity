export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="mx-auto max-w-7xl px-6 py-10 text-center">
        <p className="font-display text-sm font-semibold">Equity — AI Stock Prediction</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
          Educational deep-learning research tool. Predictions are model estimates, not financial
          advice. NSE &amp; BSE data via yfinance.
        </p>
      </div>
    </footer>
  );
}
