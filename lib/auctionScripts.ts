/**
 * Auction Script Generator
 *
 * Produces a timed sequence of provider events for the live auction room.
 * Providers join, make initial bids, undercut each other, and make special offers.
 * The script is generated from the parsed intent so messages feel contextual.
 */

import type { ParsedIntent } from './types';

export interface AuctionEvent {
  delay: number;       // ms from auction start
  type: 'join' | 'bid' | 'undercut' | 'message' | 'flash' | 'end';
  providerId: string;
  providerName: string;
  logo: string;
  text?: string;
  price?: number;
  previousPrice?: number; // for undercuts
  isWinning?: boolean;
}

// ── Provider pools per category ────────────────────────────────────────────

const PROVIDERS: Record<string, { id: string; name: string; logo: string; margin: number }[]> = {
  electronics: [
    { id: 'techub',     name: 'TecHub',       logo: '🛒', margin: 0.92 },
    { id: 'mediamarkt', name: 'MediaMarkt',   logo: '🔴', margin: 0.95 },
    { id: 'skroutz',    name: 'Skroutz',      logo: '🔶', margin: 0.88 },
    { id: 'amazon',     name: 'Amazon',        logo: '📦', margin: 0.90 },
    { id: 'kotsovolos', name: 'Kotsovolos',   logo: '🔵', margin: 0.94 },
  ],
  flights: [
    { id: 'ryanair',    name: 'Ryanair',       logo: '🟡', margin: 0.70 },
    { id: 'easyjet',    name: 'easyJet',       logo: '🟠', margin: 0.80 },
    { id: 'aegean',     name: 'Aegean',        logo: '🔵', margin: 0.95 },
    { id: 'skyscanner', name: 'Skyscanner',   logo: '🔍', margin: 0.68 },
    { id: 'wizzair',    name: 'Wizz Air',      logo: '💜', margin: 0.72 },
  ],
  freelance: [
    { id: 'fiverr',       name: 'Fiverr',        logo: '🟢', margin: 0.75 },
    { id: 'upwork',       name: 'Upwork',        logo: '🟩', margin: 0.85 },
    { id: '99designs',    name: '99designs',     logo: '🔷', margin: 0.90 },
    { id: 'designcrowd',  name: 'DesignCrowd',  logo: '🎭', margin: 0.80 },
  ],
  hotels: [
    { id: 'booking',   name: 'Booking.com', logo: '🔵', margin: 0.88 },
    { id: 'airbnb',    name: 'Airbnb',      logo: '🌸', margin: 0.82 },
    { id: 'expedia',   name: 'Expedia',     logo: '🟡', margin: 0.85 },
    { id: 'hotels',    name: 'Hotels.com',  logo: '🔴', margin: 0.90 },
  ],
  cars: [
    { id: 'sixt',        name: 'Sixt',         logo: '🟠', margin: 0.85 },
    { id: 'hertz',       name: 'Hertz',        logo: '🟡', margin: 0.88 },
    { id: 'europcar',    name: 'Europcar',     logo: '🟢', margin: 0.90 },
    { id: 'enterprise',  name: 'Enterprise',  logo: '🟩', margin: 0.87 },
  ],
  restaurants: [
    { id: 'opentable',  name: 'OpenTable',  logo: '🍽️', margin: 0.95 },
    { id: 'thefork',    name: 'TheFork',    logo: '🍴', margin: 0.90 },
    { id: 'yelp',       name: 'Yelp',       logo: '⭕',  margin: 0.92 },
  ],
  software: [
    { id: 'direct',    name: 'Direct Deal',    logo: '⬛', margin: 0.85 },
    { id: 'appsumo',   name: 'AppSumo',       logo: '🦁', margin: 0.70 },
    { id: 'stacksocial', name: 'StackSocial', logo: '🟣', margin: 0.75 },
  ],
  general: [
    { id: 'provider_a', name: 'Provider A', logo: '🏢', margin: 0.90 },
    { id: 'provider_b', name: 'Provider B', logo: '🏬', margin: 0.85 },
    { id: 'provider_c', name: 'Provider C', logo: '🏪', margin: 0.88 },
  ],
};

// ── Contextual messages per category ──────────────────────────────────────

function getMessages(cat: string, providerName: string, price: number, budget?: number): string[] {
  const over = budget && price > budget;
  const currency = '€';

  const shared = [
    `Free delivery included with this offer.`,
    `We can ship within 24 hours.`,
    `Best price we can do — ${currency}${price}.`,
    `Rated #1 in customer satisfaction this quarter.`,
    over ? `Just ${currency}${price - (budget ?? price)} over your budget — worth every cent.` : `Well within your budget at ${currency}${price}.`,
  ];

  const specific: Record<string, string[]> = {
    electronics: [
      `Includes 2-year warranty and free tech support.`,
      `We'll match any price you find elsewhere.`,
      `This model is selling out fast — only 3 left.`,
      `Buy today, get a free case and screen protector.`,
    ],
    flights: [
      `Includes 23kg checked baggage — no hidden fees.`,
      `Flexible rebooking at no extra charge.`,
      `Direct flight, no layovers.`,
      `Business upgrade available for +${currency}89.`,
    ],
    freelance: [
      `Delivery in 48 hours guaranteed or full refund.`,
      `Portfolio of 200+ completed projects available.`,
      `We'll do a free revision until you're 100% happy.`,
      `Top-rated seller — 98% client satisfaction.`,
    ],
    hotels: [
      `Free breakfast included for intent customers.`,
      `Free late checkout until 2pm.`,
      `Complimentary airport transfer included.`,
      `We'll upgrade your room if available at check-in.`,
    ],
    cars: [
      `Full insurance included, no excess.`,
      `Unlimited mileage — no surprise charges.`,
      `Free GPS and child seat if needed.`,
      `Return to any of our 12 locations.`,
    ],
    restaurants: [
      `We'll hold the table for 30 minutes.`,
      `Complimentary welcome drink for intent bookings.`,
      `Chef's special menu available tonight only.`,
      `Private dining room available for groups.`,
    ],
    software: [
      `3 months free with annual plan.`,
      `Priority onboarding and dedicated support.`,
      `Migrate from your current tool — we'll help.`,
      `30-day money back guarantee, no questions asked.`,
    ],
  };

  return [...shared, ...(specific[cat] ?? [])];
}

