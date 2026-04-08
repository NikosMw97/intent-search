'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import IntentGraph from '@/components/IntentGraph';
import { buildStats, CATEGORY_CONFIG, Category, FeedEntry } from '@/lib/graphSimulator';

type Stats = ReturnType<typeof buildStats>;

const EMPTY_STATS: Stats = {
  total: 0,
  byCategory: {
    electronics: 0, flights: 0, hotels: 0, cars: 0,
    restaurants: 0, freelance: 0, software: 0, general: 0,
  },
  trending: [],
  providerWins: [],
};

export default function GraphPage() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [feed, setFeed] = useState<FeedEntry[]>([]);

  const handleStats = useCallback((s: Stats) => {
    setStats(s);
  }, []);

  const handleFeed = useCallback((entries: FeedEntry[]) => setFeed(entries), []);

  const topCategory = (Object.entries(stats.byCategory) as [Category, number][])
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/6 flex-shrink-0">
        <Link href="/"><Logo size={34} showName showTagline={false} /></Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-white/30 border border-white/10 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Live Intent Graph
          </span>
          <Link
            href="/"
            className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-full border border-white/8 hover:border-white/20"
          >
            ← Search
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas — takes remaining space */}
        <div className="flex-1 relative bg-[#080810]">
          <IntentGraph onStatsUpdate={handleStats} liveQuery={null} onFeedUpdate={handleFeed} />

          {/* Floating total counter */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <p className="text-4xl font-bold tabular-nums text-white/90">{stats.total.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-0.5">total intents processed</p>
          </div>

          {/* Category legend — bottom of canvas */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pointer-events-none">
            {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][])
              .filter(([c]) => c !== 'general')
              .map(([cat, cfg]) => (
                <div key={cat} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/8">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                  <span className="text-xs text-white/50">{cfg.label}</span>
                  <span className="text-xs font-mono text-white/30">{stats.byCategory[cat]}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Stats sidebar */}
        <aside className="w-72 border-l border-white/6 flex flex-col overflow-y-auto flex-shrink-0 bg-[#0b0b14]">
          <div className="p-5 space-y-6">

            {/* Top category highlight */}
            {topCategory && topCategory[1] > 0 && (
              <div className="rounded-xl border border-white/8 p-3 bg-white/3">
                <p className="text-xs text-white/30 mb-1">Most active</p>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_CONFIG[topCategory[0]].color }}
                  />
                  <span className="text-sm font-semibold text-white">
                    {CATEGORY_CONFIG[topCategory[0]].label}
                  </span>
                  <span className="ml-auto text-xs font-mono text-white/40">{topCategory[1]}</span>
                </div>
              </div>
            )}

            {/* Category breakdown */}
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Category Activity</h3>
              <div className="space-y-2">
                {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][])
                  .filter(([c]) => c !== 'general')
                  .sort((a, b) => stats.byCategory[b[0]] - stats.byCategory[a[0]])
                  .map(([cat, cfg]) => {
                    const count = stats.byCategory[cat];
                    const max = Math.max(...(Object.values(stats.byCategory) as number[])) || 1;
                    const pct = (count / max) * 100;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-white/50">{cfg.label}</span>
                          <span className="text-xs font-mono text-white/30">{count}</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: cfg.color + 'cc' }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Trending queries */}
            {stats.trending.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Trending</h3>
                <div className="space-y-1.5">
                  {stats.trending.map((t, i) => (
                    <div key={t.query} className="flex items-center gap-2">
                      <span className="text-xs text-white/20 w-4 text-right">{i + 1}</span>
                      <Link
                        href={`/?q=${encodeURIComponent(t.query)}`}
                        className="text-xs text-white/55 hover:text-white/80 transition-colors flex-1 truncate"
                      >
                        {t.query}
                      </Link>
                      <span className="text-xs font-mono text-white/25">{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Provider win rates */}
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Provider Wins</h3>
              <div className="space-y-2">
                {stats.providerWins.map((p) => (
                  <div key={p.name} className="flex items-center gap-2.5">
                    <span className="text-base">{p.logo}</span>
                    <span className="text-xs text-white/55 flex-1">{p.name}</span>
                    <span className="text-xs font-mono text-white/35 tabular-nums">{p.wins} wins</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live feed */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Live Feed</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                {feed.length === 0 ? (
                  <p className="text-xs text-white/20">Waiting for intents…</p>
                ) : (
                  feed.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-2 animate-fade-in">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_CONFIG[entry.category].color }}
                      />
                      <Link
                        href={`/?q=${encodeURIComponent(entry.query)}`}
                        className="text-xs text-white/50 hover:text-white/80 transition-colors flex-1 truncate"
                      >
                        {entry.query}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/8 p-3 text-center">
              <p className="text-xs text-purple-300/80 leading-relaxed">
                Every dot is a real intent flowing through the network. Try searching to see yours appear.
              </p>
              <Link
                href="/"
                className="mt-2.5 inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Search now →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
