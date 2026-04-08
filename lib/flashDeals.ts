const STORAGE_KEY = 'intent_flash_deals';

export interface FlashDeal {
  id: string;
  providerName: string;
  providerLogo: string;
  title: string;
  description: string;
  discountPercent: number;
  expiresAt: number; // timestamp
  category: string;
}

export function getFlashDeals(): FlashDeal[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultDeals();
    const deals = JSON.parse(stored) as FlashDeal[];
    // Filter expired
    return deals.filter((d) => d.expiresAt > Date.now());
  } catch { return getDefaultDeals(); }
}

function getDefaultDeals(): FlashDeal[] {
  // Pre-seed some deals that expire in ~23 hours from now
  const base = Date.now() + 23 * 60 * 60 * 1000;
  return [
    { id: 'd1', providerName: 'TechMart',  providerLogo: '🛒', title: '15% off all laptops',    description: 'Limited time flash sale', discountPercent: 15, expiresAt: base - 2 * 60 * 60 * 1000, category: 'electronics' },
    { id: 'd2', providerName: 'SkyFly',    providerLogo: '✈️', title: '€30 off any flight',     description: 'Book in the next 4 hours', discountPercent: 10, expiresAt: base - 19 * 60 * 60 * 1000, category: 'flights' },
  ];
}

export function saveFlashDeal(deal: Omit<FlashDeal, 'id'>): FlashDeal {
  const newDeal = { ...deal, id: crypto.randomUUID() };
  const current = getFlashDeals();
  const updated = [newDeal, ...current];
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  return newDeal;
}

export function getProviderDeal(providerName: string): FlashDeal | null {
  return getFlashDeals().find((d) => d.providerName === providerName) ?? null;
}

export function formatTimeLeft(expiresAt: number): string {
  const diff = Math.max(0, expiresAt - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m ${s}s left`;
  return `${s}s left`;
}
