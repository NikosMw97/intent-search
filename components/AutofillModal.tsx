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

interface FormField {
  label: string;
  value: string;
  type: 'text' | 'email' | 'card' | 'expiry' | 'cvv' | 'address';
  icon: string;
}

const MOCK_FIELDS: FormField[] = [
  { label: 'Full name',        value: 'Alex Papadopoulos',          type: 'text',    icon: '👤' },
  { label: 'Email',            value: 'alex@example.com',           type: 'email',   icon: '📧' },
  { label: 'Card number',      value: '4532 •••• •••• 7291',        type: 'card',    icon: '💳' },
  { label: 'Expiry',           value: '09 / 27',                    type: 'expiry',  icon: '📅' },
  { label: 'CVV',              value: '•••',                        type: 'cvv',     icon: '🔒' },
  { label: 'Billing address',  value: '12 Ermou St, Athens, 10563', type: 'address', icon: '📍' },
];

type Step = 'intro' | 'filling' | 'review' | 'submitted';

export default function AutofillModal({ offer, onClose }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [filledCount, setFilledCount] = useState(0);
  const [typingField, setTypingField] = useState<number | null>(null);
  const [typingValue, setTypingValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Typewriter animation: fill fields one by one
  useEffect(() => {
    if (step !== 'filling') return;
    if (filledCount >= MOCK_FIELDS.length) {
      setTimeout(() => setStep('review'), 600);
      return;
    }

    const field = MOCK_FIELDS[filledCount];
    setTypingField(filledCount);
    setTypingValue('');

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypingValue(field.value.slice(0, i));
      if (i >= field.value.length) {
        clearInterval(interval);
        setTimeout(() => {
          setTypingField(null);
          setFilledCount((c) => c + 1);
        }, 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [step, filledCount]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={step === 'intro' ? onClose : undefined}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-surface shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-purple-500/8">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖</span>
            <div>
              <p className="text-sm font-semibold text-white">Autofill Agent</p>
              <p className="text-xs text-white/40">AI-powered checkout assistant</p>
            </div>
          </div>
          {(step === 'intro' || step === 'submitted') && (
            <button onClick={onClose} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white/30 hover:text-white text-xs">✕</button>
          )}
        </div>

        <div className="p-5">
          {/* Intro */}
          {step === 'intro' && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{offer.providerLogo}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{offer.name}</p>
                    <p className="text-xs text-white/40">{offer.providerName} · {offer.currency}{offer.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/8 p-3">
                <p className="text-xs text-purple-300/80 leading-relaxed">
                  <span className="font-semibold">AI will fill your checkout form</span> using your saved profile — name, email, payment details, and address. Review before submitting.
                </p>
              </div>
              <button
                onClick={() => setStep('filling')}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                🤖 Start autofill
              </button>
              <button onClick={onClose} className="w-full py-2 text-xs text-white/30 hover:text-white/50 transition-colors">Cancel</button>
            </div>
          )}

          {/* Filling */}
          {step === 'filling' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3.5 h-3.5 border border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                <p className="text-xs text-purple-300">Agent filling form…</p>
              </div>
              {MOCK_FIELDS.map((field, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                  i === typingField ? 'border-purple-500/40 bg-purple-500/8' :
                  i < filledCount   ? 'border-green-500/20 bg-green-500/5' :
                  'border-white/6 bg-white/2 opacity-40'
                }`}>
                  <span className="text-base flex-shrink-0">{field.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/35 mb-0.5">{field.label}</p>
                    <p className="text-sm text-white font-mono">
                      {i < filledCount ? field.value :
                       i === typingField ? typingValue + (typingValue.length < field.value.length ? '|' : '') :
                       ''}
                    </p>
                  </div>
                  {i < filledCount && <span className="text-green-400 text-xs flex-shrink-0">✓</span>}
                </div>
              ))}
            </div>
          )}

          {/* Review */}
          {step === 'review' && !submitted && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm font-semibold text-white">Review & submit</p>
              <div className="space-y-2">
                {MOCK_FIELDS.map((field, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/6 bg-white/2">
                    <span className="text-sm flex-shrink-0">{field.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/30">{field.label}</p>
                      <p className="text-xs text-white/70 font-mono truncate">{field.value}</p>
                    </div>
                    <span className="text-green-400 text-xs flex-shrink-0">✓</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSubmitted(true)}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
              >
                ✓ Submit order to {offer.providerName}
              </button>
              <button onClick={onClose} className="w-full py-2 text-xs text-white/25 hover:text-white/50 transition-colors">Cancel</button>
            </div>
          )}

          {/* Submitted */}
          {(step === 'review' && submitted) && (
            <div className="flex flex-col items-center py-6 text-center animate-fade-in space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-2xl">✓</div>
              <p className="text-base font-semibold text-white">Order placed!</p>
              <p className="text-xs text-white/40">Confirmation sent to alex@example.com</p>
              <div className="px-4 py-2 rounded-xl border border-white/8 bg-white/3 text-xs text-white/50 font-mono">
                Order #{Math.floor(Math.random() * 900000 + 100000)}
              </div>
              <button onClick={onClose} className="mt-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
