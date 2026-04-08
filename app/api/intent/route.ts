/**
 * POST /api/intent — streaming NDJSON pipeline
 *
 * Emits newline-delimited JSON events:
 *   {"type":"intent",  "data": ParsedIntent}
 *   {"type":"stats",   "data": {totalProviders, totalOffers}}
 *   {"type":"result",  "data": RankedResult}   ← one per top offer
 *   {"type":"done",    "data": {searchTimeMs}}
 *   {"type":"error",   "data": string}
 */

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { parseIntent } from '@/lib/intentParser';
import { fetchAllOffers } from '@/lib/providers';
import { rankOffers } from '@/lib/rankingEngine';
import type { IntentRequest, RankedResult } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Reasoning layer ────────────────────────────────────────────────────────

async function generateReasoning(results: RankedResult[], query: string): Promise<RankedResult[]> {
  const offerSummaries = results.map((r, i) => {
    const { offer, matchFactors } = r;
    return `#${i + 1} ${offer.name} (${offer.providerName}) — €${offer.price}
Features: ${offer.features.slice(0, 4).join(', ')}
Scores — Budget: ${matchFactors.budgetMatch}/100, Relevance: ${matchFactors.relevance}/100, Quality: ${matchFactors.quality}/100`;
  }).join('\n\n');

  const prompt = `User intent: "${query}"

Top ${results.length} offers:
${offerSummaries}

Write one concise sentence (max 15 words) per offer explaining why it matches this user's specific need.
Reply ONLY with a JSON array of strings: ["reason 1", "reason 2", ...]`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';
    const reasons: string[] = JSON.parse(text);
    return results.map((r, i) => ({ ...r, reasoning: reasons[i] ?? fallbackReason(r, query) }));
  } catch {
    return results.map((r) => ({ ...r, reasoning: fallbackReason(r, query) }));
  }
}

function fallbackReason(result: RankedResult, query: string): string {
  const { offer, matchFactors } = result;
  const parts: string[] = [];
  if (matchFactors.budgetMatch >= 80) parts.push(`fits your budget at €${offer.price}`);
  if (matchFactors.quality >= 80 && offer.rating) parts.push(`top-rated ${offer.rating}/5`);
  if (offer.features[0]) parts.push(offer.features[0].toLowerCase());
  return parts.length ? `Matches your intent: ${parts.join(', ')}.` : `Best overall match for "${query.slice(0, 35)}".`;
}

// ── Streaming handler ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
        } catch {
          // controller already closed
        }
      };

      try {
        const body: IntentRequest = await req.json();
        const { query, refinement } = body;

        if (!query?.trim()) {
          send({ type: 'error', data: 'query is required' });
          controller.close();
          return;
        }

        // Build effective query (original + optional refinement)
        const effectiveQuery = refinement?.trim()
          ? `${query.trim()}. Additional requirement: ${refinement.trim()}`
          : query.trim();

        // Step 1: Parse intent
        const intent = await parseIntent(effectiveQuery);
        intent.raw = query.trim(); // always show the original query
        send({ type: 'intent', data: intent });

        // Step 2: Fetch from providers
        const { offers, totalProviders } = fetchAllOffers(intent);
        send({ type: 'stats', data: { totalProviders, totalOffers: offers.length } });

        if (offers.length === 0) {
          send({ type: 'error', data: 'No offers found for this query.' });
          controller.close();
          return;
        }

        // Step 3: Rank
        const ranked = rankOffers(offers, intent, 5);

        // Step 4: Generate AI reasoning (batched)
        const withReasoning = await generateReasoning(ranked, effectiveQuery);

        // Step 5: Stream results one by one (staggered for visual effect)
        for (const result of withReasoning) {
          send({ type: 'result', data: result });
          await new Promise((r) => setTimeout(r, 180));
        }

        send({ type: 'done', data: { searchTimeMs: Date.now() - startTime } });
      } catch (err) {
        send({ type: 'error', data: String(err) });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
