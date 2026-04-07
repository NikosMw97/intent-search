'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Parsing your intent with AI…', icon: '🧠', duration: 1200 },
  { label: 'Querying competing providers…', icon: '📡', duration: 900 },
  { label: 'Ranking offers for you…', icon: '⚡', duration: 700 },
  { label: 'Generating AI reasoning…', icon: '✦', duration: 600 },
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [providerCount, setProviderCount] = useState(0);

  useEffect(() => {
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setCurrentStep(i);
      }, elapsed);
      timers.push(t);
      elapsed += step.duration;
    });

    // Animate provider counter
    let count = 0;
    const target = 47;
    const interval = setInterval(() => {
      count += Math.ceil(Math.random() * 8);
      if (count >= target) {
        count = target;
        clearInterval(interval);
      }
      setProviderCount(count);
    }, 60);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center py-16 animate-fade-in">
      {/* Animated rings */}
      <div className="relative mb-10">
        <div className="w-20 h-20 rounded-full border-2 border-purple-500/20 animate-ping absolute inset-0" />
        <div className="w-20 h-20 rounded-full border border-purple-500/40 animate-pulse-slow absolute inset-0" />
        <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center relative">
          <span className="text-3xl">{STEPS[currentStep]?.icon ?? '✦'}</span>
        </div>
      </div>

      {/* Step text */}
      <p className="text-white/80 text-lg font-medium mb-1 text-center transition-all duration-300">
        {STEPS[currentStep]?.label}
      </p>
      <p className="text-white/30 text-sm mb-8">
        Scanning <span className="text-purple-400 font-semibold tabular-nums">{providerCount}</span> offers from{' '}
        <span className="text-cyan-400 font-semibold">multiple providers</span>
      </p>

      {/* Step progress dots */}
      <div className="flex items-center gap-3">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-500 ${
                i < currentStep
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : i === currentStep
                  ? 'bg-white/10 text-white border border-white/20 scale-105'
                  : 'text-white/20 border border-white/8'
              }`}
            >
              {i < currentStep ? '✓' : step.icon}
              <span className="hidden sm:inline">{i < currentStep ? 'Done' : i === currentStep ? 'Working…' : 'Pending'}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-px transition-colors duration-500 ${i < currentStep ? 'bg-purple-500/40' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
