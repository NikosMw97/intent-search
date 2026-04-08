'use client';

import { useState, useCallback, useRef } from 'react';
import type { BundlePlan, SubIntent } from '@/lib/bundleParser';
import type { RankedResult } from '@/lib/types';
import type { ParsedIntent } from '@/lib/types';

export interface SubResult {
  sub: SubIntent;
  intent: ParsedIntent;
  results: RankedResult[];
}

export interface BundleSummary {
  title: string;
  subCount: number;
  totalMin: number;
  totalMax: number;
}

export type BundleState = 'idle' | 'loading' | 'streaming' | 'done' | 'error' | 'not_bundle';

export function useBundleSearch() {
  const [state, setState] = useState<BundleState>('idle');
  const [plan, setPlan] = useState<BundlePlan | null>(null);
  const [subResults, setSubResults] = useState<SubResult[]>([]);
  const [summary, setSummary] = useState<BundleSummary | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState('loading');
    setPlan(null);
    setSubResults([]);
    setSummary(null);

    try {
      const res = await fetch('/api/bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setState('error');
        return false;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setState('streaming');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as { type: string; data?: unknown; message?: string };
            if (event.type === 'not_bundle') {
              setState('not_bundle');
              return false;
            }
            if (event.type === 'plan') {
              setPlan(event.data as BundlePlan);
            }
            if (event.type === 'sub_result') {
              setSubResults((prev) => [...prev, event.data as SubResult]);
            }
            if (event.type === 'bundle_done') {
              setSummary(event.data as BundleSummary);
              setState('done');
            }
            if (event.type === 'error') {
              setState('error');
            }
          } catch { /* skip */ }
        }
      }

      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setState('error');
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState('idle');
    setPlan(null);
    setSubResults([]);
    setSummary(null);
  }, []);

  return { state, plan, subResults, summary, search, reset };
}
