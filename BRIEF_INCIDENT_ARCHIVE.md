# BRIEF CLAUDE CODE — Archive Incidents + Methodology + Tagline Home

> **Objectif** : transformer `/incidents` d'une page rudimentaire en une vraie archive SEO-friendly, ajouter une page `/methodology` et refondre la tagline home. Envoyer des signaux forts à Google : "ce site est une source de référence, pas un annuaire".
>
> **Règles absolues** :
> - **NE PAS** modifier les routes `/[serviceSlug]`, ni le footer (sauf ajout ligne /methodology), ni les catégories
> - **NE PAS** casser l'existant (redirects 301, sitemap, noindex sur pages dérivées)
> - **NE PAS** augmenter la consommation Neon de manière significative (pas de `findMany` sans limit, pas de scan de table)
> - **FILTRER** les incidents pour ne pas publier du contenu dupliqué/flappy
> - **ENRICHIR** les descriptions d'incidents pour éviter le thin content
>
> **Tag git avant push** : `pre-incident-archive`
> **Branch** : `feature/incident-archive`

---

## CONTEXTE IMPORTANT (lire avant de coder)

### État actuel identifié
1. La route `/incidents` existe déjà mais est rudimentaire (30 items, pas de pagination, pas de filtres, sévérités mal mappées)
2. `/incidents` est déjà dans le sitemap et le footer
3. Le modèle Prisma `Incident` a seulement : `MINOR / MAJOR / CRITICAL` (pas HIGH/MEDIUM/LOW)
4. Le statut existe en `OPEN / MONITORING / RESOLVED` (pas INVESTIGATING)
5. `IncidentTimelinePanel.tsx` a des bugs : il référence des valeurs d'enum qui n'existent pas

### Problème critique à gérer
- **251 incidents en base** dont **85 sur jais-ai seul** (34% = flapping)
- **Titles et summaries auto-générés identiques** ("{service} experiencing issues")
- **Risque SEO majeur** : publier 251 pages avec le même texte = thin content, exactement ce qu'on vient de nettoyer

### Stratégie anti-thin-content
- **Filtrer** les incidents publiables (critères stricts)
- **Enrichir** les descriptions côté server avec la data factuelle (durée, surfaces, classification)
- **Dédupliquer** les incidents flappy sur même service sur même journée

---

## PHASE 0 — PRÉPARATION

```bash
git checkout main
git pull
git tag pre-incident-archive
git checkout -b feature/incident-archive
```

Vérifier que `IncidentTimelinePanel.tsx` existe et noter les bugs à corriger.

---

## PHASE 1 — CRÉER LA COUCHE DE DONNÉES INCIDENTS

### 1.1 Créer `src/lib/incidents/types.ts`

```typescript
export type IncidentStatus = "OPEN" | "MONITORING" | "RESOLVED";
export type IncidentSeverity = "MINOR" | "MAJOR" | "CRITICAL";

export type PublishableIncident = {
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
  durationMinutes: number | null;
  summary: string | null;
  sourceBadge: string;
  
  // Computed fields for enriched display
  enrichedDescription: string;
  monthKey: string; // "2026-04"
  dayKey: string;   // "2026-04-20"
};

export type IncidentMonthSummary = {
  monthKey: string;      // "2026-04"
  displayMonth: string;  // "April 2026"
  incidentCount: number;
  resolvedCount: number;
  openCount: number;
  criticalCount: number;
  majorCount: number;
  topServices: Array<{ slug: string; name: string; count: number }>;
};

export type IncidentServiceSummary = {
  serviceSlug: string;
  serviceName: string;
  serviceCategory: string;
  totalIncidents: number;
  resolvedIncidents: number;
  openIncidents: number;
  avgDurationMinutes: number | null;
  lastIncidentAt: Date | null;
  firstIncidentAt: Date | null;
};

export type IncidentArchiveStats = {
  totalIncidents: number;
  totalResolved: number;
  totalOpen: number;
  monthsCovered: number;
  servicesAffected: number;
  avgDurationMinutes: number | null;
};
```

### 1.2 Créer `src/lib/incidents/filters.ts`

**CRITIQUE** : ce fichier définit quels incidents sont "publishables". Sans ça, on risque de publier 251 pages identiques.

```typescript
import type { IncidentSeverity } from "./types";

/**
 * Filter criteria for PUBLIC incident archive.
 * Goal: avoid thin content, avoid flapping, avoid duplicate titles.
 */

export const PUBLISHABLE_SEVERITIES: IncidentSeverity[] = ["MAJOR", "CRITICAL"];

/**
 * Minimum duration (in minutes) for an incident to appear in public archive.
 * Shorter incidents are considered flapping/noise.
 */
export const MIN_DURATION_MINUTES_FOR_PUBLIC = 10;

/**
 * Maximum incidents per service per day in public archive.
 * Prevents "jais-ai" type services from flooding the archive.
 */
export const MAX_INCIDENTS_PER_SERVICE_PER_DAY = 2;

/**
 * Services to exclude from the public archive entirely.
 * These are services known to produce excessive noise or are being evaluated.
 */
export const EXCLUDED_SERVICE_SLUGS: string[] = [
  // Add services with > 20% of total incidents or known monitoring issues
  // Example: "jais-ai" if it's clearly flapping
];

/**
 * Check if an incident is publishable.
 */
export function isPublishableIncident(incident: {
  severity: string;
  startedAt: Date;
  resolvedAt: Date | null;
  serviceSlug: string;
}): boolean {
  // Exclude by service
  if (EXCLUDED_SERVICE_SLUGS.includes(incident.serviceSlug)) {
    return false;
  }

  // Severity filter
  if (!PUBLISHABLE_SEVERITIES.includes(incident.severity as IncidentSeverity)) {
    return false;
  }

  // Duration filter (resolved incidents only)
  if (incident.resolvedAt) {
    const durationMin = (incident.resolvedAt.getTime() - incident.startedAt.getTime()) / 60000;
    if (durationMin < MIN_DURATION_MINUTES_FOR_PUBLIC) {
      return false;
    }
  }

  return true;
}
```

