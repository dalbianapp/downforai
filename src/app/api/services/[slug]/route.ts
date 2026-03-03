import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      surfaces: {
        include: {
          observations: {
            orderBy: { observedAt: "desc" },
            take: 192 * 2,
          },
        },
      },
      incidents: {
        where: {
          status: {
            in: ["OPEN", "MONITORING", "RESOLVED"],
          },
        },
        orderBy: { startedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Get latest observation for each surface
  const surfaceStatuses = service.surfaces.map((surface) => {
    const latestObs = surface.observations[0];
    return {
      displayName: surface.displayName,
      status: latestObs?.status || "UNKNOWN",
      latencyMs: latestObs?.latencyMs || null,
      observedAt: latestObs?.observedAt || new Date(),
    };
  });

  // Get community reports count for last 24h
  const reportsCount24h = await prisma.communityReport.count({
    where: {
      serviceId: service.id,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  return NextResponse.json({
    id: service.id,
    slug: service.slug,
    name: service.name,
    category: service.category,
    description: service.description,
    websiteUrl: service.websiteUrl,
    surfaces: service.surfaces,
    surfaceStatuses,
    incidents: service.incidents,
    reportsCount24h,
    observations: service.surfaces.flatMap((s) =>
      s.observations.map((o) => ({
        ...o,
        displayName: s.displayName,
      }))
    ),
  });
}
