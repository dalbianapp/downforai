import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { communitySignalOf } from "@/lib/status/resolveServiceStatus";
import { resolveDisplayStatus } from "@/lib/status/deriveTechnicalStatus";

export async function GET(_request: NextRequest) {
  const services = await prisma.service.findMany({
    include: {
      surfaces: {
        where: { isEnabled: true },
        include: {
          observations: {
            where: {
              observedAt: {
                gte: new Date(Date.now() - 48 * 60 * 60 * 1000), // Last 48 hours (matches seed data window)
              },
            },
            orderBy: { observedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const formatted = services.map((service) => {
    // Displayed status = CURRENT state via the single site-wide derivation
    // (latest observation PER surface + official-prime + community fold).
    const latestPerSurface = service.surfaces
      .map((s) => s.observations[0])
      .filter((o): o is NonNullable<typeof o> => o != null)
      .map((o) => ({ status: o.status, officialStatus: o.officialStatus, observedAt: o.observedAt }));
    const status = resolveDisplayStatus(
      service.monitoringCapability,
      latestPerSurface,
      communitySignalOf(service),
    ).status;

    return {
      id: service.id,
      slug: service.slug,
      name: service.name,
      category: service.category,
      status,
    };
  });

  const counts = {
    operational: formatted.filter((s) => s.status === "OPERATIONAL").length,
    degraded: formatted.filter((s) => s.status === "DEGRADED").length,
    outage: formatted.filter((s) => s.status === "OUTAGE").length,
    unknown: formatted.filter((s) => s.status === "UNKNOWN").length,
  };

  return NextResponse.json({
    services: formatted,
    counts,
    total: services.length,
  });
}
