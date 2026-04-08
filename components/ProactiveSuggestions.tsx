'use client';
import { getProactiveSuggestions } from '@/lib/proactiveSuggestions';

interface Props {
  category: string;
  query: string;
  onSearch: (query: string) => void;
}

export default function ProactiveSuggestions({ category, query, onSearch }: Props) {
  const suggestions = getProactiveSuggestions(category, query);
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4 animate-fade-in">
      <p className="text-xs text-white/25 mb-2">You might also want…</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSearch(s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/8 text-xs text-white/40 hover:border-purple-500/30 hover:text-white/70 hover:bg-purple-500/5 transition-all"
          >
            <span className="text-purple-400/60">+</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
