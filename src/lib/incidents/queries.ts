import { prisma } from "@/lib/db";
import type {
  PublishableIncident,
  IncidentMonthSummary,
  IncidentServiceSummary,
  IncidentArchiveStats,
  IncidentStatus,
  IncidentSeverity,
} from "./types";
import { MIN_DURATION_MINUTES_FOR_PUBLIC, EXCLUDED_SERVICE_SLUGS, MAX_OPEN_INCIDENT_HOURS } from "./filters";
import { generateEnrichedDescription } from "./enrichment";

// Safe SQL literal for the excluded slugs IN clause
function excludedSlugsSql(): string {
  if (EXCLUDED_SERVICE_SLUGS.length === 0) return "''";
  return EXCLUDED_SERVICE_SLUGS.map((s) => `'${s.replace(/'/g, "''")}'`).join(",");
}

// Base WHERE clause shared across queries (filters publishable incidents)
const BASE_WHERE = `
  i.severity IN ('MAJOR','CRITICAL')
  AND s.slug NOT IN (${excludedSlugsSql()})
  AND (i."resolvedAt" IS NULL OR EXTRACT(EPOCH FROM (i."resolvedAt" - i."startedAt")) / 60 >= ${MIN_DURATION_MINUTES_FOR_PUBLIC})
  AND (i.status = 'RESOLVED' OR EXTRACT(EPOCH FROM (NOW() - i."startedAt")) / 3600 <= ${MAX_OPEN_INCIDENT_HOURS})
`;

type RawIncidentRow = {
  id: string;
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  serviceCategory: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startedAt: Date;
  resolvedAt: Date | null;
  summary: string | null;
  sourceBadge: string;
};

function toPublishableIncident(row: RawIncidentRow): PublishableIncident {
  const durationMinutes = row.resolvedAt
    ? Math.round((row.resolvedAt.getTime() - row.startedAt.getTime()) / 60000)
    : null;

  const enrichedDescription = generateEnrichedDescription({
    serviceName: row.serviceName,
    severity: row.severity,
    status: row.status,
    startedAt: row.startedAt,
    resolvedAt: row.resolvedAt,
    durationMinutes,
    sourceBadge: row.sourceBadge,
  });

  const monthKey = row.startedAt.toISOString().slice(0, 7);
  const dayKey = row.startedAt.toISOString().slice(0, 10);

  const hoursSinceStart = (Date.now() - row.startedAt.getTime()) / 3600000;
  let displayStatus: "OPEN" | "STALE" | "RESOLVED";
  if (row.status === "RESOLVED") {
    displayStatus = "RESOLVED";
  } else if (hoursSinceStart > 24) {
    displayStatus = "STALE";
  } else {
    displayStatus = "OPEN";
  }

  return {
    ...row,
    durationMinutes,
    enrichedDescription,
    monthKey,
    dayKey,
    displayStatus,
  };
}

