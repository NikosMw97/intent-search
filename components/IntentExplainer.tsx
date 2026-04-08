'use client';

import { useState } from 'react';
import type { ParsedIntent } from '@/lib/types';

interface Props {
  intent: ParsedIntent;
  onUpdate: (updated: Partial<ParsedIntent>) => void;
}

const CATEGORIES: ParsedIntent['category'][] = [
  'electronics', 'flights', 'freelance', 'hotels', 'cars', 'restaurants', 'software', 'general',
];

const CATEGORY_LABELS: Record<ParsedIntent['category'], string> = {
  electronics: '💻 Electronics',
  flights:     '✈️ Flights',
  freelance:   '🎨 Freelance',
  hotels:      '🏨 Hotels',
  cars:        '🚗 Cars',
  restaurants: '🍽️ Restaurants',
  software:    '📦 Software',
  general:     '🔍 General',
};

type EditField = 'category' | 'budget' | 'currency' | 'keywords' | null;

export default function IntentExplainer({ intent, onUpdate }: Props) {
  const [editing, setEditing] = useState<EditField>(null);
  const [localCategory, setLocalCategory] = useState<ParsedIntent['category']>(intent.category);
  const [localBudget, setLocalBudget] = useState<string>(intent.budget !== undefined ? String(intent.budget) : '');
  const [localCurrency, setLocalCurrency] = useState(intent.currency);
  const [localKeywords, setLocalKeywords] = useState(intent.keywords.join(', '));
  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = () => setHasChanges(true);

  const handleReSearch = () => {
    const updates: Partial<ParsedIntent> = {
      category: localCategory,
      currency: localCurrency,
      keywords: localKeywords.split(',').map((k) => k.trim()).filter(Boolean),
    };
    if (localBudget !== '') {
      const n = parseFloat(localBudget);
      if (!isNaN(n)) updates.budget = n;
    } else {
      updates.budget = undefined;
    }
    setHasChanges(false);
    setEditing(null);
    onUpdate(updates);
  };

  return (
    <div className="rounded-2xl border border-purple-500/15 bg-purple-500/5 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-purple-400 font-semibold tracking-wide">✦ Intent parsed</span>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Category */}
        <div>
          <label className="text-xs text-white/30 uppercase tracking-wider block mb-1">Category</label>
          {editing === 'category' ? (
            <select
              value={localCategory}
              onChange={(e) => {
                setLocalCategory(e.target.value as ParsedIntent['category']);
                markChanged();
              }}
              onBlur={() => setEditing(null)}
              autoFocus
              className="w-full bg-white/8 border border-purple-500/30 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-purple-500/60"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-gray-900">{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 group">
              <span className="text-xs text-white/70 capitalize">{CATEGORY_LABELS[localCategory]}</span>
              <button
                onClick={() => setEditing('category')}
                className="text-white/20 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Edit category"
              >
                ✎
              </button>
            </div>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="text-xs text-white/30 uppercase tracking-wider block mb-1">Budget</label>
          {editing === 'budget' ? (
            <input
              type="number"
              value={localBudget}
              onChange={(e) => { setLocalBudget(e.target.value); markChanged(); }}
              onBlur={() => setEditing(null)}
              autoFocus
              placeholder="No limit"
              className="w-full bg-white/8 border border-purple-500/30 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-purple-500/60"
            />
          ) : (
            <div className="flex items-center gap-1.5 group">
              <span className="text-xs text-white/70">
                {localBudget !== '' ? `€${localBudget}` : 'No limit'}
              </span>
              <button
                onClick={() => setEditing('budget')}
                className="text-white/20 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Edit budget"
              >
                ✎
              </button>
            </div>
          )}
        </div>

        {/* Currency */}
        <div>
          <label className="text-xs text-white/30 uppercase tracking-wider block mb-1">Currency</label>
          {editing === 'currency' ? (
            <input
              type="text"
              value={localCurrency}
              onChange={(e) => { setLocalCurrency(e.target.value); markChanged(); }}
              onBlur={() => setEditing(null)}
              autoFocus
              maxLength={3}
              className="w-full bg-white/8 border border-purple-500/30 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-purple-500/60 uppercase"
            />
          ) : (
            <div className="flex items-center gap-1.5 group">
              <span className="text-xs text-white/70">{localCurrency}</span>
              <button
                onClick={() => setEditing('currency')}
                className="text-white/20 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Edit currency"
              >
                ✎
              </button>
            </div>
          )}
        </div>

        {/* Keywords */}
        <div className="col-span-2">
          <label className="text-xs text-white/30 uppercase tracking-wider block mb-1">Key phrases</label>
          {editing === 'keywords' ? (
            <input
              type="text"
              value={localKeywords}
              onChange={(e) => { setLocalKeywords(e.target.value); markChanged(); }}
              onBlur={() => setEditing(null)}
              autoFocus
              placeholder="comma-separated"
              className="w-full bg-white/8 border border-purple-500/30 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-purple-500/60"
            />
          ) : (
            <div className="flex items-start gap-1.5 group flex-wrap">
              <div className="flex flex-wrap gap-1 flex-1">
                {localKeywords.split(',').map((k) => k.trim()).filter(Boolean).map((kw) => (
                  <span key={kw} className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300/80 text-xs border border-purple-500/20">
                    {kw}
                  </span>
                ))}
                {localKeywords.trim() === '' && (
                  <span className="text-xs text-white/30 italic">none</span>
                )}
              </div>
              <button
                onClick={() => setEditing('keywords')}
                className="text-white/20 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
                title="Edit key phrases"
              >
                ✎
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Re-search button */}
      {hasChanges && (
        <button
          onClick={handleReSearch}
          className="mt-3 w-full py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-xs font-medium transition-all"
        >
          Re-search with changes →
        </button>
      )}
    </div>
  );
}
