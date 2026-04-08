'use client';
import { useState } from 'react';

const STORAGE_KEY = 'intent_tour_done';

interface Step {
  title: string;
  description: string;
  emoji: string;
  position: 'center' | 'top' | 'bottom';
}

const STEPS: Step[] = [
  {
    emoji: '🎯',
    title: 'Express your intent',
    description: 'Type what you want in plain language — "laptop under €1000 for university" or "flight to Paris next weekend". No keywords needed.',
    position: 'center',
  },
  {
    emoji: '⚡',
    title: 'Providers compete',
    description: 'Multiple providers instantly bid to serve your request. AI ranks them by budget fit, relevance, and quality score.',
    position: 'center',
  },
  {
    emoji: '🏆',
    title: 'Start a live auction',
    description: 'Open the live auction room and watch providers undercut each other in real time to win your intent.',
    position: 'center',
  },
  {
    emoji: '✦',
    title: "You're all set!",
    description: "Explore the Graph to see live intent flows, set Alerts for price drops, and use mood chips to bias your searches.",
    position: 'center',
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingTour({ onDone }: Props) {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
      onDone();
    }
  };

  const skip = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    onDone();
  };

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-purple-500/30 bg-surface shadow-2xl shadow-purple-900/30 overflow-hidden animate-slide-in-up">
        {/* Progress bar */}
        <div className="h-0.5 bg-white/6">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-6 text-center">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === step ? 'w-4 h-1.5 bg-purple-400' : i < step ? 'w-1.5 h-1.5 bg-purple-500/50' : 'w-1.5 h-1.5 bg-white/15'
                }`}
              />
            ))}
          </div>

          {/* Emoji */}
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-3xl mx-auto mb-4">
            {current.emoji}
          </div>

          {/* Content */}
          <h2 className="text-lg font-bold text-white mb-2">{current.title}</h2>
          <p className="text-sm text-white/50 leading-relaxed mb-6">{current.description}</p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={skip}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/35 text-sm hover:text-white/60 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
            >
              {step === STEPS.length - 1 ? "Let's go! →" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function shouldShowTour(): boolean {
  if (typeof window === 'undefined') return false;
  try { return !localStorage.getItem(STORAGE_KEY); } catch { return false; }
}