// --- Main archive listing (paginated) ---
export async function getPublishableIncidents(input: {
  page?: number;
  perPage?: number;
  monthKey?: string;
  serviceSlug?: string;
  status?: IncidentStatus;
}): Promise<{ incidents: PublishableIncident[]; total: number }> {
  const page = input.page ?? 1;
  const perPage = Math.min(input.perPage ?? 20, 50);
  const offset = (page - 1) * perPage;

  const conditions: string[] = [BASE_WHERE.trim()];

  if (input.monthKey) {
    const [year, month] = input.monthKey.split("-").map(Number);
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));
    conditions.push(`i."startedAt" >= '${monthStart.toISOString()}'`);
    conditions.push(`i."startedAt" < '${monthEnd.toISOString()}'`);
  }

  if (input.serviceSlug) {
    conditions.push(`s.slug = '${input.serviceSlug.replace(/'/g, "''")}'`);
  }

  if (input.status) {
    conditions.push(`i.status = '${input.status}'`);
  }

  const whereClause = conditions.join(" AND ");

  const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*) AS count
     FROM "Incident" i
     INNER JOIN "Service" s ON s.id = i."serviceId"
     WHERE ${whereClause}`
  );
  const total = Number(countResult[0]?.count ?? 0);

  const rows = await prisma.$queryRawUnsafe<RawIncidentRow[]>(
    `SELECT
       i.id, i."serviceId", i.title, i.status, i.severity,
       i."startedAt", i."resolvedAt", i.summary, i."sourceBadge",
       s.slug AS "serviceSlug",
       s.name AS "serviceName",
       s.category::text AS "serviceCategory"
     FROM "Incident" i
     INNER JOIN "Service" s ON s.id = i."serviceId"
     WHERE ${whereClause}
     ORDER BY i."startedAt" DESC
     LIMIT ${perPage} OFFSET ${offset}`
  );

  return {
    incidents: rows.map(toPublishableIncident),
    total,
  };
}

// --- Monthly summaries for archive index ---
export async function getIncidentMonthSummaries(): Promise<IncidentMonthSummary[]> {
  const rows = await prisma.$queryRawUnsafe<Array<{
    monthKey: string;
    incidentCount: bigint;
    resolvedCount: bigint;
    openCount: bigint;
    criticalCount: bigint;
    majorCount: bigint;
  }>>(
    `SELECT
       TO_CHAR(i."startedAt", 'YYYY-MM') AS "monthKey",
       COUNT(*) AS "incidentCount",
       COUNT(*) FILTER (WHERE i.status = 'RESOLVED') AS "resolvedCount",
       COUNT(*) FILTER (WHERE i.status = 'OPEN') AS "openCount",
       COUNT(*) FILTER (WHERE i.severity = 'CRITICAL') AS "criticalCount",
       COUNT(*) FILTER (WHERE i.severity = 'MAJOR') AS "majorCount"
     FROM "Incident" i
     INNER JOIN "Service" s ON s.id = i."serviceId"
     WHERE ${BASE_WHERE}
     GROUP BY TO_CHAR(i."startedAt", 'YYYY-MM')
     ORDER BY "monthKey" DESC`
  );

  const summaries: IncidentMonthSummary[] = [];

  for (const row of rows) {
    const topServicesRows = await prisma.$queryRawUnsafe<Array<{
      slug: string;
      name: string;
      count: bigint;
    }>>(
      `SELECT s.slug, s.name, COUNT(*) AS count
       FROM "Incident" i
       INNER JOIN "Service" s ON s.id = i."serviceId"
       WHERE TO_CHAR(i."startedAt", 'YYYY-MM') = '${row.monthKey}'
         AND i.severity IN ('MAJOR','CRITICAL')
         AND s.slug NOT IN (${excludedSlugsSql()})
       GROUP BY s.slug, s.name
       ORDER BY count DESC
       LIMIT 5`
    );

    const displayMonth = new Date(`${row.monthKey}-01T00:00:00Z`).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

    summaries.push({
      monthKey: row.monthKey,
      displayMonth,
      incidentCount: Number(row.incidentCount),
      resolvedCount: Number(row.resolvedCount),
      openCount: Number(row.openCount),
      criticalCount: Number(row.criticalCount),
      majorCount: Number(row.majorCount),
      topServices: topServicesRows.map((s) => ({
        slug: s.slug,
        name: s.name,
        count: Number(s.count),
      })),
    });
  }

  return summaries;
}

// --- Service-level summary ---
export async function getIncidentServiceSummaries(limit = 30): Promise<IncidentServiceSummary[]> {
  const rows = await prisma.$queryRawUnsafe<Array<{
    serviceSlug: string;
    serviceName: string;
    serviceCategory: string;
    totalIncidents: bigint;
    resolvedIncidents: bigint;
    openIncidents: bigint;
    avgDurationMinutes: number | null;
    lastIncidentAt: Date | null;
    firstIncidentAt: Date | null;
  }>>(
    `SELECT
       s.slug AS "serviceSlug",
       s.name AS "serviceName",
       s.category::text AS "serviceCategory",
       COUNT(i.id) AS "totalIncidents",
       COUNT(i.id) FILTER (WHERE i.status = 'RESOLVED') AS "resolvedIncidents",
       COUNT(i.id) FILTER (WHERE i.status = 'OPEN') AS "openIncidents",
       AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."startedAt")) / 60) AS "avgDurationMinutes",
       MAX(i."startedAt") AS "lastIncidentAt",
       MIN(i."startedAt") AS "firstIncidentAt"
     FROM "Service" s
     INNER JOIN "Incident" i ON i."serviceId" = s.id
     WHERE ${BASE_WHERE}
     GROUP BY s.slug, s.name, s.category
     HAVING COUNT(i.id) >= 1
     ORDER BY "totalIncidents" DESC, "lastIncidentAt" DESC
     LIMIT ${limit}`
  );

  return rows.map((r) => ({
    serviceSlug: r.serviceSlug,
    serviceName: r.serviceName,
    serviceCategory: r.serviceCategory,
    totalIncidents: Number(r.totalIncidents),
    resolvedIncidents: Number(r.resolvedIncidents),
    openIncidents: Number(r.openIncidents),
    avgDurationMinutes: r.avgDurationMinutes ? Math.round(r.avgDurationMinutes) : null,
    lastIncidentAt: r.lastIncidentAt,
    firstIncidentAt: r.firstIncidentAt,
  }));
}

// --- Archive global stats ---
export async function getIncidentArchiveStats(): Promise<IncidentArchiveStats> {
  const result = await prisma.$queryRawUnsafe<Array<{
    totalIncidents: bigint;
    totalResolved: bigint;
    totalOpen: bigint;
    monthsCovered: bigint;
    servicesAffected: bigint;
    avgDurationMinutes: number | null;
  }>>(
    `SELECT
       COUNT(*) AS "totalIncidents",
       COUNT(*) FILTER (WHERE i.status = 'RESOLVED') AS "totalResolved",
       COUNT(*) FILTER (WHERE i.status = 'OPEN') AS "totalOpen",
       COUNT(DISTINCT TO_CHAR(i."startedAt", 'YYYY-MM')) AS "monthsCovered",
       COUNT(DISTINCT i."serviceId") AS "servicesAffected",
       AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."startedAt")) / 60) AS "avgDurationMinutes"
     FROM "Incident" i
     INNER JOIN "Service" s ON s.id = i."serviceId"
     WHERE ${BASE_WHERE}`
  );

  const row = result[0];
  return {
    totalIncidents: Number(row.totalIncidents),
    totalResolved: Number(row.totalResolved),
    totalOpen: Number(row.totalOpen),
    monthsCovered: Number(row.monthsCovered),
    servicesAffected: Number(row.servicesAffected),
    avgDurationMinutes: row.avgDurationMinutes ? Math.round(row.avgDurationMinutes) : null,
  };
}

// --- Single incident by ID ---
export async function getIncidentById(id: string): Promise<PublishableIncident | null> {
  const safeId = id.replace(/'/g, "''");
  const rows = await prisma.$queryRawUnsafe<RawIncidentRow[]>(
    `SELECT
       i.id, i."serviceId", i.title, i.status, i.severity,
       i."startedAt", i."resolvedAt", i.summary, i."sourceBadge",
       s.slug AS "serviceSlug",
       s.name AS "serviceName",
       s.category::text AS "serviceCategory"
     FROM "Incident" i
     INNER JOIN "Service" s ON s.id = i."serviceId"
     WHERE i.id = '${safeId}'
     LIMIT 1`
  );
  return rows[0] ? toPublishableIncident(rows[0]) : null;
}
