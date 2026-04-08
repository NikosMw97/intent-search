const SUGGESTIONS: Record<string, string[]> = {
  electronics: [
    'Laptop stand for ergonomic setup',
    'USB-C hub for extra ports',
    'External monitor under €300',
    'Mechanical keyboard under €100',
    'Laptop bag or sleeve',
    'Portable charger for travel',
  ],
  flights: [
    'Hotel near the airport',
    'Travel insurance for the trip',
    'Car rental at destination',
    'Airport transfer service',
    'Luggage for carry-on only',
  ],
  hotels: [
    'Flights to the same destination',
    'Restaurant reservations nearby',
    'Local tours and experiences',
    'Car rental at the hotel',
  ],
  cars: [
    'Car insurance quote',
    'GPS navigation device',
    'Dashcam under €80',
    'Car cleaning service',
  ],
  restaurants: [
    'Uber Eats alternative for delivery',
    'Wine pairing suggestion',
    'Dessert spot nearby',
    'Cocktail bar for after dinner',
  ],
  freelance: [
    'Project management tool',
    'Contract template for freelancers',
    'Invoice software',
    'Video call setup equipment',
  ],
  software: [
    'Team password manager',
    'Cloud storage solution',
    'Monitoring and analytics tool',
    'CI/CD pipeline service',
  ],
  general: [
    'Compare similar options',
    'Set a price alert for this',
    'Check bundle deals',
  ],
};

export function getProactiveSuggestions(category: string, currentQuery: string, limit = 3): string[] {
  const pool = SUGGESTIONS[category] ?? SUGGESTIONS.general;
  // Filter out anything that sounds too similar to current query
  const lower = currentQuery.toLowerCase();
  const filtered = pool.filter((s) => !s.toLowerCase().split(' ').some((w) => w.length > 4 && lower.includes(w)));
  // Shuffle deterministically based on query length
  const seed = currentQuery.length % filtered.length || 1;
  const rotated = [...filtered.slice(seed), ...filtered.slice(0, seed)];
  return rotated.slice(0, limit);
}
