"use client";

interface HeroSectionProps {
  operational: number;
  degraded: number;
  outage: number;
}

export function HeroSection({ operational, degraded, outage }: HeroSectionProps) {
  const issues = degraded + outage;
  const total = operational + degraded + outage;

  return (
    <div className="text-center py-12 mb-12">
      <h1 className="text-5xl font-extrabold mb-6" style={{ letterSpacing: '-3px', color: 'var(--text)' }}>
        Is your AI <span className="gradient-text">down</span>?
      </h1>

      <div className="flex items-center justify-center gap-3 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        <span>
          <span className="font-bold" style={{ color: 'var(--operational)' }}>{operational}</span> operational
        </span>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <span>
          <span className="font-bold" style={{ color: issues > 0 ? 'var(--degraded)' : 'var(--text-secondary)' }}>{issues}</span> issues
        </span>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <span>
          <span className="font-bold">{total}</span> services
        </span>
      </div>
    </div>
  );
}
