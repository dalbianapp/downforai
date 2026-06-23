// Shared DB helper: fetch the latest-per-surface snapshots for a set of slugs and
// resolve each to its DISPLAYED status (current state + official-prime + community
// fold) via the single derivation. Used by the slug-based surfaces (single badge,
// stack badge, top-outages, reliability) so they all read the same source.

import { prisma } from "@/lib/db";
import { Prisma, type ServiceStatus } from "@prisma/client";
import { communitySignalOf } from "./resolveServiceStatus";
import { resolveDisplayStatus, type DisplayStatus, type SurfaceLatest } from "./deriveTechnicalStatus";

export interface ServiceDisplay {
  name: string;
  display: DisplayStatus;
}

interface RawRow {
  slug: string;
  name: string;
  monitoringCapability: string;
  communityStatus: ServiceStatus | null;
  communityConfidence: "CONFIRMED" | "PROBABLE" | null;
  communityReportsWindow: number | null;
  communitySignalAt: Date | null;
  status: ServiceStatus | null;
  officialStatus: string | null;
  observedAt: Date | null;
}

/**
 * Map<slug, { name, display }> for the given slugs. Slugs absent from the DB are
 * simply absent from the map (caller decides: 404, "unknown" badge, etc.).
 * One query — LATERAL latest observation per enabled surface.
 */
export async function getDisplayStatusMap(slugs: string[]): Promise<Map<string, ServiceDisplay>> {
  const result = new Map<string, ServiceDisplay>();
  const unique = [...new Set(slugs)];
  if (unique.length === 0) return result;

  const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
    SELECT
      s.slug,
      s.name,
      s."monitoringCapability"::text   AS "monitoringCapability",
      s."communityStatus"              AS "communityStatus",
      s."communityConfidence"          AS "communityConfidence",
      s."communityReportsWindow"       AS "communityReportsWindow",
      s."communitySignalAt"            AS "communitySignalAt",
      latest.status                    AS "status",
      latest."officialStatus"::text    AS "officialStatus",
      latest."observedAt"              AS "observedAt"
    FROM "Service" s
    LEFT JOIN "ServiceSurface" ss ON ss."serviceId" = s.id AND ss."isEnabled" = true
    LEFT JOIN LATERAL (
      SELECT o.status, o."officialStatus", o."observedAt"
      FROM "Observation" o
      WHERE o."serviceSurfaceId" = ss.id
      ORDER BY o."observedAt" DESC
      LIMIT 1
    ) latest ON true
    WHERE s.slug IN (${Prisma.join(unique)})
  `);

  // Group rows (one per service×surface) back into services.
  type Accum = { name: string; monitoringCapability: string; row: RawRow; surfaces: SurfaceLatest[] };
  const byService = new Map<string, Accum>();
  for (const row of rows) {
    let acc = byService.get(row.slug);
    if (!acc) {
      acc = { name: row.name, monitoringCapability: row.monitoringCapability, row, surfaces: [] };
      byService.set(row.slug, acc);
    }
    if (row.status !== null) {
      acc.surfaces.push({ status: row.status, officialStatus: row.officialStatus, observedAt: row.observedAt });
    }
  }

  const nowMs = Date.now();
  for (const [slug, acc] of byService) {
    const display = resolveDisplayStatus(
      acc.monitoringCapability,
      acc.surfaces,
      communitySignalOf(acc.row),
      nowMs,
    );
    result.set(slug, { name: acc.name, display });
  }

  return result;
}
