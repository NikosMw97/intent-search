'use client';

interface Props {
  size?: number;
  showName?: boolean;
  showTagline?: boolean;
}

/**
 * intent — brand mark v2
 *
 * Mark: A four-pointed star on a dark squircle (iOS-style rounded square).
 * White star on dark background = high contrast, reads at any size.
 * The squircle signals "product/app", not just a decorative shape.
 * Star proportions: outer R = 11, inner r = 4 — sharp, not bloated.
 *
 * Wordmark: clean white "intent", weight 800, tight tracking.
 * Tagline: uppercase, wide tracking, low opacity.
 */
export default function Logo({ size = 36, showName = true, showTagline = false }: Props) {
  // Unique IDs so multiple Logo instances don't conflict
  const uid = `l${size}`;

  return (
    <div className="flex items-center gap-3 select-none">

      {/* ── Mark ──────────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* Squircle background: deep purple → deep navy */}
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#1e0b3a" />
            <stop offset="100%" stopColor="#060c1f" />
          </linearGradient>

          {/* Star: white → light violet (subtle, looks clean) */}
          <linearGradient id={`${uid}-star`} x1="20" y1="9" x2="20" y2="31" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#ffffff" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>

          {/* Soft glow behind the star */}
          <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="1 0 0 0 0.5
                      0 0 1 0 0.3
                      0 0 1 0 1
                      0 0 0 0.6 0" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Drop shadow under the squircle */}
          <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Squircle background */}
        <rect
          x="0.5" y="0.5" width="39" height="39" rx="10" ry="10"
          fill={`url(#${uid}-bg)`}
          filter={`url(#${uid}-shadow)`}
        />

        {/* Squircle border — very subtle white */}
        <rect
          x="0.5" y="0.5" width="39" height="39" rx="10" ry="10"
          fill="none"
          stroke="white" strokeOpacity="0.1" strokeWidth="0.75"
        />

        {/* Four-pointed star
            Center: (20, 20)
            Outer R=11 → top(20,9) right(31,20) bottom(20,31) left(9,20)
            Inner r=4 at 45° → (±2.83) → corners at (22.83,17.17) etc.
            Ratio R/r ≈ 2.75 — sharper than typical, reads well small */}
        <path
          d="M20 9 L22.83 17.17 L31 20 L22.83 22.83 L20 31 L17.17 22.83 L9 20 L17.17 17.17 Z"
          fill={`url(#${uid}-star)`}
          filter={`url(#${uid}-glow)`}
        />
      </svg>

      {/* ── Wordmark ──────────────────────────────────────── */}
      {showName && (
        <div className="flex flex-col leading-none gap-[3px]">
          <span
            className="text-white tracking-tight"
            style={{
              fontSize: size * 0.48,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            intent
          </span>
          {showTagline && (
            <span
              className="text-white/30 uppercase tracking-widest"
              style={{
                fontSize: size * 0.22,
                fontWeight: 500,
                letterSpacing: '0.12em',
                lineHeight: 1,
              }}
            >
              the end of search
            </span>
          )}
        </div>
      )}

    </div>
  );
}
