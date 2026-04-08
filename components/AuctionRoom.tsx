'use client';

import { useEffect, useRef, useState } from 'react';
import type { AuctionEvent } from '@/lib/auctionScripts';

interface Props {
  status: 'idle' | 'open' | 'ended';
  events: AuctionEvent[];
  bestPrice: number | null;
  bestProvider: string | null;
  winnerLogo: string | null;
  onStart: () => void;
  onReset: () => void;
  onAcceptBid?: (bid: { name: string; price: number; currency: string; providerName: string; providerLogo: string }) => void;
}

const AUCTION_DURATION_MS = 18000;

function EventBubble({ event, isNew }: { event: AuctionEvent; isNew: boolean }) {
  const isPrice = event.price !== undefined;
  const isPriceEvent = event.type === 'bid' || event.type === 'undercut' || event.type === 'flash';

  if (event.type === 'join') {
    return (
      <div className={`flex items-center gap-2 py-1.5 transition-all ${isNew ? 'animate-fade-in' : ''}`}>
        <div className="flex-1 h-px bg-white/6" />
        <span className="text-xs text-white/25 flex items-center gap-1.5">
          <span>{event.logo}</span>
          <span className="font-medium text-white/40">{event.providerName}</span>
          <span>joined</span>
        </span>
        <div className="flex-1 h-px bg-white/6" />
      </div>
    );
  }

  if (event.type === 'end') {
    return (
      <div className={`rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center ${isNew ? 'animate-fade-in' : ''}`}>
        <div className="text-2xl mb-1">🏆</div>
        <p className="text-xs font-semibold text-yellow-300">Auction Closed</p>
        <p className="text-sm font-bold text-white mt-0.5">
          {event.logo} {event.providerName} — €{event.price}
        </p>
        <p className="text-xs text-white/35 mt-1">Best price secured by the market</p>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 ${isNew ? 'animate-slide-up' : ''}`}>
      {/* Provider avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
        event.isWinning && isPriceEvent ? 'bg-green-500/20 ring-1 ring-green-500/40' : 'bg-white/8'
      }`}>
        {event.logo}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-white/80">{event.providerName}</span>
          {event.type === 'flash' && (
            <span className="px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-xs border border-orange-500/30">
              ⚡ Flash
            </span>
          )}
          {event.type === 'undercut' && (
            <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs border border-green-500/30">
              ↓ Lower
            </span>
          )}
        </div>

        <div className={`rounded-xl rounded-tl-sm px-3 py-2 ${
          event.isWinning && isPriceEvent
            ? 'bg-green-500/12 border border-green-500/25'
            : 'bg-white/5 border border-white/8'
        }`}>
          {/* Price row */}
          {isPrice && isPriceEvent && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-base font-bold tabular-nums ${
                event.isWinning ? 'text-green-400' : 'text-white'
              }`}>
                €{event.price}
              </span>
              {event.previousPrice && event.previousPrice !== event.price && (
                <span className="text-xs text-white/30 line-through tabular-nums">€{event.previousPrice}</span>
              )}
              {event.isWinning && (
                <span className="text-xs text-green-400/70 font-medium">best bid</span>
              )}
            </div>
          )}
          {/* Message */}
          {event.text && (
            <p className="text-xs text-white/60 leading-relaxed">{event.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuctionRoom({ status, events, bestPrice, bestProvider, winnerLogo, onStart, onReset, onAcceptBid }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(AUCTION_DURATION_MS / 1000);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [newEventIds, setNewEventIds] = useState<Set<number>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);
  const prevEventsLen = useRef(0);

  // Start countdown when auction opens
  useEffect(() => {
    if (status === 'open' && !startedAt) {
      setStartedAt(Date.now());
      setTimeLeft(AUCTION_DURATION_MS / 1000);
    }
    if (status === 'idle') {
      setStartedAt(null);
      setTimeLeft(AUCTION_DURATION_MS / 1000);
    }
  }, [status, startedAt]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'open' || !startedAt) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const remaining = Math.max(0, AUCTION_DURATION_MS / 1000 - elapsed);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0) clearInterval(interval);
    }, 250);
    return () => clearInterval(interval);
  }, [status, startedAt]);

  // Track new events for animation
  useEffect(() => {
    if (events.length > prevEventsLen.current) {
      const newIds = new Set<number>();
      for (let i = prevEventsLen.current; i < events.length; i++) newIds.add(i);
      setNewEventIds(newIds);
      setTimeout(() => setNewEventIds(new Set()), 600);
      prevEventsLen.current = events.length;
    }
  }, [events]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  const bidCount = events.filter((e) => e.type === 'bid' || e.type === 'undercut' || e.type === 'flash').length;
  const providerCount = new Set(events.map((e) => e.providerId)).size;

  // ── Idle state ───────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <div className="rounded-2xl border border-white/8 bg-surface p-5 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-xl">⚡</div>
        <div>
          <p className="text-sm font-semibold text-white">Live Auction</p>
          <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
            Open a real-time auction where providers compete and undercut each other for your intent.
          </p>
        </div>
        <button
          onClick={onStart}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-sm font-medium transition-all shadow-lg shadow-purple-900/30"
        >
          Start live auction →
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
      status === 'ended' ? 'border-yellow-500/30' : 'border-purple-500/30'
    } bg-surface`}>

      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${
          status === 'ended' ? 'bg-yellow-500/8' : 'bg-purple-500/8'
        }`}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          {status === 'open' ? (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
          ) : (
            <span className="text-sm">🏆</span>
          )}
          <div>
            <p className="text-xs font-semibold text-white leading-none">
              {status === 'open' ? 'Live Auction' : 'Auction Ended'}
            </p>
            <p className="text-xs text-white/35 mt-0.5">
              {status === 'open'
                ? `${providerCount} providers · ${bidCount} bids`
                : `Winner: ${winnerLogo} ${bestProvider} — €${bestPrice}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown */}
          {status === 'open' && (
            <div className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded-lg ${
              timeLeft <= 5 ? 'text-red-400 bg-red-500/15' : 'text-white/50 bg-white/6'
            }`}>
              {timeLeft}s
            </div>
          )}
          {/* Best price badge */}
          {bestPrice !== null && (
            <div className="text-xs font-bold text-green-400 tabular-nums">
              €{bestPrice}
            </div>
          )}
          <span className="text-white/25 text-xs">{collapsed ? '▼' : '▲'}</span>
        </div>
      </div>

      {/* Feed */}
      {!collapsed && (
        <div>
          <div
            ref={feedRef}
            className="px-3 py-3 space-y-3 overflow-y-auto"
            style={{ maxHeight: '320px' }}
          >
            {events.map((event, i) => (
              <EventBubble key={i} event={event} isNew={newEventIds.has(i)} />
            ))}

            {/* Typing indicator while auction is running */}
            {status === 'open' && (
              <div className="flex items-center gap-1.5 py-1">
                <span className="text-white/20 text-xs">providers are competing</span>
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-purple-400/50 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-3 pb-3 border-t border-white/6 pt-2.5 flex items-center justify-between">
            {status === 'ended' ? (
              <>
                <p className="text-xs text-white/30">
                  Best: <span className="text-green-400 font-semibold">€{bestPrice}</span> from {winnerLogo} {bestProvider}
                </p>
                <div className="flex items-center gap-2">
                  {onAcceptBid && bestPrice && bestProvider && winnerLogo && (
                    <button
                      onClick={() => onAcceptBid({
                        name: `Winning bid from ${bestProvider}`,
                        price: bestPrice,
                        currency: 'EUR',
                        providerName: bestProvider,
                        providerLogo: winnerLogo,
                      })}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#9945FF]/20 border border-[#9945FF]/40 text-[#9945FF] text-xs hover:bg-[#9945FF]/30 transition-colors"
                    >
                      <span>◎</span> Accept
                    </button>
                  )}
                  <button onClick={onReset} className="text-xs text-white/25 hover:text-white/50 transition-colors">
                    Again
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-white/25">Real-time provider competition</p>
                <div className="flex items-center gap-1">
                  {Array.from(new Set(events.map((e) => e.logo))).slice(0, 4).map((logo, i) => (
                    <span key={i} className="text-sm">{logo}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
