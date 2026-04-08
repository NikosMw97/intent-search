const POPULAR_QUERIES = [
  'Best laptop under €1200 for programming',
  'Best laptop under €800 for students',
  'MacBook Pro M3 best price',
  'iPhone 15 Pro cheapest deal',
  'Sony WH-1000XM5 headphones',
  '4K monitor under €400',
  'Mechanical keyboard under €150',
  'Cheap flight from Athens to London',
  'Cheap flight from Athens to Paris',
  'Direct flight New York to Los Angeles',
  'Flight to Tokyo under €600',
  'Last minute flight to Barcelona',
  'Hotel in Paris under €120 per night',
  'Luxury hotel in Santorini',
  'Airbnb in Tokyo city centre',
  'Budget hotel near Rome Colosseum',
  'Logo designer under €100',
  'React developer for freelance project',
  'Video editor for YouTube channel',
  'SEO consultant for e-commerce',
  'Python developer hourly rate',
  'Tesla Model 3 long range lease',
  'BMW rental for weekend',
  'Toyota Prius monthly rental',
  'Best sushi restaurant near me',
  'Vegan restaurant in Athens',
  'Rooftop bar with city view',
  'Figma Pro annual plan',
  'GitHub Teams for small startup',
  'Notion Business plan pricing',
  'Trip to Paris next weekend',
  'Weekend getaway in Amsterdam',
  'Vacation in Tokyo for 5 days',
  'Holiday package to Santorini',
];

export function getAutocompleteSuggestions(partial: string, limit = 5): string[] {
  if (partial.trim().length < 2) return [];
  const lower = partial.toLowerCase();
  return POPULAR_QUERIES
    .filter((q) => q.toLowerCase().includes(lower))
    .slice(0, limit);
}
