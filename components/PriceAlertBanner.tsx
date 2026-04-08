'use client';
import type { PriceAlert } from '@/hooks/usePriceAlerts';

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻', flights: '✈️', freelance: '🎨',
  hotels: '🏨', cars: '🚗', restaurants: '🍽️', software: '📦', general: '🔍',
};

interface Props {
  alerts: PriceAlert[];
  onSearch: (query: string) => void;
  onDismiss: (id: string) => void;
}

export default function PriceAlertBanner({ alerts, onSearch, onDismiss }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="w-full max-w-2xl space-y-2 animate-fade-in">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-green-500/25 bg-green-500/8"
        >
          <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[alert.category] ?? '🔍'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-300 mb-0.5">
              📉 Price dropped {alert.dropPercent}%
            </p>
            <p className="text-xs text-white/50 truncate">{alert.query}</p>
            <p className="text-xs text-white/30">
              <span className="line-through">€{alert.oldPrice.toLocaleString()}</span>
              {' → '}
              <span className="text-green-400 font-semibold">€{alert.newPrice.toLocaleString()}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onSearch(alert.query)}
              className="px-2.5 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-xs hover:bg-green-500/30 transition-colors"
            >
              Search →
            </button>
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-white/20 hover:text-white/50 transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
