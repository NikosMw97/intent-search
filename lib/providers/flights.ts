/**
 * Flights providers — simulates competing airlines and aggregators.
 */

import type { ParsedIntent, ProviderOffer } from '../types';

// Base route prices (one-way, EUR). Bidirectional lookup.
const ROUTE_PRICES: Record<string, number> = {
  'athens-paris': 89,    'paris-athens': 94,
  'athens-london': 119,  'london-athens': 124,
  'athens-rome': 59,     'rome-athens': 65,
  'athens-berlin': 99,   'berlin-athens': 104,
  'athens-amsterdam': 109, 'amsterdam-athens': 114,
  'athens-barcelona': 79,  'barcelona-athens': 84,
  'athens-madrid': 99,   'madrid-athens': 104,
  'athens-lisbon': 119,  'lisbon-athens': 124,
};

function getRouteKey(origin: string, dest: string) {
  return `${origin.toLowerCase().replace(/\s+/g, '')}-${dest.toLowerCase().replace(/\s+/g, '')}`;
}

function getBasePrice(origin?: string, destination?: string): number {
  if (!origin || !destination) return 99;
  return ROUTE_PRICES[getRouteKey(origin, destination)] ?? 109;
}

export function getFlightOffers(intent: ParsedIntent): ProviderOffer[] {
  const base = getBasePrice(intent.origin, intent.destination);
  const from = intent.origin ?? 'Athens';
  const to = intent.destination ?? 'destination';
  const route = `${from} → ${to}`;

  // Each airline "bids" with a different price/tradeoff
  return [
    {
      id: 'f-001', providerId: 'ryanair', providerName: 'Ryanair', providerLogo: '🟡',
      name: `${route} — Economy`,
      price: Math.round(base * 0.72),
      currency: 'EUR',
      features: ['Cabin bag included', 'Online check-in', 'Choose seats (+fee)', '2h flight avg'],
      link: '#', rating: 3.8, reviewCount: 45200, imageEmoji: '✈️',
      availability: '14 seats left',
      metadata: { airline: 'Ryanair', stops: 'Direct', class: 'Economy', duration: '2h 55m' },
    },
    {
      id: 'f-002', providerId: 'easyjet', providerName: 'easyJet', providerLogo: '🟠',
      name: `${route} — Economy`,
      price: Math.round(base * 0.85),
      currency: 'EUR',
      features: ['Cabin bag included', 'Free seat selection', 'Flexible rebooking', 'On-time 88%'],
      link: '#', rating: 4.0, reviewCount: 32100, imageEmoji: '✈️',
      availability: '8 seats left',
      metadata: { airline: 'easyJet', stops: 'Direct', class: 'Economy', duration: '2h 50m' },
    },
    {
      id: 'f-003', providerId: 'aegean', providerName: 'Aegean Airlines', providerLogo: '🔵',
      name: `${route} — Economy Flex`,
      price: Math.round(base * 1.05),
      currency: 'EUR',
      features: ['23kg checked bag', 'Meal included', 'Free rebooking', 'Miles accrual', 'Priority boarding'],
      link: '#', rating: 4.6, reviewCount: 18700, imageEmoji: '✈️',
      availability: 'Available',
      metadata: { airline: 'Aegean', stops: 'Direct', class: 'Economy Flex', duration: '2h 45m' },
    },
    {
      id: 'f-004', providerId: 'lufthansa', providerName: 'Lufthansa', providerLogo: '⭐',
      name: `${route} — Economy (via Frankfurt)`,
      price: Math.round(base * 1.15),
      currency: 'EUR',
      features: ['23kg checked bag', 'Meal + drinks', 'Miles accrual', 'Lounge access', 'Premium service'],
      link: '#', rating: 4.5, reviewCount: 28900, imageEmoji: '✈️',
      availability: 'Available',
      metadata: { airline: 'Lufthansa', stops: '1 stop', class: 'Economy', duration: '5h 20m' },
    },
    {
      id: 'f-005', providerId: 'skyscanner', providerName: 'Skyscanner Deal', providerLogo: '🔍',
      name: `${route} — Best Price Found`,
      price: Math.round(base * 0.68),
      currency: 'EUR',
      features: ['Price alert', 'Flexible dates', 'Mix of airlines', 'Best combo route'],
      link: '#', rating: 4.2, reviewCount: 91400, imageEmoji: '✈️',
      availability: 'Limited time offer',
      metadata: { airline: 'Mixed', stops: 'Varies', class: 'Economy', duration: 'Varies' },
    },
    {
      id: 'f-006', providerId: 'wizzair', providerName: 'Wizz Air', providerLogo: '💜',
      name: `${route} — Wizz Basic`,
      price: Math.round(base * 0.78),
      currency: 'EUR',
      features: ['Small cabin bag only', 'Online boarding pass', 'Carbon offset option'],
      link: '#', rating: 3.6, reviewCount: 27800, imageEmoji: '✈️',
      availability: '22 seats left',
      metadata: { airline: 'Wizz Air', stops: 'Direct', class: 'Basic', duration: '3h 00m' },
    },
    {
      id: 'f-007', providerId: 'airfrance', providerName: 'Air France', providerLogo: '🇫🇷',
      name: `${route} — Business`,
      price: Math.round(base * 3.2),
      currency: 'EUR',
      features: ['Lie-flat seat', 'Gourmet meals', 'Lounge access', 'Chauffeur service', 'Fast track security'],
      link: '#', rating: 4.8, reviewCount: 15600, imageEmoji: '✈️',
      availability: '4 seats left',
      metadata: { airline: 'Air France', stops: 'Direct', class: 'Business', duration: '2h 50m' },
    },
  ];
}