### 1.3 Créer `src/lib/incidents/enrichment.ts`

**CRITIQUE** : génère des descriptions riches pour éviter le thin content.

```typescript
import type { IncidentSeverity, IncidentStatus } from "./types";

const SEVERITY_DESCRIPTORS: Record<IncidentSeverity, string> = {
  CRITICAL: "a critical service disruption",
  MAJOR: "a significant service issue",
  MINOR: "a minor anomaly",
};

const STATUS_DESCRIPTORS: Record<IncidentStatus, string> = {
  OPEN: "is currently being investigated",
  MONITORING: "is being monitored after initial recovery",
  RESOLVED: "has been resolved",
};

/**
 * Generate an enriched, unique description for an incident.
 * Avoids publishing 251 identical "{service} experiencing issues" summaries.
 */
export function generateEnrichedDescription(input: {
  serviceName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: Date;
  resolvedAt: Date | null;
  durationMinutes: number | null;
  sourceBadge: string;
}): string {
  const { serviceName, severity, status, startedAt, resolvedAt, durationMinutes, sourceBadge } = input;

  const severityDesc = SEVERITY_DESCRIPTORS[severity];
  const statusDesc = STATUS_DESCRIPTORS[status];

  const startDate = startedAt.toISOString().split("T")[0];
  const startTime = startedAt.toISOString().split("T")[1].slice(0, 5) + " UTC";

  let description = `On ${startDate} at ${startTime}, DownForAI monitoring detected ${severityDesc} affecting ${serviceName}. `;

  if (resolvedAt && durationMinutes !== null) {
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    description += `The incident ${statusDesc} after approximately ${durationStr}. `;
  } else {
    description += `The incident ${statusDesc}. `;
  }

  // Source context
  const sourceContext: Record<string, string> = {
    LIVE_MONITORING: "This incident was detected by our automated probes running every 2-5 minutes from multiple locations.",
    STATUS_PAGE_SYNC: "This incident was surfaced through synchronization with the provider's official status page.",
    COMMUNITY_REPORTS: "This incident was identified based on a significant volume of user reports.",
  };

  description += sourceContext[sourceBadge] || "";

  return description;
}

/**
 * Generate a human-readable title for an incident.
 * Replaces generic "{service} experiencing issues" with something richer.
 */
export function generateEnrichedTitle(input: {
  serviceName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: Date;
  durationMinutes: number | null;
}): string {
  const { serviceName, severity, status, startedAt } = input;

  const severityLabel = {
    CRITICAL: "critical disruption",
    MAJOR: "major issue",
    MINOR: "minor anomaly",
  }[severity];

  const month = startedAt.toLocaleString("en-US", { month: "long" });
  const day = startedAt.getUTCDate();

  if (status === "OPEN") {
    return `${serviceName} — ongoing ${severityLabel} (since ${month} ${day})`;
  }

  return `${serviceName} — ${severityLabel} on ${month} ${day}`;
}
```

### 1.4 Créer `src/lib/incidents/queries.ts`

**ATTENTION PRISMA** : utiliser `$queryRaw` avec filtrage SQL pour éviter de scanner toute la table. Appliquer les filtres au niveau DB.

