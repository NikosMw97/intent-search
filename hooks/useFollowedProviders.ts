'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'intent_followed_providers';

export function useFollowedProviders() {
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFollowed(new Set(JSON.parse(stored) as string[]));
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback((providerName: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(providerName)) next.delete(providerName);
      else next.add(providerName);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const isFollowing = useCallback((providerName: string) => followed.has(providerName), [followed]);

  return { followed, toggle, isFollowing };
}
