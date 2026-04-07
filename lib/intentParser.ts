/**
 * Intent Parser — uses Claude to convert natural language into structured intent.
 *
 * The AI extracts: category, budget, currency, constraints, keywords,
 * and optional routing fields (origin/destination for flights).
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ParsedIntent } from './types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an intent parser for a shopping/service discovery engine.
Your job is to extract structured data from a natural language user query.
Always respond with ONLY valid JSON — no markdown, no explanation, no extra text.

JSON shape:
{
  "category": "electronics" | "flights" | "freelance" | "general",
  "budget": number | null,
  "currency": string (ISO 4217, e.g. "EUR", "USD", "GBP"),
  "constraints": string[],
  "keywords": string[],
  "timeframe": string | null,
  "origin": string | null,
  "destination": string | null
}

Rules:
- "category" must be exactly one of the four options.
  - electronics: phones, laptops, tablets, headphones, cameras, etc.
  - flights: airplane travel, trip from A to B
  - freelance: hiring someone — designers, developers, writers, etc.
  - general: anything else
- "budget" should be a number (no currency symbol). If no budget mentioned, use null.
- "currency" defaults to "EUR" if not specified.
- "constraints" are adjectives/requirements the user mentioned ("lightweight", "for programming", "non-stop", etc.)
- "keywords" are the main product/service nouns ("laptop", "logo design", "flight", etc.)
- "origin" / "destination" only for flight queries.
- Keep constraints and keywords concise (2–5 words max each).`;

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
    // Graceful fallback — heuristic parsing if Claude is unavailable
    console.error('[intentParser] Claude call failed, using fallback:', err);
    return heuristicFallback(query);
  }
}

/** Fast heuristic fallback used when Claude is unavailable */
function heuristicFallback(query: string): ParsedIntent {
  const lower = query.toLowerCase();

  // Detect category
  const category =
    /laptop|phone|tablet|headphone|camera|pc|computer|macbook|samsung|apple/.test(lower)
      ? 'electronics'
      : /flight|fly|ticket|travel|airport|from .+ to/.test(lower)
      ? 'flights'
      : /design|developer|writer|freelanc|hire|logo|website/.test(lower)
      ? 'freelance'
      : 'general';

  // Extract budget (first number found after €/$)
  const budgetMatch = query.match(/[€$£]?\s*(\d[\d,]*)/);
  const budget = budgetMatch ? parseFloat(budgetMatch[1].replace(',', '')) : undefined;

  // Detect currency
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
