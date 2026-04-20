# BRIEF CLAUDE CODE — Big Bang Service Page Restructuring

> **Lis d'abord** les 3 documents de référence dans `docs/` avant de commencer :
> 1. `docs/CODE_CONTEXT.md` — schéma Prisma, patterns de requêtes, design system, contraintes
> 2. `docs/top50_v2.md` — contenu éditorial à convertir en TypeScript
> 3. `docs/SLUG_MAPPING.md` — validation des slugs DB
>
> **Règle absolue** : toute nouvelle requête Prisma DOIT utiliser `$queryRaw` avec LATERAL JOIN.
> JAMAIS de `findMany` + `include` + `take` sur les tables à fort volume (Observation, CommunityReport).
> Voir `docs/CODE_CONTEXT.md` section 3 pour les patterns exacts.
>
> **Ne pas toucher** : Header, Footer, NordVPN affiliate link, middleware bots, homepage, category pages.
>
> **Priorité** : le code doit build (`npm run build`) sans erreur avant tout push.

---

## PHASE 0 — PRÉPARATION (faire en premier)

### 0.1 Créer la branche de travail

```bash
git checkout -b feature/big-bang-v65
git tag pre-service-page-consolidation
```

### 0.2 Copier les docs de référence

Vérifie que ces fichiers existent à la racine du repo :
- `docs/CODE_CONTEXT.md`
- `docs/top50_v2.md`
- `docs/SLUG_MAPPING.md`

Si non, demande à l'utilisateur de les ajouter.

---

## PHASE 1 — CONTENU TOP 50 (src/content/top-services/)

### 1.1 Créer `src/content/top-services/types.ts`

Types exacts depuis `docs/top50_v2.md` section "Schéma TypeScript cible" :

```typescript
export type CommunityLink = {
  type: "discord" | "reddit" | "github" | "forum" | "x";
  url: string;
  label: string;
  verified?: boolean;
};

export type MonitoredSurface = {
  name: string;
  description: string;
  criticality: "critical" | "high" | "medium" | "low";
};

export type KnownFailurePattern = {
  pattern: string;
  scope: "global" | "partial" | "local";
  signal: string;
  quickCheck: string;
};

export type FallbackAlternative = {
  scenario: string;
  alternative: string;
  switchingCost: "low" | "medium" | "high";
  note?: string;
};

export type TopServiceContent = {
  slug: string;
  providerSummary: string;
  officialStatusUrl?: string;
  docsUrl: string;
  pricingUrl?: string;
  communityLinks: CommunityLink[];
  monitoredSurfaces: MonitoredSurface[];
  statusSegmentation?: string[];
  modelFamilies?: string[];
  commonLimits?: string[];
  knownFailurePatterns: KnownFailurePattern[];
  fallbackAlternatives: FallbackAlternative[];
  ecosystemDependencies: string[];
  operatorNotes: string[];
  diagnosticHeaders?: string[];
  diagnosticCommands?: string[];
};
```

### 1.2 Créer `src/content/top-services/top50.ts`

Convertir les 58 fiches de `docs/top50_v2.md` en un objet TypeScript :

```typescript
import type { TopServiceContent } from "./types";

export const TOP_SERVICE_CONTENT: Record<string, TopServiceContent> = {
  chatgpt: {
    slug: "chatgpt",
    providerSummary: "ChatGPT is OpenAI's consumer-facing AI assistant across web and mobile...",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://help.openai.com/en/collections/3742473-chatgpt",
    // ... convertir TOUS les champs du markdown
  },
  openai: { ... },
  "claude-chat": { ... },
  anthropic: { ... },
  "github-copilot": { ... },
  "google-gemini": { ... },
  deepseek: { ... },
  perplexity: { ... },
  ollama: { ... },
  cursor: { ... },
  // ... 48 autres fiches
};
```

