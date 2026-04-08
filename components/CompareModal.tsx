'use client';

import type { RankedResult } from '@/lib/types';

interface Props {
  items: RankedResult[];
  onClose: () => void;
}

export default function CompareModal({ items, onClose }: Props) {
  if (items.length < 2) return null;

  const currencySymbol = (c: string) => c === 'USD' ? '$' : c === 'GBP' ? '£' : '€';

  // All unique feature keys across items
  const allFeatures = Array.from(new Set(items.flatMap((r) => r.offer.features))).slice(0, 10);

  // Find best values
  const lowestPrice = Math.min(...items.map((r) => r.offer.price));
  const highestRating = Math.max(...items.map((r) => r.offer.rating ?? 0));
  const highestScore = Math.max(...items.map((r) => r.score));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8 sticky top-0 bg-surface z-10">
          <div>
            <h2 className="text-base font-semibold text-white">Side-by-side comparison</h2>
            <p className="text-xs text-white/40 mt-0.5">Comparing {items.length} offers</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {/* Column headers */}
          <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
            <div />
            {items.map((r) => (
              <div key={r.offer.id} className="text-center">
                <div className="text-2xl mb-1">{r.offer.imageEmoji ?? '📦'}</div>
                <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{r.offer.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{r.offer.providerLogo} {r.offer.providerName}</p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {[
            {
              label: 'Price',
              render: (r: RankedResult) => (
                <span className={`font-bold ${r.offer.price === lowestPrice ? 'text-green-400' : 'text-white'}`}>
                  {currencySymbol(r.offer.currency)}{r.offer.price.toLocaleString()}
                  {r.offer.price === lowestPrice && <span className="ml-1 text-xs text-green-400/70">lowest</span>}
                </span>
              ),
            },
            {
              label: 'Match Score',
              render: (r: RankedResult) => (
                <span className={r.score === highestScore ? 'text-purple-400 font-bold' : 'text-white/70'}>
                  {r.score}/100
                </span>
              ),
            },
            {
              label: 'Rating',
              render: (r: RankedResult) => (
                <span className={r.offer.rating === highestRating ? 'text-yellow-400 font-bold' : 'text-white/70'}>
                  {r.offer.rating ? `★ ${r.offer.rating}` : '—'}
                  {r.offer.reviewCount && (
                    <span className="text-white/30 text-xs ml-1">({r.offer.reviewCount.toLocaleString()})</span>
                  )}
                </span>
              ),
            },
            {
              label: 'Budget match',
              render: (r: RankedResult) => <ScoreChip value={r.matchFactors.budgetMatch} />,
            },
            {
              label: 'Relevance',
              render: (r: RankedResult) => <ScoreChip value={r.matchFactors.relevance} />,
            },
            {
              label: 'Quality',
              render: (r: RankedResult) => <ScoreChip value={r.matchFactors.quality} />,
            },
            {
              label: 'Availability',
              render: (r: RankedResult) => (
                <span className="text-xs text-white/60">{r.offer.availability ?? '—'}</span>
              ),
            },
          ].map((row) => (
            <div
              key={row.label}
              className="grid gap-3 py-3 border-b border-white/6 items-center"
              style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}
            >
              <span className="text-xs text-white/35 uppercase tracking-wider">{row.label}</span>
              {items.map((r) => (
                <div key={r.offer.id} className="text-center text-sm">
                  {row.render(r)}
                </div>
              ))}
            </div>
          ))}

          {/* Features */}
          <p className="text-xs text-white/30 uppercase tracking-wider mt-4 mb-2">Features</p>
          {allFeatures.map((feature) => (
            <div
              key={feature}
              className="grid gap-3 py-2.5 border-b border-white/4 items-center"
              style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}
            >
              <span className="text-xs text-white/40">{feature}</span>
              {items.map((r) => (
                <div key={r.offer.id} className="text-center text-sm">
                  {r.offer.features.includes(feature)
                    ? <span className="text-green-400">✓</span>
                    : <span className="text-white/15">—</span>}
                </div>
              ))}
            </div>
          ))}

          {/* AI Reasoning */}
          <p className="text-xs text-white/30 uppercase tracking-wider mt-4 mb-2">AI Reasoning</p>
          <div className="grid gap-3" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
            <div />
            {items.map((r) => (
              <div key={r.offer.id} className="px-3 py-2 rounded-xl bg-purple-500/8 border border-purple-500/15">
                <p className="text-xs text-purple-200/80 leading-relaxed">{r.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreChip({ value }: { value: number }) {
  const color = value >= 80 ? 'text-green-400' : value >= 60 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`text-sm font-medium ${color}`}>{value}</span>;
}
