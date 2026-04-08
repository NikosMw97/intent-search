'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import IntentSummary from '@/components/IntentSummary';
import ResultCard from '@/components/ResultCard';
import LoadingState from '@/components/LoadingState';
import WalletButton from '@/components/WalletButton';
import Logo from '@/components/Logo';
import FilterBar from '@/components/FilterBar';
import CompareModal from '@/components/CompareModal';
import RefinementBar from '@/components/RefinementBar';
import AuctionRoom from '@/components/AuctionRoom';
import EscrowModal from '@/components/EscrowModal';
import BundleResults from '@/components/BundleResults';
import { useIntentStream } from '@/hooks/useIntentStream';
import { useIntentHistory } from '@/hooks/useIntentHistory';
import { useAuction } from '@/hooks/useAuction';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useBundleSearch } from '@/hooks/useBundleSearch';
import { looksLikeBundle } from '@/lib/bundleHeuristic';
import type { FilterState, RankedResult } from '@/lib/types';

const DEFAULT_FILTERS: FilterState = { minPrice: 0, maxPrice: Infinity, minRating: 0, providers: [] };

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻', flights: '✈️', freelance: '🎨',
  hotels: '🏨', cars: '🚗', restaurants: '🍽️', software: '📦', general: '🔍',
};

function applyFilters(results: RankedResult[], filters: FilterState): RankedResult[] {
  return results.filter((r) => {
    if (r.offer.price < filters.minPrice) return false;
    if (r.offer.price > filters.maxPrice) return false;
    if (filters.minRating > 0 && (r.offer.rating ?? 0) < filters.minRating) return false;
    if (filters.providers.length > 0 && !filters.providers.includes(r.offer.providerName)) return false;
    return true;
  });
}

