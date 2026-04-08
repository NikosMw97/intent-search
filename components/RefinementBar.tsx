'use client';

import { useState } from 'react';

const SUGGESTIONS = [
  'Show cheaper options',
  'Only 4-star and above',
  'Fastest delivery only',
  'Include more features',
  'Better value for money',
];

interface Props {
  onRefine: (refinement: string) => void;
  isLoading: boolean;
}

export default function RefinementBar({ onRefine, isLoading }: Props) {
  const [value, setValue] = useState('');

  const submit = (text: string) => {
    if (!text.trim() || isLoading) return;
    onRefine(text.trim());
    setValue('');
  };

  return (
    <div className="border-t border-white/6 pt-4 mt-2">
      <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Refine your search</p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full text-xs border border-white/10 text-white/40 hover:border-purple-500/40 hover:text-white/70 hover:bg-purple-500/8 transition-all disabled:opacity-30"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Custom refinement input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(value)}
          placeholder="e.g. only show options with free shipping..."
          disabled={isLoading}
          className="flex-1 bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/40 transition-colors disabled:opacity-40"
        />
        <button
          onClick={() => submit(value)}
          disabled={!value.trim() || isLoading}
          className="px-3 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-medium transition-colors"
        >
          Refine
        </button>
      </div>
    </div>
  );
}
