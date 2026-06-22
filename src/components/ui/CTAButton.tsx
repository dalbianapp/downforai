"use client";

export function CTAButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        padding: '10px 24px',
        background: '#4F46E5',
        color: '#ffffff',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#4338CA'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#4F46E5'; }}
    >
      {children}
    </a>
  );
}
