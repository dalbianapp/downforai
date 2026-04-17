"use client";

import { useState } from "react";
import type { KnownFailurePattern } from "@/content/top-services/types";

interface Props {
  patterns: KnownFailurePattern[];
}

const SCOPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  global: { label: "Provider-wide", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  partial: { label: "Partial", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
  local: { label: "Your side", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
};

export default function ErrorSignaturesPanel({ patterns }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (patterns.length === 0) return null;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <h2
          style={{ fontSize: "15px", fontWeight: 700, color: "#171717", margin: 0 }}
        >
          Known error signatures
        </h2>
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}>
          Common failure patterns and how to diagnose them
        </p>
      </div>

      <div style={{ padding: "8px 0" }}>
        {patterns.map((p, i) => {
          const sc = SCOPE_CONFIG[p.scope] ?? SCOPE_CONFIG.partial;
          const isOpen = openIndex === i;

          return (
            <div
              key={i}
              style={{
                borderBottom: i < patterns.length - 1 ? "1px solid #f5f5f5" : "none",
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "14px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: sc.color,
                    background: sc.bg,
                    border: `1px solid ${sc.border}`,
                    borderRadius: "999px",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {sc.label}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#171717",
                      lineHeight: 1.4,
                    }}
                  >
                    {p.pattern}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                    {p.signal}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#9ca3af",
                    flexShrink: 0,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                    marginTop: "2px",
                  }}
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 20px 16px 20px",
                    marginLeft: "calc(12px + 68px)", // align with pattern text
                  }}
                >
                  <div
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "6px",
                      }}
                    >
                      Quick check
                    </div>
                    <div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>
                      {p.quickCheck}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
