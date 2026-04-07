/**
 * Ranking Engine
 *
 * Scores each provider offer against the parsed intent using three factors:
 *   - budgetMatch  (40%): how well price fits the budget
 *   - relevance    (35%): keyword/feature overlap with query
 *   - quality      (25%): rating, review count, availability signals
 *
 * Returns the top N results with assigned badges and scores.
 */

import type { ParsedIntent, ProviderOffer, RankedResult } from './types';

const WEIGHTS = { budget: 0.40, relevance: 0.35, quality: 0.25 };

// ── Scoring helpers ────────────────────────────────────────────────────────

function scoreBudget(price: number, budget?: number): number {
  if (!budget) return 70; // neutral score when no budget given

  if (price <= budget) {
    // Slightly penalise very cheap items (could signal lower quality)
    const ratio = price / budget;
    if (ratio < 0.4) return 65;
    return Math.round(85 + ratio * 15); // 85–100
  } else {
    // Penalise over-budget proportionally
    const overBy = (price - budget) / budget;
    return Math.max(0, Math.round(100 - overBy * 120));
  }
}

function scoreRelevance(offer: ProviderOffer, intent: ParsedIntent): number {
  const queryTerms = [
    ...intent.keywords,
    ...intent.constraints,
    intent.category,
  ].map((t) => t.toLowerCase());

  const offerText = [
    offer.name,
    ...offer.features,
    offer.metadata?.brand ?? '',
    offer.metadata?.type ?? '',
    offer.metadata?.service ?? '',
    offer.metadata?.airline ?? '',
  ]
    .join(' ')
    .toLowerCase();

  if (queryTerms.length === 0) return 50;

  const matches = queryTerms.filter((term) => offerText.includes(term)).length;
  const ratio = matches / queryTerms.length;

  // Boost for exact name matches
  const nameMatch = queryTerms.some((t) => offer.name.toLowerCase().includes(t)) ? 15 : 0;

  return Math.min(100, Math.round(ratio * 85 + nameMatch));
}

function scoreQuality(offer: ProviderOffer): number {
  let score = 50;

  if (offer.rating) {
    score += ((offer.rating / 5) * 35);
  }

  if (offer.reviewCount) {
    // Log-scale review count bonus (max 15 points)
    const bonus = Math.min(15, Math.log10(offer.reviewCount) * 5);
    score += bonus;
  }

  // Availability signals
  if (offer.availability?.includes('In stock') || offer.availability?.includes('Available')) {
    score += 5;
  }
  if (offer.availability?.includes('Last') || offer.availability?.includes('Limited')) {
    score += 2; // slight urgency boost
  }

  return Math.min(100, Math.round(score));
}

// ── Badge assignment ───────────────────────────────────────────────────────

function assignBadge(
  result: Omit<RankedResult, 'badge'>,
  allResults: Omit<RankedResult, 'badge'>[],
): RankedResult['badge'] {
  if (result.rank === 1) return 'best-match';

  const lowestPrice = Math.min(...allResults.map((r) => r.offer.price));
  if (result.offer.price === lowestPrice) return 'best-value';

  const highestQuality = Math.max(...allResults.map((r) => r.matchFactors.quality));
  if (result.matchFactors.quality === highestQuality) return 'top-rated';

  if (result.offer.metadata?.deliveryDays === '1' || result.offer.metadata?.deliveryDays === '2') {
    return 'fastest-delivery';
  }

  return undefined;
}

// ── Main export ────────────────────────────────────────────────────────────

export function rankOffers(
  offers: ProviderOffer[],
  intent: ParsedIntent,
  topN = 5,
): RankedResult[] {
  const scored = offers.map((offer) => {
    const budgetMatch = scoreBudget(offer.price, intent.budget);
    const relevance = scoreRelevance(offer, intent);
    const quality = scoreQuality(offer);

    const score = Math.round(
      budgetMatch * WEIGHTS.budget +
      relevance * WEIGHTS.relevance +
      quality * WEIGHTS.quality,
    );

    return {
      offer,
      score,
      rank: 0, // assigned below
      reasoning: '', // filled by reasoning layer
      matchFactors: { budgetMatch, relevance, quality },
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Assign ranks and take top N
  const top = scored.slice(0, topN).map((r, i) => ({ ...r, rank: i + 1 }));

  // Assign badges
  return top.map((r) => ({ ...r, badge: assignBadge(r, top) }));
}
