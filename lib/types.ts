// ─────────────────────────────────────────────────────────────────────────────
// Core types for the Intent-Based Internet MVP
// ─────────────────────────────────────────────────────────────────────────────

/** What the AI extracts from a natural-language user query */
export interface ParsedIntent {
  category: 'electronics' | 'flights' | 'freelance' | 'general';
  budget?: number;
  currency: string;          // ISO code, e.g. "EUR"
  constraints: string[];     // ["for programming", "lightweight", ...]
  keywords: string[];        // ["laptop", "macbook", ...]
  timeframe?: string;        // "this weekend", "next month", etc.
  origin?: string;           // for flights
  destination?: string;      // for flights
  raw: string;               // original user query
}

/** A single offer submitted by a provider */
export interface ProviderOffer {
  id: string;
  providerId: string;
  providerName: string;
  providerLogo: string;      // emoji or URL
  name: string;
  price: number;
  currency: string;
  features: string[];
  link: string;
  rating?: number;           // 0–5
  reviewCount?: number;
  imageEmoji?: string;       // product emoji for demo
  availability?: string;     // "In stock", "3 seats left", etc.
  metadata?: Record<string, string>; // extra fields (airline, delivery, etc.)
}

/** A provider offer after scoring and reasoning */
export interface RankedResult {
  offer: ProviderOffer;
  score: number;             // 0–100
  rank: number;              // 1 = best
  reasoning: string;         // AI-generated "why this matches"
  matchFactors: {
    budgetMatch: number;     // 0–100
    relevance: number;       // 0–100
    quality: number;         // 0–100
  };
  badge?: 'best-match' | 'best-value' | 'top-rated' | 'fastest-delivery';
}

/** Full API response */
export interface IntentResponse {
  intent: ParsedIntent;
  results: RankedResult[];
  totalProviders: number;    // how many providers "competed"
  totalOffers: number;       // total raw offers considered
  searchTimeMs: number;
}

/** API request body */
export interface IntentRequest {
  query: string;
}
