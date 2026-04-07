'use client';

import { useState } from 'react';
import SearchBox from '@/components/SearchBox';
import IntentSummary from '@/components/IntentSummary';
import ResultCard from '@/components/ResultCard';
import LoadingState from '@/components/LoadingState';
import WalletButton from '@/components/WalletButton';
import Logo from '@/components/Logo';
import type { IntentResponse } from '@/lib/types';

// ─── State machine ──────────────────────────────────────────────────────────
type AppState = 'idle' | 'loading' | 'results' | 'error';

export default function Home() {
  const [state, setState] = useState<AppState>('idle');
  const [isSearching, setIsSearching] = useState(false);
  const [response, setResponse] = useState<IntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async (query: string) => {
    setState('loading');
    setIsSearching(true);
    setLastQuery(query);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? 'Something went wrong');
      }

      const data: IntentResponse = await res.json();
      setResponse(data);
      setState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setState('idle');
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/6">
        <button onClick={handleReset} className="hover:opacity-80 transition-opacity">
          <Logo size={34} showName showTagline={false} />
        </button>

        <div className="flex items-center gap-3">
          {/* Colosseum Hackathon badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/8 text-xs text-yellow-400/80">
            <span>🏆</span>
            <span>Colosseum Hackathon</span>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">

        {/* IDLE STATE — Hero + search */}
        {state === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
            {/* Hero text */}
            <div className="text-center mb-10 animate-fade-in">
              {/* Large logo mark */}
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

              <p className="text-white/30 text-sm uppercase tracking-widest mb-5 font-medium">
                the end of search
              </p>

              <p className="text-white/45 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                Tell us what you want in plain language. AI understands it,
                providers compete, you get ranked answers — with reasoning.
              </p>
            </div>

            {/* Search box */}
            <div className="w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <SearchBox onSearch={handleSearch} isLoading={false} />
            </div>

            {/* How it works */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {[
                { icon: '🧠', title: 'Express Intent', desc: 'Type naturally — no keywords, no filters needed' },
                { icon: '⚡', title: 'Providers Compete', desc: 'Multiple providers bid to serve your request' },
                { icon: '✦', title: 'AI Ranks & Reasons', desc: 'Get top picks with clear explanations' },
              ].map((step) => (
                <div key={step.title} className="glass-card rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <p className="text-xs font-semibold text-white/70 mb-1">{step.title}</p>
                  <p className="text-xs text-white/35 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {state === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <LoadingState />
          </div>
        )}

        {/* ERROR STATE */}
        {state === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-fade-in">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-white/40 text-sm mb-6 max-w-sm">{error}</p>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* RESULTS STATE */}
        {state === 'results' && response && (
          <div className="flex-1 flex flex-col lg:flex-row gap-0">

            {/* ── Left panel: Intent summary + search again ── */}
            <aside className="lg:w-72 xl:w-80 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/6">
              <div className="p-5 lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto">
                {/* New search */}
                <div className="mb-6">
                  <SearchBox onSearch={handleSearch} isLoading={isSearching} />
                </div>

                <IntentSummary
                  intent={response.intent}
                  totalOffers={response.totalOffers}
                  totalProviders={response.totalProviders}
                  searchTimeMs={response.searchTimeMs}
                />
              </div>
            </aside>

            {/* ── Right panel: Results ── */}
            <section className="flex-1 p-5 overflow-y-auto">
              {/* Results header */}
              <div className="flex items-center justify-between mb-5 animate-fade-in">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Top {response.results.length} results
                  </h2>
                  <p className="text-xs text-white/35 mt-0.5">
                    {response.totalProviders} providers competed · {response.totalOffers} offers analysed
                  </p>
                </div>
                {/* Competition visual */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(response.totalProviders, 6) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-xs border-2 border-void"
                      style={{
                        background: `hsl(${260 + i * 25}, 70%, 50%)`,
                        marginLeft: i > 0 ? '-6px' : 0,
                        zIndex: 6 - i,
                      }}
                    >
                      {['🛒', '🔴', '🔶', '📦', '🔵', '🟢'][i]}
                    </div>
                  ))}
                  <span className="ml-2 text-xs text-white/30">competing</span>
                </div>
              </div>

              {/* Result cards */}
              <div className="space-y-3">
                {response.results.map((result, i) => (
                  <ResultCard
                    key={result.offer.id}
                    result={result}
                    rank={result.rank}
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>

              {/* Footer disclaimer */}
              <p className="text-xs text-white/20 text-center mt-8 pb-4">
                Results powered by AI intent parsing + algorithmic ranking · Mock data for demo purposes
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
