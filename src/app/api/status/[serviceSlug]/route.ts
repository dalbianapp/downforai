import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ServiceStatus } from "@prisma/client";
import { resolveServiceStatus, communitySignalOf } from "@/lib/status/resolveServiceStatus";

export const revalidate = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serviceSlug: string }> }
) {
  const { serviceSlug } = await params;
  // Support both /api/status/openai and /api/status/openai.json
  const slug = serviceSlug.replace(/\.json$/, "");

  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      surfaces: {
        where: { isEnabled: true },
        include: {
          observations: {
            orderBy: { observedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const latestObs = service.surfaces
    .flatMap((s) => s.observations)
    .sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime())[0];

  // Single source of truth — same resolution as every surface (community signal
  // is canary-gated + freshness-gated; community-only caps at DEGRADED).
  const resolved = resolveServiceStatus({
    technicalStatus: (latestObs?.status ?? "UNKNOWN") as ServiceStatus,
    monitoringCapability: service.monitoringCapability,
    community: communitySignalOf(service),
  });

  return NextResponse.json(
    {
      service: service.name,
      slug: service.slug,
      status: resolved.status,
      status_source: resolved.source,
      status_confidence: resolved.confidence,
      community_reports_window: resolved.reportsInWindow,
      latency_ms: latestObs?.latencyMs ?? null,
      last_checked: latestObs?.observedAt.toISOString() ?? null,
      url: `https://downforai.com/${service.slug}`,
      badge: `https://downforai.com/api/badge/${service.slug}.svg`,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    }
  );
}
