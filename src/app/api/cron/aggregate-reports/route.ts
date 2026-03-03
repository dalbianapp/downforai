import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CRON_SECRET = process.env.CRON_SECRET;

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${CRON_SECRET}`;
}

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "Server configuration error: CRON_SECRET not set" },
      { status: 500 }
    );
  }

  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // 1 seule requête : compter les reports par service sur 30 min
    const reportCounts = await prisma.communityReport.groupBy({
      by: ["serviceId"],
      where: {
        createdAt: { gte: thirtyMinutesAgo },
      },
      _count: { serviceId: true },
    });

    // Map pour accès rapide
    const countMap = new Map(
      reportCounts.map((r) => [r.serviceId, r._count.serviceId])
    );

    // 1 seule requête : tous les incidents ouverts source COMMUNITY_REPORTS
    const openIncidents = await prisma.incident.findMany({
      where: {
        status: { in: ["OPEN", "MONITORING"] },
        sourceBadge: "COMMUNITY_REPORTS",
      },
    });

    const incidentMap = new Map(
      openIncidents.map((i) => [i.serviceId, i])
    );

    let created = 0;
    let resolved = 0;

    // Créer des incidents pour les services avec >= 10 reports et pas d'incident ouvert
    const toCreate = [];
    for (const [serviceId, count] of countMap) {
      if (count >= 10 && !incidentMap.has(serviceId)) {
        toCreate.push({
          serviceId,
          title: "Community reports: Potential service issues detected",
          status: "OPEN" as const,
          severity: "MAJOR" as const,
          summary: `${count} community reports received in the last 30 minutes`,
          sourceBadge: "COMMUNITY_REPORTS" as const,
        });
      }
    }

    if (toCreate.length > 0) {
      await prisma.incident.createMany({ data: toCreate });
      created = toCreate.length;
    }

    // Résoudre les incidents pour les services avec < 3 reports
    const toResolve = [];
    for (const [serviceId, incident] of incidentMap) {
      const count = countMap.get(serviceId) || 0;
      if (count < 3) {
        toResolve.push(incident.id);
      }
    }

    if (toResolve.length > 0) {
      await prisma.incident.updateMany({
        where: { id: { in: toResolve } },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
      });
      resolved = toResolve.length;
    }

    return NextResponse.json({
      services_with_reports: countMap.size,
      incidents_created: created,
      incidents_resolved: resolved,
      open_incidents: openIncidents.length,
    });
  } catch (error) {
    console.error("Cron aggregate-reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