// ── Script generator ───────────────────────────────────────────────────────

export function generateAuctionScript(intent: ParsedIntent): AuctionEvent[] {
  const pool = PROVIDERS[intent.category] ?? PROVIDERS.general;
  const providers = pool.slice(0, Math.min(4, pool.length));
  const budget = intent.budget ?? 200;
  const events: AuctionEvent[] = [];

  // Calculate initial prices per provider (near budget, varied)
  const initialPrices: Record<string, number> = {};
  providers.forEach((p, i) => {
    // Stagger initial prices slightly so they have something to compete on
    const base = budget * (0.9 + i * 0.04);
    initialPrices[p.id] = Math.round(base * p.margin);
  });

  // ── Phase 1: Providers join (0–3s) ──────────────────────────────────────
  providers.forEach((p, i) => {
    events.push({
      delay: 400 + i * 700,
      type: 'join',
      providerId: p.id,
      providerName: p.name,
      logo: p.logo,
      text: `${p.name} joined the auction`,
    });
  });

  // ── Phase 2: Initial bids (3–7s) ────────────────────────────────────────
  let currentBest = Infinity;
  providers.forEach((p, i) => {
    const price = initialPrices[p.id];
    if (price < currentBest) currentBest = price;
    const msgs = getMessages(intent.category, p.name, price, intent.budget);

    events.push({
      delay: 3000 + i * 900,
      type: 'bid',
      providerId: p.id,
      providerName: p.name,
      logo: p.logo,
      price,
      text: msgs[Math.floor(Math.random() * Math.min(msgs.length, 3))],
      isWinning: price === currentBest,
    });
  });

  // Recalculate winner after initial bids
  currentBest = Math.min(...providers.map((p) => initialPrices[p.id]));

  // ── Phase 3: Undercutting (7–13s) ───────────────────────────────────────
  // Provider 2 undercuts the leader
  const undercutter = providers[1];
  const undercutPrice = Math.round(currentBest * 0.96);
  events.push({
    delay: 7500,
    type: 'undercut',
    providerId: undercutter.id,
    providerName: undercutter.name,
    logo: undercutter.logo,
    price: undercutPrice,
    previousPrice: initialPrices[undercutter.id],
    text: `We're dropping our price to beat the competition!`,
    isWinning: true,
  });
  currentBest = undercutPrice;

  // Provider 1 fires back
  const leader = providers[0];
  const counterPrice = Math.round(currentBest * 0.97);
  events.push({
    delay: 10000,
    type: 'undercut',
    providerId: leader.id,
    providerName: leader.name,
    logo: leader.logo,
    price: counterPrice,
    previousPrice: initialPrices[leader.id],
    text: `Not so fast — we'll go lower. This is our best offer.`,
    isWinning: true,
  });
  currentBest = counterPrice;

  // ── Phase 4: Special offers / messages (10–15s) ──────────────────────────
  if (providers.length >= 3) {
    const p3 = providers[2];
    const msgs = getMessages(intent.category, p3.name, initialPrices[p3.id], intent.budget);
    events.push({
      delay: 12000,
      type: 'message',
      providerId: p3.id,
      providerName: p3.name,
      logo: p3.logo,
      text: msgs[3] ?? msgs[0],
    });
  }

  // Flash deal from last provider
  if (providers.length >= 4) {
    const p4 = providers[3];
    const flashPrice = Math.round(currentBest * 0.94);
    events.push({
      delay: 14000,
      type: 'flash',
      providerId: p4.id,
      providerName: p4.name,
      logo: p4.logo,
      price: flashPrice,
      previousPrice: initialPrices[p4.id],
      text: `⚡ FLASH DEAL — limited time only!`,
      isWinning: flashPrice < currentBest,
    });
    if (flashPrice < currentBest) currentBest = flashPrice;
  }

  // ── Phase 5: End (18s) ───────────────────────────────────────────────────
  type ProviderWithPrice = (typeof providers[0]) & { price?: number };
  const winner = providers.reduce<ProviderWithPrice>((best, p) => {
    const price = events
      .filter((e) => e.providerId === p.id && e.price !== undefined)
      .reduce((minP, e) => Math.min(minP, e.price!), Infinity);
    return price < (best.price ?? Infinity) ? { ...p, price } : best;
  }, {} as ProviderWithPrice);

  events.push({
    delay: 18000,
    type: 'end',
    providerId: winner.id ?? '',
    providerName: winner.name ?? '',
    logo: winner.logo ?? '🏆',
    price: currentBest,
    text: `Auction closed — best bid: €${currentBest} from ${winner.name}`,
    isWinning: true,
  });

  return events.sort((a, b) => a.delay - b.delay);
}