**Règles de conversion MD → TS :**
- Les sections `### knownFailurePatterns` avec sub-bullets → array d'objets `{ pattern, scope, signal, quickCheck }`
- Les URLs marquées `*undefined*` dans le MD → champ omis (pas `officialStatusUrl: undefined`, mais absent de l'objet)
- Les `communityLinks` avec `verified: true` dans le MD → `verified: true` dans l'objet
- Les `communityLinks` sans mention de verified → ne pas mettre le champ `verified`
- Les fiches ⭐⭐ ont moins de champs que les ⭐⭐⭐ — c'est normal, ne pas inventer du contenu pour remplir

### 1.3 Créer `src/content/top-services/index.ts`

```typescript
export { TOP_SERVICE_CONTENT } from "./top50";
export type { TopServiceContent } from "./types";
```

---

## PHASE 2 — LOGIQUE SERVEUR (src/lib/service-page/)

### 2.1 Créer `src/lib/service-page/types.ts`

```typescript
export type SurfaceSnapshot = {
  surfaceId: string;
  surfaceSlug: string;
  displayName: string;
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";
  latestHttpStatus: number | null;
  latestLatencyMs: number | null;
  confidence: string | null;
  lastObservedAt: Date | null;
  p50Latency24h: number | null;
  p95Latency24h: number | null;
};

export type DiagnosisResult = {
  label: string;
  scope: "global" | "partial" | "local" | "unknown";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
};

export type IncidentSummary = {
  id: string;
  title: string;
  status: string;
  severity: string;
  startedAt: Date;
  resolvedAt: Date | null;
  duration: number | null; // minutes
  summary: string | null;
};

export type ReportSummary = {
  total24h: number;
  byType: Record<string, number>;
  bySurface: Record<string, number>;
  recentComments: Array<{
    pseudo: string;
    content: string;
    reportType: string;
    createdAt: Date;
  }>;
};

export type ServiceDashboardData = {
  service: {
    id: string;
    slug: string;
    name: string;
    category: string;
    description: string | null;
    websiteUrl: string | null;
    iconUrl: string | null;
  };
  overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN";
  diagnosis: DiagnosisResult;
  surfaces: SurfaceSnapshot[];
  uptime24h: number | null;       // percentage
  incidents30d: IncidentSummary[];
  reportSummary: ReportSummary;
  topContent: import("@/content/top-services/types").TopServiceContent | null;
};
```

### 2.2 Créer `src/lib/service-page/classifyServiceIssue.ts`

Classifieur global/partial/local/inconclusive. Logique :

```typescript
import type { SurfaceSnapshot, DiagnosisResult } from "./types";

export function classifyServiceIssue(input: {
  surfaces: SurfaceSnapshot[];
  reports24h: number;
  reports2h: number;
  hasOpenIncident: boolean;
}): DiagnosisResult {
  const { surfaces, reports24h, reports2h, hasOpenIncident } = input;

  const degradedSurfaces = surfaces.filter(s => s.status === "DEGRADED");
  const outageSurfaces = surfaces.filter(s => s.status === "OUTAGE");
  const unknownSurfaces = surfaces.filter(s => s.status === "UNKNOWN");
  const allProbesHealthy = degradedSurfaces.length === 0 && outageSurfaces.length === 0;

  // 1. Global outage
  if (hasOpenIncident || outageSurfaces.length >= 2) {
    return {
      label: "Likely provider-side issue",
      scope: "global",
      confidence: "HIGH",
      reasons: [
        hasOpenIncident ? "Official incident currently open" : null,
        outageSurfaces.length >= 2
          ? `${outageSurfaces.length} surfaces reporting outage`
          : null,
        reports2h > 10 ? `${reports2h} user reports in last 2 hours` : null,
      ].filter(Boolean) as string[],
    };
  }

  // 2. Partial issue
  if (
    (degradedSurfaces.length + outageSurfaces.length >= 1 && reports2h >= 5) ||
    (outageSurfaces.length === 1 && degradedSurfaces.length === 0)
  ) {
    const affectedNames = [...outageSurfaces, ...degradedSurfaces]
      .map(s => s.displayName)
      .join(", ");
    return {
      label: "Likely partial provider issue",
      scope: "partial",
      confidence: "MEDIUM",
      reasons: [
        `Affected surfaces: ${affectedNames}`,
        reports2h > 0 ? `${reports2h} user reports in last 2 hours` : null,
        "Other surfaces appear healthy",
      ].filter(Boolean) as string[],
    };
  }

  // 3. Local/client issue
  if (allProbesHealthy && reports2h < 3) {
    return {
      label: "Likely local or client-side issue",
      scope: "local",
      confidence: "MEDIUM",
      reasons: [
        "All monitored surfaces operational",
        reports2h === 0
          ? "No recent user reports"
          : `Only ${reports2h} user reports (below threshold)`,
        "Check your network, credentials, or rate limits",
      ],
    };
  }

  // 4. Inconclusive
  return {
    label: "Monitoring data inconclusive",
    scope: "unknown",
    confidence: "LOW",
    reasons: [
      unknownSurfaces.length > 0
        ? `${unknownSurfaces.length} surfaces returning unknown status`
        : null,
      "Insufficient signal to determine scope",
      "Check official status page for confirmation",
    ].filter(Boolean) as string[],
  };
}
```

### 2.3 Créer `src/lib/service-page/getServiceDashboard.ts`

Fonction serveur centralisant toute la data.
**DOIT utiliser `$queryRaw` avec LATERAL JOIN — voir docs/CODE_CONTEXT.md section 3.**

```typescript
import { prisma } from "@/lib/prisma";
import { TOP_SERVICE_CONTENT } from "@/content/top-services";
import { classifyServiceIssue } from "./classifyServiceIssue";
import type { ServiceDashboardData, SurfaceSnapshot, IncidentSummary } from "./types";

export async function getServiceDashboard(
  slug: string
): Promise<ServiceDashboardData | null> {

  // 1. Load service basic info
  const service = await prisma.service.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, name: true, category: true,
      description: true, websiteUrl: true, iconUrl: true,
    },
  });
  if (!service) return null;

  // 2. Load surfaces with latest observation (LATERAL JOIN)
  const surfacesRaw = await prisma.$queryRaw<Array<{
    surfaceId: string;
    surfaceSlug: string;
    displayName: string;
    status: string | null;
    latencyMs: number | null;
    httpStatus: number | null;
    confidence: string | null;
    observedAt: Date | null;
  }>>`
    SELECT
      ss.id AS "surfaceId",
      ss.slug AS "surfaceSlug",
      ss."displayName",
      latest.status,
      latest."latencyMs",
      latest."httpStatus",
      latest.confidence,
      latest."observedAt"
    FROM "ServiceSurface" ss
    LEFT JOIN LATERAL (
      SELECT o.status, o."latencyMs", o."httpStatus", o.confidence, o."observedAt"
      FROM "Observation" o
      WHERE o."serviceSurfaceId" = ss.id
      ORDER BY o."observedAt" DESC
      LIMIT 1
    ) latest ON true
    WHERE ss."serviceId" = ${service.id}
      AND ss."isEnabled" = true
    ORDER BY ss.slug
  `;

  // 3. Compute p50/p95 latency 24h per surface (single query for all surfaces)
  const latencyStats = await prisma.$queryRaw<Array<{
    surfaceId: string;
    p50: number | null;
    p95: number | null;
  }>>`
    SELECT
      ss.id AS "surfaceId",
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY o."latencyMs") AS p50,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY o."latencyMs") AS p95
    FROM "ServiceSurface" ss
    LEFT JOIN "Observation" o
      ON o."serviceSurfaceId" = ss.id
      AND o."observedAt" >= NOW() - INTERVAL '24 hours'
      AND o."latencyMs" IS NOT NULL
    WHERE ss."serviceId" = ${service.id}
      AND ss."isEnabled" = true
    GROUP BY ss.id
  `;

  const latencyMap = new Map(latencyStats.map(l => [l.surfaceId, l]));

  // Build surface snapshots
  const surfaces: SurfaceSnapshot[] = surfacesRaw.map(s => {
    const stats = latencyMap.get(s.surfaceId);
    return {
      surfaceId: s.surfaceId,
      surfaceSlug: s.surfaceSlug,
      displayName: s.displayName,
      status: (s.status as SurfaceSnapshot["status"]) ?? "UNKNOWN",
      latestHttpStatus: s.httpStatus,
      latestLatencyMs: s.latencyMs,
      confidence: s.confidence,
      lastObservedAt: s.observedAt,
      p50Latency24h: stats?.p50 ? Math.round(Number(stats.p50)) : null,
      p95Latency24h: stats?.p95 ? Math.round(Number(stats.p95)) : null,
    };
  });

  // 4. Compute uptime 24h (percentage of OPERATIONAL observations)
  const uptimeRaw = await prisma.$queryRaw<[{ total: bigint; operational: bigint }]>`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE o.status = 'OPERATIONAL') AS operational
    FROM "Observation" o
    INNER JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
    WHERE ss."serviceId" = ${service.id}
      AND o."observedAt" >= NOW() - INTERVAL '24 hours'
  `;
  const uptime24h = uptimeRaw[0].total > 0n
    ? Number((uptimeRaw[0].operational * 10000n) / uptimeRaw[0].total) / 100
    : null;

  // 5. Load incidents last 30 days
  const incidentsRaw = await prisma.incident.findMany({
    where: {
      serviceId: service.id,
      startedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { startedAt: "desc" },
    take: 10,
  });
  const incidents30d: IncidentSummary[] = incidentsRaw.map(inc => ({
    id: inc.id,
    title: inc.title,
    status: inc.status,
    severity: inc.severity,
    startedAt: inc.startedAt,
    resolvedAt: inc.resolvedAt,
    duration: inc.resolvedAt
      ? Math.round((inc.resolvedAt.getTime() - inc.startedAt.getTime()) / 60000)
      : null,
    summary: inc.summary,
  }));

  // 6. Load community reports summary
  const reports24hCount = await prisma.communityReport.count({
    where: {
      serviceId: service.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  const reports2hCount = await prisma.communityReport.count({
    where: {
      serviceId: service.id,
      createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    },
  });

  // Reports by type (24h)
  const reportsByType = await prisma.communityReport.groupBy({
    by: ["reportType"],
    where: {
      serviceId: service.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    _count: true,
  });

  // Recent comments (5 max)
  const recentComments = await prisma.communityReport.findMany({
    where: {
      serviceId: service.id,
      comment: { not: null },
      isVisible: true,
      isSpam: false,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      reportType: true,
      comment: true,
      createdAt: true,
    },
  });

  // 7. Classify
  const hasOpenIncident = incidentsRaw.some(i => i.status !== "RESOLVED");
  const diagnosis = classifyServiceIssue({
    surfaces,
    reports24h: reports24hCount,
    reports2h: reports2hCount,
    hasOpenIncident,
  });

  // 8. Overall status = worst of surface statuses
  const statusPriority = { OUTAGE: 3, DEGRADED: 2, UNKNOWN: 1, OPERATIONAL: 0 };
  const overallStatus = surfaces.reduce(
    (worst, s) =>
      (statusPriority[s.status] ?? 0) > (statusPriority[worst] ?? 0) ? s.status : worst,
    "OPERATIONAL" as SurfaceSnapshot["status"]
  );

  // 9. Top 50 content
  const topContent = TOP_SERVICE_CONTENT[slug] ?? null;

  return {
    service,
    overallStatus,
    diagnosis,
    surfaces,
    uptime24h,
    incidents30d,
    reportSummary: {
      total24h: reports24hCount,
      byType: Object.fromEntries(
        reportsByType.map(r => [r.reportType, r._count])
      ),
      bySurface: {}, // can be enriched later
      recentComments: recentComments.map(c => ({
        pseudo: "Anonymous",
        content: c.comment!,
        reportType: c.reportType,
        createdAt: c.createdAt,
      })),
    },
    topContent,
  };
}
```

