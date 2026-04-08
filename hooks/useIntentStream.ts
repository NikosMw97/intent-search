'use client';

import { useState, useCallback, useRef } from 'react';
import type { ParsedIntent, RankedResult, StreamEvent } from '@/lib/types';

export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error';

export interface StreamState {
  intent: ParsedIntent | null;
  results: RankedResult[];
  stats: { totalProviders: number; totalOffers: number } | null;
  status: StreamStatus;
  error: string | null;
  searchTimeMs: number;
}

const INITIAL: StreamState = {
  intent: null,
  results: [],
  stats: null,
  status: 'idle',
  error: null,
  searchTimeMs: 0,
};

export function useIntentStream() {
  const [state, setState] = useState<StreamState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string, refinement?: string) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setState({ ...INITIAL, status: 'streaming' });

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, refinement }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          let event: StreamEvent;
          try { event = JSON.parse(line); } catch { continue; }

          setState((prev) => {
            switch (event.type) {
              case 'intent':
                return { ...prev, intent: event.data };
              case 'stats':
                return { ...prev, stats: event.data };
              case 'result':
                return { ...prev, results: [...prev.results, event.data] };
              case 'done':
                return { ...prev, status: 'done', searchTimeMs: event.data.searchTimeMs };
              case 'error':
                return { ...prev, status: 'error', error: event.data };
              default:
                return prev;
            }
          });
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setState((prev) => ({ ...prev, status: 'error', error: String(err) }));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL);
  }, []);

  return { ...state, search, reset };
}
