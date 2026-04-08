import Anthropic from '@anthropic-ai/sdk';
import type { ParsedIntent } from './types';

const anthropic = new Anthropic();

export interface SubIntent {
  label: string;       // e.g. "Flight", "Hotel", "Restaurant"
  query: string;       // e.g. "Flight to Paris next weekend"
  category: ParsedIntent['category'];
}

export interface BundlePlan {
  isBundle: boolean;
  title: string;         // e.g. "Weekend Trip to Paris"
  subIntents: SubIntent[];
}

export { looksLikeBundle } from './bundleHeuristic';

export async function parseBundleIntent(query: string): Promise<BundlePlan> {
  const systemPrompt = `You are an intent decomposition engine. Given a compound user query,
decompose it into 2-4 sub-intents that together fulfil the overall goal.

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "isBundle": true,
  "title": "Short descriptive title",
  "subIntents": [
    { "label": "Flight", "query": "...", "category": "flights" },
    { "label": "Hotel",  "query": "...", "category": "hotels"  },
    { "label": "Dining", "query": "...", "category": "restaurants" }
  ]
}

Category must be one of: electronics, flights, freelance, hotels, cars, restaurants, software, general.
If the query is NOT a compound intent, respond: { "isBundle": false, "title": "", "subIntents": [] }`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    const parsed = JSON.parse(text) as BundlePlan;
    return parsed;
  } catch {
    // Fallback heuristic for common patterns
    return heuristicBundle(query);
  }
}

function heuristicBundle(query: string): BundlePlan {
  const lower = query.toLowerCase();

  // Detect destination
  const destMatch = lower.match(/to\s+([a-z\s]+?)(?:\s+(?:next|this|for|on|in)\b|$)/i);
  const dest = destMatch ? destMatch[1].trim() : 'destination';
  const destTitle = dest.charAt(0).toUpperCase() + dest.slice(1);

  if (/trip|vacation|getaway|holiday|visit/.test(lower)) {
    return {
      isBundle: true,
      title: `Trip to ${destTitle}`,
      subIntents: [
        { label: 'Flight',      query: `Flight to ${destTitle}`,         category: 'flights' },
        { label: 'Hotel',       query: `Hotel in ${destTitle}`,          category: 'hotels' },
        { label: 'Dining',      query: `Best restaurants in ${destTitle}`, category: 'restaurants' },
      ],
    };
  }

  if (/weekend/.test(lower)) {
    return {
      isBundle: true,
      title: `Weekend in ${destTitle}`,
      subIntents: [
        { label: 'Flight',      query: `Weekend flight to ${destTitle}`, category: 'flights' },
        { label: 'Hotel',       query: `Weekend hotel in ${destTitle}`,  category: 'hotels' },
      ],
    };
  }

  return { isBundle: false, title: '', subIntents: [] };
}
