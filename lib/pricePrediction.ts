export type PriceTrend = 'rising' | 'falling' | 'stable';

export interface PricePrediction {
  trend: PriceTrend;
  changePercent: number;   // e.g. 12
  timeframe: string;       // e.g. "3 days"
  recommendation: 'buy_now' | 'wait' | 'neutral';
  label: string;           // human-readable
}

// Deterministic mock based on price % 3 and category
export function predictPrice(category: string, price: number): PricePrediction {
  const seed = (price * 7 + category.length * 13) % 9;

  if (seed < 3) {
    return { trend: 'falling', changePercent: 8 + (seed * 3), timeframe: `${2 + seed} days`, recommendation: 'wait', label: `↓ Likely ${8 + seed * 3}% cheaper in ${2 + seed} days` };
  }
  if (seed < 6) {
    return { trend: 'rising', changePercent: 5 + seed, timeframe: `${seed} days`, recommendation: 'buy_now', label: `↑ Price rising — buy now` };
  }
  return { trend: 'stable', changePercent: 2, timeframe: '7 days', recommendation: 'neutral', label: `→ Price stable this week` };
}
