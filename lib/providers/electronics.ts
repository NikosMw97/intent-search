/**
 * Electronics providers — simulates competing retailers/marketplaces.
 * Each provider submits their best matching offers.
 */

import type { ParsedIntent, ProviderOffer } from '../types';

const CATALOG: ProviderOffer[] = [
  // ── Laptops ───────────────────────────────────────────────────────────────
  {
    id: 'e-001', providerId: 'techub', providerName: 'TecHub', providerLogo: '🛒',
    name: 'Apple MacBook Air M3 13"', price: 1149, currency: 'EUR',
    features: ['Apple M3 chip', '8GB RAM', '256GB SSD', '18h battery', 'macOS', 'fanless design'],
    link: '#', rating: 4.9, reviewCount: 2341, imageEmoji: '💻',
    availability: 'In stock', metadata: { brand: 'Apple', type: 'laptop', weight: '1.24kg' },
  },
  {
    id: 'e-002', providerId: 'mediamarkt', providerName: 'MediaMarkt', providerLogo: '🔴',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12', price: 1099, currency: 'EUR',
    features: ['Intel Core Ultra 7', '16GB RAM', '512GB SSD', 'business-grade', 'MIL-SPEC', 'keyboard backlit'],
    link: '#', rating: 4.7, reviewCount: 876, imageEmoji: '💻',
    availability: 'In stock', metadata: { brand: 'Lenovo', type: 'laptop', weight: '1.12kg' },
  },
  {
    id: 'e-003', providerId: 'skroutz', providerName: 'Skroutz', providerLogo: '🔶',
    name: 'ASUS ZenBook 14 OLED', price: 879, currency: 'EUR',
    features: ['AMD Ryzen 7 7730U', '16GB RAM', '512GB SSD', 'OLED display', '2.8K resolution', 'USB-C charging'],
    link: '#', rating: 4.6, reviewCount: 1102, imageEmoji: '💻',
    availability: 'In stock', metadata: { brand: 'ASUS', type: 'laptop', weight: '1.39kg' },
  },
  {
    id: 'e-004', providerId: 'amazon', providerName: 'Amazon', providerLogo: '📦',
    name: 'Dell XPS 15 9530', price: 1189, currency: 'EUR',
    features: ['Intel Core i7-13700H', '16GB RAM', '512GB SSD', '15.6" OLED', 'NVIDIA RTX 4060', 'creator-focused'],
    link: '#', rating: 4.8, reviewCount: 3204, imageEmoji: '💻',
    availability: 'In stock', metadata: { brand: 'Dell', type: 'laptop', weight: '1.86kg' },
  },
  {
    id: 'e-005', providerId: 'kotsovolos', providerName: 'Kotsovolos', providerLogo: '🔵',
    name: 'HP Spectre x360 14"', price: 1049, currency: 'EUR',
    features: ['Intel Evo i7-1355U', '16GB RAM', '1TB SSD', '2-in-1 convertible', 'OLED touch', 'pen included'],
    link: '#', rating: 4.5, reviewCount: 654, imageEmoji: '💻',
    availability: 'Last 3 units', metadata: { brand: 'HP', type: 'laptop', weight: '1.36kg' },
  },
  {
    id: 'e-006', providerId: 'techub', providerName: 'TecHub', providerLogo: '🛒',
    name: 'Apple MacBook Pro 14" M3 Pro', price: 1999, currency: 'EUR',
    features: ['Apple M3 Pro chip', '18GB RAM', '512GB SSD', 'Liquid Retina XDR', 'ProRes video', '22h battery'],
    link: '#', rating: 5.0, reviewCount: 1892, imageEmoji: '💻',
    availability: 'In stock', metadata: { brand: 'Apple', type: 'laptop', weight: '1.61kg' },
  },
  // ── Phones ────────────────────────────────────────────────────────────────
  {
    id: 'e-007', providerId: 'mediamarkt', providerName: 'MediaMarkt', providerLogo: '🔴',
    name: 'Samsung Galaxy S24+', price: 749, currency: 'EUR',
    features: ['Snapdragon 8 Gen 3', '12GB RAM', '256GB', '6.7" Dynamic AMOLED', '50MP camera', '5000mAh'],
    link: '#', rating: 4.7, reviewCount: 5621, imageEmoji: '📱',
    availability: 'In stock', metadata: { brand: 'Samsung', type: 'phone' },
  },
  {
    id: 'e-008', providerId: 'skroutz', providerName: 'Skroutz', providerLogo: '🔶',
    name: 'Apple iPhone 15 Pro', price: 1099, currency: 'EUR',
    features: ['A17 Pro chip', '256GB', '6.1" Super Retina XDR', 'titanium frame', '48MP camera', 'USB-C'],
    link: '#', rating: 4.9, reviewCount: 7823, imageEmoji: '📱',
    availability: 'In stock', metadata: { brand: 'Apple', type: 'phone' },
  },
  {
    id: 'e-009', providerId: 'amazon', providerName: 'Amazon', providerLogo: '📦',
    name: 'Google Pixel 8a', price: 549, currency: 'EUR',
    features: ['Google Tensor G3', '8GB RAM', '128GB', 'OLED 120Hz', '64MP camera', '7 years updates'],
    link: '#', rating: 4.6, reviewCount: 2110, imageEmoji: '📱',
    availability: 'In stock', metadata: { brand: 'Google', type: 'phone' },
  },
  {
    id: 'e-010', providerId: 'kotsovolos', providerName: 'Kotsovolos', providerLogo: '🔵',
    name: 'OnePlus 12 5G', price: 699, currency: 'EUR',
    features: ['Snapdragon 8 Gen 3', '12GB RAM', '256GB', '6.82" LTPO AMOLED', '100W charging', 'Hasselblad camera'],
    link: '#', rating: 4.5, reviewCount: 987, imageEmoji: '📱',
    availability: 'In stock', metadata: { brand: 'OnePlus', type: 'phone' },
  },
  {
    id: 'e-011', providerId: 'techub', providerName: 'TecHub', providerLogo: '🛒',
    name: 'Xiaomi 14 Ultra', price: 1199, currency: 'EUR',
    features: ['Snapdragon 8 Gen 3', '16GB RAM', '512GB', 'Leica camera', '1" sensor', '90W wireless'],
    link: '#', rating: 4.7, reviewCount: 1204, imageEmoji: '📱',
    availability: 'Limited stock', metadata: { brand: 'Xiaomi', type: 'phone' },
  },
  {
    id: 'e-012', providerId: 'mediamarkt', providerName: 'MediaMarkt', providerLogo: '🔴',
    name: 'Samsung Galaxy A55 5G', price: 399, currency: 'EUR',
    features: ['Exynos 1480', '8GB RAM', '128GB', '6.6" Super AMOLED', 'IP67 water-resistant', '5000mAh'],
    link: '#', rating: 4.4, reviewCount: 3402, imageEmoji: '📱',
    availability: 'In stock', metadata: { brand: 'Samsung', type: 'phone' },
  },
];

/**
 * Returns all catalog entries matching the parsed intent.
 * Filtering is intentionally permissive — the ranking engine does the heavy lifting.
 */
export function getElectronicsOffers(intent: ParsedIntent): ProviderOffer[] {
  const lower = [...intent.keywords, ...intent.constraints].join(' ').toLowerCase();

  // Detect product type from query
  const wantsPhone = /phone|mobile|smartphone|iphone|samsung|pixel|android/.test(lower);
  const wantsLaptop = /laptop|notebook|macbook|computer|pc|programming|coding|developer/.test(lower);

  let offers = CATALOG;

  if (wantsPhone && !wantsLaptop) {
    offers = CATALOG.filter((o) => o.metadata?.type === 'phone');
  } else if (wantsLaptop && !wantsPhone) {
    offers = CATALOG.filter((o) => o.metadata?.type === 'laptop');
  }

  // If budget specified, include items within 30% over budget (ranking will penalise over-budget items)
  if (intent.budget) {
    const ceiling = intent.budget * 1.3;
    const inBudget = offers.filter((o) => o.price <= ceiling);
    // Always return at least some results
    offers = inBudget.length >= 3 ? inBudget : offers;
  }

  return offers;
}
