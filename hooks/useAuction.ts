'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { AuctionEvent } from '@/lib/auctionScripts';
import type { ParsedIntent } from '@/lib/types';

export type AuctionStatus = 'idle' | 'open' | 'ended';

export interface AuctionState {
  status: AuctionStatus;
  events: AuctionEvent[];
  bestPrice: number | null;
  bestProvider: string | null;
  winnerLogo: string | null;
}

export function useAuction(intent: ParsedIntent | null) {
  const [state, setState] = useState<AuctionState>({
    status: 'idle',
    events: [],
    bestPrice: null,
    bestProvider: null,
    winnerLogo: null,
  });

  const esRef = useRef<EventSource | null>(null);

  const start = useCallback(() => {
    if (!intent) return;

    // Close any existing connection
    esRef.current?.close();
    setState({ status: 'open', events: [], bestPrice: null, bestProvider: null, winnerLogo: null });

    const params = new URLSearchParams({
      q:        intent.raw,
      category: intent.category,
      ...(intent.budget ? { budget: String(intent.budget) } : {}),
    });

    const es = new EventSource(`/api/auction?${params.toString()}`);
    esRef.current = es;

    es.onmessage = (e) => {
      const raw = JSON.parse(e.data) as { type: string; [key: string]: unknown };
      if (raw.type === 'open') return; // handshake
      const event = raw as unknown as AuctionEvent;

      if (event.type === 'end') {
        setState((prev) => ({
          ...prev,
          status: 'ended',
          events: [...prev.events, event as AuctionEvent],
          bestPrice: event.price ?? prev.bestPrice,
          bestProvider: event.providerName,
          winnerLogo: event.logo,
        }));
        es.close();
        return;
      }

      setState((prev) => {
        const newEvent = event as AuctionEvent;
        const newBestPrice =
          newEvent.price !== undefined && (prev.bestPrice === null || newEvent.price < prev.bestPrice)
            ? newEvent.price
            : prev.bestPrice;
        const newBestProvider =
          newBestPrice !== prev.bestPrice ? newEvent.providerName : prev.bestProvider;
        const newWinnerLogo =
          newBestPrice !== prev.bestPrice ? newEvent.logo : prev.winnerLogo;

        return {
          ...prev,
          events: [...prev.events, newEvent],
          bestPrice: newBestPrice,
          bestProvider: newBestProvider,
          winnerLogo: newWinnerLogo,
        };
      });
    };

    es.onerror = () => {
      es.close();
    };
  }, [intent]);

  const reset = useCallback(() => {
    esRef.current?.close();
    setState({ status: 'idle', events: [], bestPrice: null, bestProvider: null, winnerLogo: null });
  }, []);

  // Auto-close on unmount
  useEffect(() => () => { esRef.current?.close(); }, []);

  return { ...state, start, reset };
}