```typescript
import { prisma } from "@/lib/db";
import type {
  PublishableIncident,
  IncidentMonthSummary,
  IncidentServiceSummary,
  IncidentArchiveStats,
  IncidentStatus,
  IncidentSeverity,
} from "./types";
import { PUBLISHABLE_SEVERITIES, MIN_DURATION_MINUTES_FOR_PUBLIC, EXCLUDED_SERVICE_SLUGS } from "./filters";
import { generateEnrichedDescription, generateEnrichedTitle } from "./enrichment";

// --- Helper: transform raw DB row to PublishableIncident ---
function toPublishableIncident(row: {
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
}): PublishableIncident {
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

  return {
    ...row,
    durationMinutes,
    enrichedDescription,
    monthKey,
    dayKey,
  };
}

// --- Main archive listing (paginated) ---
export async function getPublishableIncidents(input: {
  page?: number;
  perPage?: number;
  monthKey?: string;      // "2026-04"
  serviceSlug?: string;
  status?: IncidentStatus;
}): Promise<{ incidents: PublishableIncident[]; total: number }> {
  const page = input.page ?? 1;
  const perPage = Math.min(input.perPage ?? 20, 50);
  const offset = (page - 1) * perPage;

  // Build WHERE conditions
  const conditions: string[] = [
    `i.severity IN ('MAJOR','CRITICAL')`,
    `s.slug NOT IN (${EXCLUDED_SERVICE_SLUGS.length > 0 ? EXCLUDED_SERVICE_SLUGS.map(s => `'${s}'`).join(",") : "''"})`,
    // Duration filter: either open (resolvedAt IS NULL) OR duration >= threshold
    `(i."resolvedAt" IS NULL OR EXTRACT(EPOCH FROM (i."resolvedAt" - i."startedAt")) / 60 >= ${MIN_DURATION_MINUTES_FOR_PUBLIC})`,
  ];

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

  // Count query
  const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*) as count FROM "Incident" i
     INNER JOIN "Service" s ON s.id = i."serviceId"
     WHERE ${whereClause}`
  );
  const total = Number(countResult[0]?.count ?? 0);

  // Paginated query
  const rows = await prisma.$queryRawUnsafe<Array<{
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
  }>>(
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
  const rows = await prisma.$queryRaw<Array<{
    monthKey: string;
    incidentCount: bigint;
    resolvedCount: bigint;
    openCount: bigint;
    criticalCount: bigint;
    majorCount: bigint;
  }>>`
    SELECT
      TO_CHAR(i."startedAt", 'YYYY-MM') AS "monthKey",
      COUNT(*) AS "incidentCount",
      COUNT(*) FILTER (WHERE i.status = 'RESOLVED') AS "resolvedCount",
      COUNT(*) FILTER (WHERE i.status = 'OPEN') AS "openCount",
      COUNT(*) FILTER (WHERE i.severity = 'CRITICAL') AS "criticalCount",
      COUNT(*) FILTER (WHERE i.severity = 'MAJOR') AS "majorCount"
    FROM "Incident" i
    INNER JOIN "Service" s ON s.id = i."serviceId"
    WHERE i.severity IN ('MAJOR','CRITICAL')
      AND s.slug NOT IN (${EXCLUDED_SERVICE_SLUGS.length > 0 ? EXCLUDED_SERVICE_SLUGS.map(s => `'${s}'`).join(",") : "''"})
      AND (i."resolvedAt" IS NULL OR EXTRACT(EPOCH FROM (i."resolvedAt" - i."startedAt")) / 60 >= ${MIN_DURATION_MINUTES_FOR_PUBLIC})
    GROUP BY TO_CHAR(i."startedAt", 'YYYY-MM')
    ORDER BY "monthKey" DESC
  `;

  // Get top services per month
  const summaries: IncidentMonthSummary[] = [];
  for (const row of rows) {
    const topServicesRows = await prisma.$queryRaw<Array<{
      slug: string;
      name: string;
      count: bigint;
    }>>`
      SELECT s.slug, s.name, COUNT(*) AS count
      FROM "Incident" i
      INNER JOIN "Service" s ON s.id = i."serviceId"
      WHERE TO_CHAR(i."startedAt", 'YYYY-MM') = ${row.monthKey}
        AND i.severity IN ('MAJOR','CRITICAL')
      GROUP BY s.slug, s.name
      ORDER BY count DESC
      LIMIT 5
    `;

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
      topServices: topServicesRows.map(s => ({
        slug: s.slug,
        name: s.name,
        count: Number(s.count),
      })),
    });
  }

  return summaries;
}

