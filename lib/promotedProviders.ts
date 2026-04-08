// Providers that have "paid" to be promoted — stored in localStorage, toggled from providers page
const STORAGE_KEY = 'intent_promoted_providers';

export function getPromotedProviders(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set(['TechMart', 'SkyFly']);
  } catch { return new Set(['TechMart', 'SkyFly']); }
}

export function setPromotedProviders(providers: Set<string>): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(providers))); } catch { /* ignore */ }
}

export function togglePromoted(providerName: string): void {
  const current = getPromotedProviders();
  if (current.has(providerName)) current.delete(providerName);
  else current.add(providerName);
  setPromotedProviders(current);
}
