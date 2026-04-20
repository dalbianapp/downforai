import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cleanup] Starting at " + new Date().toISOString());

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Supprimer les observations de plus de 7 jours
    const deletedObs = await prisma.observation.deleteMany({
      where: { observedAt: { lt: sevenDaysAgo } },
    });

    // Supprimer les CommunityReport de plus de 90 jours (garder plus longtemps car contient les commentaires)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const deletedReports = await prisma.communityReport.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
        comment: null, // Ne supprimer que ceux sans commentaire
      },
    });

    // Résoudre les incidents OPEN de plus de 48h (probablement résolus mais pas détectés)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const resolvedIncidents = await prisma.incident.updateMany({
      where: {
        status: "OPEN",
        startedAt: { lt: twoDaysAgo },
        resolvedAt: null,
      },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    console.log(`[cleanup] Resolved ${resolvedIncidents.count} stale incidents`);
    console.log(`[cleanup] Deleted ${deletedObs.count} observations, ${deletedReports.count} community reports`);
    console.log("[cleanup] Done at " + new Date().toISOString());

    return NextResponse.json({
      ok: true,
      resolved: resolvedIncidents.count,
      deletedObservations: deletedObs.count,
      deletedReports: deletedReports.count,
    });
  } catch (error) {
    console.error("[cleanup] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
