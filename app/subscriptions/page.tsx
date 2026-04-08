'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import type { Subscription } from '@/hooks/useSubscriptions';

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻', flights: '✈️', freelance: '🎨',
  hotels: '🏨', cars: '🚗', restaurants: '🍽️', software: '📦', general: '🔍',
};

const EXAMPLE_SUBSCRIPTIONS = [
  { query: 'Flight from Athens to London', category: 'flights', condition: { type: 'price_below' as const, threshold: 80 } },
  { query: 'MacBook Air M3', category: 'electronics', condition: { type: 'price_below' as const, threshold: 1100 } },
  { query: 'Logo designer', category: 'freelance', condition: { type: 'new_offers' as const } },
];

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function SubscriptionCard({ sub, onCheck, onRemove, onToggle }: {
  sub: Subscription;
  onCheck: () => void;
  onRemove: () => void;
  onToggle: () => void;
}) {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await onCheck();
    setChecking(false);
  };

  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      sub.status === 'triggered'
        ? 'border-green-500/40 bg-green-500/8'
        : sub.status === 'paused'
        ? 'border-white/6 bg-surface opacity-60'
        : 'border-white/8 bg-surface'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-lg flex-shrink-0 mt-0.5">{CATEGORY_ICONS[sub.category] ?? '🔍'}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white line-clamp-1">{sub.query}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                sub.status === 'triggered' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
                sub.status === 'paused'    ? 'bg-white/5 border-white/10 text-white/30'           :
                'bg-purple-500/15 border-purple-500/25 text-purple-300'
              }`}>
                {sub.status === 'triggered' ? '✓ Triggered' : sub.status === 'paused' ? 'Paused' : '● Active'}
              </span>
              {sub.lastChecked && (
                <span className="text-xs text-white/25">checked {timeAgo(sub.lastChecked)}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onRemove} className="text-white/20 hover:text-white/50 transition-colors text-xs flex-shrink-0">✕</button>
      </div>

      {/* Condition */}
      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-white/4 border border-white/6 text-xs text-white/50">
        <span>🔔</span>
        <span>
          {sub.condition.type === 'price_below'
            ? `Alert when price drops below €${sub.condition.threshold}`
            : sub.condition.type === 'new_offers'
            ? 'Alert when new offers arrive'
            : 'Alert when available'}
        </span>
      </div>

      {/* Best offer found */}
      {sub.bestOffer && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-green-500/8 border border-green-500/15 text-xs">
          <p className="text-green-400 font-medium">Best offer found:</p>
          <p className="text-white/60 mt-0.5">{sub.bestOffer.name} — <span className="text-white font-semibold">€{sub.bestOffer.price}</span> via {sub.bestOffer.providerName}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCheck}
          disabled={checking || sub.status === 'paused'}
          className="flex-1 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:border-purple-500/30 hover:text-white/70 transition-all disabled:opacity-30 flex items-center justify-center gap-1.5"
        >
          {checking
            ? <><div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" /> Checking…</>
            : '↻ Check now'
          }
        </button>
        <button
          onClick={onToggle}
          className="px-3 py-1.5 rounded-lg border border-white/10 text-white/40 text-xs hover:border-white/20 transition-all"
        >
          {sub.status === 'paused' ? 'Resume' : 'Pause'}
        </button>
        <Link
          href={`/?q=${encodeURIComponent(sub.query)}`}
          className="px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white text-xs transition-colors"
        >
          Search →
        </Link>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const { subscriptions, add, remove, toggle, check, triggeredCount } = useSubscriptions();
  const [form, setForm] = useState({ query: '', conditionType: 'price_below', threshold: '' });
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.query.trim()) return;

    const condition: Subscription['condition'] =
      form.conditionType === 'price_below' && form.threshold
        ? { type: 'price_below', threshold: Number(form.threshold) }
        : form.conditionType === 'new_offers'
        ? { type: 'new_offers' }
        : { type: 'availability' };

    // Detect category from query (simple heuristic)
    const lower = form.query.toLowerCase();
    const category =
      /laptop|phone|tablet/.test(lower) ? 'electronics' :
      /flight|fly/.test(lower)          ? 'flights'     :
      /hotel|stay/.test(lower)          ? 'hotels'      :
      /designer|developer|freelan/.test(lower) ? 'freelance' : 'general';

    add(form.query.trim(), category, condition);
    setForm({ query: '', conditionType: 'price_below', threshold: '' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/6">
        <Link href="/"><Logo size={34} showName showTagline={false} /></Link>
        <span className="text-xs text-white/30 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
          🔔 Subscriptions
          {triggeredCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">{triggeredCount}</span>
          )}
        </span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Intent Subscriptions</h1>
          <p className="text-white/40">Save intents and get alerted when conditions are met — price drops, new offers, availability.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New subscription form */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">New Subscription</h2>
            <form onSubmit={handleAdd} className="rounded-2xl border border-white/8 bg-surface p-5 space-y-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Your intent</label>
                <input
                  required
                  value={form.query}
                  onChange={(e) => setForm({ ...form, query: e.target.value })}
                  placeholder="e.g. Flight from Athens to London"
                  className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Alert condition</label>
                <select
                  value={form.conditionType}
                  onChange={(e) => setForm({ ...form, conditionType: e.target.value })}
                  className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 mb-2"
                >
                  <option value="price_below" className="bg-gray-900">Price drops below threshold</option>
                  <option value="new_offers"   className="bg-gray-900">New offers available</option>
                  <option value="availability" className="bg-gray-900">Becomes available</option>
                </select>
                {form.conditionType === 'price_below' && (
                  <input
                    type="number"
                    value={form.threshold}
                    onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                    placeholder="Price threshold (€)"
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors"
                  />
                )}
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
                {added ? '✓ Subscribed!' : 'Subscribe →'}
              </button>
            </form>

            {/* Quick-add examples */}
            <div className="mt-4">
              <p className="text-xs text-white/25 mb-2">Quick examples</p>
              <div className="space-y-1.5">
                {EXAMPLE_SUBSCRIPTIONS.map((ex) => (
                  <button
                    key={ex.query}
                    onClick={() => {
                      add(ex.query, ex.category, ex.condition);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl border border-white/8 text-xs text-white/40 hover:border-purple-500/30 hover:text-white/60 hover:bg-purple-500/5 transition-all flex items-center gap-2"
                  >
                    <span>{CATEGORY_ICONS[ex.category]}</span>
                    <span>{ex.query}</span>
                    {ex.condition.type === 'price_below' && (
                      <span className="ml-auto text-white/25">under €{ex.condition.threshold}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subscriptions list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Active ({subscriptions.length})</h2>
              {triggeredCount > 0 && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {triggeredCount} triggered
                </span>
              )}
            </div>

            {subscriptions.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-surface p-8 text-center">
                <p className="text-3xl mb-3">🔔</p>
                <p className="text-sm text-white/40">No subscriptions yet.</p>
                <p className="text-xs text-white/25 mt-1">Add one to get alerted when conditions are met.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    sub={sub}
                    onCheck={() => check(sub.id)}
                    onRemove={() => remove(sub.id)}
                    onToggle={() => toggle(sub.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
