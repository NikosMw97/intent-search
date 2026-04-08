import type { ParsedIntent, ProviderOffer } from '../types';

const CATALOG: ProviderOffer[] = [
  {
    id: 'r-001', providerId: 'opentable', providerName: 'OpenTable', providerLogo: '🍽️',
    name: 'Funky Gourmet — Molecular Greek', price: 120, currency: 'EUR',
    features: ['2 Michelin stars', 'Tasting menu', 'Wine pairing', 'Athens', 'Vegetarian options', 'Reservations required'],
    link: '#', rating: 4.9, reviewCount: 2840, imageEmoji: '⭐',
    availability: 'Table for 2 — Friday 8pm',
    metadata: { cuisine: 'Greek fusion', priceRange: '€€€€', location: 'Athens' },
  },
  {
    id: 'r-002', providerId: 'thefork', providerName: 'TheFork', providerLogo: '🍴',
    name: 'Strofi — Acropolis View Taverna', price: 35, currency: 'EUR',
    features: ['Rooftop', 'Acropolis view', 'Traditional Greek', 'Outdoor seating', 'Live music Fri-Sat'],
    link: '#', rating: 4.7, reviewCount: 5610, imageEmoji: '🏛️',
    availability: 'Tables available tonight',
    metadata: { cuisine: 'Greek', priceRange: '€€', location: 'Athens' },
  },
  {
    id: 'r-003', providerId: 'opentable', providerName: 'OpenTable', providerLogo: '🍽️',
    name: 'Nobu Athens — Japanese-Peruvian', price: 95, currency: 'EUR',
    features: ['Celebrity chef', 'Black cod miso', 'Cocktail bar', 'Private dining', 'Dress code'],
    link: '#', rating: 4.8, reviewCount: 1920, imageEmoji: '🍣',
    availability: 'Table for 2 — Saturday 9pm',
    metadata: { cuisine: 'Japanese-Peruvian', priceRange: '€€€€', location: 'Athens' },
  },
  {
    id: 'r-004', providerId: 'thefork', providerName: 'TheFork', providerLogo: '🍴',
    name: 'Kuzina — Modern Greek Bistro', price: 45, currency: 'EUR',
    features: ['Modern Greek', 'Thisio neighbourhood', 'Natural wines', 'Seasonal menu', 'Cosy atmosphere'],
    link: '#', rating: 4.6, reviewCount: 3280, imageEmoji: '🫒',
    availability: 'Available',
    metadata: { cuisine: 'Modern Greek', priceRange: '€€€', location: 'Thisio, Athens' },
  },
  {
    id: 'r-005', providerId: 'yelp', providerName: 'Yelp', providerLogo: '⭕',
    name: 'Falafellas — Best Vegan in Athens', price: 12, currency: 'EUR',
    features: ['100% vegan', 'Budget-friendly', 'Takeaway & dine-in', 'Gluten-free options', 'Fast service'],
    link: '#', rating: 4.5, reviewCount: 8920, imageEmoji: '🥙',
    availability: 'Open now',
    metadata: { cuisine: 'Vegan', priceRange: '€', location: 'Monastiraki, Athens' },
  },
  {
    id: 'r-006', providerId: 'thefork', providerName: 'TheFork', providerLogo: '🍴',
    name: 'Il Postino — Authentic Italian', price: 55, currency: 'EUR',
    features: ['Hand-made pasta', 'Italian wine list', 'Romantic setting', 'Truffle specials', 'Quiet atmosphere'],
    link: '#', rating: 4.7, reviewCount: 2140, imageEmoji: '🍝',
    availability: '10% discount tonight',
    metadata: { cuisine: 'Italian', priceRange: '€€€', location: 'Kolonaki, Athens' },
  },
];

export function getRestaurantOffers(intent: ParsedIntent): ProviderOffer[] {
  const lower = [...intent.keywords, ...intent.constraints].join(' ').toLowerCase();
  let offers = CATALOG;

  if (/vegan|vegetarian|plant.based/.test(lower)) {
    offers = CATALOG.filter((o) => o.metadata?.cuisine === 'Vegan');
    if (offers.length < 2) offers = CATALOG;
  } else if (/italian|pizza|pasta/.test(lower)) {
    offers = CATALOG.filter((o) => o.metadata?.cuisine === 'Italian');
    if (offers.length < 2) offers = CATALOG;
  } else if (/sushi|japanese/.test(lower)) {
    offers = CATALOG.filter((o) => o.name.toLowerCase().includes('nobu'));
    if (offers.length < 2) offers = CATALOG;
  }

  if (intent.budget) {
    const ceiling = intent.budget * 1.3;
    const inBudget = offers.filter((o) => o.price <= ceiling);
    offers = inBudget.length >= 2 ? inBudget : offers;
  }
  return offers;
}
