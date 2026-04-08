'use client';
import { useState } from 'react';

interface Props {
  currentBest: number | null;
  currency?: string;
  onCounterOffer: (maxPrice: number) => void;
  isLoading?: boolean;
}

export default function CounterOfferBar({ currentBest, currency = '€', onCounterOffer, isLoading }: Props) {
  const [price, setPrice] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(price);
    if (!val || val <= 0) return;
    onCounterOffer(val);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="mt-6 rounded-2xl border border-white/8 bg-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">💬</span>
        <div>
          <p className="text-sm font-semibold text-white">Make a counter-offer</p>
          <p className="text-xs text-white/35">
            {currentBest ? `Best offer so far: ${currency}${currentBest.toLocaleString()}` : 'Name your max price and providers will respond'}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">{currency}</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={currentBest ? String(Math.round(currentBest * 0.85)) : '150'}
            className="w-full bg-white/4 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !price}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5"
        >
          {isLoading ? <><div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" /> Searching…</> : submitted ? '✓ Sent!' : 'Counter →'}
        </button>
      </form>
      {/* Quick suggestions */}
      {currentBest && (
        <div className="flex gap-2 mt-2">
          {[0.9, 0.8, 0.7].map((factor) => {
            const suggested = Math.round(currentBest * factor);
            return (
              <button
                key={factor}
                onClick={() => setPrice(String(suggested))}
                className="px-2.5 py-1 rounded-lg border border-white/8 text-xs text-white/35 hover:border-purple-500/30 hover:text-white/60 transition-all"
              >
                {currency}{suggested}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
