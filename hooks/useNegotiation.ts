'use client';
import { useState, useCallback, useRef } from 'react';

export interface NegotiationStep {
  round: number;
  type: 'offer' | 'counter' | 'accept' | 'reject' | 'thinking';
  providerName: string;
  providerLogo: string;
  price?: number;
  message: string;
}

export type NegotiationStatus = 'idle' | 'running' | 'accepted' | 'rejected';

export function useNegotiation() {
  const [status, setStatus] = useState<NegotiationStatus>('idle');
  const [steps, setSteps] = useState<NegotiationStep[]>([]);
  const [dealPrice, setDealPrice] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const negotiate = useCallback(async (query: string, startPrice: number, budget: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('running');
    setSteps([]);
    setDealPrice(null);

    try {
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, startPrice, budget }),
        signal: controller.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const step = JSON.parse(line.slice(6)) as NegotiationStep;
            setSteps((prev) => [...prev, step]);
            if (step.type === 'accept') { setDealPrice(step.price ?? null); setStatus('accepted'); }
            if (step.type === 'reject') setStatus('rejected');
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setStatus('rejected');
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setSteps([]);
    setDealPrice(null);
  }, []);

  return { status, steps, dealPrice, negotiate, reset };
}
