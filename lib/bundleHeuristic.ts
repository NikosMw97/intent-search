const BUNDLE_HEURISTICS = [
  /\btrip\b/i, /\bweekend\b/i, /\bvacation\b/i, /\bholiday\b/i,
  /\btravel\b/i, /\bgetaway\b/i, /\bvisit\b/i,
];

export function looksLikeBundle(query: string): boolean {
  return BUNDLE_HEURISTICS.some((r) => r.test(query));
}
