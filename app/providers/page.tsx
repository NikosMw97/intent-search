'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useFollowedProviders } from '@/hooks/useFollowedProviders';
import { getPromotedProviders, togglePromoted } from '@/lib/promotedProviders';
import { getReputation, getReputationColor, getBadgeLabel } from '@/lib/providerReputation';
import { saveFlashDeal, getFlashDeals, formatTimeLeft } from '@/lib/flashDeals';
import type { FlashDeal } from '@/lib/flashDeals';

interface RegisteredProvider {
  id: string;
  name: string;
  category: string;
  website: string;
  offerDescription: string;
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
  const [form, setForm] = useState({ name: '', category: '', website: '', offerDescription: '' });
  const [submitted, setSubmitted] = useState(false);
  const [promotedSet, setPromotedSet] = useState<Set<string>>(new Set());
  const [generatingOffer, setGeneratingOffer] = useState(false);

  // Flash deals state
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [dealForm, setDealForm] = useState({ providerName: '', discountPercent: '', title: '', hours: '4' });
  const [dealSubmitted, setDealSubmitted] = useState(false);
  const [dealTick, setDealTick] = useState(0);

  const { isFollowing, toggle: toggleFollow } = useFollowedProviders();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('intent_providers');
      if (stored) setRegistered(JSON.parse(stored));
    } catch { /* ignore */ }
    // Load promoted providers
    setPromotedSet(getPromotedProviders());
    // Load flash deals
    setFlashDeals(getFlashDeals());
  }, []);

  // Tick to update flash deal timers
  useEffect(() => {
    const interval = setInterval(() => setDealTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) return;
    const newProvider: RegisteredProvider = {
      id: crypto.randomUUID(),
      name: form.name,
      category: form.category,
      website: form.website,
      offerDescription: form.offerDescription,
      registeredAt: Date.now(),
    };
    const updated = [newProvider, ...registered];
    setRegistered(updated);
    try { localStorage.setItem('intent_providers', JSON.stringify(updated)); } catch { /* ignore */ }
    setForm({ name: '', category: '', website: '', offerDescription: '' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleGenerateOffer = async () => {
    if (!form.name || !form.category) return;
    setGeneratingOffer(true);
    try {
      const res = await fetch('/api/generate-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerName: form.name, category: form.category, website: form.website || undefined }),
      });
      const data = await res.json() as { description: string };
      setForm((f) => ({ ...f, offerDescription: data.description }));
    } catch { /* ignore */ } finally {
      setGeneratingOffer(false);
    }
  };

  const handleTogglePromote = (providerName: string) => {
    togglePromoted(providerName);
    setPromotedSet(getPromotedProviders());
  };

  const handlePostDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const { providerName, discountPercent, title, hours } = dealForm;
    if (!providerName || !discountPercent || !title) return;

    // Find provider logo from known providers or use default
    const knownProvider = [...MOCK_PROVIDERS, ...registered.map(r => ({ name: r.name, logo: '🆕' }))].find(p => p.name === providerName);
    const providerLogo = knownProvider ? ('logo' in knownProvider ? knownProvider.logo : '🆕') : '⚡';

    const newDeal = saveFlashDeal({
      providerName,
      providerLogo,
      title,
      description: 'Flash deal',
      discountPercent: Number(discountPercent),
      expiresAt: Date.now() + Number(hours) * 3600000,
      category: 'general',
    });
    setFlashDeals((prev) => [newDeal, ...prev]);
    setDealForm({ providerName: '', discountPercent: '', title: '', hours: '4' });
    setDealSubmitted(true);
    setTimeout(() => setDealSubmitted(false), 3000);
  };

  const allProviders = [
    ...MOCK_PROVIDERS,
    ...registered.map((r) => ({
      id: r.id, name: r.name, category: r.category, offers: 0,
      intentsServed: 0, winRate: '—', logo: '🆕',
    })),
  ];

  // Suppress dealTick unused warning — it's used to re-render timers
  void dealTick;

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
              {allProviders.map((p, i) => {
                const isPromoted = promotedSet.has(p.name);
                const following = isFollowing(p.name);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-white/6' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">{p.logo}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          {isPromoted && (
                            <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-yellow-400/80 text-xs">
                              ⚡ Promoted
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/35">{p.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-white/60">{p.intentsServed > 0 ? p.intentsServed.toLocaleString() : '—'} intents</p>
                        <p className="text-xs text-green-400">{p.winRate} win rate</p>
                      </div>
                      {/* Reputation score */}
                      {(() => {
                        const rep = getReputation(p.name);
                        if (!rep) return null;
                        return (
                          <div className="flex items-center gap-1.5 hidden sm:flex">
                            <span className={`text-xs font-mono font-bold ${getReputationColor(rep.overall)}`}>{rep.overall}</span>
                            {rep.badge && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                                rep.badge === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                rep.badge === 'trusted'  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                              }`}>{getBadgeLabel(rep.badge)}</span>
                            )}
                          </div>
                        );
                      })()}
                      {/* Follow button */}
                      <button
                        onClick={() => toggleFollow(p.name)}
                        title={following ? `Unfollow ${p.name}` : `Follow ${p.name}`}
                        className="text-lg leading-none transition-colors"
                      >
                        {following
                          ? <span className="text-pink-400">♥</span>
                          : <span className="text-white/20 hover:text-pink-400/60">♡</span>
                        }
                      </button>
                      {/* Promote toggle */}
                      <button
                        onClick={() => handleTogglePromote(p.name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                          isPromoted
                            ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25'
                            : 'border-white/10 text-white/30 hover:border-yellow-500/30 hover:text-yellow-400/60'
                        }`}
                        title={isPromoted ? 'Remove promotion' : 'Promote this provider'}
                      >
                        {isPromoted ? '⚡ On' : '⚡'}
                      </button>
                    </div>
                  </div>
                );
              })}
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
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-white/40 uppercase tracking-wider">Offer description</label>
                      <button
                        type="button"
                        onClick={handleGenerateOffer}
                        disabled={generatingOffer || !form.name || !form.category}
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-colors"
                      >
                        {generatingOffer ? '⏳ Generating…' : '✨ Generate with AI'}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={form.offerDescription}
                      onChange={(e) => setForm({ ...form, offerDescription: e.target.value })}
                      placeholder="Describe what makes your offering unique…"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors resize-none"
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

        {/* Flash Deals Section */}
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-white mb-3">⚡ Flash Deals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Post a flash deal */}
            <div className="rounded-2xl border border-orange-500/20 bg-surface p-5">
              <p className="text-sm font-semibold text-white mb-1">Post a Flash Deal</p>
              <p className="text-xs text-white/35 mb-4">Create a time-limited discount that appears on matching result cards.</p>

              {dealSubmitted ? (
                <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
                  <div className="text-3xl mb-2">⚡</div>
                  <p className="text-white font-semibold mb-1">Flash deal is live!</p>
                  <p className="text-xs text-white/40">It will appear on matching provider cards.</p>
                </div>
              ) : (
                <form onSubmit={handlePostDeal} className="space-y-3">
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Provider Name</label>
                    <input
                      required
                      value={dealForm.providerName}
                      onChange={(e) => setDealForm({ ...dealForm, providerName: e.target.value })}
                      placeholder="e.g. TechMart"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Deal Title</label>
                    <input
                      required
                      value={dealForm.title}
                      onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                      placeholder="e.g. 20% off all laptops"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Discount %</label>
                      <input
                        required
                        type="number"
                        min={1}
                        max={90}
                        value={dealForm.discountPercent}
                        onChange={(e) => setDealForm({ ...dealForm, discountPercent: e.target.value })}
                        placeholder="15"
                        className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Duration (hours)</label>
                      <input
                        required
                        type="number"
                        min={1}
                        max={72}
                        value={dealForm.hours}
                        onChange={(e) => setDealForm({ ...dealForm, hours: e.target.value })}
                        className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white text-sm font-medium transition-all"
                  >
                    ⚡ Post Flash Deal
                  </button>
                </form>
              )}
            </div>

            {/* Active flash deals list */}
            <div>
              <div className="rounded-2xl border border-white/8 bg-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-white/6">
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Active Deals ({flashDeals.length})</p>
                </div>
                {flashDeals.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-xs text-white/25">No active flash deals. Post one to get started.</p>
                  </div>
                ) : (
                  flashDeals.map((deal, i) => (
                    <div key={deal.id} className={`px-4 py-3 ${i > 0 ? 'border-t border-white/6' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-sm">{deal.providerLogo}</span>
                            <p className="text-xs font-semibold text-white">{deal.providerName}</p>
                            <span className="px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-xs font-semibold">
                              {deal.discountPercent}% off
                            </span>
                          </div>
                          <p className="text-xs text-white/50 truncate">{deal.title}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-xs text-orange-400/70 font-mono whitespace-nowrap">
                            {formatTimeLeft(deal.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
