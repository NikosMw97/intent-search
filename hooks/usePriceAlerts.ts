'use client';
import { useState, useEffect } from 'react';
import type { HistoryItem } from '@/lib/types';

export interface PriceAlert {
  id: string;
  query: string;
  category: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
}

// Simulate checking current prices by applying a deterministic mock drop
// based on the query string (so it's consistent across renders)
function mockCurrentPrice(oldPrice: number, query: string): number {
  const seed = query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const factor = 0.75 + (seed % 25) / 100; // 0.75–0.99
  return Math.round(oldPrice * factor);
}

const STORAGE_KEY = 'intent_dismissed_alerts';

export function usePriceAlerts(history: HistoryItem[]) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setDismissed(new Set(JSON.parse(stored) as string[]));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // Only check items that have a stored bestPrice
    const candidates = history.filter((h) => h.bestPrice !== undefined && h.bestPrice > 0);
    const newAlerts: PriceAlert[] = [];

    for (const item of candidates) {
      const oldPrice = item.bestPrice!;
      const newPrice = mockCurrentPrice(oldPrice, item.query);
      const dropPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

      // Only alert if price dropped >= 8%
      if (dropPercent >= 8 && !dismissed.has(item.id)) {
        newAlerts.push({
          id: item.id,
          query: item.query,
          category: item.category,
          oldPrice,
          newPrice,
          dropPercent,
        });
      }
    }

    setAlerts(newAlerts);
  }, [history, dismissed]);

  const dismiss = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
  };

  return { alerts, dismiss };
}
