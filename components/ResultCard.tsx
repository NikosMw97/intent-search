'use client';

import type { RankedResult } from '@/lib/types';
import { predictPrice } from '@/lib/pricePrediction';
import { getReputation, getReputationColor, getBadgeLabel } from '@/lib/providerReputation';

interface Props {
  result: RankedResult;
  rank: number;
  isSelected?: boolean;
  onToggleCompare?: (id: string) => void;
  style?: React.CSSProperties;
  isFollowing?: boolean;
  onToggleFollow?: (providerName: string) => void;
  isSponsored?: boolean;
}

const BADGE_CONFIG = {
  'best-match':       { label: '✦ Best Match',  className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  'best-value':       { label: '💰 Best Value',  className: 'bg-green-500/20  text-green-300  border-green-500/30'  },
  'top-rated':        { label: '⭐ Top Rated',   className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  'fastest-delivery': { label: '⚡ Fastest',     className: 'bg-cyan-500/20   text-cyan-300   border-cyan-500/30'   },
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500/70';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/30 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-white/40 w-7 text-right">{value}</span>
    </div>
  );
}

export default function ResultCard({ result, rank, isSelected, onToggleCompare, style, isFollowing, onToggleFollow, isSponsored }: Props) {
  const { offer, score, reasoning, matchFactors, badge } = result;
  const badgeCfg = badge ? BADGE_CONFIG[badge] : null;
  const sym = offer.currency === 'USD' ? '$' : offer.currency === 'GBP' ? '£' : '€';

  // Price prediction — use category from offer if available, fallback to providerName
  const prediction = predictPrice(offer.providerName, offer.price);

  // Provider reputation
  const rep = getReputation(offer.providerName);

  return (
    <div
      className={`relative group rounded-2xl border transition-all duration-300 overflow-hidden animate-slide-up ${
        isSelected
          ? 'border-purple-500/60 bg-purple-500/8'
          : 'border-white/8 bg-surface hover:border-purple-500/30 hover:bg-surface-2'
      }`}
      style={style}
    >
      {rank === 1 && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Compare checkbox — always visible on mobile, hover on desktop */}
            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(offer.id)}
                className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border transition-all ${
                  isSelected
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'border-white/20 text-transparent hover:border-purple-400 group-hover:border-white/30'
                } flex items-center justify-center text-xs`}
                title={isSelected ? 'Remove from compare' : 'Add to compare'}
              >
                {isSelected ? '✓' : ''}
              </button>
            )}

            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${rank === 1 ? 'bg-purple-500/25' : 'bg-white/6'}`}>
                {offer.imageEmoji ?? '📦'}
              </div>
              <span className="text-xs text-white/20 font-mono">#{rank}</span>
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{offer.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-white/40">{offer.providerLogo} {offer.providerName}</span>
                {rep && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-mono font-bold ${getReputationColor(rep.overall)}`}>{rep.overall}</span>
                    {rep.badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                        rep.badge === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                        rep.badge === 'trusted'  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}>{getBadgeLabel(rep.badge)}</span>
                    )}
                  </div>
                )}
                {offer.rating && <span className="text-xs text-yellow-400/80">★ {offer.rating.toFixed(1)}</span>}
                {offer.reviewCount && <span className="text-xs text-white/25">({offer.reviewCount.toLocaleString()})</span>}
                {/* Follow button */}
                {onToggleFollow && (
                  <button
                    onClick={(e) => { e.preventDefault(); onToggleFollow(offer.providerName); }}
                    title={isFollowing ? `Unfollow ${offer.providerName}` : `Follow ${offer.providerName}`}
                    className="transition-colors text-sm leading-none"
                  >
                    {isFollowing
                      ? <span className="text-pink-400">♥</span>
                      : <span className="text-white/20 hover:text-pink-400/60">♡</span>
                    }
                  </button>
                )}
                {/* Sponsored badge */}
                {isSponsored && (
                  <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-yellow-400/80 text-xs">
                    Sponsored
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <div className="text-xl font-bold text-white tabular-nums">{sym}{offer.price.toLocaleString()}</div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-white/40">{score}/100</span>
            </div>
          </div>
        </div>

        {/* Price prediction badge */}
        <div className="mb-3">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
            prediction.trend === 'falling' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
            prediction.trend === 'rising'  ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            'bg-white/5 border-white/10 text-white/35'
          }`}>
            {prediction.label}
          </div>
        </div>

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
            <span key={f} className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-xs border border-white/8">{f}</span>
          ))}
        </div>

        {/* Metadata */}
        {offer.metadata && (
          <div className="flex flex-wrap gap-2 mb-4">
            {offer.metadata.stops       && <MetaChip icon="🛫" value={offer.metadata.stops} />}
            {offer.metadata.duration    && <MetaChip icon="⏱"  value={offer.metadata.duration} />}
            {offer.metadata.deliveryDays && <MetaChip icon="📦" value={`${offer.metadata.deliveryDays}-day delivery`} />}
            {offer.metadata.weight      && <MetaChip icon="⚖️"  value={offer.metadata.weight} />}
            {offer.metadata.stars       && <MetaChip icon="⭐"  value={`${offer.metadata.stars}-star`} />}
            {offer.metadata.rateType    && <MetaChip icon="📅"  value={offer.metadata.rateType} />}
          </div>
        )}

        {/* Score bars */}
        <div className="space-y-1.5 mb-4 pt-2 border-t border-white/6">
          <ScoreBar label="Budget"    value={matchFactors.budgetMatch} />
          <ScoreBar label="Relevance" value={matchFactors.relevance}   />
          <ScoreBar label="Quality"   value={matchFactors.quality}     />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-white/40">{offer.availability ?? 'Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-[#9945FF]/30 text-[#9945FF] text-xs hover:bg-[#9945FF]/10 transition-colors flex items-center gap-1.5"
              onClick={(e) => e.preventDefault()}
              title="Pay with SOL (coming soon)"
            >
              <span>◎</span><span>Pay SOL</span>
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
      <span>{icon}</span><span>{value}</span>
    </span>
  );
}
