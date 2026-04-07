/**
 * Freelance providers — simulates competing platforms and freelancer profiles.
 */

import type { ParsedIntent, ProviderOffer } from '../types';

const CATALOG: ProviderOffer[] = [
  // ── Logo Design ──────────────────────────────────────────────────────────
  {
    id: 'fl-001', providerId: 'fiverr', providerName: 'Fiverr', providerLogo: '🟢',
    name: 'Professional Logo Design — Standard', price: 45, currency: 'EUR',
    features: ['3 concepts', '2 revisions', '48h delivery', 'Vector files', 'Commercial license'],
    link: '#', rating: 4.8, reviewCount: 3241, imageEmoji: '🎨',
    availability: 'Available now',
    metadata: { service: 'logo design', deliveryDays: '2', platform: 'Fiverr' },
  },
  {
    id: 'fl-002', providerId: 'upwork', providerName: 'Upwork', providerLogo: '🟩',
    name: 'Brand Identity + Logo Design', price: 85, currency: 'EUR',
    features: ['5 concepts', 'Unlimited revisions', 'Brand guidelines', 'All file formats', 'Satisfaction guarantee'],
    link: '#', rating: 4.9, reviewCount: 892, imageEmoji: '🎨',
    availability: 'Available now',
    metadata: { service: 'logo design', deliveryDays: '5', platform: 'Upwork' },
  },
  {
    id: 'fl-003', providerId: '99designs', providerName: '99designs', providerLogo: '🔷',
    name: 'Logo Design Contest — 30+ designers', price: 299, currency: 'EUR',
    features: ['30+ unique concepts', 'Money-back guarantee', 'Full IP ownership', 'Designer communication', 'Vectorised'],
    link: '#', rating: 4.7, reviewCount: 12400, imageEmoji: '🎨',
    availability: 'Launch in minutes',
    metadata: { service: 'logo design', deliveryDays: '7', platform: '99designs' },
  },
  {
    id: 'fl-004', providerId: 'fiverr', providerName: 'Fiverr Pro', providerLogo: '🟢',
    name: 'Logo Design by Verified Pro', price: 149, currency: 'EUR',
    features: ['Fiverr Pro verified', '5 concepts', 'Unlimited revisions', 'Brand kit included', '5-day delivery'],
    link: '#', rating: 5.0, reviewCount: 445, imageEmoji: '🎨',
    availability: 'Available',
    metadata: { service: 'logo design', deliveryDays: '5', platform: 'Fiverr Pro' },
  },
  // ── Web Development ──────────────────────────────────────────────────────
  {
    id: 'fl-005', providerId: 'upwork', providerName: 'Upwork', providerLogo: '🟩',
    name: 'React / Next.js Developer (hourly)', price: 55, currency: 'EUR',
    features: ['Senior developer', 'React + TypeScript', 'Next.js expert', 'Portfolio available', 'EU timezone'],
    link: '#', rating: 4.9, reviewCount: 234, imageEmoji: '💻',
    availability: 'Available this week',
    metadata: { service: 'web development', deliveryDays: 'ongoing', platform: 'Upwork', rateType: 'hourly' },
  },
  {
    id: 'fl-006', providerId: 'fiverr', providerName: 'Fiverr', providerLogo: '🟢',
    name: 'Landing Page Build (React)', price: 199, currency: 'EUR',
    features: ['Full landing page', 'Mobile responsive', 'Fast delivery', 'Source code included', 'CMS integration'],
    link: '#', rating: 4.7, reviewCount: 1102, imageEmoji: '🌐',
    availability: 'Available now',
    metadata: { service: 'web development', deliveryDays: '7', platform: 'Fiverr' },
  },
  // ── Content Writing ──────────────────────────────────────────────────────
  {
    id: 'fl-007', providerId: 'fiverr', providerName: 'Fiverr', providerLogo: '🟢',
    name: 'SEO Blog Articles (1000 words)', price: 25, currency: 'EUR',
    features: ['SEO optimised', 'Keyword research included', 'Plagiarism-free', '24h delivery', 'Native English'],
    link: '#', rating: 4.6, reviewCount: 4521, imageEmoji: '✍️',
    availability: 'Available',
    metadata: { service: 'content writing', deliveryDays: '1', platform: 'Fiverr' },
  },
  {
    id: 'fl-008', providerId: 'designcrowd', providerName: 'DesignCrowd', providerLogo: '🎭',
    name: 'Logo + Brand Package', price: 79, currency: 'EUR',
    features: ['Logo + business card', 'Social media kit', 'Font + colour guide', 'All formats', '100% satisfaction'],
    link: '#', rating: 4.5, reviewCount: 8760, imageEmoji: '🎨',
    availability: 'Start immediately',
    metadata: { service: 'logo design', deliveryDays: '5', platform: 'DesignCrowd' },
  },
];

export function getFreelanceOffers(intent: ParsedIntent): ProviderOffer[] {
  const lower = [...intent.keywords, ...intent.constraints].join(' ').toLowerCase();

  // Detect service type
  const wantsLogo = /logo|brand|identity|design/.test(lower);
  const wantsDev = /developer|website|landing|react|web dev|coding/.test(lower);
  const wantsContent = /content|blog|writing|article|copy/.test(lower);

  let offers = CATALOG;

  if (wantsLogo && !wantsDev && !wantsContent) {
    offers = CATALOG.filter((o) => o.metadata?.service === 'logo design');
  } else if (wantsDev) {
    offers = CATALOG.filter((o) => o.metadata?.service === 'web development');
  } else if (wantsContent) {
    offers = CATALOG.filter((o) => o.metadata?.service === 'content writing');
  }

  // Budget filtering with 30% ceiling
  if (intent.budget) {
    const ceiling = intent.budget * 1.3;
    const inBudget = offers.filter((o) => o.price <= ceiling);
    offers = inBudget.length >= 2 ? inBudget : offers;
  }

  return offers;
}
