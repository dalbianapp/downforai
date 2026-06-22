"use client";

import Link from "next/link";

const SIGNAL_CHIPS = [
  "OpenAI", "Anthropic", "Google Gemini", "Mistral", "ElevenLabs",
  "Character.AI", "Tencent Hunyuan", "Qdrant", "Weaviate", "Groq",
  "Perplexity", "Runway", "Replicate", "Together AI",
];

interface HeroSectionProps {
  operational: number;
  degraded: number;
  outage: number;
  limited: number;
  total: number;
  officialApiCount: number;
}

export function HeroSection({
  operational,
  degraded,
  outage,
  limited,
  total,
  officialApiCount,
}: HeroSectionProps) {
  const issues = degraded + outage;
  const uptimePct = total > 0 ? ((operational / total) * 100).toFixed(1) : "0.0";

  // 100-dot status sample — issues first for visual salience, then operational, then limited
  const nOut = Math.round((outage / total) * 100);
  const nDeg = Math.round((degraded / total) * 100);
  const nLim = Math.round((limited / total) * 100);
  const nOp = Math.max(0, 100 - nOut - nDeg - nLim);
  const rawSample: ("OPERATIONAL" | "DEGRADED" | "OUTAGE" | "LIMITED")[] = [
    ...Array(nOut).fill("OUTAGE" as const),
    ...Array(nDeg).fill("DEGRADED" as const),
    ...Array(nOp).fill("OPERATIONAL" as const),
    ...Array(nLim).fill("LIMITED" as const),
  ];
  while (rawSample.length < 100) rawSample.push("OPERATIONAL");
  const statusSample = rawSample.slice(0, 100);

  const dotColor = (s: string) => {
    if (s === "OPERATIONAL") return "#16A34A";
    if (s === "DEGRADED") return "#D97706";
    if (s === "OUTAGE") return "#DC2626";
    return "#64748B";
  };

  const COUNTER_ITEMS = [
    { count: operational, label: "operational", color: "#16A34A", dot: "#16A34A" },
    { count: issues, label: "issues", color: issues > 0 ? "#D97706" : "#94A3B8", dot: issues > 0 ? "#D97706" : "#CBD5E1" },
    { count: limited, label: "limited", color: "#64748B", dot: "#94A3B8" },
    { count: total, label: "tracked", color: "#0F172A", dot: null },
  ] as const;

  return (
    <div
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 65% -15%, rgba(79,70,229,0.07) 0%, rgba(6,182,212,0.04) 55%, transparent 100%), #F8FAFC",
        borderRadius: "20px",
        padding: "40px 32px 36px",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* ── COLONNE GAUCHE ── */}
        <div>
          {/* Badge pulsant indigo */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(79,70,229,0.07)",
              border: "1px solid rgba(79,70,229,0.18)",
              borderRadius: "999px",
              padding: "5px 14px 5px 10px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#4F46E5",
                display: "inline-block",
                animation: "pulse-dot 2.5s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#4F46E5",
                letterSpacing: "0.01em",
              }}
            >
              Monitoring 800+ AI services · niche tools most trackers miss
            </span>
          </div>

          {/* H1 — wording INCHANGÉ, style mis à jour */}
          <h1
            style={{
              fontSize: "clamp(26px, 3.2vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              color: "#0F172A",
              marginBottom: "16px",
            }}
          >
            AI service status monitoring for{" "}
            <span className="gradient-text mono">{total}</span>{" "}tools
          </h1>

          {/* Sous-titre — wording INCHANGÉ */}
          <p
            style={{
              fontSize: "14px",
              color: "#64748B",
              lineHeight: 1.65,
              marginBottom: "24px",
              maxWidth: "440px",
            }}
          >
            DownForAI tracks outages, status, response times, and community
            reports across major LLMs and 750+ niche AI services most trackers
            miss.
          </p>

          {/* Compteur 4 segments — mono + dots colorés */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "24px",
              gap: "2px 0",
            }}
          >
            {COUNTER_ITEMS.map(({ count, label, color, dot }, idx) => (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                {idx > 0 && (
                  <span style={{ color: "#CBD5E1", margin: "0 10px", fontSize: "14px" }}>·</span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {dot && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: dot,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span className="mono" style={{ fontSize: "15px", fontWeight: 700, color }}>
                    {count}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginLeft: "3px",
                    }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Nav links */}
          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#64748B",
            }}
          >
            <Link
              href="/incidents"
              style={{
                textDecoration: "none",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ color: "#DC2626", fontSize: "8px" }}>●</span> Latest AI incidents
            </Link>
            <span style={{ color: "#CBD5E1" }}>·</span>
            <Link href="/methodology" style={{ textDecoration: "none", color: "#64748B" }}>
              How we detect incidents
            </Link>
            <span style={{ color: "#CBD5E1" }}>·</span>
            <Link href="/#services" style={{ textDecoration: "none", color: "#64748B" }}>
              Browse {total} services
            </Link>
            <span style={{ color: "#CBD5E1" }}>·</span>
            <Link href="/developers" style={{ textDecoration: "none", color: "#64748B" }}>
              Badges &amp; API
            </Link>
          </nav>
        </div>

        {/* ── COLONNE DROITE — Signal Network Panel ── */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "20px",
            boxShadow:
              "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "14px",
            }}
          >
            <div>
              <div
                className="mono"
                style={{
                  fontSize: "52px",
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-3px",
                  lineHeight: 1,
                }}
              >
                {total}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: "3px",
                }}
              >
                AI services tracked
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: "22px", fontWeight: 700, color: "#16A34A" }}>
                {uptimePct}%
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 500 }}>
                up right now
              </div>
            </div>
          </div>

          {/* Signal grid 20×5 = 100 dots */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(20, 1fr)",
              gap: "3px",
              marginBottom: "12px",
            }}
          >
            {statusSample.map((s, i) => (
              <div
                key={i}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "2px",
                  backgroundColor: dotColor(s),
                  opacity: s === "LIMITED" ? 0.3 : 0.85,
                  animation:
                    (s === "OUTAGE" || s === "DEGRADED") && i < 5
                      ? "pulse-led 1.8s ease-in-out infinite"
                      : "none",
                }}
              />
            ))}
          </div>

          {/* Légende */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            {[
              { label: "Operational", color: "#16A34A", count: operational },
              { label: "Issues", color: "#D97706", count: issues },
              { label: "Limited", color: "#94A3B8", count: limited },
            ].map(({ label, color, count }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "2px",
                    background: color,
                    display: "inline-block",
                    opacity: 0.85,
                  }}
                />
                <span className="mono" style={{ fontSize: "11px", color: "#64748B", fontWeight: 500 }}>
                  {count} {label}
                </span>
              </div>
            ))}
          </div>

          {/* Footer stats */}
          <div
            style={{
              paddingTop: "10px",
              borderTop: "1px solid #F1F5F9",
              fontSize: "11px",
              color: "#94A3B8",
            }}
          >
            <span className="mono">{officialApiCount}</span> official status sources ·{" "}
            <span className="mono">750+</span> niche tools ·{" "}
            <span className="mono">~75m</span> cycle
          </div>

          {/* Service chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              marginTop: "10px",
            }}
          >
            {SIGNAL_CHIPS.map((chip) => (
              <span
                key={chip}
                style={{
                  fontSize: "10px",
                  padding: "2px 7px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "999px",
                  color: "#64748B",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
