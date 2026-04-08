'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface RegisteredProvider {
  id: string;
  name: string;
  category: string;
  website: string;
  registeredAt: number;
}

const MOCK_PROVIDERS = [
  { id: 'p1', name: 'TecHub',         category: 'Electronics', offers: 24, intentsServed: 1842, winRate: '34%', logo: '🛒' },
  { id: 'p2', name: 'MediaMarkt',     category: 'Electronics', offers: 31, intentsServed: 2910, winRate: '28%', logo: '🔴' },
  { id: 'p3', name: 'Skroutz',        category: 'Electronics', offers: 18, intentsServed: 1204, winRate: '41%', logo: '🔶' },
  { id: 'p4', name: 'Aegean Airlines',category: 'Flights',     offers: 12, intentsServed: 3421, winRate: '22%', logo: '🔵' },
  { id: 'p5', name: 'Ryanair',        category: 'Flights',     offers: 8,  intentsServed: 5102, winRate: '38%', logo: '🟡' },
  { id: 'p6', name: 'Fiverr',         category: 'Freelance',   offers: 40, intentsServed: 892,  winRate: '51%', logo: '🟢' },
  { id: 'p7', name: 'Booking.com',    category: 'Hotels',      offers: 28, intentsServed: 2140, winRate: '33%', logo: '🔵' },
  { id: 'p8', name: 'Sixt',           category: 'Cars',        offers: 15, intentsServed: 741,  winRate: '44%', logo: '🟠' },
];

const CATEGORIES = ['Electronics', 'Flights', 'Freelance', 'Hotels', 'Cars', 'Restaurants', 'Software', 'Other'];

export default function ProvidersPage() {
  const [registered, setRegistered] = useState<RegisteredProvider[]>([]);
  const [form, setForm] = useState({ name: '', category: '', website: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('intent_providers');
      if (stored) setRegistered(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) return;
    const newProvider: RegisteredProvider = {
      id: crypto.randomUUID(),
      ...form,
      registeredAt: Date.now(),
    };
    const updated = [newProvider, ...registered];
    setRegistered(updated);
    try { localStorage.setItem('intent_providers', JSON.stringify(updated)); } catch { /* ignore */ }
    setForm({ name: '', category: '', website: '' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/6">
        <Link href="/">
          <Logo size={34} showName showTagline={false} />
        </Link>
        <span className="text-xs text-white/30 border border-white/10 px-3 py-1.5 rounded-full">Provider Dashboard</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Compete for intent.</h1>
          <p className="text-white/40 max-w-lg">
            Register your business as a provider. When users express intent that matches your category,
            your offers enter the competition — you only pay when you win.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Intents today',      value: '4,281', icon: '✦' },
            { label: 'Active providers',   value: `${MOCK_PROVIDERS.length + registered.length}`,  icon: '🏢' },
            { label: 'Avg win rate',        value: '36%',   icon: '🏆' },
            { label: 'Categories',          value: '8',     icon: '📦' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-surface p-4">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/35 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Active providers table */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">Active Providers</h2>
            <div className="rounded-2xl border border-white/8 bg-surface overflow-hidden">
              {[...MOCK_PROVIDERS, ...registered.map((r) => ({
                id: r.id, name: r.name, category: r.category, offers: 0,
                intentsServed: 0, winRate: '—', logo: '🆕',
              }))].map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-white/6' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{p.logo}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-white/35">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">{p.intentsServed > 0 ? p.intentsServed.toLocaleString() : '—'} intents</p>
                    <p className="text-xs text-green-400">{p.winRate} win rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registration form */}
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">Register Your Business</h2>
            <div className="rounded-2xl border border-white/8 bg-surface p-5">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-white font-semibold mb-1">You're in the competition!</p>
                  <p className="text-xs text-white/40">Your offers will now compete for matching intents.</p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Business Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. MyShop"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Category</label>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="" disabled className="bg-gray-900">Select a category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-gray-900">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Website (optional)</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://yoursite.com"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-sm font-medium transition-all shadow-lg shadow-purple-900/30"
                  >
                    Join the competition →
                  </button>
                  <p className="text-xs text-white/25 text-center">
                    You only pay when your offer is selected. No listing fees.
                  </p>
                </form>
              )}
            </div>

            {/* How it works */}
            <div className="mt-4 rounded-2xl border border-white/8 bg-surface p-5 space-y-3">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">How provider competition works</p>
              {[
                { step: '1', text: 'User expresses an intent in natural language' },
                { step: '2', text: 'AI parses their need — category, budget, constraints' },
                { step: '3', text: 'Your offers enter the ranking against competitors' },
                { step: '4', text: 'Top 5 results shown with AI reasoning' },
                { step: '5', text: 'You pay a success fee only when selected' },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
