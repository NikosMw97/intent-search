'use client';

import type { SubResult, BundleSummary } from '@/hooks/useBundleSearch';
import type { BundlePlan } from '@/lib/bundleParser';

interface Props {
  plan: BundlePlan | null;
  subResults: SubResult[];
  summary: BundleSummary | null;
  isStreaming: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻', flights: '✈️', freelance: '🎨',
  hotels: '🏨', cars: '🚗', restaurants: '🍽️', software: '📦', general: '🔍',
};

export default function BundleResults({ plan, subResults, summary, isStreaming, onClose }: Props) {
  if (!plan) return null;

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 bg-purple-500/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-base">🧩</div>
          <div>
            <p className="text-sm font-semibold text-white">{plan.title}</p>
            <p className="text-xs text-white/40">
              Multi-intent bundle · {plan.subIntents.length} components
              {isStreaming && (
                <span className="ml-2 inline-flex items-center gap-1 text-purple-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  Searching…
                </span>
              )}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/25 hover:text-white/60 transition-colors text-xs">✕</button>
      </div>

      <div className="p-5 space-y-4">
        {/* Plan overview */}
        <div className="flex items-center gap-2 flex-wrap">
          {plan.subIntents.map((sub, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/4 text-xs text-white/60">
                <span>{CATEGORY_ICONS[sub.category] ?? '🔍'}</span>
                {sub.label}
              </span>
              {i < plan.subIntents.length - 1 && (
                <span className="text-white/20 text-xs">+</span>
              )}
            </div>
          ))}
        </div>

        {/* Sub-results */}
        <div className="space-y-4">
          {plan.subIntents.map((sub, idx) => {
            const sr = subResults.find((r) => r.sub.label === sub.label);
            const isLoading = !sr && isStreaming;
            const isDone = !!sr;

            return (
              <div key={idx} className="rounded-xl border border-white/8 overflow-hidden">
                {/* Sub-intent header */}
                <div className="flex items-center gap-2.5 px-4 py-3 bg-white/3 border-b border-white/6">
                  <span className="text-base">{CATEGORY_ICONS[sub.category] ?? '🔍'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/80">{sub.label}</p>
                    <p className="text-xs text-white/35 truncate">{sub.query}</p>
                  </div>
                  {isLoading && (
                    <div className="w-3.5 h-3.5 border border-white/20 border-t-purple-400 rounded-full animate-spin" />
                  )}
                  {isDone && (
                    <span className="text-xs text-green-400/70">✓ {sr.results.length} offers</span>
                  )}
                </div>

                {/* Results */}
                {isDone && sr.results.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {sr.results.slice(0, 3).map((ranked, ri) => (
                      <div key={ri} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white line-clamp-1">{ranked.offer.name}</p>
                          <p className="text-xs text-white/35">{ranked.offer.providerName}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-white tabular-nums">€{ranked.offer.price.toLocaleString()}</p>
                          <p className="text-xs text-white/30 tabular-nums">{ranked.score}pts</p>
                        </div>
                        {ri === 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-xs flex-shrink-0">Best</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : isDone && sr.results.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-white/30">No offers found</p>
                ) : (
                  <div className="px-4 py-3 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-white/6 overflow-hidden">
                      <div className="h-full w-1/3 rounded-full bg-purple-500/40 animate-pulse" />
                    </div>
                    <span className="text-xs text-white/25">Fetching…</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary total */}
        {summary && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-300/70">Estimated total</p>
              <p className="text-sm font-bold text-white mt-0.5">
                €{summary.totalMin.toLocaleString()} – €{summary.totalMax.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/30">{summary.subCount} components</p>
              <p className="text-xs text-yellow-400/60 mt-0.5">combined estimate</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
