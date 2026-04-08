'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HistoryItem, ParsedIntent } from '@/lib/types';

const STORAGE_KEY = 'intent_history';
const MAX_ITEMS = 10;

export function useIntentHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const add = useCallback((query: string, category: ParsedIntent['category'], bestPrice?: number) => {
    setHistory((prev) => {
      // Deduplicate by query text
      const filtered = prev.filter((h) => h.query !== query);
      const updated = [
        { id: crypto.randomUUID(), query, category, timestamp: Date.now(), bestPrice },
        ...filtered,
      ].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return { history, add, clear };
}
