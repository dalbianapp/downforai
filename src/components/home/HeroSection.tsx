"use client";

import Link from "next/link";

interface HeroSectionProps {
  operational: number;
  degraded: number;
  outage: number;
  limited: number;
  total: number;
}

export function HeroSection({ operational, degraded, outage, limited, total }: HeroSectionProps) {
  const issues = degraded + outage;

  return (
    <div className="text-center py-6 mb-4">
      <h1 className="text-5xl font-extrabold mb-4" style={{ letterSpacing: '-3px', color: 'var(--text)' }}>
        AI service status monitoring for <span className="gradient-text">{total}</span> tools
      </h1>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        DownForAI tracks outages, status, response times, and community reports across major LLMs and 750+ niche AI services most trackers miss.
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
          <span className="font-bold" style={{ color: 'var(--text-dim)' }}>{limited}</span> monitoring-limited
        </span>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <span>
          <span className="font-bold">{total}</span> tracked
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
