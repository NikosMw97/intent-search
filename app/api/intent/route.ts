/**
 * POST /api/intent
 *
 * Main pipeline:
 *   1. Parse natural language query → structured intent  (Claude)
 *   2. Fetch offers from mock providers
 *   3. Rank offers algorithmically
 *   4. Generate AI reasoning for each top result         (Claude)
 *   5. Return IntentResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { parseIntent } from '@/lib/intentParser';
import { fetchAllOffers } from '@/lib/providers';
import { rankOffers } from '@/lib/rankingEngine';
import type { IntentRequest, IntentResponse, RankedResult } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Reasoning layer ────────────────────────────────────────────────────────

async function generateReasoning(
  results: RankedResult[],
  query: string,
): Promise<RankedResult[]> {
  // Build a compact list of offers for Claude to reason about
  const offerSummaries = results
    .map((r, i) => {
      const { offer, matchFactors } = r;
      return `#${i + 1} ${offer.name} (${offer.providerName}) — €${offer.price}
  Features: ${offer.features.slice(0, 4).join(', ')}
  Budget match: ${matchFactors.budgetMatch}/100, Relevance: ${matchFactors.relevance}/100, Quality: ${matchFactors.quality}/100`;
    })
    .join('\n\n');

  const prompt = `User's intent: "${query}"

Here are the top ${results.length} matching offers:

${offerSummaries}

For each offer (#1 through #${results.length}), write a single concise sentence (max 15 words) explaining why it matches the user's need.
Focus on the most relevant benefit for THIS specific user.
Reply ONLY with a JSON array of strings in order, no markdown:
["reason for #1", "reason for #2", ...]`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';
    const reasons: string[] = JSON.parse(text);

    return results.map((r, i) => ({
      ...r,
      reasoning: reasons[i] ?? buildFallbackReasoning(r, query),
    }));
  } catch {
    // Fallback: generate template-based reasoning
    return results.map((r) => ({
      ...r,
      reasoning: buildFallbackReasoning(r, query),
    }));
  }
}

/** Template-based fallback reasoning if Claude is unavailable */
function buildFallbackReasoning(result: RankedResult, query: string): string {
  const { offer, matchFactors } = result;
  const parts: string[] = [];

  if (matchFactors.budgetMatch >= 80) {
    parts.push(`fits your budget at €${offer.price}`);
  } else if (matchFactors.budgetMatch < 50) {
    parts.push(`slightly over budget but offers premium value`);
  }

  if (matchFactors.quality >= 80) {
    parts.push(`top-rated with ${offer.reviewCount?.toLocaleString()} reviews`);
  }

  if (offer.features.length > 0) {
    parts.push(offer.features[0].toLowerCase());
  }

  return parts.length > 0
    ? `Matches your intent: ${parts.join(', ')}.`
    : `Best overall match for "${query.slice(0, 40)}".`;
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const body: IntentRequest = await req.json();
    const { query } = body;

    if (!query?.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    // Step 1: Parse intent
    const intent = await parseIntent(query.trim());

    // Step 2: Fetch from providers
    const { offers, totalProviders } = fetchAllOffers(intent);

    if (offers.length === 0) {
      return NextResponse.json({ error: 'No offers found for this query' }, { status: 404 });
    }

    // Step 3: Rank
    const rankedResults = rankOffers(offers, intent, 5);

    // Step 4: Generate AI reasoning
    const resultsWithReasoning = await generateReasoning(rankedResults, query);

    const response: IntentResponse = {
      intent,
      results: resultsWithReasoning,
      totalProviders,
      totalOffers: offers.length,
      searchTimeMs: Date.now() - start,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[/api/intent] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}
