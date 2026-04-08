'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Subscription {
  id: string;
  query: string;
  category: string;
  condition: {
    type: 'price_below';
    threshold: number;
  } | {
    type: 'new_offers';
  } | {
    type: 'availability';
  };
  createdAt: number;
  lastChecked?: number;
  status: 'active' | 'triggered' | 'paused';
  bestOffer?: {
    name: string;
    price: number;
    providerName: string;
  };
}

const STORAGE_KEY = 'intent_subscriptions';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSubscriptions(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const save = (updated: Subscription[]) => {
    setSubscriptions(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const add = useCallback((query: string, category: string, condition: Subscription['condition']) => {
    const newSub: Subscription = {
      id: crypto.randomUUID(),
      query,
      category,
      condition,
      createdAt: Date.now(),
      status: 'active',
    };
    setSubscriptions((prev) => {
      const updated = [newSub, ...prev];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
    return newSub.id;
  }, []);

  const remove = useCallback((id: string) => {
    setSubscriptions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSubscriptions((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'paused' ? 'active' : 'paused' as Subscription['status'] } : s,
      );
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  // Simulate checking a subscription against the API
  const check = useCallback(async (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sub.query }),
      });
      if (!res.ok) return;

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';
      let firstResult: { name: string; price: number; providerName: string } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === 'result' && !firstResult) {
              firstResult = {
                name: event.data.offer.name,
                price: event.data.offer.price,
                providerName: event.data.offer.providerName,
              };
            }
          } catch { /* skip */ }
        }
      }

      if (!firstResult) return;

      // Evaluate condition
      let triggered = false;
      if (sub.condition.type === 'price_below') {
        triggered = firstResult.price < sub.condition.threshold;
      } else if (sub.condition.type === 'new_offers' || sub.condition.type === 'availability') {
        triggered = true; // always trigger for demo
      }

      setSubscriptions((prev) => {
        const updated = prev.map((s) =>
          s.id === id
            ? {
                ...s,
                lastChecked: Date.now(),
                status: triggered ? ('triggered' as const) : ('active' as const),
                bestOffer: firstResult ?? s.bestOffer,
              }
            : s,
        );
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });
    } catch { /* ignore */ }
  }, [subscriptions]);

  const triggeredCount = subscriptions.filter((s) => s.status === 'triggered').length;

  return { subscriptions, add, remove, toggle, check, triggeredCount };
}
