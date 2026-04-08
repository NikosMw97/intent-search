'use client';
import { useState, useEffect } from 'react';
import { formatTimeLeft } from '@/lib/flashDeals';

interface Props {
  deal: { discountPercent: number; title: string; expiresAt: number };
}

export default function FlashDealBadge({ deal }: Props) {
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(deal.expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(deal.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [deal.expiresAt]);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/15 border border-orange-500/25 animate-pulse">
      <span className="text-xs">⚡</span>
      <span className="text-xs font-semibold text-orange-300">{deal.discountPercent}% off</span>
      <span className="text-xs text-orange-400/60">·</span>
      <span className="text-xs text-orange-400/60 font-mono">{timeLeft}</span>
    </div>
  );
}
