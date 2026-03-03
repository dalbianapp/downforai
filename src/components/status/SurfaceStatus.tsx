"use client";

import { ServiceStatus } from "@prisma/client";
import { StatusBadge } from "./StatusBadge";
import { formatLatency } from "@/lib/utils";

interface SurfaceStatusType {
  displayName: string;
  status: ServiceStatus;
  latencyMs: number | null;
}

interface SurfaceStatusProps {
  surfaces: SurfaceStatusType[];
}

export function SurfaceStatus({ surfaces }: SurfaceStatusProps) {
  const sorted = [...surfaces].sort((a, b) => {
    const statusOrder = {
      OUTAGE: 0,
      DEGRADED: 1,
      UNKNOWN: 2,
      OPERATIONAL: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 font-semibold text-slate-300">
              Service
            </th>
            <th className="text-left py-3 px-4 font-semibold text-slate-300">
              Status
            </th>
            <th className="text-left py-3 px-4 font-semibold text-slate-300">
              Latency
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((surface) => (
            <tr
              key={surface.displayName}
              className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
            >
              <td className="py-3 px-4 text-slate-200">{surface.displayName}</td>
              <td className="py-3 px-4">
                <StatusBadge status={surface.status} size="sm" />
              </td>
              <td className="py-3 px-4 text-slate-300">
                {formatLatency(surface.latencyMs)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
