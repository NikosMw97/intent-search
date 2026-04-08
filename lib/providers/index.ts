import type { ParsedIntent, ProviderOffer } from '../types';
import { getElectronicsOffers } from './electronics';
import { getFlightOffers } from './flights';
import { getFreelanceOffers } from './freelance';
import { getHotelOffers } from './hotels';
import { getCarOffers } from './cars';
import { getRestaurantOffers } from './restaurants';
import { getSoftwareOffers } from './software';

export interface ProviderResult {
  offers: ProviderOffer[];
  totalProviders: number;
}

export function fetchAllOffers(intent: ParsedIntent): ProviderResult {
  let offers: ProviderOffer[] = [];

  switch (intent.category) {
    case 'electronics':  offers = getElectronicsOffers(intent); break;
    case 'flights':      offers = getFlightOffers(intent);      break;
    case 'freelance':    offers = getFreelanceOffers(intent);   break;
    case 'hotels':       offers = getHotelOffers(intent);       break;
    case 'cars':         offers = getCarOffers(intent);         break;
    case 'restaurants':  offers = getRestaurantOffers(intent);  break;
    case 'software':     offers = getSoftwareOffers(intent);    break;
    default:
      offers = [
        ...getElectronicsOffers(intent).slice(0, 3),
        ...getFreelanceOffers(intent).slice(0, 2),
      ];
  }

  const totalProviders = new Set(offers.map((o) => o.providerId)).size;
  return { offers, totalProviders };
}
