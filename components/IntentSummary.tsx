'use client';

import type { ParsedIntent } from '@/lib/types';

interface Props {
  intent: ParsedIntent;
  totalOffers: number;
  totalProviders: number;
  searchTimeMs: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻',
  flights: '✈️',
  freelance: '🎨',
  general: '🔍',
};

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Electronics',
  flights: 'Flights',
  freelance: 'Freelance',
  general: 'General',
};

export default function IntentSummary({ intent, totalOffers, totalProviders, searchTimeMs }: Props) {
  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-base">
          {CATEGORY_ICONS[intent.category]}
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Intent Parsed</p>
          <p className="text-sm text-white/80 font-medium leading-tight">&ldquo;{intent.raw}&rdquo;</p>
        </div>
      </div>

      {/* Structured breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Chip label="Category" value={CATEGORY_LABELS[intent.category]} icon={CATEGORY_ICONS[intent.category]} />
        {intent.budget && (
          <Chip
            label="Budget"
            value={`${intent.currency === 'EUR' ? '€' : intent.currency === 'USD' ? '$' : '£'}${intent.budget.toLocaleString()}`}
            icon="💰"
          />
        )}
        {intent.origin && <Chip label="From" value={intent.origin} icon="📍" />}
        {intent.destination && <Chip label="To" value={intent.destination} icon="🎯" />}
        {intent.timeframe && <Chip label="When" value={intent.timeframe} icon="📅" />}
      </div>

      {/* Keywords */}
      {intent.keywords.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {intent.keywords.map((kw) => (
              <span key={kw} className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-xs border border-purple-500/20">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Constraints */}
      {intent.constraints.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Requirements</p>
          <div className="flex flex-wrap gap-1.5">
            {intent.constraints.map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 text-xs border border-cyan-500/20">
                ✓ {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="border-t border-white/8 pt-3">
        <div className="flex items-center justify-between text-xs text-white/30">
          <span>
            <span className="text-white/60 font-semibold">{totalProviders}</span> providers competed
          </span>
          <span>
            <span className="text-white/60 font-semibold">{totalOffers}</span> offers analysed
          </span>
          <span>{(searchTimeMs / 1000).toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/8">
      <span className="text-sm">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-white/35 leading-none mb-0.5">{label}</p>
        <p className="text-xs text-white/80 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
