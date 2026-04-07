'use client';

import { useState, useRef, useEffect } from 'react';

const EXAMPLE_QUERIES = [
  'Best laptop under €1200 for programming',
  'Cheap flight from Athens to Paris',
  'Hire a logo designer under €100',
  'Best phone under €800 with great camera',
  'Find a React developer for a landing page',
];

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchBox({ onSearch, isLoading }: Props) {
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typewriter effect for placeholder cycling
  useEffect(() => {
    const target = EXAMPLE_QUERIES[placeholderIndex];
    let i = 0;
    setDisplayedPlaceholder('');

    function type() {
      if (i <= target.length) {
        setDisplayedPlaceholder(target.slice(0, i));
        i++;
        animRef.current = setTimeout(type, 45);
      } else {
        // Pause, then erase, then next
        animRef.current = setTimeout(() => {
          function erase() {
            if (i > 0) {
              i--;
              setDisplayedPlaceholder(target.slice(0, i));
              animRef.current = setTimeout(erase, 25);
            } else {
              setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_QUERIES.length);
            }
          }
          erase();
        }, 2200);
      }
    }

    type();
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, [placeholderIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) onSearch(query.trim());
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isLoading) onSearch(query.trim());
    }
  };

  const handleExample = (example: string) => {
    setQuery(example);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative group">
          {/* Glow border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl opacity-30 group-focus-within:opacity-70 blur transition-opacity duration-300" />

          <div className="relative flex items-end bg-surface rounded-2xl border border-white/10 overflow-hidden">
            {/* Intent icon */}
            <div className="pl-5 pb-4 pt-4 flex-shrink-0 self-start mt-0.5">
              <div className="w-6 h-6 text-purple-400 flex items-center justify-center text-lg">
                ✦
              </div>
            </div>

            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder={displayedPlaceholder || 'Tell me what you want...'}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-white/25 text-[17px] leading-relaxed px-4 py-4 resize-none outline-none min-h-[56px] max-h-[160px] overflow-y-auto"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
              disabled={isLoading}
              autoFocus
            />

            <div className="pr-3 pb-3 flex-shrink-0">
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group/btn shadow-lg shadow-purple-900/40"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-white translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Example chips */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {EXAMPLE_QUERIES.slice(0, 3).map((ex) => (
          <button
            key={ex}
            onClick={() => handleExample(ex)}
            className="px-3 py-1.5 rounded-full text-xs text-white/40 border border-white/10 hover:border-purple-500/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
