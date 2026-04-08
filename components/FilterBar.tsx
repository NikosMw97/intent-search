'use client';

import { useState } from 'react';
import type { FilterState, RankedResult } from '@/lib/types';

interface Props {
  results: RankedResult[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const STARS = [0, 3, 4, 4.5];

export default function FilterBar({ results, filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const allProviders = Array.from(new Set(results.map((r) => r.offer.providerName)));
  const prices = results.map((r) => r.offer.price);
  const minAll = Math.min(...prices);
  const maxAll = Math.max(...prices);

  const activeCount = [
    filters.minPrice > 0,
    filters.maxPrice < Infinity,
    filters.minRating > 0,
    filters.providers.length > 0,
  ].filter(Boolean).length;

  const reset = () => onChange({ minPrice: 0, maxPrice: Infinity, minRating: 0, providers: [] });

  const toggleProvider = (name: string) => {
    const next = filters.providers.includes(name)
      ? filters.providers.filter((p) => p !== name)
      : [...filters.providers, name];
    onChange({ ...filters, providers: next });
  };

  return (
    <div className="mb-4">
      {/* Toggle row */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
            open ? 'border-purple-500/50 bg-purple-500/15 text-purple-300' : 'border-white/10 text-white/50 hover:border-white/20'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500 text-white text-xs leading-none">{activeCount}</span>
          )}
        </button>

        {/* Active filter pills */}
        {filters.minRating > 0 && (
          <Pill label={`★ ${filters.minRating}+`} onRemove={() => onChange({ ...filters, minRating: 0 })} />
        )}
        {filters.maxPrice < Infinity && (
          <Pill label={`≤ €${filters.maxPrice}`} onRemove={() => onChange({ ...filters, maxPrice: Infinity })} />
        )}
        {filters.providers.map((p) => (
          <Pill key={p} label={p} onRemove={() => toggleProvider(p)} />
        ))}
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Expanded panel */}
      {open && (
        <div className="mt-3 p-4 rounded-2xl border border-white/8 bg-surface grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in">

          {/* Price range */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Max Price</p>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder={String(maxAll)}
                value={filters.maxPrice === Infinity ? '' : filters.maxPrice}
                onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : Infinity })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50"
              />
              <span className="text-white/30 text-sm flex-shrink-0">EUR</span>
            </div>
          </div>

          {/* Min rating */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Min Rating</p>
            <div className="flex gap-1.5 flex-wrap">
              {STARS.map((s) => (
                <button
                  key={s}
                  onClick={() => onChange({ ...filters, minRating: s })}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                    filters.minRating === s
                      ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {s === 0 ? 'Any' : `★ ${s}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Provider filter */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Provider</p>
            <div className="flex gap-1.5 flex-wrap">
              {allProviders.map((p) => (
                <button
                  key={p}
                  onClick={() => toggleProvider(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                    filters.providers.includes(p)
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors leading-none">✕</button>
    </span>
  );
}
