'use client';

import { useRef, useEffect, useState } from 'react';
import type { NegotiationStep, NegotiationStatus } from '@/hooks/useNegotiation';

interface Props {
  query: string;
  startPrice: number | null;
  budget: number;
  status: NegotiationStatus;
  steps: NegotiationStep[];
  dealPrice: number | null;
  onStart: () => void;
  onReset: () => void;
}

function StepBubble({ step, isNew }: { step: NegotiationStep; isNew: boolean }) {
  const typeStyles: Record<NegotiationStep['type'], string> = {
    thinking: 'bg-white/5 border-white/10 text-white/50',
    counter:  'bg-purple-500/12 border-purple-500/25 text-purple-200',
    offer:    'bg-blue-500/12 border-blue-500/25 text-blue-200',
    accept:   'bg-green-500/12 border-green-500/25 text-green-200',
    reject:   'bg-red-500/12 border-red-500/20 text-red-300',
  };

  const logoColors: Record<NegotiationStep['type'], string> = {
    thinking: 'bg-white/8',
    counter:  'bg-purple-500/20',
    offer:    'bg-blue-500/20',
    accept:   'bg-green-500/20',
    reject:   'bg-red-500/20',
  };

  return (
    <div className={`flex items-start gap-2.5 ${isNew ? 'animate-slide-up' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 ${logoColors[step.type]}`}>
        {step.providerLogo}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-white/70">{step.providerName}</span>
          {step.round > 0 && (
            <span className="text-xs text-white/25">Round {step.round}</span>
          )}
        </div>
        <div className={`rounded-xl rounded-tl-sm px-3 py-2 border ${typeStyles[step.type]}`}>
          {step.price !== undefined && (
            <div className="text-base font-bold tabular-nums mb-0.5">€{step.price}</div>
          )}
          <p className="text-xs leading-relaxed">{step.message}</p>
        </div>
      </div>
    </div>
  );
}

export default function NegotiationPanel({ query, startPrice, budget, status, steps, dealPrice, onStart, onReset }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const [newStepIndices, setNewStepIndices] = useState<Set<number>>(new Set());
  const prevLenRef = useRef(0);

  // Track new steps for animation
  useEffect(() => {
    if (steps.length > prevLenRef.current) {
      const newSet = new Set<number>();
      for (let i = prevLenRef.current; i < steps.length; i++) newSet.add(i);
      setNewStepIndices(newSet);
      setTimeout(() => setNewStepIndices(new Set()), 600);
      prevLenRef.current = steps.length;
    }
  }, [steps]);

  // Auto-scroll
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [steps]);

  // ── Idle state ───────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <div className="rounded-2xl border border-white/8 bg-surface p-5 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-xl">🤖</div>
        <div>
          <p className="text-sm font-semibold text-white">Auto-negotiate</p>
          <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
            Let AI negotiate the best price on your behalf.
          </p>
        </div>
        <button
          onClick={onStart}
          disabled={startPrice === null}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-all shadow-lg shadow-purple-900/30"
        >
          🤖 Auto-negotiate →
        </button>
      </div>
    );
  }

  const borderColor = status === 'accepted'
    ? 'border-green-500/30'
    : status === 'rejected'
    ? 'border-red-500/25'
    : 'border-purple-500/30';

  const headerBg = status === 'accepted'
    ? 'bg-green-500/8'
    : status === 'rejected'
    ? 'bg-red-500/8'
    : 'bg-purple-500/8';

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${borderColor} bg-surface`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${headerBg}`}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          {status === 'running' ? (
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />
          ) : status === 'accepted' ? (
            <span className="text-sm">✅</span>
          ) : (
            <span className="text-sm">❌</span>
          )}
          <div>
            <p className="text-xs font-semibold text-white leading-none">
              {status === 'running' ? 'Negotiating…' : status === 'accepted' ? 'Deal Secured!' : 'Negotiation Ended'}
            </p>
            <p className="text-xs text-white/35 mt-0.5">
              {status === 'accepted' && dealPrice !== null
                ? `€${dealPrice} · saved €${(startPrice ?? 0) - dealPrice}`
                : status === 'rejected'
                ? 'Could not match budget'
                : `${steps.length} exchanges`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dealPrice !== null && (
            <div className="text-xs font-bold text-green-400 tabular-nums">€{dealPrice}</div>
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
            style={{ maxHeight: '300px' }}
          >
            {steps.map((step, i) => (
              <StepBubble key={i} step={step} isNew={newStepIndices.has(i)} />
            ))}
            {status === 'running' && (
              <div className="flex items-center gap-1.5 py-1">
                <span className="text-white/20 text-xs">negotiating</span>
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

          {/* Footer */}
          <div className="px-3 pb-3 border-t border-white/6 pt-2.5 flex items-center justify-between">
            {status === 'accepted' ? (
              <>
                <p className="text-xs text-white/30">
                  Deal: <span className="text-green-400 font-semibold">€{dealPrice}</span>
                  {startPrice !== null && dealPrice !== null && (
                    <span className="text-green-400/70 ml-1">(−€{startPrice - dealPrice})</span>
                  )}
                </p>
                <button onClick={onReset} className="text-xs text-white/25 hover:text-white/50 transition-colors">
                  Again
                </button>
              </>
            ) : status === 'rejected' ? (
              <>
                <p className="text-xs text-white/30">Budget not matched</p>
                <button onClick={onReset} className="text-xs text-white/25 hover:text-white/50 transition-colors">
                  Reset
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-white/25">AI is negotiating for you</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm">🤖</span>
                  <span className="text-sm">🛒</span>
                  <span className="text-sm">🔴</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
