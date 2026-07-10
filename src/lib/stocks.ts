

export interface StockMeta {
  symbol: string;      // yfinance ticker, e.g. "RELIANCE.NS"
  name: string;
  sector: string;
  industry: string;
  exchange: "NSE" | "BSE";
}

export const STOCKS: StockMeta[] = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy", industry: "Oil & Gas", exchange: "NSE" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", sector: "IT", industry: "IT Services", exchange: "NSE" },
  { symbol: "INFY.NS", name: "Infosys", sector: "IT", industry: "IT Services", exchange: "NSE" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", sector: "Financials", industry: "Private Bank", exchange: "NSE" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", sector: "Financials", industry: "Private Bank", exchange: "NSE" },
  { symbol: "SBIN.NS", name: "State Bank of India", sector: "Financials", industry: "Public Bank", exchange: "NSE" },
  { symbol: "AXISBANK.NS", name: "Axis Bank", sector: "Financials", industry: "Private Bank", exchange: "NSE" },
  { symbol: "LT.NS", name: "Larsen & Toubro", sector: "Industrials", industry: "Construction", exchange: "NSE" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", sector: "Communication", industry: "Telecom", exchange: "NSE" },
  { symbol: "ITC.NS", name: "ITC Limited", sector: "Consumer Staples", industry: "FMCG", exchange: "NSE" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki", sector: "Consumer Discretionary", industry: "Automobile", exchange: "NSE" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", sector: "Consumer Discretionary", industry: "Automobile", exchange: "NSE" },
  { symbol: "TATASTEEL.NS", name: "Tata Steel", sector: "Materials", industry: "Steel", exchange: "NSE" },
  { symbol: "ASIANPAINT.NS", name: "Asian Paints", sector: "Materials", industry: "Paints", exchange: "NSE" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical", sector: "Healthcare", industry: "Pharma", exchange: "NSE" },
  { symbol: "POWERGRID.NS", name: "Power Grid Corporation", sector: "Utilities", industry: "Power", exchange: "NSE" },
  { symbol: "WIPRO.NS", name: "Wipro", sector: "IT", industry: "IT Services", exchange: "NSE" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises", sector: "Conglomerate", industry: "Diversified", exchange: "NSE" },
  { symbol: "ADANIPORTS.NS", name: "Adani Ports & SEZ", sector: "Industrials", industry: "Ports", exchange: "NSE" },
  { symbol: "NTPC.NS", name: "NTPC", sector: "Utilities", industry: "Power", exchange: "NSE" },
  { symbol: "HCLTECH.NS", name: "HCL Technologies", sector: "IT", industry: "IT Services", exchange: "NSE" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", sector: "Financials", industry: "Private Bank", exchange: "NSE" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", sector: "Consumer Staples", industry: "FMCG", exchange: "NSE" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", sector: "Financials", industry: "NBFC", exchange: "NSE" },
  { symbol: "TITAN.NS", name: "Titan Company", sector: "Consumer Discretionary", industry: "Jewellery", exchange: "NSE" },
];

export function searchStocks(query: string, limit = 8): StockMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return STOCKS.slice(0, limit);
  return STOCKS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.sector.toLowerCase().includes(q),
  ).slice(0, limit);
}

export function findStock(symbol: string): StockMeta | undefined {
  return STOCKS.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
}
