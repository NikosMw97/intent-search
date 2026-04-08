'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { getAutocompleteSuggestions } from '@/lib/autocomplete';

const EXAMPLE_QUERIES = [
  'Best laptop under €1200 for programming',
  'Cheap flight from Athens to Paris',
  'Hire a logo designer under €100',
  'Best phone under €800 with great camera',
  'Hotel in Santorini under €200 per night',
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
  const [interimText, setInterimText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [imageStatus, setImageStatus] = useState<'idle' | 'identifying' | 'error'>('idle');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Voice input ──────────────────────────────────────────────────────────
  const { isListening, isSupported, start: startVoice, stop: stopVoice, status: voiceStatus } = useVoiceInput({
    onFinalTranscript: useCallback((text: string) => {
      setInterimText('');
      setQuery(text);
      // Auto-submit after a brief pause so user can see the transcript
      setTimeout(() => onSearch(text), 350);
    }, [onSearch]),
    onInterimTranscript: useCallback((text: string) => {
      setInterimText(text);
    }, []),
  });

  // ── Autocomplete debounce ─────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const results = getAutocompleteSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0 && query.trim().length >= 2);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // ── Typewriter placeholder ───────────────────────────────────────────────
  useEffect(() => {
    if (isListening) return; // pause animation while listening
    const target = EXAMPLE_QUERIES[placeholderIndex];
    let i = 0;
    setDisplayedPlaceholder('');

    function type() {
      if (i <= target.length) {
        setDisplayedPlaceholder(target.slice(0, i));
        i++;
        animRef.current = setTimeout(type, 45);
      } else {
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
  }, [placeholderIndex, isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q && !isLoading) {
      setShowSuggestions(false);
      onSearch(q);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const q = query.trim();
      if (q && !isLoading) {
        setShowSuggestions(false);
        onSearch(q);
      }
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleBlur = () => {
    // Delay so click on suggestion registers first
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const toggleVoice = () => {
    if (isListening) stopVoice();
    else startVoice();
  };

  // ── Image identification ─────────────────────────────────────────────────
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so same file can be re-selected
    e.target.value = '';

    setImageStatus('identifying');
    setShowSuggestions(false);

    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/identify', { method: 'POST', body: fd });
      const data = await res.json() as { query?: string; error?: string };
      if (data.query) {
        setImageStatus('idle');
        setQuery(data.query);
        // Auto-submit
        setTimeout(() => onSearch(data.query!), 100);
      } else {
        setImageStatus('error');
        setTimeout(() => setImageStatus('idle'), 3000);
      }
    } catch {
      setImageStatus('error');
      setTimeout(() => setImageStatus('idle'), 3000);
    }
  };

  const displayValue = isListening ? interimText : imageStatus === 'identifying' ? '' : query;
  const placeholderText = isListening
    ? 'Listening… speak your intent'
    : imageStatus === 'identifying'
    ? 'Identifying image…'
    : imageStatus === 'error'
    ? "Couldn't identify — try typing"
    : displayedPlaceholder || 'Tell me what you want...';

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <form onSubmit={handleSubmit}>
        <div className="relative group">
          {/* Glow border — purple normally, red when listening */}
          <div className={`absolute -inset-0.5 rounded-2xl blur transition-all duration-300 ${
            isListening
              ? 'bg-gradient-to-r from-red-500 to-pink-500 opacity-50'
              : 'bg-gradient-to-r from-purple-600 to-cyan-500 opacity-30 group-focus-within:opacity-70'
          }`} />

          <div className={`relative flex items-end rounded-2xl border overflow-hidden transition-colors duration-300 ${
            isListening ? 'bg-surface border-red-500/20' : 'bg-surface border-white/10'
          }`}>
            {/* Intent icon */}
            <div className="pl-5 pb-4 pt-4 flex-shrink-0 self-start mt-0.5">
              <div className={`w-6 h-6 flex items-center justify-center text-lg transition-colors ${
                isListening ? 'text-red-400' : 'text-purple-400'
              }`}>
                {isListening ? (
                  // Animated soundwave
                  <span className="flex items-center gap-0.5">
                    {[1, 1.5, 1, 0.75, 1.25].map((h, i) => (
                      <span
                        key={i}
                        className="w-0.5 rounded-full bg-red-400 animate-bounce"
                        style={{ height: `${h * 8}px`, animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </span>
                ) : imageStatus === 'identifying' ? (
                  <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                ) : '✦'}
              </div>
            </div>

            <textarea
              ref={inputRef}
              value={displayValue}
              onChange={(e) => { if (!isListening && imageStatus === 'idle') setQuery(e.target.value); }}
              onKeyDown={handleKey}
              onBlur={handleBlur}
              onFocus={() => {
                if (suggestions.length > 0 && query.trim().length >= 2) setShowSuggestions(true);
              }}
              placeholder={placeholderText}
              rows={1}
              className={`flex-1 bg-transparent text-white placeholder-white/25 text-[17px] leading-relaxed px-4 py-4 resize-none outline-none min-h-[56px] max-h-[160px] overflow-y-auto transition-colors ${
                isListening ? 'placeholder-red-400/40' : imageStatus === 'error' ? 'placeholder-red-400/60' : ''
              }`}
              style={{ fieldSizing: 'content' } as React.CSSProperties}
              disabled={isLoading || imageStatus === 'identifying'}
              autoFocus
              readOnly={isListening}
            />

            <div className="pr-3 pb-3 flex items-center gap-2 flex-shrink-0">
              {/* Camera button */}
              <button
                type="button"
                onClick={handleCameraClick}
                disabled={isLoading || isListening || imageStatus === 'identifying'}
                title="Search by image"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border border-white/10 text-white/30 hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/8 disabled:opacity-30`}
              >
                {imageStatus === 'identifying' ? (
                  <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                )}
              </button>

              {/* Voice button */}
              {isSupported && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={isLoading || imageStatus === 'identifying'}
                  title={isListening ? 'Stop listening' : 'Speak your intent'}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isListening
                      ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse-slow'
                      : 'border border-white/10 text-white/30 hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/8'
                  } disabled:opacity-30`}
                >
                  {voiceStatus === 'processing' ? (
                    <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!query.trim() || isLoading || isListening || imageStatus === 'identifying'}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg shadow-purple-900/40"
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

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 rounded-xl border border-white/10 bg-[#0f0f1a] shadow-xl overflow-hidden">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2.5 text-sm text-white/60 hover:bg-purple-500/10 hover:text-white/90 cursor-pointer transition-colors flex items-center gap-2 text-left"
                >
                  <span className="text-purple-400/60 flex-shrink-0">✦</span>
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Voice hint / example chips */}
      {isListening ? (
        <p className="mt-3 text-center text-xs text-red-400/60 animate-pulse">
          🎙 Speak now — say your intent clearly
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {EXAMPLE_QUERIES.slice(0, 3).map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); inputRef.current?.focus(); }}
              className="px-3 py-1.5 rounded-full text-xs text-white/40 border border-white/10 hover:border-purple-500/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
