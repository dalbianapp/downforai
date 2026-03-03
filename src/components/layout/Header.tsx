"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0" style={{ letterSpacing: '-1px' }}>
          <span className="font-extrabold text-lg" style={{ color: 'var(--text)' }}>
            Down
          </span>
          <span className="font-extrabold text-lg" style={{ color: 'var(--accent)' }}>
            For
          </span>
          <span className="font-extrabold text-lg" style={{ color: 'var(--text)' }}>
            AI
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/incidents"
            className="text-[13px] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Incidents
          </Link>
          <Link
            href="/report"
            className="text-[13px] transition-colors font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Report Issue
          </Link>
        </nav>
      </div>
    </header>
  );
}