**NOTE** : Les `count` et `groupBy` Prisma sont acceptables ici car ils travaillent sur des indexes existants (`@@index([serviceId, createdAt(sort: Desc)])`) et ne font pas de partition scan. Seules les requêtes sur `Observation` DOIVENT utiliser LATERAL JOIN.

### 2.4 Créer `src/lib/service-page/structuredData.ts`

```typescript
import type { ServiceDashboardData } from "./types";

export function buildBreadcrumbJsonLd(service: { slug: string; name: string; category: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://downforai.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: service.category.replace(/_/g, " "),
        item: `https://downforai.com/category/${service.category.toLowerCase().replace(/_/g, "-")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.name,
        item: `https://downforai.com/${service.slug}`,
      },
    ],
  };
}

export function buildSoftwareApplicationJsonLd(
  service: { slug: string; name: string; description: string | null; websiteUrl: string | null },
  dashboard: ServiceDashboardData
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: service.name,
    description: service.description ?? `${service.name} AI service status and monitoring`,
    url: service.websiteUrl ?? `https://downforai.com/${service.slug}`,
    applicationCategory: "Artificial Intelligence",
    operatingSystem: "Web",
  };
}
```

**NE PAS ajouter FAQPage** — Google a restreint les FAQ rich results aux sites santé/gov.

---

## PHASE 3 — COMPOSANTS REACT (src/components/service/)

Créer les 13 composants suivants. Chacun reçoit des props typées depuis `ServiceDashboardData`.

**Conventions de style :**
- Utiliser les couleurs sémantiques du tailwind.config (`color-background`, `color-surface`, `color-border`, `color-text-primary/secondary/muted`)
- `font-mono` pour toute donnée technique (HTTP codes, latency, timestamps, curl)
- `font-sans` pour labels et titres
- Container : `max-w-6xl mx-auto` (pas de sidebar)
- Status colors : emerald-500 (OPERATIONAL), amber-500 (DEGRADED), red-500 (OUTAGE), slate-400 (UNKNOWN)
- Mobile : sections 6+ collapsables (accordéon ou details/summary)

**IMPORTANT** : Regarde d'abord les composants existants dans `src/components/` pour réutiliser les patterns de style déjà en place. Ne pas réinventer les couleurs de status si elles existent déjà.

### Liste des 13 composants à créer

1. **`ServiceHeroHeader.tsx`** — Bloc 1, above-the-fold
   - Props : `service`, `overallStatus`, `diagnosis`, `surfaces`, `reportSummary`, `topContent`
   - Contenu : H1 (`{name} status: API, auth, latency & outage reports`), badge status principal (OPERATIONAL/DEGRADED/OUTAGE), sous-verdict du classifieur (ex: "Likely provider-side issue"), ligne de confiance ("Last probe 2 min ago · X surfaces · Y reports / 24h"), chips vers status page/docs/pricing (si topContent existe), CTA "Report issue"

2. **`ServiceSignalStrip.tsx`** — Bloc 2, compact KPI strip
   - Props : `uptime24h`, `surfaces` (pour p50/p95), `incidents30d`
   - Contenu : 4 tuiles — 24h uptime %, p50 latency, p95 latency, incidents count 30d
   - Desktop : 4 colonnes. Mobile : 2×2 grid.

3. **`SurfaceHealthGrid.tsx`** — Bloc 3
   - Props : `surfaces`
   - Contenu : une card par surface avec status badge, HTTP code, last success ago, p50 24h
   - Desktop : 3 cols. Tablet : 2. Mobile : 1.

4. **`LatencySparklinePanel.tsx`** — Bloc 4a
   - Props : `serviceId` (pour fetch sparkline data côté client ou via server component)
   - Contenu : Sparkline p50/p95 sur 24h (use recharts `LineChart`). Grille 4h. Zones de couleur : vert <500ms, orange 500-1500ms, rouge >1500ms. Tooltip avec timestamp + valeurs exactes.
   - **NOTE** : Si les données sparkline nécessitent une requête supplémentaire (48 buckets de 30 min), créer un endpoint API dédié `GET /api/service/[slug]/sparkline` ou utiliser un Server Component avec la requête sparkline du CODE_CONTEXT.md section 3.

5. **`UptimeHeatStrip.tsx`** — Bloc 4b
   - Props : `serviceId`
   - Contenu : 48 slots de 30 min, colorés (vert/orange/rouge/gris). Hover tooltip : "02:00–02:30 · degraded". Légende sous le strip.
   - **NOTE** : partage la même source de données que le sparkline (buckets).

6. **`DiagnosisPanel.tsx`** — Bloc 5
   - Props : `diagnosis`, `overallStatus`
   - Contenu : panneau "Is {name} down for everyone, or is it just you?". 3 sous-blocs : A) Current diagnosis (label + confidence badge), B) Why we think that (liste des reasons), C) What to check right now (5 quick checks).
   - Desktop : 2 colonnes. Mobile : 1.

7. **`IncidentTimelinePanel.tsx`** — Bloc 6
   - Props : `incidents30d`
   - Contenu : timeline verticale des 5 derniers incidents. Chaque incident : titre, start/end, durée, severity badge. Si aucun incident : "No incidents recorded in the last 30 days".

8. **`ErrorSignaturesPanel.tsx`** — Bloc 7 (**absorbe le contenu des pages /error/**)
   - Props : `topContent` (pour `knownFailurePatterns`)
   - Contenu : accordéon, max 6 erreurs. Si `topContent` est null, afficher un message générique "Check official status page". Pour chaque erreur : pattern name, scope badge, signal, quickCheck.
   - Desktop : premier item ouvert par défaut. Mobile : tout fermé.
   - **C'est ici que le contenu des anciennes pages /error/ est absorbé.**

9. **`SymptomsPanel.tsx`** — Bloc 8 (**absorbe le contenu des pages /[symptom]/**)
   - Props : `reportSummary.byType`
   - Contenu : chips/badges pour chaque type de rapport (DOWN, SLOW, LOGIN, API_ERROR, OTHER) avec count 24h. Coloré proportionnellement au volume.
   - **C'est ici que le contenu des anciennes pages /[symptom]/ est absorbé.**

10. **`CommunityEvidencePanel.tsx`** — Bloc 9
    - Props : `reportSummary`
    - Contenu : "Latest reports" — 5 commentaires récents avec horodatage relatif, report type badge. Si aucun : "No recent community reports".
    - Réutiliser le composant Comments existant si possible.

11. **`ProviderSpecificPanel.tsx`** — Bloc 10 (**contenu unique top 50**)
    - Props : `topContent`
    - Contenu : **SI `topContent` est null → return null** (ne rien afficher pour les 752 services non-top-50). Si présent : providerSummary, officialStatusUrl link, docsUrl link, pricingUrl link, communityLinks, monitoredSurfaces list, diagnosticHeaders (dans un bloc `font-mono`), diagnosticCommands (dans un bloc `font-mono` copiable).

12. **`FallbackAlternativesPanel.tsx`** — Bloc 11
    - Props : `topContent`
    - Contenu : **SI `topContent` est null → return null**. Sinon : liste des fallback alternatives. Format : "If X is unavailable → Y can reduce downtime — switching cost: low/medium/high".

13. **`MethodologyPanel.tsx`** — Bloc 12
    - Props : `surfaces` (pour count), `service`
    - Contenu : court paragraphe de crédibilité : probe cadence, number of surfaces, what "checking" means, synthetic probes vs user reports, limits of inference. Max 100 mots.

---

## PHASE 4 — REFONDRE LA PAGE SERVICE

### 4.1 Modifier `src/app/[serviceSlug]/page.tsx`

**Remplacer la logique actuelle** par :

```typescript
import { getServiceDashboard } from "@/lib/service-page/getServiceDashboard";
import { buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd } from "@/lib/service-page/structuredData";
import { TOP_SERVICE_CONTENT } from "@/content/top-services";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Components
import ServiceHeroHeader from "@/components/service/ServiceHeroHeader";
import ServiceSignalStrip from "@/components/service/ServiceSignalStrip";
import SurfaceHealthGrid from "@/components/service/SurfaceHealthGrid";
import LatencySparklinePanel from "@/components/service/LatencySparklinePanel";
import UptimeHeatStrip from "@/components/service/UptimeHeatStrip";
import DiagnosisPanel from "@/components/service/DiagnosisPanel";
import IncidentTimelinePanel from "@/components/service/IncidentTimelinePanel";
import ErrorSignaturesPanel from "@/components/service/ErrorSignaturesPanel";
import SymptomsPanel from "@/components/service/SymptomsPanel";
import CommunityEvidencePanel from "@/components/service/CommunityEvidencePanel";
import ProviderSpecificPanel from "@/components/service/ProviderSpecificPanel";
import FallbackAlternativesPanel from "@/components/service/FallbackAlternativesPanel";
import MethodologyPanel from "@/components/service/MethodologyPanel";

