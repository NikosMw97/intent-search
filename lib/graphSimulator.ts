export type Category = 'electronics' | 'flights' | 'hotels' | 'cars' | 'restaurants' | 'freelance' | 'software' | 'general';

export interface GraphParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  category: Category;
  query: string;
  age: number;       // ms since spawn
  maxAge: number;    // ms
  size: number;      // base radius
  opacity: number;
}

export interface GraphStats {
  total: number;
  byCategory: Record<Category, number>;
  trending: { query: string; count: number }[];
  providerWins: { name: string; logo: string; wins: number }[];
}

// Visual config per category
export const CATEGORY_CONFIG: Record<Category, { color: string; label: string; clusterFrac: [number, number] }> = {
  electronics:  { color: '#a78bfa', label: 'Electronics',  clusterFrac: [0.22, 0.28] },
  flights:      { color: '#22d3ee', label: 'Flights',      clusterFrac: [0.62, 0.18] },
  hotels:       { color: '#fbbf24', label: 'Hotels',       clusterFrac: [0.78, 0.52] },
  cars:         { color: '#34d399', label: 'Cars',         clusterFrac: [0.50, 0.72] },
  restaurants:  { color: '#f87171', label: 'Restaurants',  clusterFrac: [0.25, 0.70] },
  freelance:    { color: '#c084fc', label: 'Freelance',    clusterFrac: [0.14, 0.52] },
  software:     { color: '#60a5fa', label: 'Software',     clusterFrac: [0.72, 0.32] },
  general:      { color: '#94a3b8', label: 'General',      clusterFrac: [0.50, 0.45] },
};

const SAMPLE_QUERIES: Record<Category, string[]> = {
  electronics:  ['MacBook Pro M3', 'iPhone 15', 'Sony WH-1000XM5', '4K Monitor', 'iPad Air'],
  flights:      ['Athens → London', 'NYC → LA', 'Paris → Tokyo', 'Berlin → Rome', 'Dubai → NYC'],
  hotels:       ['Paris 4-star hotel', 'Tokyo Airbnb', 'NYC luxury suite', 'Santorini villa'],
  cars:         ['Tesla Model 3', 'BMW M4 rental', 'Toyota Prius lease', 'Audi Q5'],
  restaurants:  ['Sushi near me', 'Best pizza NYC', 'Rooftop bar Athens', 'Vegan brunch'],
  freelance:    ['Logo designer', 'React developer', 'Video editor', 'SEO consultant'],
  software:     ['Figma Pro', 'GitHub Teams', 'Notion Business', 'Slack Pro plan'],
  general:      ['Gift for mom', 'Gym membership', 'Language lessons', 'Home cleaning'],
};

const PROVIDER_WINS = [
  { name: 'TechMart',    logo: '🛒', wins: 47 },
  { name: 'SkyFly',      logo: '✈️', wins: 38 },
  { name: 'LuxStay',     logo: '🏨', wins: 31 },
  { name: 'DriveNow',    logo: '🚗', wins: 24 },
  { name: 'TalentHub',   logo: '🎨', wins: 19 },
];

let _nextId = 1;

export function createParticle(canvasW: number, canvasH: number, category?: Category): GraphParticle {
  const cats = Object.keys(CATEGORY_CONFIG) as Category[];
  const cat = category ?? cats[Math.floor(Math.random() * (cats.length - 1))]; // exclude 'general' from random
  const cfg = CATEGORY_CONFIG[cat];

  // Spawn near cluster with spread
  const cx = cfg.clusterFrac[0] * canvasW;
  const cy = cfg.clusterFrac[1] * canvasH;
  const spread = Math.min(canvasW, canvasH) * 0.12;

  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * spread;
  const queries = SAMPLE_QUERIES[cat];

  return {
    id: _nextId++,
    x: cx + Math.cos(angle) * dist,
    y: cy + Math.sin(angle) * dist,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    category: cat,
    query: queries[Math.floor(Math.random() * queries.length)],
    age: 0,
    maxAge: 10000 + Math.random() * 4000, // 10–14s
    size: 4 + Math.random() * 3,
    opacity: 0,
  };
}

export function tickParticles(
  particles: GraphParticle[],
  dt: number,
  canvasW: number,
  canvasH: number,
): GraphParticle[] {
  return particles
    .map((p) => {
      const cfg = CATEGORY_CONFIG[p.category];
      const cx = cfg.clusterFrac[0] * canvasW;
      const cy = cfg.clusterFrac[1] * canvasH;

      // Drift toward cluster center
      const dx = cx - p.x;
      const dy = cy - p.y;
      const attract = 0.00008;

      const newVx = p.vx + dx * attract + (Math.random() - 0.5) * 0.05;
      const newVy = p.vy + dy * attract + (Math.random() - 0.5) * 0.05;

      // Dampen velocity
      const damp = 0.98;
      const vx = newVx * damp;
      const vy = newVy * damp;

      const newAge = p.age + dt;
      // Fade in over 500ms, fade out over last 1500ms
      let opacity = 1;
      if (newAge < 500) opacity = newAge / 500;
      else if (newAge > p.maxAge - 1500) opacity = Math.max(0, (p.maxAge - newAge) / 1500);

      return { ...p, x: p.x + vx, y: p.y + vy, vx, vy, age: newAge, opacity };
    })
    .filter((p) => p.age < p.maxAge);
}

export function buildStats(particles: GraphParticle[], allTimeTotal: number): GraphStats {
  const byCategory = {} as Record<Category, number>;
  (Object.keys(CATEGORY_CONFIG) as Category[]).forEach((c) => { byCategory[c] = 0; });
  particles.forEach((p) => { byCategory[p.category]++; });

  // Build trending from particles
  const counts: Record<string, number> = {};
  particles.forEach((p) => { counts[p.query] = (counts[p.query] ?? 0) + 1; });
  const trending = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([query, count]) => ({ query, count }));

  return { total: allTimeTotal, byCategory, trending, providerWins: PROVIDER_WINS };
}