// --- Service-level summary ---
export async function getIncidentServiceSummaries(limit: number = 30): Promise<IncidentServiceSummary[]> {
  const rows = await prisma.$queryRaw<Array<{
    serviceSlug: string;
    serviceName: string;
    serviceCategory: string;
    totalIncidents: bigint;
    resolvedIncidents: bigint;
    openIncidents: bigint;
    avgDurationMinutes: number | null;
    lastIncidentAt: Date | null;
    firstIncidentAt: Date | null;
  }>>`
    SELECT
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
    WHERE i.severity IN ('MAJOR','CRITICAL')
      AND (i."resolvedAt" IS NULL OR EXTRACT(EPOCH FROM (i."resolvedAt" - i."startedAt")) / 60 >= ${MIN_DURATION_MINUTES_FOR_PUBLIC})
    GROUP BY s.slug, s.name, s.category
    HAVING COUNT(i.id) >= 1
    ORDER BY "totalIncidents" DESC, "lastIncidentAt" DESC
    LIMIT ${limit}
  `;

  return rows.map(r => ({
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
  const result = await prisma.$queryRaw<Array<{
    totalIncidents: bigint;
    totalResolved: bigint;
    totalOpen: bigint;
    monthsCovered: bigint;
    servicesAffected: bigint;
    avgDurationMinutes: number | null;
  }>>`
    SELECT
      COUNT(*) AS "totalIncidents",
      COUNT(*) FILTER (WHERE i.status = 'RESOLVED') AS "totalResolved",
      COUNT(*) FILTER (WHERE i.status = 'OPEN') AS "totalOpen",
      COUNT(DISTINCT TO_CHAR(i."startedAt", 'YYYY-MM')) AS "monthsCovered",
      COUNT(DISTINCT i."serviceId") AS "servicesAffected",
      AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."startedAt")) / 60) AS "avgDurationMinutes"
    FROM "Incident" i
    INNER JOIN "Service" s ON s.id = i."serviceId"
    WHERE i.severity IN ('MAJOR','CRITICAL')
      AND (i."resolvedAt" IS NULL OR EXTRACT(EPOCH FROM (i."resolvedAt" - i."startedAt")) / 60 >= ${MIN_DURATION_MINUTES_FOR_PUBLIC})
  `;

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

// --- Single incident by ID (for future detail pages, not used now) ---
export async function getIncidentById(id: string): Promise<PublishableIncident | null> {
  const rows = await prisma.$queryRaw<Array<any>>`
    SELECT
      i.id, i."serviceId", i.title, i.status, i.severity,
      i."startedAt", i."resolvedAt", i.summary, i."sourceBadge",
      s.slug AS "serviceSlug",
      s.name AS "serviceName",
      s.category::text AS "serviceCategory"
    FROM "Incident" i
    INNER JOIN "Service" s ON s.id = i."serviceId"
    WHERE i.id = ${id}
    LIMIT 1
  `;
  return rows[0] ? toPublishableIncident(rows[0]) : null;
}
```

---

## PHASE 2 — REFONDRE LA PAGE /incidents

### 2.1 Remplacer `src/app/incidents/page.tsx`

**IMPORTANT** : garder le layout existant, améliorer le contenu.

```typescript
import Link from "next/link";
import type { Metadata } from "next";
import {
  getPublishableIncidents,
  getIncidentMonthSummaries,
  getIncidentArchiveStats,
} from "@/lib/incidents/queries";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { IncidentStatsBar } from "@/components/incidents/IncidentStatsBar";
import { MonthArchiveGrid } from "@/components/incidents/MonthArchiveGrid";

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: "AI Incidents Archive — Real outages across 800+ AI services",
  description:
    "Public archive of AI service incidents detected by DownForAI monitoring. Browse by month, by service, or by severity. Independent, data-driven, updated hourly.",
  alternates: { canonical: "/incidents" },
  robots: { index: true, follow: true },
};

type SearchParams = {
  page?: string;
  month?: string;
  severity?: string;
};

export default async function IncidentsArchivePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const perPage = 20;

  // Fetch in parallel
  const [incidentsResult, months, stats] = await Promise.all([
    getPublishableIncidents({ page, perPage, monthKey: params.month }),
    getIncidentMonthSummaries(),
    getIncidentArchiveStats(),
  ]);

  const totalPages = Math.ceil(incidentsResult.total / perPage);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Incidents Archive",
    description: "Archive of AI service incidents detected by DownForAI monitoring.",
    url: "https://downforai.com/incidents",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
        { "@type": "ListItem", position: 2, name: "Incidents", item: "https://downforai.com/incidents" },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <nav className="text-sm" style={{ color: "#525252" }}>
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span style={{ color: "#171717" }}>Incidents</span>
          </nav>
          <h1 className="text-3xl font-bold" style={{ color: "#171717" }}>
            AI Incidents Archive
          </h1>
          <p className="text-base max-w-3xl" style={{ color: "#525252" }}>
            Public archive of significant incidents detected across 800+ AI services.
            Automated probes run every 2-5 minutes from multiple locations. Data is updated hourly.
            See our <Link href="/methodology" className="underline" style={{ color: "#2563eb" }}>methodology</Link>.
          </p>
        </header>

        {/* Stats bar */}
        <IncidentStatsBar stats={stats} />

        {/* Month archive grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#171717" }}>
            Browse by month
          </h2>
          <MonthArchiveGrid months={months} activeMonth={params.month} />
        </section>

        {/* Incident list */}
        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#171717" }}>
            {params.month
              ? `Incidents in ${months.find(m => m.monthKey === params.month)?.displayMonth ?? params.month}`
              : "Latest incidents"}
            <span className="ml-2 text-sm font-normal" style={{ color: "#525252" }}>
              ({incidentsResult.total} total)
            </span>
          </h2>

          {incidentsResult.incidents.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                padding: "32px",
                textAlign: "center",
                color: "#525252",
              }}
            >
              No incidents match the current filters.
            </div>
          ) : (
            <div className="space-y-3">
              {incidentsResult.incidents.map(incident => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex justify-center items-center gap-2 pt-6"
            style={{ borderTop: "1px solid #e5e5e5" }}
          >
            {page > 1 && (
              <Link
                href={`/incidents?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                className="px-4 py-2 rounded-md text-sm"
                style={{ border: "1px solid #e5e5e5", color: "#171717" }}
              >
                ← Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm" style={{ color: "#525252" }}>
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/incidents?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                className="px-4 py-2 rounded-md text-sm"
                style={{ border: "1px solid #e5e5e5", color: "#171717" }}
              >
                Next →
              </Link>
            )}
          </nav>
        )}

        {/* Footer link */}
        <footer className="pt-6 text-sm" style={{ borderTop: "1px solid #e5e5e5", color: "#525252" }}>
          Looking for a specific service?{" "}
          <Link href="/" className="underline" style={{ color: "#2563eb" }}>
            Browse all 800+ monitored AI services →
          </Link>
        </footer>
      </div>
    </>
  );
}
```

### 2.2 Créer `src/components/incidents/IncidentCard.tsx`

```typescript
import Link from "next/link";
import type { PublishableIncident } from "@/lib/incidents/types";

const SEVERITY_CONFIG = {
  CRITICAL: { label: "Critical", color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
  MAJOR: { label: "Major", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  MINOR: { label: "Minor", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
} as const;

const STATUS_CONFIG = {
  OPEN: { label: "Ongoing", color: "#dc2626" },
  MONITORING: { label: "Monitoring", color: "#ca8a04" },
  RESOLVED: { label: "Resolved", color: "#16a34a" },
} as const;

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }) + " UTC";
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "ongoing";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function IncidentCard({ incident }: { incident: PublishableIncident }) {
  const sev = SEVERITY_CONFIG[incident.severity];
  const stat = STATUS_CONFIG[incident.status];

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-xs font-semibold uppercase px-2 py-1 rounded"
              style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}
            >
              {sev.label}
            </span>
            <span className="text-xs font-medium uppercase" style={{ color: stat.color }}>
              • {stat.label}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: "#171717" }}>
            <Link href={`/${incident.serviceSlug}`} className="hover:underline">
              {incident.serviceName}
            </Link>
          </h3>
          <p className="text-sm mb-3" style={{ color: "#525252" }}>
            {incident.enrichedDescription}
          </p>
          <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: "#737373" }}>
            <span>Started: {formatDate(incident.startedAt)}</span>
            {incident.resolvedAt && <span>Resolved: {formatDate(incident.resolvedAt)}</span>}
            <span>Duration: {formatDuration(incident.durationMinutes)}</span>
            <Link href={`/${incident.serviceSlug}`} className="underline" style={{ color: "#2563eb" }}>
              View service →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
```

### 2.3 Créer `src/components/incidents/IncidentStatsBar.tsx`

```typescript
import type { IncidentArchiveStats } from "@/lib/incidents/types";

export function IncidentStatsBar({ stats }: { stats: IncidentArchiveStats }) {
  const items = [
    { label: "Total incidents", value: stats.totalIncidents.toString() },
    { label: "Resolved", value: stats.totalResolved.toString() },
    { label: "Currently open", value: stats.totalOpen.toString() },
    { label: "Services affected", value: stats.servicesAffected.toString() },
    {
      label: "Avg duration",
      value: stats.avgDurationMinutes
        ? stats.avgDurationMinutes >= 60
          ? `${Math.floor(stats.avgDurationMinutes / 60)}h ${stats.avgDurationMinutes % 60}m`
          : `${stats.avgDurationMinutes}m`
        : "—",
    },
  ];

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}
    >
      {items.map(item => (
        <div
          key={item.label}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div className="text-2xl font-bold" style={{ color: "#171717" }}>
            {item.value}
          </div>
          <div className="text-xs mt-1" style={{ color: "#525252" }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 2.4 Créer `src/components/incidents/MonthArchiveGrid.tsx`

```typescript
import Link from "next/link";
import type { IncidentMonthSummary } from "@/lib/incidents/types";

export function MonthArchiveGrid({
  months,
  activeMonth,
}: {
  months: IncidentMonthSummary[];
  activeMonth?: string;
}) {
  if (months.length === 0) {
    return (
      <div style={{ color: "#737373", fontSize: "14px" }}>
        No incident data available yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      {months.map(month => {
        const isActive = activeMonth === month.monthKey;
        return (
          <Link
            key={month.monthKey}
            href={`/incidents/${month.monthKey}`}
            style={{
              background: isActive ? "#f0f9ff" : "#ffffff",
              border: `1px solid ${isActive ? "#2563eb" : "#e5e5e5"}`,
              borderRadius: "12px",
              padding: "16px",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div className="font-semibold" style={{ color: "#171717" }}>
              {month.displayMonth}
            </div>
            <div className="text-xs mt-1" style={{ color: "#525252" }}>
              {month.incidentCount} incident{month.incidentCount !== 1 ? "s" : ""}
              {month.criticalCount > 0 && ` · ${month.criticalCount} critical`}
            </div>
            {month.topServices.length > 0 && (
              <div className="text-xs mt-2" style={{ color: "#737373" }}>
                Top: {month.topServices.slice(0, 3).map(s => s.name).join(", ")}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
```

---

## PHASE 3 — ROUTES ARCHIVES MENSUELLES ET PAR SERVICE

### 3.1 Créer `src/app/incidents/[monthKey]/page.tsx`

```typescript
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishableIncidents,
  getIncidentMonthSummaries,
} from "@/lib/incidents/queries";
import { IncidentCard } from "@/components/incidents/IncidentCard";

export const revalidate = 3600;

// Validate monthKey format: YYYY-MM
function isValidMonthKey(key: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(key)) return false;
  const [year, month] = key.split("-").map(Number);
  if (year < 2025 || year > 2030) return false;
  if (month < 1 || month > 12) return false;
  return true;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ monthKey: string }>;
}): Promise<Metadata> {
  const { monthKey } = await params;
  if (!isValidMonthKey(monthKey)) return {};

  const displayMonth = new Date(`${monthKey}-01T00:00:00Z`).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return {
    title: `AI Incidents — ${displayMonth} | DownForAI`,
    description: `All major AI service incidents detected by DownForAI in ${displayMonth}. Browse incidents, durations, and affected services.`,
    alternates: { canonical: `/incidents/${monthKey}` },
    robots: { index: true, follow: true },
  };
}

export default async function IncidentMonthPage({
  params,
  searchParams,
}: {
  params: Promise<{ monthKey: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { monthKey } = await params;
  if (!isValidMonthKey(monthKey)) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const perPage = 30;

  const [result, months] = await Promise.all([
    getPublishableIncidents({ page, perPage, monthKey }),
    getIncidentMonthSummaries(),
  ]);

  const currentMonth = months.find(m => m.monthKey === monthKey);
  const displayMonth = currentMonth?.displayMonth ?? monthKey;
  const totalPages = Math.ceil(result.total / perPage);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `AI Incidents — ${displayMonth}`,
    url: `https://downforai.com/incidents/${monthKey}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
        { "@type": "ListItem", position: 2, name: "Incidents", item: "https://downforai.com/incidents" },
        { "@type": "ListItem", position: 3, name: displayMonth, item: `https://downforai.com/incidents/${monthKey}` },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="space-y-6">
        <nav className="text-sm" style={{ color: "#525252" }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/incidents" className="hover:underline">Incidents</Link>
          <span className="mx-2">/</span>
          <span style={{ color: "#171717" }}>{displayMonth}</span>
        </nav>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold" style={{ color: "#171717" }}>
            AI Incidents — {displayMonth}
          </h1>
          <p className="text-base" style={{ color: "#525252" }}>
            {result.total} major incident{result.total !== 1 ? "s" : ""} detected across AI services in {displayMonth}.
          </p>
        </header>

        {result.incidents.length === 0 ? (
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#525252" }}>
            No major incidents recorded for this period.
          </div>
        ) : (
          <div className="space-y-3">
            {result.incidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex justify-center items-center gap-2 pt-6" style={{ borderTop: "1px solid #e5e5e5" }}>
            {page > 1 && (
              <Link href={`/incidents/${monthKey}?page=${page - 1}`} className="px-4 py-2 rounded-md text-sm" style={{ border: "1px solid #e5e5e5" }}>
                ← Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm" style={{ color: "#525252" }}>Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link href={`/incidents/${monthKey}?page=${page + 1}`} className="px-4 py-2 rounded-md text-sm" style={{ border: "1px solid #e5e5e5" }}>
                Next →
              </Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
```

### 3.2 Créer `src/app/incidents/service/[serviceSlug]/page.tsx`

**NOTE** : pour éviter les conflits avec `/incidents/[monthKey]`, utiliser un sous-chemin `/service/`.

```typescript
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPublishableIncidents } from "@/lib/incidents/queries";
import { IncidentCard } from "@/components/incidents/IncidentCard";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serviceSlug: string }>;
}): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    select: { name: true },
  });
  if (!service) return {};

  return {
    title: `${service.name} Incident History | DownForAI`,
    description: `Complete incident history for ${service.name}: durations, severities, and outages detected by DownForAI monitoring.`,
    alternates: { canonical: `/incidents/service/${serviceSlug}` },
    robots: { index: true, follow: true },
  };
}

export default async function IncidentByServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { serviceSlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    select: { name: true, slug: true, category: true },
  });
  if (!service) notFound();

  const result = await getPublishableIncidents({ page, perPage: 30, serviceSlug });
  const totalPages = Math.ceil(result.total / 30);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${service.name} Incident History`,
    url: `https://downforai.com/incidents/service/${serviceSlug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
        { "@type": "ListItem", position: 2, name: "Incidents", item: "https://downforai.com/incidents" },
        { "@type": "ListItem", position: 3, name: service.name, item: `https://downforai.com/incidents/service/${serviceSlug}` },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="space-y-6">
        <nav className="text-sm" style={{ color: "#525252" }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/incidents" className="hover:underline">Incidents</Link>
          <span className="mx-2">/</span>
          <span style={{ color: "#171717" }}>{service.name}</span>
        </nav>

        <header className="space-y-3">
          <h1 className="text-3xl font-bold" style={{ color: "#171717" }}>
            {service.name} Incident History
          </h1>
          <p className="text-base" style={{ color: "#525252" }}>
            {result.total} major incident{result.total !== 1 ? "s" : ""} detected for {service.name}.{" "}
            <Link href={`/${serviceSlug}`} className="underline" style={{ color: "#2563eb" }}>
              View live status dashboard →
            </Link>
          </p>
        </header>

        {result.incidents.length === 0 ? (
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#525252" }}>
            No major incidents recorded for {service.name}.
          </div>
        ) : (
          <div className="space-y-3">
            {result.incidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex justify-center items-center gap-2 pt-6" style={{ borderTop: "1px solid #e5e5e5" }}>
            {page > 1 && (
              <Link href={`/incidents/service/${serviceSlug}?page=${page - 1}`} className="px-4 py-2 rounded-md text-sm" style={{ border: "1px solid #e5e5e5" }}>
                ← Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm" style={{ color: "#525252" }}>Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link href={`/incidents/service/${serviceSlug}?page=${page + 1}`} className="px-4 py-2 rounded-md text-sm" style={{ border: "1px solid #e5e5e5" }}>
                Next →
              </Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
```

---

## PHASE 4 — PAGE /methodology

### 4.1 Créer `src/app/methodology/page.tsx`

```typescript
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology — How DownForAI detects AI incidents",
  description:
    "How DownForAI monitors 800+ AI services: probe cadence, classification logic, signal sources, and what we don't claim. Independent, data-driven, transparent.",
  alternates: { canonical: "/methodology" },
  robots: { index: true, follow: true },
};

export default function MethodologyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "DownForAI Methodology",
    url: "https://downforai.com/methodology",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://downforai.com" },
        { "@type": "ListItem", position: 2, name: "Methodology", item: "https://downforai.com/methodology" },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="space-y-8 max-w-3xl">
        <nav className="text-sm" style={{ color: "#525252" }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span style={{ color: "#171717" }}>Methodology</span>
        </nav>

        <header className="space-y-3">
          <h1 className="text-3xl font-bold" style={{ color: "#171717" }}>
            How DownForAI Works
          </h1>
          <p className="text-lg" style={{ color: "#525252" }}>
            Transparency about what we measure, how we measure it, and what we don't claim.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold" style={{ color: "#171717" }}>Who</h2>
          <p style={{ color: "#171717", lineHeight: 1.7 }}>
            DownForAI is an independent monitoring project for AI services, operated as a
            solo technical effort. We have no affiliation, sponsorship, or financial
            relationship with any AI provider listed on this site. We are not paid to
            report any particular status.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold" style={{ color: "#171717" }}>How we detect incidents</h2>
          <p style={{ color: "#171717", lineHeight: 1.7 }}>
            We run automated HTTP probes every 2 to 5 minutes against each monitored
            service from multiple geographically distributed locations. For each probe,
            we record:
          </p>
          <ul className="list-disc pl-6 space-y-2" style={{ color: "#171717", lineHeight: 1.7 }}>
            <li>HTTP response code (200, 429, 5xx, etc.)</li>
            <li>Response latency in milliseconds</li>
            <li>TLS handshake success / failure</li>
            <li>Response body signals (content-type, error patterns)</li>
            <li>Regional path / CDN edge hit</li>
          </ul>
          <p style={{ color: "#171717", lineHeight: 1.7 }}>
            We classify each service surface as <strong>Operational</strong>,{" "}
            <strong>Degraded</strong>, or <strong>Outage</strong> based on a weighted
            combination of probe results over a rolling time window. We also compute
            latency baselines (median and median absolute deviation) to detect statistical
            anomalies distinct from hard errors.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold" style={{ color: "#171717" }}>How we classify incidents</h2>
          <p style={{ color: "#171717", lineHeight: 1.7 }}>
            When a service shows degraded or failed probes, we apply a diagnosis classifier
            with four possible outcomes:
          </p>
          <ul className="list-disc pl-6 space-y-2" style={{ color: "#171717", lineHeight: 1.7 }}>
            <li>
              <strong>Global outage</strong> — Multiple surfaces across multiple probe
              locations report failure. Concurrent community reports increase confidence.
            </li>
            <li>
              <strong>Partial incident</strong> — A single surface degraded (e.g. API fails
              while web works) or isolated regional failure.
            </li>
            <li>
              <strong>Local / client-side issue</strong> — All probes healthy, no significant
              volume of community reports. The issue is likely on the user's end (network,
              credentials, rate limits).
            </li>
            <li>
              <strong>Inconclusive</strong> — Insufficient signal. We prefer honesty over
              false positives.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold" style={{ color: "#171717" }}>Our signal sources</h2>
          <ul className="list-disc pl-6 space-y-2" style={{ color: "#171717", lineHeight: 1.7 }}>
            <li>
              <strong>Live monitoring</strong> — Our own probes. Primary signal.
            </li>
            <li>
              <strong>Status page sync</strong> — When a provider's official status page
              reports an incident, we surface it. Secondary signal.
            </li>
            <li>
              <strong>Community reports</strong> — User-submitted reports on this site.
              Tertiary signal; used to corroborate probe data, not to declare outages on
              their own.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold" style={{ color: "#171717" }}>What we don't claim</h2>
          <p style={{ color: "#171717", lineHeight: 1.7 }}>
            DownForAI is <strong>not</strong> an SLA, an insurance product, or an official
            source. We show you signal. We show you data. We show you what we see. We
            don't:
          </p>
          <ul className="list-disc pl-6 space-y-2" style={{ color: "#171717", lineHeight: 1.7 }}>
            <li>Claim authority over any provider's true service status</li>
            <li>Replace the provider's official status page</li>
            <li>Guarantee that our classification is always correct</li>
            <li>Detect incidents that do not affect our probes or that resolve faster than our cadence</li>
          </ul>
          <p style={{ color: "#171717", lineHeight: 1.7 }}>
            When our signal conflicts with the provider's official status page, check both.
            When our signal matches community reports but the official page is green,
            that's exactly the kind of gap we try to surface.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold" style={{ color: "#171717" }}>How to interpret what you see</h2>
          <ul className="list-disc pl-6 space-y-2" style={{ color: "#171717", lineHeight: 1.7 }}>
            <li>
              <strong>Operational but slow</strong> — Service responds, but latency is above
              baseline. Check your integrations for timeouts.
            </li>
            <li>
              <strong>Degraded</strong> — Some probes fail. If only one surface is affected,
              the issue is likely partial. Consider a fallback.
            </li>
            <li>
              <strong>Outage</strong> — Multiple probes fail across regions. Cross-check the
              provider's status page.
            </li>
            <li>
              <strong>No data</strong> — Either monitoring is paused for this surface, or
              probes haven't had time to run yet.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold" style={{ color: "#171717" }}>Browse incidents</h2>
          <p style={{ color: "#171717", lineHeight: 1.7 }}>
            All major incidents detected by our monitoring are archived publicly. Browse
            by month or by service in the <Link href="/incidents" className="underline" style={{ color: "#2563eb" }}>incidents archive</Link>.
          </p>
        </section>
      </article>
    </>
  );
}
```

---

## PHASE 5 — HOMEPAGE : NOUVELLE TAGLINE

### 5.1 Modifier `src/app/page.tsx`

**REGLE** : ne pas refaire la home entière. Juste modifier :
1. Le metadata title + description
2. La tagline dans `HeroSection`
3. Ajouter un lien vers `/methodology` et `/incidents` dans l'intro

**Nouvelle tagline** : `"API diagnostics for AI tools — faster than status pages, cleaner than Reddit"`

Dans `src/components/HeroSection.tsx` (ou composant équivalent), modifier :

```typescript
// AVANT
// H1: "Is your AI down?"
// Subtitle: "Community-Driven AI Outage Monitor — We detect what official status pages hide"

// APRÈS
// H1: "Is your AI tool down?" (garder le gradient sur "down")
// Subtitle: "API diagnostics for AI tools. Faster than status pages, cleaner than Reddit."
```

Dans `src/app/page.tsx`, modifier le metadata :

```typescript
export const metadata: Metadata = {
  title: "DownForAI — Real-time status & diagnostics for 800+ AI tools",
  description:
    "Independent real-time monitoring for AI APIs, chat interfaces, and dev tools. Faster than official status pages, cleaner than Reddit. Incidents, latency, fallback alternatives.",
  alternates: { canonical: "/" },
};
```

Ajouter 3 petits liens sous la HeroSection (ou dans HeroSection), avant le BentoSection :

```typescript
<nav className="flex items-center gap-4 text-sm flex-wrap" style={{ color: "#525252", marginTop: "16px" }}>
  <Link href="/incidents" className="hover:underline flex items-center gap-1">
    <span style={{ color: "#dc2626" }}>●</span> Latest AI incidents
  </Link>
  <span style={{ color: "#d4d4d4" }}>·</span>
  <Link href="/methodology" className="hover:underline">How we detect incidents</Link>
  <span style={{ color: "#d4d4d4" }}>·</span>
  <Link href="/#services" className="hover:underline">Browse 800+ services</Link>
</nav>
```

---

## PHASE 6 — SITEMAP, FOOTER, BUG FIXES

### 6.1 Mettre à jour `src/app/sitemap.ts`

Ajouter dans `staticRoutes` :

```typescript
{
  url: `${baseUrl}/methodology`,
  lastModified: new Date(),
  changeFrequency: "monthly",
  priority: 0.4,
},
```

Ajouter la génération dynamique des routes `/incidents/[monthKey]` et `/incidents/service/[serviceSlug]` :

```typescript
// Monthly archive routes
const monthlyRoutes = months.map(m => ({
  url: `${baseUrl}/incidents/${m.monthKey}`,
  lastModified: new Date(),
  changeFrequency: "weekly" as const,
  priority: 0.5,
}));

// Service incident routes (only for services with >= 1 publishable incident)
const serviceIncidentRoutes = serviceSummaries.map(s => ({
  url: `${baseUrl}/incidents/service/${s.serviceSlug}`,
  lastModified: s.lastIncidentAt ?? new Date(),
  changeFrequency: "weekly" as const,
  priority: 0.5,
}));

return [...staticRoutes, ...categoryRoutes, ...serviceRoutes, ...monthlyRoutes, ...serviceIncidentRoutes];
```

### 6.2 Mettre à jour le Footer

Dans `src/components/layout/Footer.tsx`, ajouter dans la colonne "Resources" :

```typescript
<li><Link href="/methodology">Methodology</Link></li>
```

Juste après `/about` et avant `/incidents`.

### 6.3 Corriger `IncidentTimelinePanel.tsx`

Remplacer les références obsolètes :

```typescript
// AVANT (BUG)
const SEVERITY_COLOR = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",     // N'EXISTE PAS DANS L'ENUM
  MEDIUM: "#ca8a04",   // N'EXISTE PAS DANS L'ENUM
  LOW: "#6b7280",      // N'EXISTE PAS DANS L'ENUM
};

// APRÈS (CORRIGÉ)
const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#dc2626",
  MAJOR: "#dc2626",
  MINOR: "#ca8a04",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Ongoing",
  MONITORING: "Monitoring",
  RESOLVED: "Resolved",
};
```

Supprimer toute référence à `INVESTIGATING`, `HIGH`, `MEDIUM`, `LOW`.

### 6.4 Ajouter un lien "View all incidents" dans `IncidentTimelinePanel`

Modifier le composant pour ajouter un lien en bas :

```typescript
{incidents.length > 0 && (
  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
    <Link
      href={`/incidents/service/${serviceSlug}`}
      style={{ fontSize: "13px", color: "#2563eb", textDecoration: "underline" }}
    >
      View full incident history →
    </Link>
  </div>
)}
```

(Ajouter `serviceSlug` en prop du composant et le passer depuis la page service).

---

## CHECKLIST AVANT PUSH

### Build local

```bash
npm run build
# DOIT réussir sans erreur
npx tsc --noEmit --strict
# DOIT réussir sans erreur
```

### Tests manuels (5 URLs)

```bash
npm run dev
```

Tester :

1. **http://localhost:3000/incidents** — archive globale, stats bar, grid des mois, liste paginated
2. **http://localhost:3000/incidents/2026-04** — archive d'avril 2026
3. **http://localhost:3000/incidents/service/google-gemini** — historique Google Gemini (18 incidents)
4. **http://localhost:3000/incidents/service/jais-ai** — doit afficher "No major incidents recorded" si jais-ai est exclu (ou liste filtrée)
5. **http://localhost:3000/methodology** — toutes les sections rendent
6. **http://localhost:3000/** — nouvelle tagline, nouveaux liens sous hero
7. **http://localhost:3000/incidents/2099-12** — doit retourner 404 (monthKey invalide)
8. **http://localhost:3000/incidents/invalid-slug** — doit retourner 404

### Vérifications techniques

- JSON-LD CollectionPage présent dans le source HTML des pages /incidents/*
- JSON-LD AboutPage présent sur /methodology
- Breadcrumb JSON-LD cohérent
- Canonical URL correcte sur chaque page
- Pas de hydration warnings dans la console
- Lighthouse local > 95

### Vérifications Neon (après 30 min en preview)

- Vercel preview deploy OK
- Neon data transfer ne monte pas anormalement (surveiller 15 min)
- ISR cache HIT rate > 50% après quelques minutes

---

## PUSH

```bash
git add .
git commit -m "feat: incident archive + methodology + home tagline refresh"
git push
```

Preview deploy sur Vercel → valider 5 URLs → merge main.

---

## APRÈS LE MERGE

### 24h d'observation

- Vercel logs : pas de 5xx sur /incidents/*
- Neon : +1 à +2 GB de transfer sur 24h maximum (si plus → requête mal optimisée)
- GSC : soumettre manuellement le sitemap updaté
- Google Search Console → "Inspect URL" sur `/incidents`, `/methodology`, `/incidents/2026-04`

### 7j check

- Ces 3 URLs indexées dans GSC
- PostHog : vérifier si trafic organique sur /incidents
- Si `/incidents/service/[slug]` des services populaires (Google Gemini) ne sont pas indexés → soumettre manuellement

---

## NOTES IMPORTANTES

1. **jais-ai** : si 85 incidents sur ce service sont clairement du flapping, ajouter `"jais-ai"` dans `EXCLUDED_SERVICE_SLUGS` dans `filters.ts`. Ça va nettoyer l'archive publique sans toucher à la DB.

2. **Durées**: la plupart des incidents auto-générés ont une durée très courte (< 10 min). Le filtre `MIN_DURATION_MINUTES_FOR_PUBLIC = 10` va éliminer le bruit. Si après déploiement l'archive est quasi vide, abaisser à 5 min.

3. **Open vs Resolved**: les incidents OPEN sans `resolvedAt` passent le filtre de durée automatiquement (c'est voulu — un incident en cours doit être affiché immédiatement).

4. **Pas de page `/incidents/[incidentId]`** : on ne crée pas de page par incident individuel (trop de pages, risque thin content). Si besoin plus tard, on pourra ajouter.

5. **Prochaine étape (semaine 2)** : API publique + badges SVG.

---

**FIN DU BRIEF**

Tag avant push : `pre-incident-archive`
Branch : `feature/incident-archive`
