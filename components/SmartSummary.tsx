'use client';

import type { RankedResult } from '@/lib/types';
import type { ParsedIntent } from '@/lib/types';

interface Props {
  results: RankedResult[];
  intent: ParsedIntent;
}

export default function SmartSummary({ results }: Props) {
  if (results.length === 0) return null;

  const best = results[0];

  // Best value: lowest price among results with score >= 60
  const qualityResults = results.filter((r) => r.score >= 60);
  const bestValue = qualityResults.length > 0
    ? qualityResults.reduce((min, r) => r.offer.price < min.offer.price ? r : min, qualityResults[0])
    : null;

  // One to avoid: last result if score < 70
  const last = results[results.length - 1];
  const avoid = last.score < 70 ? last : null;

  return (
    <div className="rounded-2xl border border-white/8 bg-surface p-4 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">✦</span>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">AI Verdict</p>
      </div>
      <div className="space-y-2">
        {/* Best overall */}
        <div className="flex items-start gap-2">
          <span className="text-green-400 text-xs mt-0.5 flex-shrink-0">🏆</span>
          <p className="text-xs text-white/70 leading-relaxed">
            <span className="font-semibold text-white">Best overall:</span>{' '}
            {best.offer.name} from {best.offer.providerName} at €{best.offer.price.toLocaleString()} — scored {best.score}/100 across budget, relevance and quality.
          </p>
        </div>
        {/* Best value */}
        {bestValue && bestValue.offer.id !== best.offer.id && (
          <div className="flex items-start gap-2">
            <span className="text-blue-400 text-xs mt-0.5 flex-shrink-0">💰</span>
            <p className="text-xs text-white/70 leading-relaxed">
              <span className="font-semibold text-white">Best value:</span>{' '}
              {bestValue.offer.name} at €{bestValue.offer.price.toLocaleString()} — lowest price among quality options.
            </p>
          </div>
        )}
        {/* One to reconsider */}
        {avoid && (
          <div className="flex items-start gap-2">
            <span className="text-yellow-500/70 text-xs mt-0.5 flex-shrink-0">⚠</span>
            <p className="text-xs text-white/50 leading-relaxed">
              <span className="font-semibold text-white/70">Consider skipping:</span>{' '}
              {avoid.offer.name} — scored {avoid.score}/100, lower relevance to your intent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
