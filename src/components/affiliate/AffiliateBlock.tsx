'use client';

import { usePathname } from 'next/navigation';

interface AffiliateBlockProps {
  serviceName: string;
  category?: string;
}

const MESSAGES: Record<string, { icon: string; title: string; desc: string; cta: string }> = {
  LLM: {
    icon: '🛡️',
    title: '{service} API not responding?',
    desc: 'ISP routing issues can block API endpoints. Bypass network restrictions for a stable connection.',
    cta: 'Fix my connection',
  },
  IMAGE_GEN: {
    icon: '💡',
    title: "Can't reach {service}?",
    desc: 'Some networks throttle AI services. Bypass the restriction to restore access.',
    cta: 'Unblock access',
  },
  VIDEO_GEN: {
    icon: '💡',
    title: '{service} timing out?',
    desc: 'Network throttling can cause timeouts on AI video services. Secure your connection.',
    cta: 'Fix timeout issues',
  },
  AUDIO: {
    icon: '💡',
    title: '{service} not loading?',
    desc: 'Network restrictions can block AI audio services. Bypass them instantly.',
    cta: 'Unblock access',
  },
  INFRA: {
    icon: '🛡️',
    title: '{service} unreachable?',
    desc: 'DNS or routing issues can block cloud infrastructure. A VPN can bypass these problems.',
    cta: 'Fix my connection',
  },
  DEV: {
    icon: '🛡️',
    title: '{service} API errors?',
    desc: 'Network-level blocks can cause API failures. Route around ISP restrictions.',
    cta: 'Bypass restrictions',
  },
  CODING: {
    icon: '🛡️',
    title: '{service} connection issues?',
    desc: 'Corporate firewalls and ISP throttling can block dev tools. Bypass restrictions instantly.',
    cta: 'Fix my connection',
  },
  SEARCH: {
    icon: '💡',
    title: "Can't access {service}?",
    desc: 'Some networks block AI search tools. Bypass the restriction in one click.',
    cta: 'Unblock access',
  },
  PRODUCTIVITY: {
    icon: '💡',
    title: '{service} not loading?',
    desc: 'Network restrictions can block productivity tools. Bypass them instantly.',
    cta: 'Unblock access',
  },
};

const DEFAULT_MSG = {
  icon: '💡',
  title: "Can't access {service}?",
  desc: 'If the service is unreachable from your network, a VPN can help bypass the block.',
  cta: 'Try NordVPN',
};

export default function AffiliateBlock({ serviceName, category }: AffiliateBlockProps) {
  const pathname = usePathname();

  const msg = (category && MESSAGES[category]) || DEFAULT_MSG;
  const title = msg.title.replace('{service}', serviceName);
  const desc = msg.desc.replace('{service}', serviceName);

  const handleClick = () => {
    fetch('/api/affiliate-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceName, page: pathname }),
    }).catch(() => {});
  };

  return (
    <aside style={{ margin: '16px 0' }}>
      <a
        href="https://www.tkqlhce.com/click-101711531-16968809"
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          padding: '16px',
          background: 'rgba(238, 242, 255, 0.8)',
          border: '1px solid #e0e7ff',
          borderLeft: '4px solid #4f46e5',
          borderRadius: '4px 16px 16px 4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          textDecoration: 'none',
        }}
      >
        <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>{msg.icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>{title}</p>
          <p style={{ fontSize: '13px', color: 'rgba(30, 27, 75, 0.7)', margin: '6px 0 0 0', lineHeight: 1.5 }}>{desc}</p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '12px',
            padding: '6px 14px',
            background: '#fff',
            color: '#4338ca',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '50px',
            border: '1px solid #e0e7ff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}>
            {msg.cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
          </div>
        </div>
      </a>
      <p style={{ fontSize: '10px', color: '#a1a1aa', textAlign: 'right', marginTop: '4px' }}>Sponsored · Affiliate link</p>
    </aside>
  );
}
