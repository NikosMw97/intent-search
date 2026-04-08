export interface ReputationScore {
  providerName: string;
  reliability: number;    // 0-100
  accuracy: number;       // 0-100 (offer matches reality)
  speed: number;          // 0-100 (delivery speed)
  overall: number;        // weighted average
  totalReviews: number;
  badge: 'verified' | 'trusted' | 'new' | null;
}

const REPUTATION_DATA: Record<string, ReputationScore> = {
  'TechMart':       { providerName: 'TechMart',       reliability: 94, accuracy: 88, speed: 91, overall: 91, totalReviews: 2840, badge: 'verified' },
  'MediaMarkt':     { providerName: 'MediaMarkt',     reliability: 89, accuracy: 92, speed: 85, overall: 89, totalReviews: 4210, badge: 'trusted' },
  'Skroutz':        { providerName: 'Skroutz',        reliability: 96, accuracy: 94, speed: 78, overall: 90, totalReviews: 1930, badge: 'verified' },
  'Aegean Airlines':{ providerName: 'Aegean Airlines', reliability: 82, accuracy: 90, speed: 88, overall: 87, totalReviews: 6720, badge: 'trusted' },
  'Ryanair':        { providerName: 'Ryanair',        reliability: 74, accuracy: 85, speed: 92, overall: 83, totalReviews: 12400, badge: null },
  'Fiverr':         { providerName: 'Fiverr',         reliability: 78, accuracy: 82, speed: 70, overall: 77, totalReviews: 890,  badge: null },
  'Booking.com':    { providerName: 'Booking.com',    reliability: 91, accuracy: 89, speed: 95, overall: 92, totalReviews: 8900, badge: 'verified' },
  'Sixt':           { providerName: 'Sixt',           reliability: 87, accuracy: 91, speed: 83, overall: 87, totalReviews: 1240, badge: 'trusted' },
  'TalentHub':      { providerName: 'TalentHub',      reliability: 85, accuracy: 87, speed: 80, overall: 84, totalReviews: 430,  badge: 'new' },
  'SkyFly':         { providerName: 'SkyFly',         reliability: 88, accuracy: 86, speed: 90, overall: 88, totalReviews: 3100, badge: 'trusted' },
};

export function getReputation(providerName: string): ReputationScore | null {
  return REPUTATION_DATA[providerName] ?? null;
}

export function getReputationColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 80) return 'text-yellow-400';
  return 'text-red-400/80';
}

export function getBadgeLabel(badge: ReputationScore['badge']): string {
  switch (badge) {
    case 'verified': return '✓ Verified';
    case 'trusted':  return '★ Trusted';
    case 'new':      return '◈ New';
    default: return '';
  }
}
