import Anthropic from '@anthropic-ai/sdk';
import type { ParsedIntent } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an intent parser for a discovery engine.
Extract structured data from a natural language user query.
Respond with ONLY valid JSON — no markdown, no explanation.

JSON shape:
{
  "category": string,
  "budget": number | null,
  "currency": string,
  "constraints": string[],
  "keywords": string[],
  "timeframe": string | null,
  "origin": string | null,
  "destination": string | null
}

Category must be exactly one of:
- "electronics"  → phones, laptops, tablets, headphones, cameras, TVs
- "flights"      → air travel, tickets from A to B
- "freelance"    → hiring someone: designers, developers, writers
- "hotels"       → accommodation, hotels, Airbnb, resorts, stays
- "cars"         → car rental, buying a car, vehicle hire
- "restaurants"  → dining, food, reservations, cafes
- "software"     → SaaS, apps, tools, subscriptions, platforms
- "general"      → anything else

Rules:
- "budget" is a number only (no symbols). Null if not mentioned.
- "currency" defaults to "EUR" if not specified.
- "constraints" are requirements: ["under 1kg", "for programming", "non-stop", "vegan"]
- "keywords" are the main nouns: ["laptop", "logo design", "hotel", "project management"]
- "origin" / "destination" for flights only.
- Keep each constraint/keyword under 5 words.`;

export async function parseIntent(query: string): Promise<ParsedIntent> {
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text);

    return {
      category: parsed.category ?? 'general',
      budget: parsed.budget ?? undefined,
      currency: parsed.currency ?? 'EUR',
      constraints: parsed.constraints ?? [],
      keywords: parsed.keywords ?? [],
      timeframe: parsed.timeframe ?? undefined,
      origin: parsed.origin ?? undefined,
      destination: parsed.destination ?? undefined,
      raw: query,
    };
  } catch (err) {
    console.error('[intentParser] Claude call failed, using fallback:', err);
    return heuristicFallback(query);
  }
}

function heuristicFallback(query: string): ParsedIntent {
  const lower = query.toLowerCase();

  const category =
    /laptop|phone|tablet|headphone|camera|pc|computer|macbook/.test(lower) ? 'electronics' :
    /flight|fly|ticket|travel|airport|from .+ to/.test(lower)              ? 'flights'     :
    /hotel|airbnb|stay|accommodation|resort|hostel/.test(lower)            ? 'hotels'      :
    /car rental|rent a car|hire a car|sixt|hertz/.test(lower)              ? 'cars'        :
    /restaurant|dinner|lunch|eat|reserve|dining/.test(lower)               ? 'restaurants' :
    /notion|slack|figma|saas|software|subscription|tool/.test(lower)       ? 'software'    :
    /design|developer|writer|freelanc|hire|logo/.test(lower)               ? 'freelance'   :
    'general';

  const budgetMatch = query.match(/[€$£]?\s*(\d[\d,]*)/);
  const budget = budgetMatch ? parseFloat(budgetMatch[1].replace(',', '')) : undefined;
  const currency = query.includes('$') ? 'USD' : query.includes('£') ? 'GBP' : 'EUR';

  return {
    category,
    budget,
    currency,
    constraints: [],
    keywords: lower.split(' ').filter((w) => w.length > 4).slice(0, 4),
    raw: query,
  };
}
