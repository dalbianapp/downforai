import { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "AI Service Incidents — Latest Outages & Issues | DownForAI",
  description:
    "Timeline of recent AI service incidents, outages, and degraded performance across 200+ AI services.",
  alternates: {
    canonical: "/incidents",
  },
};

export const revalidate = 60;

const severityConfig = {
  MINOR: { label: "Minor", bgColor: "#fefce8", textColor: "#854d0e", borderColor: "#fef9c3" },
  MAJOR: { label: "Major", bgColor: "#fef2f2", textColor: "#991b1b", borderColor: "#fde8e8" },
  CRITICAL: { label: "Critical", bgColor: "#fef2f2", textColor: "#7f1d1d", borderColor: "#fde8e8" },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(start: Date, end: Date | null): string {
  if (!end) return "Ongoing";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export default async function IncidentsPage() {
  const incidents = await prisma.incident.findMany({
    include: {
      service: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 30,
  });

  const open = incidents.filter((i) => i.status !== "RESOLVED");
  const resolved = incidents.filter((i) => i.status === "RESOLVED");

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#171717', letterSpacing: '-1.5px', marginBottom: '8px' }}>
          Incidents
        </h1>
        <p style={{ fontSize: '14px', color: '#a3a3a3' }}>
          Latest outages and issues affecting AI services
        </p>
      </div>

      {/* Active incidents */}
      {open.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            🔴 Active ({open.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {open.map((incident) => {
              const config = severityConfig[incident.severity];
              return (
                <div
                  key={incident.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fde8e8',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    borderLeft: '3px solid #dc2626',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: config.textColor, backgroundColor: config.bgColor, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {config.label}
                    </span>
                    <span style={{ fontSize: '12px', color: '#a3a3a3' }}>{incident.service.name}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#171717', marginBottom: '4px' }}>
                    {incident.title}
                  </div>
                  {incident.summary && (
                    <div style={{ fontSize: '13px', color: '#525252', marginBottom: '6px', lineHeight: 1.5 }}>
                      {incident.summary}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#a3a3a3' }}>
                    Started {formatDate(incident.startedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved incidents */}
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          ✓ Resolved ({resolved.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {resolved.map((incident) => {
            const config = severityConfig[incident.severity];
            return (
              <div
                key={incident.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '12px',
                  padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: config.textColor, backgroundColor: config.bgColor, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {config.label}
                  </span>
                  <span style={{ fontSize: '12px', color: '#a3a3a3' }}>{incident.service.name}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#171717', marginBottom: '4px' }}>
                  {incident.title}
                </div>
                {incident.summary && (
                  <div style={{ fontSize: '13px', color: '#525252', marginBottom: '6px', lineHeight: 1.5 }}>
                    {incident.summary}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#a3a3a3' }}>
                  <span>{formatDate(incident.startedAt)} → {incident.resolvedAt ? formatDate(incident.resolvedAt) : '—'}</span>
                  <span>({formatDuration(incident.startedAt, incident.resolvedAt)})</span>
                  <span style={{ color: '#16a34a', marginLeft: 'auto' }}>✓ Resolved</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
