import type { ParsedIntent, ProviderOffer } from '../types';

const CATALOG: ProviderOffer[] = [
  // ── Project Management ──────────────────────────────────────────────────
  {
    id: 's-001', providerId: 'notion', providerName: 'Notion', providerLogo: '⬛',
    name: 'Notion Plus — All-in-one workspace', price: 10, currency: 'EUR',
    features: ['Unlimited pages', 'AI assistant', 'Databases', 'Team wikis', 'API access', '30-day history'],
    link: '#', rating: 4.7, reviewCount: 89200, imageEmoji: '📓',
    availability: 'Free trial available',
    metadata: { type: 'project_management', billing: 'per month/user', subcategory: 'workspace' },
  },
  {
    id: 's-002', providerId: 'linear', providerName: 'Linear', providerLogo: '🔷',
    name: 'Linear Business — Issue Tracker', price: 16, currency: 'EUR',
    features: ['Git integration', 'Roadmaps', 'Sprints', 'Analytics', 'Slack sync', 'SLA tracking'],
    link: '#', rating: 4.9, reviewCount: 23400, imageEmoji: '📋',
    availability: 'Free trial available',
    metadata: { type: 'project_management', billing: 'per month/user', subcategory: 'issue_tracking' },
  },
  {
    id: 's-003', providerId: 'monday', providerName: 'Monday.com', providerLogo: '🟣',
    name: 'Monday Pro — Team Management', price: 24, currency: 'EUR',
    features: ['Automations', 'Timeline', 'Dashboards', 'Forms', 'Integrations 200+', 'Guest access'],
    link: '#', rating: 4.5, reviewCount: 62100, imageEmoji: '📊',
    availability: 'Free trial available',
    metadata: { type: 'project_management', billing: 'per month/user', subcategory: 'team_management' },
  },
  // ── Design ──────────────────────────────────────────────────────────────
  {
    id: 's-004', providerId: 'figma', providerName: 'Figma', providerLogo: '🎨',
    name: 'Figma Professional — Design Tool', price: 15, currency: 'EUR',
    features: ['Unlimited files', 'Dev mode', 'Component libraries', 'Prototyping', 'Auto-layout', 'Plugins'],
    link: '#', rating: 4.9, reviewCount: 112000, imageEmoji: '🖌️',
    availability: 'Free starter plan available',
    metadata: { type: 'design', billing: 'per month/editor', subcategory: 'ui_design' },
  },
  {
    id: 's-005', providerId: 'canva', providerName: 'Canva', providerLogo: '🌈',
    name: 'Canva Pro — Visual Design', price: 13, currency: 'EUR',
    features: ['100M+ templates', 'Brand kit', 'Background remover', 'AI tools', 'Social scheduler', 'Team sharing'],
    link: '#', rating: 4.7, reviewCount: 245000, imageEmoji: '🎭',
    availability: 'Free plan available',
    metadata: { type: 'design', billing: 'per month', subcategory: 'graphic_design' },
  },
  // ── Communication ────────────────────────────────────────────────────────
  {
    id: 's-006', providerId: 'slack', providerName: 'Slack', providerLogo: '💬',
    name: 'Slack Pro — Team Communication', price: 8, currency: 'EUR',
    features: ['Unlimited history', 'Huddles', '10 apps', 'Screen share', 'Workflows', 'Guest channels'],
    link: '#', rating: 4.6, reviewCount: 178000, imageEmoji: '💬',
    availability: 'Free plan available',
    metadata: { type: 'communication', billing: 'per month/user', subcategory: 'messaging' },
  },
  // ── Analytics / Marketing ────────────────────────────────────────────────
  {
    id: 's-007', providerId: 'posthog', providerName: 'PostHog', providerLogo: '🦔',
    name: 'PostHog Scale — Product Analytics', price: 0, currency: 'EUR',
    features: ['Event tracking', 'Session replay', 'Feature flags', 'A/B testing', 'Open source', '1M events free'],
    link: '#', rating: 4.8, reviewCount: 14200, imageEmoji: '📈',
    availability: 'Free up to 1M events',
    metadata: { type: 'analytics', billing: 'usage-based', subcategory: 'product_analytics' },
  },
  {
    id: 's-008', providerId: 'vercel', providerName: 'Vercel', providerLogo: '▲',
    name: 'Vercel Pro — Frontend Deployment', price: 20, currency: 'EUR',
    features: ['Unlimited deployments', 'Edge network', 'Preview URLs', 'Analytics', 'Serverless functions', '1TB bandwidth'],
    link: '#', rating: 4.9, reviewCount: 67800, imageEmoji: '🚀',
    availability: 'Free hobby plan available',
    metadata: { type: 'devtools', billing: 'per month', subcategory: 'deployment' },
  },
];

export function getSoftwareOffers(intent: ParsedIntent): ProviderOffer[] {
  const lower = [...intent.keywords, ...intent.constraints].join(' ').toLowerCase();
  let offers = CATALOG;

  if (/design|figma|ui|ux|graphic/.test(lower)) {
    offers = CATALOG.filter((o) => o.metadata?.type === 'design');
  } else if (/project|task|manage|sprint|agile|kanban/.test(lower)) {
    offers = CATALOG.filter((o) => o.metadata?.type === 'project_management');
  } else if (/chat|message|communicate|slack/.test(lower)) {
    offers = CATALOG.filter((o) => o.metadata?.type === 'communication');
  } else if (/analytics|tracking|metrics/.test(lower)) {
    offers = CATALOG.filter((o) => o.metadata?.type === 'analytics');
  } else if (/deploy|hosting|frontend/.test(lower)) {
    offers = CATALOG.filter((o) => o.metadata?.type === 'devtools');
  }

  if (offers.length < 3) offers = CATALOG;

  if (intent.budget) {
    const inBudget = offers.filter((o) => o.price <= intent.budget!);
    offers = inBudget.length >= 2 ? inBudget : offers;
  }
  return offers;
}