export async function generateMetadata({ params }: { params: { serviceSlug: string } }): Promise<Metadata> {
  // Use a lightweight query here, NOT getServiceDashboard
  // to avoid double-fetching
  const service = await prisma.service.findUnique({
    where: { slug: params.serviceSlug },
    select: { name: true, slug: true },
  });
  if (!service) return {};

  return {
    title: `${service.name} status: API, auth, latency & outage reports`,
    description: `Live technical status for ${service.name}: API health, auth, latency, incidents, error signatures, and community outage reports.`,
    alternates: { canonical: `/${service.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function ServicePage({ params }: { params: { serviceSlug: string } }) {
  const dashboard = await getServiceDashboard(params.serviceSlug);
  if (!dashboard) notFound();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(dashboard.service);
  const softwareAppJsonLd = buildSoftwareApplicationJsonLd(dashboard.service, dashboard);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, softwareAppJsonLd]) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <ServiceHeroHeader
          service={dashboard.service}
          overallStatus={dashboard.overallStatus}
          diagnosis={dashboard.diagnosis}
          surfaces={dashboard.surfaces}
          reportSummary={dashboard.reportSummary}
          topContent={dashboard.topContent}
        />
        <ServiceSignalStrip
          uptime24h={dashboard.uptime24h}
          surfaces={dashboard.surfaces}
          incidents30d={dashboard.incidents30d}
        />
        <SurfaceHealthGrid surfaces={dashboard.surfaces} />
        <LatencySparklinePanel serviceId={dashboard.service.id} />
        <UptimeHeatStrip serviceId={dashboard.service.id} />
        <DiagnosisPanel
          diagnosis={dashboard.diagnosis}
          overallStatus={dashboard.overallStatus}
        />
        <IncidentTimelinePanel incidents={dashboard.incidents30d} />
        <ErrorSignaturesPanel topContent={dashboard.topContent} />
        <SymptomsPanel reportSummary={dashboard.reportSummary} />
        <CommunityEvidencePanel reportSummary={dashboard.reportSummary} />
        <ProviderSpecificPanel topContent={dashboard.topContent} />
        <FallbackAlternativesPanel topContent={dashboard.topContent} />
        <MethodologyPanel
          surfaces={dashboard.surfaces}
          service={dashboard.service}
        />
        {/* Existing Comments component — keep as is, push to bottom */}
      </div>
    </>
  );
}
```

**IMPORTANT** :
- Garder le composant Comments existant en bas de page — ne pas le supprimer.
- Garder le lien NordVPN s'il existe dans la page actuelle.
- Ne pas appeler `headers()` dans le composant (casse le cache ISR — voir CODE_CONTEXT.md).

---

## PHASE 5 — SEO CLEANUP (Push 1)

### 5.1 Modifier `src/app/sitemap.ts`

Retirer du sitemap :
- Toutes les URLs `/${serviceSlug}/down`
- Toutes les URLs `/${serviceSlug}/error/${errorSlug}`
- Toutes les URLs `/${serviceSlug}/${symptom}`

Garder :
- `/` (homepage)
- `/category/${category}` (toutes les catégories)
- `/${serviceSlug}` (810 pages service)
- Pages statiques (`/about`, `/contact`, `/incidents`, `/privacy`, `/terms`, `/cookie-policy`)

### 5.2 Noindex sur pages dérivées

Dans chacun de ces fichiers, modifier `generateMetadata()` :
- `src/app/[serviceSlug]/down/page.tsx`
- `src/app/[serviceSlug]/error/[errorSlug]/page.tsx`
- `src/app/[serviceSlug]/[symptom]/page.tsx`

Ajouter :

```typescript
robots: { index: false, follow: true },
alternates: { canonical: `/${params.serviceSlug}` },
```

Et en haut du rendu JSX, ajouter un bandeau de redirection soft :

```tsx
<div className="bg-slate-800 border border-color-border rounded-lg p-4 mb-6 text-center">
  <p className="text-color-text-secondary">
    This page has moved.{" "}
    <a href={`/${params.serviceSlug}`} className="text-emerald-400 underline">
      View the full status dashboard for {service.name} →
    </a>
  </p>
</div>
```

---

## PHASE 6 — REDIRECTS 301 (Push 2 — séparé, 24-72h après Push 1)

### 6.1 Modifier `next.config.ts`

```typescript
async redirects() {
  return [
    {
      source: "/:serviceSlug/down",
      destination: "/:serviceSlug",
      permanent: true,
    },
    {
      source: "/:serviceSlug/error/:errorSlug",
      destination: "/:serviceSlug",
      permanent: true,
    },
    {
      source: "/:serviceSlug/:symptom(slow|login-issues|api-errors|empty-responses|model-unavailable)",
      destination: "/:serviceSlug",
      permanent: true,
    },
  ];
},
```

**IMPORTANT pour la route /:symptom** : il faut un pattern restrictif (regex ou liste) pour ne pas attraper les routes légitimes comme `/category/`, `/about/`, etc. Utiliser une liste explicite de symptom slugs ou un middleware de matching.

**Tester avant push** que les redirects ne créent pas de boucles.

### 6.2 Supprimer les fichiers route (optionnel, après stabilisation)

Une fois les 301 confirmés stables (7+ jours), supprimer :
- `src/app/[serviceSlug]/down/`
- `src/app/[serviceSlug]/error/`
- `src/app/[serviceSlug]/[symptom]/`

---

## CHECKLIST AVANT PUSH

### Build local

```bash
npm run build
# Doit réussir sans erreur
```

### Vérification manuelle de 5 pages

Ouvrir en `npm run dev` :
1. `/openai` — service top 50, doit afficher le ProviderSpecificPanel
2. `/chatgpt` — service top 50, panels complets
3. `/claude-chat` — service top 50
4. `/voicemod` — service non top 50, ProviderSpecificPanel doit return null (pas de bloc)
5. `/01-ai-yi` — service normal, template de base sans contenu enrichi

### Vérification pages dérivées

6. `/openai/down` — doit afficher le bandeau "This page has moved" + noindex dans le HTML
7. `/openai/error/rate-limit-exceeded` — même chose
8. `/openai/slow` — même chose

### Vérification technique

9. Pas de `headers()` call dans le root layout ou les server components (casse ISR)
10. JSON-LD BreadcrumbList et SoftwareApplication présents dans le HTML source
11. Canonical URL correcte dans le `<head>`
12. Pas d'erreur console / hydration warning
13. Lighthouse desktop > 95

---

## PLAN DE MESURE POST-PUSH

### H+24 — Survie technique (DOIT vérifier)

| Quoi | Seuil OK | Seuil panique |
|------|----------|---------------|
| Vercel 5xx | < 0.5% des requêtes | > 2% → rollback |
| Neon data transfer | < 5 GB/jour | > 10 GB/jour → requête non optimisée, rollback |
| Pages service rendues | Fonctionnelles (spot check 5 pages) | Crash / blank → rollback |
| Redirect loops | 0 détectée | Toute loop → rollback Push 2 |
| ISR cache HIT rate | > 50% | < 10% → `headers()` leak, fix |

### J+7 — Premier signal Google

| Quoi | Seuil bon | Seuil inquiétant |
|------|-----------|------------------|
| GSC impressions pages service | Stable ou hausse | Chute > 20% → investiguer |
| GSC impressions pages dérivées | En baisse | Si stables → noindex pas pris en compte, revérifier |
| GSC "Pages avec redirection" | Hausse (normal) | — |
| GSC "Explorée, non indexée" | Stable | Forte hausse sur pages service → problème de contenu |
| PostHog organic Google | Stable | Chute > 30% → rollback complet si combiné avec GSC chute |
| PostHog engagement pages service | Hausse ou stable | — |

### J+30 — Consolidation (mi-mai 2026)

| Quoi | Succès | Stagnation | Échec |
|------|--------|------------|-------|
| CTR pages service | > 3% | 1.5–3% | < 1.5% |
| Impressions globales | Hausse > 20% vs baseline | ±10% | Chute > 20% |
| Positions moyennes | 5–8 sur requêtes cibles | 8–12 | > 12 |
| Bing traffic | Maintien ou hausse | — | Chute |
| PostHog session duration | Hausse (devs lisent le dashboard) | Stable | Chute |
| Neon data transfer | < 3 GB/jour | < 5 GB/jour | > 5 GB/jour |

**Si échec J+30** : enrichir plus agressivement les top 20, envisager de réduire les 810 à un noyau SEO plus serré.

---

**FIN DU BRIEF CLAUDE CODE**

Rappel des fichiers de référence :
- `docs/CODE_CONTEXT.md` — schéma, requêtes, design
- `docs/top50_v2.md` — contenu éditorial 58 fiches
- `docs/SLUG_MAPPING.md` — validation slugs

Tag git avant push : `pre-service-page-consolidation`
Tag git avant Push 2 : `pre-derived-redirects`
