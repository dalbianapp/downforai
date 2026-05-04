"use client";

import Link from "next/link";

interface HeroSectionProps {
  operational: number;
  degraded: number;
  outage: number;
  total: number;
}

export function HeroSection({ operational, degraded, outage, total }: HeroSectionProps) {
  const issues = degraded + outage;

  return (
    <div className="text-center py-6 mb-4">
      <h1 className="text-5xl font-extrabold mb-4" style={{ letterSpacing: '-3px', color: 'var(--text)' }}>
        Is your AI tool <span className="gradient-text">down</span>?
      </h1>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        API diagnostics for AI tools. Faster than status pages, cleaner than Reddit.
      </p>

      <div className="flex items-center justify-center gap-3 text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
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

      <nav className="flex items-center justify-center gap-4 text-[13px] flex-wrap" style={{ color: 'var(--text-secondary)' }}>
        <Link href="/incidents" style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#dc2626' }}>●</span> Latest AI incidents
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <Link href="/methodology" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>
          How we detect incidents
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <Link href="/#services" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>
          Browse 800+ services
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <Link href="/developers" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>
          Badges &amp; API
        </Link>
      </nav>
    </div>
  );
}
