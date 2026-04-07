/**
 * Provider aggregator — routes the parsed intent to the appropriate
 * category provider and returns all offers for ranking.
 */

import type { ParsedIntent, ProviderOffer } from '../types';
import { getElectronicsOffers } from './electronics';
import { getFlightOffers } from './flights';
import { getFreelanceOffers } from './freelance';

export interface ProviderResult {
  offers: ProviderOffer[];
  totalProviders: number;
}

export function fetchAllOffers(intent: ParsedIntent): ProviderResult {
  let offers: ProviderOffer[] = [];

  switch (intent.category) {
    case 'electronics':
      offers = getElectronicsOffers(intent);
      break;
    case 'flights':
      offers = getFlightOffers(intent);
      break;
    case 'freelance':
      offers = getFreelanceOffers(intent);
      break;
    default:
      // For general queries, try all categories and return a mix
      offers = [
        ...getElectronicsOffers(intent).slice(0, 3),
        ...getFreelanceOffers(intent).slice(0, 2),
      ];
  }

  // Count unique providers who "competed"
  const totalProviders = new Set(offers.map((o) => o.providerId)).size;

  return { offers, totalProviders };
}
