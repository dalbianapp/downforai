import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateWorstStatus } from "@/lib/utils";

export async function GET(_request: NextRequest) {
  const services = await prisma.service.findMany({
    include: {
      surfaces: {
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
    const allObservations = service.surfaces.flatMap((s) => s.observations);

    let status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN" = "UNKNOWN";
    if (allObservations.length > 0) {
      const statuses = allObservations.map((o) => o.status);
      status = calculateWorstStatus(statuses);
    }

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
