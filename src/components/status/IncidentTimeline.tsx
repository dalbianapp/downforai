"use client";

import { IncidentSeverity } from "@prisma/client";
import { formatDate, formatDuration } from "@/lib/utils";

interface IncidentTimelineProps {
  incidents: Array<{
    id: string;
    title: string;
    status: string;
    severity: IncidentSeverity;
    startedAt: Date;
    resolvedAt: Date | null;
    summary: string | null;
    serviceName?: string;
  }>;
}

const severityConfig = {
  MINOR: { bg: "bg-yellow-900/20", border: "border-yellow-700", badge: "Minor" },
  MAJOR: { bg: "bg-orange-900/20", border: "border-orange-700", badge: "Major" },
  CRITICAL: { bg: "bg-red-900/20", border: "border-red-700", badge: "Critical" },
};

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No incidents in the past 30 days
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => {
        const config = severityConfig[incident.severity];
        const duration = incident.resolvedAt
          ? formatDuration(
              new Date(incident.resolvedAt).getTime() -
                new Date(incident.startedAt).getTime()
            )
          : null;

        return (
          <div
            key={incident.id}
            className={`rounded-lg border ${config.border} ${config.bg} p-4`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-100">
                    {config.badge}
                  </span>
                  {incident.serviceName && (
                    <span className="text-xs text-slate-400">
                      {incident.serviceName}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-slate-100">{incident.title}</h4>
              </div>
            </div>

            {incident.summary && (
              <p className="text-sm text-slate-300 mb-2">{incident.summary}</p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div>
                <span>{formatDate(new Date(incident.startedAt))}</span>
                {incident.resolvedAt && (
                  <>
                    <span className="mx-2">→</span>
                    <span>{formatDate(new Date(incident.resolvedAt))}</span>
                    {duration && <span className="ml-2">({duration})</span>}
                  </>
                )}
              </div>
              <span className="text-xs font-medium text-slate-400">
                {incident.status === "RESOLVED" ? "✓ Resolved" : "◐ Ongoing"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
