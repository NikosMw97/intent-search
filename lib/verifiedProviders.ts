export interface VerifiedProvider {
  providerName: string;
  transactionCount: number;  // formatted as "10K+", "2.4K+", etc.
  verifiedSince: number;     // year
  badge: 'gold' | 'silver' | 'bronze';
}

const VERIFIED: Record<string, VerifiedProvider> = {
  'TechMart':        { providerName: 'TechMart',        transactionCount: 18400, verifiedSince: 2021, badge: 'gold'   },
  'MediaMarkt':      { providerName: 'MediaMarkt',       transactionCount: 42100, verifiedSince: 2020, badge: 'gold'   },
  'Skroutz':         { providerName: 'Skroutz',          transactionCount: 9800,  verifiedSince: 2022, badge: 'silver' },
  'Aegean Airlines': { providerName: 'Aegean Airlines',  transactionCount: 61200, verifiedSince: 2019, badge: 'gold'   },
  'Ryanair':         { providerName: 'Ryanair',          transactionCount: 98000, verifiedSince: 2019, badge: 'gold'   },
  'Booking.com':     { providerName: 'Booking.com',      transactionCount: 74500, verifiedSince: 2018, badge: 'gold'   },
  'Fiverr':          { providerName: 'Fiverr',           transactionCount: 3200,  verifiedSince: 2023, badge: 'bronze' },
  'Sixt':            { providerName: 'Sixt',             transactionCount: 8700,  verifiedSince: 2021, badge: 'silver' },
  'SkyFly':          { providerName: 'SkyFly',           transactionCount: 12400, verifiedSince: 2022, badge: 'silver' },
  'TalentHub':       { providerName: 'TalentHub',        transactionCount: 890,   verifiedSince: 2024, badge: 'bronze' },
};

export function getVerifiedProvider(providerName: string): VerifiedProvider | null {
  return VERIFIED[providerName] ?? null;
}

export function formatTransactionCount(count: number): string {
  if (count >= 10000) return `${(count / 1000).toFixed(0)}K+`;
  if (count >= 1000)  return `${(count / 1000).toFixed(1)}K+`;
  return `${count}+`;
}

export function getBadgeColor(badge: VerifiedProvider['badge']): string {
  switch (badge) {
    case 'gold':   return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    case 'silver': return 'text-slate-300 border-slate-400/30 bg-slate-400/10';
    case 'bronze': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  }
}
