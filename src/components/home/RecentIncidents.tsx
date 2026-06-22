"use client";

import Link from "next/link";
import { IncidentStatus, IncidentSeverity } from "@prisma/client";
import { formatDate } from "@/lib/utils";

interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startedAt: Date;
  resolvedAt: Date | null;
  summary: string | null;
  service: {
    name: string;
  };
}

interface RecentIncidentsProps {
  incidents: Incident[];
}

const severityConfig = {
  MINOR: { label: "Minor", dotColor: "#D97706", bgColor: "#fefce8", textColor: "#854d0e" },
  MAJOR: { label: "Major", dotColor: "#DC2626", bgColor: "#fef2f2", textColor: "#991b1b" },
  CRITICAL: { label: "Critical", dotColor: "#DC2626", bgColor: "#fef2f2", textColor: "#991b1b" },
};

export function RecentIncidents({ incidents }: RecentIncidentsProps) {
  if (incidents.length === 0) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Recent Incidents</h3>
        <Link href="/incidents" style={{ fontSize: '13px', color: '#4F46E5', fontWeight: 500, textDecoration: 'none' }}>
          View all →
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {incidents.map((incident) => {
          const config = severityConfig[incident.severity];
          const timeAgo = formatDate(new Date(incident.startedAt));

          return (
            <div
              key={incident.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #F1F5F9',
                background: '#F8FAFC',
                transition: 'background 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            >
              {/* Severity dot */}
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: config.dotColor,
                  marginTop: '6px',
                  flexShrink: 0,
                }}
              />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: config.textColor,
                      backgroundColor: config.bgColor,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {config.label}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {incident.service.name}
                  </span>
                </div>

                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '2px' }}>
                  {incident.title}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#94A3B8' }}>
                  <span>{timeAgo}</span>
                  {incident.status === 'RESOLVED' && (
                    <span style={{ color: '#16A34A' }}>✓ Resolved</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
