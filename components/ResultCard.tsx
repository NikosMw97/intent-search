'use client';

import type { RankedResult } from '@/lib/types';

interface Props {
  result: RankedResult;
  rank: number;
  style?: React.CSSProperties;
}

const BADGE_CONFIG = {
  'best-match': { label: '✦ Best Match', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  'best-value': { label: '💰 Best Value', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
  'top-rated': { label: '⭐ Top Rated', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  'fastest-delivery': { label: '⚡ Fastest', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500/70';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/30 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-white/40 w-7 text-right">{value}</span>
    </div>
  );
}

export default function ResultCard({ result, rank, style }: Props) {
  const { offer, score, reasoning, matchFactors, badge } = result;
  const badgeCfg = badge ? BADGE_CONFIG[badge] : null;

  const currencySymbol = offer.currency === 'EUR' ? '€' : offer.currency === 'USD' ? '$' : '£';

  return (
    <div
      className="relative group rounded-2xl border border-white/8 bg-surface hover:border-purple-500/30 hover:bg-surface-2 transition-all duration-300 overflow-hidden animate-slide-up"
      style={style}
    >
      {/* Top glow on rank #1 */}
      {rank === 1 && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Rank + emoji */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${rank === 1 ? 'bg-purple-500/25' : 'bg-white/6'}`}>
                {offer.imageEmoji ?? '📦'}
              </div>
              <span className="text-xs text-white/20 font-mono">#{rank}</span>
            </div>

            {/* Name + provider */}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{offer.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/40">
                  {offer.providerLogo} {offer.providerName}
                </span>
                {offer.rating && (
                  <span className="text-xs text-yellow-400/80">★ {offer.rating.toFixed(1)}</span>
                )}
                {offer.reviewCount && (
                  <span className="text-xs text-white/25">({offer.reviewCount.toLocaleString()})</span>
                )}
              </div>
            </div>
          </div>

          {/* Price + score */}
          <div className="flex-shrink-0 text-right">
            <div className="text-xl font-bold text-white tabular-nums">
              {currencySymbol}{offer.price.toLocaleString()}
            </div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-white/40">{score}/100</span>
            </div>
          </div>
        </div>

        {/* Badge */}
        {badgeCfg && (
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border mb-3 ${badgeCfg.className}`}>
            {badgeCfg.label}
          </div>
        )}

        {/* AI Reasoning */}
        <div className="flex items-start gap-2 mb-3 px-3 py-2.5 rounded-xl bg-purple-500/8 border border-purple-500/15">
          <span className="text-purple-400 text-xs mt-0.5 flex-shrink-0">✦</span>
          <p className="text-xs text-purple-200/80 leading-relaxed">{reasoning}</p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {offer.features.slice(0, 5).map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-xs border border-white/8"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Metadata chips (airline, delivery, etc.) */}
        {offer.metadata && Object.keys(offer.metadata).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {offer.metadata.stops && (
              <MetaChip icon="🛫" value={offer.metadata.stops} />
            )}
            {offer.metadata.duration && (
              <MetaChip icon="⏱" value={offer.metadata.duration} />
            )}
            {offer.metadata.deliveryDays && (
              <MetaChip icon="📦" value={`${offer.metadata.deliveryDays}-day delivery`} />
            )}
            {offer.metadata.weight && (
              <MetaChip icon="⚖️" value={offer.metadata.weight} />
            )}
          </div>
        )}

        {/* Score bars */}
        <div className="space-y-1.5 mb-4 pt-2 border-t border-white/6">
          <ScoreBar label="Budget" value={matchFactors.budgetMatch} />
          <ScoreBar label="Relevance" value={matchFactors.relevance} />
          <ScoreBar label="Quality" value={matchFactors.quality} />
        </div>

        {/* Footer: availability + CTA */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-xs text-white/40">{offer.availability ?? 'Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Solana pay button (Hackathon: structure only) */}
            <button
              className="px-3 py-1.5 rounded-lg border border-[#9945FF]/30 text-[#9945FF] text-xs hover:bg-[#9945FF]/10 transition-colors flex items-center gap-1.5"
              title="Pay with SOL (coming soon)"
              onClick={(e) => e.preventDefault()}
            >
              <span>◎</span>
              <span>Pay SOL</span>
            </button>
            <a
              href={offer.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
            >
              View offer →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaChip({ icon, value }: { icon: string; value: string }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/4 text-white/40 text-xs border border-white/8">
      <span>{icon}</span>
      <span>{value}</span>
    </span>
  );
}
