import type { ParsedIntent, ProviderOffer } from '../types';

const CATALOG: ProviderOffer[] = [
  {
    id: 'c-001', providerId: 'sixt', providerName: 'Sixt', providerLogo: '🟠',
    name: 'BMW 3 Series — Full Size', price: 89, currency: 'EUR',
    features: ['Automatic', 'AC', 'GPS', 'Unlimited mileage', '5 seats', 'Bluetooth'],
    link: '#', rating: 4.5, reviewCount: 12400, imageEmoji: '🚗',
    availability: '3 available',
    metadata: { type: 'car_rental', brand: 'BMW', rateType: 'per day', transmission: 'Automatic' },
  },
  {
    id: 'c-002', providerId: 'hertz', providerName: 'Hertz', providerLogo: '🟡',
    name: 'Toyota Yaris — Economy', price: 34, currency: 'EUR',
    features: ['Manual', 'AC', 'Compact', 'Fuel efficient', 'Unlimited mileage', 'City-friendly'],
    link: '#', rating: 4.2, reviewCount: 28900, imageEmoji: '🚗',
    availability: 'Available',
    metadata: { type: 'car_rental', brand: 'Toyota', rateType: 'per day', transmission: 'Manual' },
  },
  {
    id: 'c-003', providerId: 'europcar', providerName: 'Europcar', providerLogo: '🟢',
    name: 'Mercedes C-Class — Premium', price: 119, currency: 'EUR',
    features: ['Automatic', 'Leather seats', 'GPS', 'Bluetooth', 'Premium insurance', 'Roadside assist'],
    link: '#', rating: 4.6, reviewCount: 8710, imageEmoji: '🚗',
    availability: '1 available',
    metadata: { type: 'car_rental', brand: 'Mercedes', rateType: 'per day', transmission: 'Automatic' },
  },
  {
    id: 'c-004', providerId: 'enterprise', providerName: 'Enterprise', providerLogo: '🟩',
    name: 'Ford Focus — Intermediate', price: 49, currency: 'EUR',
    features: ['Automatic', 'AC', '5 seats', 'Large boot', 'Unlimited mileage', 'Child seat available'],
    link: '#', rating: 4.3, reviewCount: 19200, imageEmoji: '🚗',
    availability: 'Available',
    metadata: { type: 'car_rental', brand: 'Ford', rateType: 'per day', transmission: 'Automatic' },
  },
  {
    id: 'c-005', providerId: 'discovercars', providerName: 'DiscoverCars', providerLogo: '🔍',
    name: 'VW Polo — Best Price Found', price: 28, currency: 'EUR',
    features: ['Manual', 'AC', 'Compact', 'Lowest price guarantee', 'Free cancellation'],
    link: '#', rating: 4.1, reviewCount: 44200, imageEmoji: '🚗',
    availability: 'Available',
    metadata: { type: 'car_rental', brand: 'VW', rateType: 'per day', transmission: 'Manual' },
  },
  {
    id: 'c-006', providerId: 'sixt', providerName: 'Sixt', providerLogo: '🟠',
    name: 'Tesla Model 3 — Electric', price: 145, currency: 'EUR',
    features: ['Electric', 'Autopilot', 'Supercharger access', '500km range', 'App control', 'Zero emissions'],
    link: '#', rating: 4.8, reviewCount: 3200, imageEmoji: '⚡',
    availability: '2 available',
    metadata: { type: 'car_rental', brand: 'Tesla', rateType: 'per day', transmission: 'Automatic' },
  },
  {
    id: 'c-007', providerId: 'hertz', providerName: 'Hertz', providerLogo: '🟡',
    name: 'Jeep Renegade — SUV 4x4', price: 74, currency: 'EUR',
    features: ['4x4 drive', 'SUV', 'High clearance', 'AC', 'GPS', '5 seats', 'Roof rack'],
    link: '#', rating: 4.4, reviewCount: 7650, imageEmoji: '🚙',
    availability: 'Available',
    metadata: { type: 'car_rental', brand: 'Jeep', rateType: 'per day', transmission: 'Automatic' },
  },
];

export function getCarOffers(intent: ParsedIntent): ProviderOffer[] {
  const lower = [...intent.keywords, ...intent.constraints].join(' ').toLowerCase();
  let offers = CATALOG;

  if (/electric|tesla|ev|zero emission/.test(lower)) {
    offers = CATALOG.filter((o) => o.metadata?.brand === 'Tesla');
    if (offers.length < 2) offers = CATALOG;
  } else if (/suv|4x4|offroad|off-road/.test(lower)) {
    offers = CATALOG.filter((o) => o.metadata?.brand === 'Jeep');
    if (offers.length < 2) offers = CATALOG;
  }

  if (intent.budget) {
    const ceiling = intent.budget * 1.3;
    const inBudget = offers.filter((o) => o.price <= ceiling);
    offers = inBudget.length >= 3 ? inBudget : offers;
  }
  return offers;
}
