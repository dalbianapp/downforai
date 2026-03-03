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
  MINOR: { label: "Minor", dotColor: "#ca8a04", bgColor: "#fefce8", textColor: "#854d0e" },
  MAJOR: { label: "Major", dotColor: "#dc2626", bgColor: "#fef2f2", textColor: "#991b1b" },
  CRITICAL: { label: "Critical", dotColor: "#dc2626", bgColor: "#fef2f2", textColor: "#991b1b" },
};

export function RecentIncidents({ incidents }: RecentIncidentsProps) {
  if (incidents.length === 0) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e5e5',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#171717' }}>Recent Incidents</h3>
        <Link href="/incidents" style={{ fontSize: '13px', color: '#2563eb', fontWeight: 500 }}>
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
                border: '1px solid #f0f0f0',
                background: '#fafafa',
                transition: 'background 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fafafa'; }}
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
                  {/* Severity badge */}
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
                  {/* Service name */}
                  <span style={{ fontSize: '12px', color: '#a3a3a3' }}>
                    {incident.service.name}
                  </span>
                </div>

                {/* Title */}
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#171717', marginBottom: '2px' }}>
                  {incident.title}
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#a3a3a3' }}>
                  <span>{timeAgo}</span>
                  {incident.status === 'RESOLVED' && (
                    <span style={{ color: '#16a34a' }}>✓ Resolved</span>
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
