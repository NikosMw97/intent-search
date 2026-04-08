import type { ParsedIntent, ProviderOffer } from '../types';

const CATALOG: ProviderOffer[] = [
  {
    id: 'h-001', providerId: 'booking', providerName: 'Booking.com', providerLogo: '🔵',
    name: 'Hotel Grande Bretagne, Athens', price: 320, currency: 'EUR',
    features: ['5-star', 'City centre', 'Rooftop pool', 'Spa', 'Free WiFi', 'Breakfast included'],
    link: '#', rating: 4.9, reviewCount: 8420, imageEmoji: '🏨',
    availability: '2 rooms left',
    metadata: { type: 'hotel', stars: '5', location: 'Athens centre', checkIn: 'Flexible' },
  },
  {
    id: 'h-002', providerId: 'airbnb', providerName: 'Airbnb', providerLogo: '🌸',
    name: 'Santorini Cliffside Villa with Pool', price: 280, currency: 'EUR',
    features: ['Entire villa', 'Private pool', 'Caldera view', 'Self check-in', '2 bedrooms', 'Kitchen'],
    link: '#', rating: 4.95, reviewCount: 341, imageEmoji: '🏡',
    availability: 'Available',
    metadata: { type: 'villa', location: 'Santorini', checkIn: 'Self check-in' },
  },
  {
    id: 'h-003', providerId: 'booking', providerName: 'Booking.com', providerLogo: '🔵',
    name: 'Novotel Athens Centre', price: 129, currency: 'EUR',
    features: ['4-star', 'Free WiFi', 'Fitness centre', 'Restaurant', 'Airport shuttle', 'AC'],
    link: '#', rating: 4.3, reviewCount: 5210, imageEmoji: '🏨',
    availability: 'Available',
    metadata: { type: 'hotel', stars: '4', location: 'Athens', checkIn: 'Flexible' },
  },
  {
    id: 'h-004', providerId: 'expedia', providerName: 'Expedia', providerLogo: '🟡',
    name: 'Athenian Riviera Beach Resort', price: 195, currency: 'EUR',
    features: ['4-star', 'Private beach', 'Sea view', 'Pool', 'All-inclusive option', 'Free parking'],
    link: '#', rating: 4.6, reviewCount: 2980, imageEmoji: '🏖️',
    availability: '5 rooms left',
    metadata: { type: 'resort', stars: '4', location: 'Athens Riviera', checkIn: 'Flexible' },
  },
  {
    id: 'h-005', providerId: 'airbnb', providerName: 'Airbnb', providerLogo: '🌸',
    name: 'Cosy Studio in Plaka Old Town', price: 65, currency: 'EUR',
    features: ['Entire studio', 'Acropolis view', 'Fast WiFi', 'Self check-in', 'Central location'],
    link: '#', rating: 4.8, reviewCount: 892, imageEmoji: '🏠',
    availability: 'Available',
    metadata: { type: 'studio', location: 'Plaka, Athens', checkIn: 'Self check-in' },
  },
  {
    id: 'h-006', providerId: 'hotels', providerName: 'Hotels.com', providerLogo: '🔴',
    name: 'Mykonos Grand Hotel & Resort', price: 450, currency: 'EUR',
    features: ['5-star', 'Adults only', 'Private beach', 'Butler service', 'Infinity pool', 'Fine dining'],
    link: '#', rating: 4.8, reviewCount: 1240, imageEmoji: '🏨',
    availability: '1 suite left',
    metadata: { type: 'resort', stars: '5', location: 'Mykonos', checkIn: 'Flexible' },
  },
  {
    id: 'h-007', providerId: 'booking', providerName: 'Booking.com', providerLogo: '🔵',
    name: 'Ibis Budget Athens Airport', price: 59, currency: 'EUR',
    features: ['3-star', 'Airport hotel', 'Free shuttle', 'Free WiFi', '24h reception', 'Parking'],
    link: '#', rating: 4.0, reviewCount: 3870, imageEmoji: '🏨',
    availability: 'Available',
    metadata: { type: 'hotel', stars: '3', location: 'Athens Airport', checkIn: 'Flexible' },
  },
];

export function getHotelOffers(intent: ParsedIntent): ProviderOffer[] {
  let offers = CATALOG;
  if (intent.budget) {
    const ceiling = intent.budget * 1.3;
    const inBudget = offers.filter((o) => o.price <= ceiling);
    offers = inBudget.length >= 3 ? inBudget : offers;
  }
  return offers;
}
