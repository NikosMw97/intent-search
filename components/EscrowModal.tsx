'use client';

import { useState, useEffect } from 'react';

interface Props {
  offer: {
    name: string;
    price: number;
    currency: string;
    providerName: string;
    providerLogo: string;
  };
  onClose: () => void;
}

// Mock SOL conversion rate (1 EUR ≈ 0.0085 SOL)
const EUR_TO_SOL = 0.0085;

// Generate a mock transaction hash
function mockTxHash() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type Step = 'review' | 'signing' | 'broadcasting' | 'confirmed';

const STEPS: { id: Step; label: string }[] = [
  { id: 'review',      label: 'Review'      },
  { id: 'signing',     label: 'Sign'        },
  { id: 'broadcasting',label: 'Broadcast'   },
  { id: 'confirmed',   label: 'Confirmed'   },
];

export default function EscrowModal({ offer, onClose }: Props) {
  const [step, setStep] = useState<Step>('review');
  const [txHash] = useState(() => mockTxHash());
  const [released, setReleased] = useState(false);

  const solAmount = (offer.price * EUR_TO_SOL).toFixed(4);
  const escrowAddress = '3fTz...k9Rp'; // mock
  const providerAddress = '7xKX...sAsU'; // mock

  // Auto-progress through signing → broadcasting → confirmed
  useEffect(() => {
    if (step === 'signing') {
      const t = setTimeout(() => setStep('broadcasting'), 2000);
      return () => clearTimeout(t);
    }
    if (step === 'broadcasting') {
      const t = setTimeout(() => setStep('confirmed'), 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={step === 'review' ? onClose : undefined}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-surface shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-[#9945FF]/8">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">◎</span>
            <div>
              <p className="text-sm font-semibold text-white">Solana Escrow</p>
              <p className="text-xs text-white/40">Secure intent payment</p>
            </div>
          </div>
          {step === 'review' && (
            <button onClick={onClose} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors text-xs">✕</button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-5 py-3 border-b border-white/6 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all ${
                i < stepIndex  ? 'bg-[#9945FF] text-white' :
                i === stepIndex ? 'bg-[#9945FF]/20 border border-[#9945FF]/60 text-[#9945FF]' :
                'bg-white/6 text-white/25'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <p className={`ml-1.5 text-xs transition-colors ${i === stepIndex ? 'text-white/70' : 'text-white/25'}`}>
                {s.label}
              </p>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 transition-colors ${i < stepIndex ? 'bg-[#9945FF]/40' : 'bg-white/8'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="p-5">

          {/* ── Review ──────────────────────────────────────────────────────── */}
          {step === 'review' && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{offer.providerLogo}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{offer.name}</p>
                    <p className="text-xs text-white/40">{offer.providerName}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <Row label="Amount" value={`€${offer.price.toLocaleString()}`} highlight />
                  <Row label="SOL equivalent" value={`◎ ${solAmount} SOL`} />
                  <Row label="Provider address" value={providerAddress} mono />
                  <Row label="Escrow contract" value={escrowAddress} mono />
                </div>
              </div>

              <div className="rounded-xl border border-[#9945FF]/20 bg-[#9945FF]/8 p-3">
                <p className="text-xs text-[#9945FF]/90 leading-relaxed">
                  <span className="font-semibold">How escrow works:</span> Your SOL is locked in a smart contract.
                  The provider delivers your order, then you release the funds.
                  If unsatisfied, raise a dispute — funds are returned.
                </p>
              </div>

              <button
                onClick={() => setStep('signing')}
                className="w-full py-3 rounded-xl bg-[#9945FF] hover:bg-[#8835ef] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#9945FF]/25"
              >
                <span>◎</span> Lock ◎{solAmount} in Escrow
              </button>
              <button onClick={onClose} className="w-full py-2 text-xs text-white/30 hover:text-white/50 transition-colors">
                Cancel
              </button>
            </div>
          )}

          {/* ── Signing ─────────────────────────────────────────────────────── */}
          {step === 'signing' && (
            <div className="flex flex-col items-center py-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full border-2 border-[#9945FF]/30 border-t-[#9945FF] animate-spin mb-5" />
              <p className="text-base font-semibold text-white mb-1">Waiting for signature…</p>
              <p className="text-xs text-white/40">Open your Solana wallet to sign the transaction</p>
              <div className="mt-4 px-3 py-1.5 rounded-full bg-white/5 text-xs text-white/30 font-mono">
                ◎ {solAmount} SOL → Escrow
              </div>
            </div>
          )}

          {/* ── Broadcasting ────────────────────────────────────────────────── */}
          {step === 'broadcasting' && (
            <div className="flex flex-col items-center py-8 text-center animate-fade-in">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-full border-2 border-[#9945FF]/20 animate-ping absolute inset-0" />
                <div className="w-16 h-16 rounded-full bg-[#9945FF]/15 flex items-center justify-center relative">
                  <span className="text-2xl">◎</span>
                </div>
              </div>
              <p className="text-base font-semibold text-white mb-1">Broadcasting to Solana…</p>
              <p className="text-xs text-white/40 mb-3">Your transaction is being confirmed on-chain</p>
              <p className="text-xs font-mono text-white/25">{txHash.slice(0, 16)}…</p>
            </div>
          )}

          {/* ── Confirmed ───────────────────────────────────────────────────── */}
          {step === 'confirmed' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-2xl mb-3">
                  ✓
                </div>
                <p className="text-base font-semibold text-white">Funds locked in escrow</p>
                <p className="text-xs text-white/40 mt-0.5">◎ {solAmount} SOL held by smart contract</p>
              </div>

              <div className="rounded-xl border border-white/8 bg-white/3 p-3 space-y-1.5 text-xs">
                <Row label="Transaction" value={`${txHash.slice(0, 20)}…`} mono />
                <Row label="Block" value={`#${(Math.random() * 300000000 + 250000000).toFixed(0)}`} mono />
                <Row label="Status" value="Confirmed (32 confirmations)" highlight />
              </div>

              <a
                href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-[#9945FF]/70 hover:text-[#9945FF] transition-colors"
              >
                View on Solana Explorer ↗
              </a>

              {!released ? (
                <button
                  onClick={() => setReleased(true)}
                  className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
                >
                  ✓ Release funds to {offer.providerName}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold text-center">
                  ✓ Payment released — thank you!
                </div>
              )}

              <button onClick={onClose} className="w-full py-2 text-xs text-white/25 hover:text-white/50 transition-colors">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/35 flex-shrink-0">{label}</span>
      <span className={`truncate ${mono ? 'font-mono text-white/50' : ''} ${highlight ? 'text-white font-medium' : 'text-white/60'}`}>
        {value}
      </span>
    </div>
  );
}