// Skeleton card shown while streaming
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/8 bg-surface p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-3 skeleton rounded w-3/4" />
          <div className="h-2 skeleton rounded w-1/3" />
        </div>
        <div className="h-6 w-16 skeleton rounded" />
      </div>
      <div className="h-10 skeleton rounded-xl mb-3" />
      <div className="flex gap-1.5 mb-4">
        {[60, 80, 50, 70].map((w) => (
          <div key={w} className="h-5 skeleton rounded" style={{ width: `${w}px` }} />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-1.5 skeleton rounded" />
        <div className="h-1.5 skeleton rounded" />
        <div className="h-1.5 skeleton rounded" />
      </div>
    </div>
  );
}

export default function Home() {
  const { intent, results, stats, status, error, searchTimeMs, search, reset } = useIntentStream();
  const { history, add: addToHistory, clear: clearHistory } = useIntentHistory();

  const [lastQuery, setLastQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [escrowOffer, setEscrowOffer] = useState<{
    name: string; price: number; currency: string; providerName: string; providerLogo: string;
  } | null>(null);

  const auction = useAuction(intent);
  const { triggeredCount } = useSubscriptions();
  const bundle = useBundleSearch();
  const [showBundle, setShowBundle] = useState(false);

  // ── URL sharing: read ?q= on load ────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setLastQuery(q);
      search(q);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update URL when search completes ─────────────────────────────────────
  useEffect(() => {
    if (status === 'done' && lastQuery) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', lastQuery);
      window.history.replaceState({}, '', url.toString());
      addToHistory(lastQuery, intent?.category ?? 'general');
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reset filters when new search starts ─────────────────────────────────
  useEffect(() => {
    if (status === 'streaming') {
      setFilters(DEFAULT_FILTERS);
      setCompareIds(new Set());
    }
  }, [status]);

  const handleSearch = useCallback((query: string) => {
    setLastQuery(query);
    window.history.replaceState({}, '', '/');
    // If the query looks like a bundle, run bundle search alongside normal search
    if (looksLikeBundle(query)) {
      setShowBundle(true);
      bundle.search(query);
    } else {
      setShowBundle(false);
      bundle.reset();
    }
    search(query);
  }, [search, bundle]);

  const handleRefine = useCallback((refinement: string) => {
    search(lastQuery, refinement);
  }, [search, lastQuery]);

  const handleReset = useCallback(() => {
    reset();
    bundle.reset();
    setLastQuery('');
    setCompareIds(new Set());
    setShowBundle(false);
    window.history.replaceState({}, '', '/');
  }, [reset, bundle]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else if (next.size < 3) { next.add(id); }
      return next;
    });
  }, []);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const filteredResults = applyFilters(results, filters);
  const compareItems = results.filter((r) => compareIds.has(r.offer.id));

  const isStreaming = status === 'streaming';
  const isDone = status === 'done';
  const hasResults = results.length > 0;
  const showResults = hasResults || isStreaming;

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/6 sticky top-0 z-30 bg-void/80 backdrop-blur-md">
        <button onClick={handleReset} className="hover:opacity-80 transition-opacity">
          <Logo size={34} showName showTagline={false} />
        </button>
        <div className="flex items-center gap-3">
          <Link href="/subscriptions" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-xs transition-all">
            🔔 Alerts
            {triggeredCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">{triggeredCount}</span>
            )}
          </Link>
          <Link
            href="/providers"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-xs transition-all"
          >
            🏢 Providers
          </Link>
          <Link
            href="/graph"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-xs transition-all"
          >
            ✦ Graph
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/8 text-xs text-yellow-400/80">
            <span>🏆</span><span>Colosseum Hackathon</span>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">

        {/* ── IDLE ─────────────────────────────────────────────────────────── */}
        {status === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
            <div className="text-center mb-10 animate-fade-in">
              <div className="flex justify-center mb-6">
                <Logo size={72} showName={false} />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 text-purple-300 text-xs mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                Colosseum Hackathon 2025
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3 leading-tight">
                <span className="gradient-text">intent</span>
              </h1>
              <p className="text-white/30 text-sm uppercase tracking-widest mb-5 font-medium">the end of search</p>
              <p className="text-white/45 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                Tell us what you want in plain language. AI understands it,
                providers compete, you get ranked answers — with reasoning.
              </p>
            </div>

            <div className="w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <SearchBox onSearch={handleSearch} isLoading={false} />
            </div>

            {/* How it works */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {[
                { icon: '🧠', title: 'Express Intent', desc: 'Type naturally — no keywords, no filters' },
                { icon: '⚡', title: 'Providers Compete', desc: 'Multiple providers bid to serve your request' },
                { icon: '✦', title: 'AI Ranks & Reasons', desc: 'Top picks with clear explanations' },
              ].map((step) => (
                <div key={step.title} className="glass-card rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <p className="text-xs font-semibold text-white/70 mb-1">{step.title}</p>
                  <p className="text-xs text-white/35 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {Object.entries(CATEGORY_ICONS).filter(([k]) => k !== 'general').map(([cat, icon]) => (
                <span key={cat} className="px-3 py-1 rounded-full text-xs border border-white/8 text-white/30 capitalize">
                  {icon} {cat}
                </span>
              ))}
            </div>

            {/* Search history */}
            {history.length > 0 && (
              <div className="mt-10 w-full max-w-2xl animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-white/30 uppercase tracking-widest">Recent searches</p>
                  <button onClick={clearHistory} className="text-xs text-white/20 hover:text-white/40 transition-colors">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearch(item.query)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 hover:border-purple-500/30 hover:bg-purple-500/8 text-white/50 hover:text-white/80 text-xs transition-all"
                    >
                      <span>{CATEGORY_ICONS[item.category] ?? '🔍'}</span>
                      <span>{item.query}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LOADING (no results yet) ──────────────────────────────────────── */}
        {isStreaming && !hasResults && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <LoadingState />
          </div>
        )}

        {/* ── ERROR ────────────────────────────────────────────────────────── */}
        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-fade-in">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-white/40 text-sm mb-6 max-w-sm">{error}</p>
            <button onClick={handleReset} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
              Try again
            </button>
          </div>
        )}

        {/* ── RESULTS (streaming + done) ────────────────────────────────────── */}
        {showResults && (
          <div className="flex-1 flex flex-col lg:flex-row gap-0">

            {/* Left panel */}
            <aside className="lg:w-72 xl:w-80 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/6">
              <div className="p-5 lg:sticky lg:top-[65px] lg:max-h-[calc(100vh-65px)] lg:overflow-y-auto space-y-5">
                <SearchBox onSearch={handleSearch} isLoading={isStreaming} />

                {intent && (
                  <IntentSummary
                    intent={intent}
                    totalOffers={stats?.totalOffers ?? results.length}
                    totalProviders={stats?.totalProviders ?? 0}
                    searchTimeMs={searchTimeMs}
                  />
                )}

                {/* Refinement bar (only after results are done) */}
                {isDone && (
                  <RefinementBar onRefine={handleRefine} isLoading={isStreaming} />
                )}

                {/* Live auction room */}
                {(isDone || isStreaming) && (
                  <AuctionRoom
                    status={auction.status}
                    events={auction.events}
                    bestPrice={auction.bestPrice}
                    bestProvider={auction.bestProvider}
                    winnerLogo={auction.winnerLogo}
                    onStart={auction.start}
                    onReset={auction.reset}
                    onAcceptBid={setEscrowOffer}
                  />
                )}
              </div>
            </aside>

            {/* Right panel */}
            <section className="flex-1 p-5 overflow-y-auto min-w-0">
              {/* Results header */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3 animate-fade-in">
                <div>
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    {isStreaming && !isDone
                      ? <><span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /> Finding results…</>
                      : `Top ${filteredResults.length} results`
                    }
                  </h2>
                  {stats && (
                    <p className="text-xs text-white/35 mt-0.5">
                      {stats.totalProviders} providers competed · {stats.totalOffers} offers analysed
                      {isDone && ` · ${(searchTimeMs / 1000).toFixed(1)}s`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Share button */}
                  {isDone && (
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-xs transition-all"
                    >
                      {copied ? '✓ Copied!' : '🔗 Share'}
                    </button>
                  )}

                  {/* Compare button */}
                  {compareIds.size >= 2 && (
                    <button
                      onClick={() => setShowCompare(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs hover:bg-purple-500/30 transition-all"
                    >
                      Compare {compareIds.size} →
                    </button>
                  )}

                  {/* Provider stack */}
                  {stats && stats.totalProviders > 0 && (
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(stats.totalProviders, 5) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-void"
                          style={{ background: `hsl(${260 + i * 30}, 65%, 45%)`, marginLeft: i > 0 ? -6 : 0, zIndex: 5 - i }}
                        >
                          {['🛒','🔴','🔶','📦','🔵'][i]}
                        </div>
                      ))}
                      <span className="ml-2 text-xs text-white/25">competing</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Filters (only when we have results) */}
              {results.length > 0 && (
                <FilterBar results={results} filters={filters} onChange={setFilters} />
              )}

              {/* Bundle results */}
              {showBundle && bundle.state !== 'not_bundle' && bundle.state !== 'idle' && (
                <div className="mb-5 animate-fade-in">
                  <BundleResults
                    plan={bundle.plan}
                    subResults={bundle.subResults}
                    summary={bundle.summary}
                    isStreaming={bundle.state === 'loading' || bundle.state === 'streaming'}
                    onClose={() => setShowBundle(false)}
                  />
                </div>
              )}

              {/* Cards */}
              <div className="space-y-3">
                {filteredResults.map((result, i) => (
                  <ResultCard
                    key={result.offer.id}
                    result={result}
                    rank={result.rank}
                    isSelected={compareIds.has(result.offer.id)}
                    onToggleCompare={toggleCompare}
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}

                {/* Skeleton placeholders while streaming */}
                {isStreaming && Array.from({ length: Math.max(0, 5 - results.length) }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} />
                ))}
              </div>

              {/* Compare hint */}
              {isDone && results.length > 0 && compareIds.size === 0 && (
                <p className="text-xs text-white/20 text-center mt-6">
                  Tip: check up to 3 cards to compare side-by-side
                </p>
              )}

              <p className="text-xs text-white/15 text-center mt-8 pb-4">
                Powered by AI intent parsing + algorithmic ranking · Mock data for demo
              </p>
            </section>
          </div>
        )}
      </main>

      {/* ── Compare modal ──────────────────────────────────────────────────── */}
      {showCompare && compareItems.length >= 2 && (
        <CompareModal items={compareItems} onClose={() => setShowCompare(false)} />
      )}

      {/* ── Escrow modal ───────────────────────────────────────────────────── */}
      {escrowOffer && (
        <EscrowModal offer={escrowOffer} onClose={() => setEscrowOffer(null)} />
      )}

      {/* ── Floating compare bar ───────────────────────────────────────────── */}
      {compareIds.size >= 2 && !showCompare && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium shadow-2xl shadow-purple-900/50 transition-all"
          >
            <span>⚖️</span>
            <span>Compare {compareIds.size} offers</span>
            <span className="opacity-60">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
