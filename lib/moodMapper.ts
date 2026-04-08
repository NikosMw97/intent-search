export interface Mood {
  id: string;
  emoji: string;
  label: string;
  modifier: string;  // appended to query
  description: string;
}

export const MOODS: Mood[] = [
  { id: 'cheapest',    emoji: '💸', label: 'Cheapest',     modifier: 'cheapest possible lowest price',         description: 'Absolute lowest price, no compromises' },
  { id: 'fastest',     emoji: '⚡', label: 'Fastest',      modifier: 'fastest delivery express same day',      description: 'Speed over everything' },
  { id: 'best',        emoji: '✨', label: 'Best quality',  modifier: 'best quality premium top rated',         description: 'Only the best, price secondary' },
  { id: 'adventurous', emoji: '🎲', label: 'Surprise me',  modifier: 'unique unusual unexpected alternative',  description: 'Something off the beaten path' },
  { id: 'eco',         emoji: '🌿', label: 'Eco-friendly', modifier: 'sustainable eco-friendly green ethical', description: 'Sustainable and responsible choices' },
  { id: 'local',       emoji: '📍', label: 'Local',        modifier: 'local nearby independent small business', description: 'Support local providers' },
];

export function applyMood(query: string, moodId: string): string {
  const mood = MOODS.find((m) => m.id === moodId);
  if (!mood) return query;
  return `${query} — ${mood.modifier}`;
}
