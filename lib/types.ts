// ─────────────────────────────────────────────────────────────────────────────
// Core types for the Intent-Based Internet MVP
// ─────────────────────────────────────────────────────────────────────────────

/** What the AI extracts from a natural-language user query */
export interface ParsedIntent {
  category: 'electronics' | 'flights' | 'freelance' | 'hotels' | 'cars' | 'restaurants' | 'software' | 'general';
  budget?: number;
  currency: string;
  constraints: string[];
  keywords: string[];
  timeframe?: string;
  origin?: string;
  destination?: string;
  raw: string;
}

/** A single offer submitted by a provider */
export interface ProviderOffer {
  id: string;
  providerId: string;
  providerName: string;
  providerLogo: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  link: string;
  rating?: number;
  reviewCount?: number;
  imageEmoji?: string;
  availability?: string;
  metadata?: Record<string, string>;
}

/** A provider offer after scoring and reasoning */
export interface RankedResult {
  offer: ProviderOffer;
  score: number;
  rank: number;
  reasoning: string;
  matchFactors: {
    budgetMatch: number;
    relevance: number;
    quality: number;
  };
  badge?: 'best-match' | 'best-value' | 'top-rated' | 'fastest-delivery';
}

/** Full API response (non-streaming) */
export interface IntentResponse {
  intent: ParsedIntent;
  results: RankedResult[];
  totalProviders: number;
  totalOffers: number;
  searchTimeMs: number;
}

/** Streaming event types emitted by POST /api/intent */
export type StreamEvent =
  | { type: 'intent';  data: ParsedIntent }
  | { type: 'stats';   data: { totalProviders: number; totalOffers: number } }
  | { type: 'result';  data: RankedResult }
  | { type: 'done';    data: { searchTimeMs: number } }
  | { type: 'error';   data: string };

/** API request body */
export interface IntentRequest {
  query: string;
  refinement?: string; // follow-up refinement on an existing search
}

/** One item in the user's search history */
export interface HistoryItem {
  id: string;
  query: string;
  category: ParsedIntent['category'];
  timestamp: number;
}

/** Client-side filter state */
export interface FilterState {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  providers: string[]; // empty = all
}

export const DEFAULT_FILTERS: FilterState = {
  minPrice: 0,
  maxPrice: Infinity,
  minRating: 0,
  providers: [],
};
