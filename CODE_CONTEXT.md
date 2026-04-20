# DownForAI — Code Context for Claude Code

> Document de référence pour Claude Code. À lire **avant toute modification** du code.
> Version : 1.0 — 17 avril 2026
> Project : `dalbianapp/downforai` (Next.js 15 + Prisma + Neon + Vercel Pro)

---

## 1. Stack

- **Framework** : Next.js 15 (App Router)
- **ORM** : Prisma
- **DB** : Neon PostgreSQL (pooled connection, Frankfurt region)
- **Styling** : Tailwind CSS
- **Fonts** : JetBrains Mono (mono), system-ui (sans)
- **Deploy** : Vercel Pro (auto-deploy from `main` branch)
- **Analytics** : PostHog (EU host: `eu.i.posthog.com`)
- **Monitoring crons** : internal, secret `dfa-cron-2026-prod-secure`

---

## 2. Prisma Schema — Models clés

### `Service` (810 entries)

```prisma
model Service {
  id              String          @id @default(cuid())
  slug            String          @unique       // ← key for all lookups
  name            String
  category        ServiceCategory
  tier            Int             @default(1)
  defaultBadge    BadgeType
  limitPhraseKey  String
  websiteUrl      String?
  iconUrl         String?
  description     String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  surfaces         ServiceSurface[]
  incidents        Incident[]
  communityReports CommunityReport[]
  comments         Comment[]

  @@index([category])
}
```

**Important** : `slug` is the canonical lookup key used throughout the app and in URLs `/[serviceSlug]`.

### `ServiceSurface`

Each service has 1+ surfaces (e.g. ChatGPT has "ChatGPT Web", "ChatGPT Mobile", "Auth").

```prisma
model ServiceSurface {
  id                     String    @id @default(cuid())
  serviceId              String
  slug                   String                         // surface slug within service
  displayName            String
  badgeOverride          BadgeType?
  limitPhraseOverrideKey String?
  isEnabled              Boolean   @default(true)
  checkUrl               String?                        // URL to ping for monitoring
  createdAt              DateTime  @default(now())

  service       Service           @relation(...)
  observations  Observation[]
  reports       CommunityReport[]

  @@unique([serviceId, slug])
  @@index([serviceId])
}
```

### `Observation` (high write volume — monitoring data)

```prisma
model Observation {
  id               String        @id @default(cuid())
  serviceSurfaceId String
  regionId         String
  status           ServiceStatus                        // OPERATIONAL | DEGRADED | OUTAGE | UNKNOWN
  latencyMs        Int?
  errorRate        Int?
  httpStatus       Int?                                  // HTTP status code from ping
  confidence       String?                               // "HIGH" or "LOW"
  observedAt       DateTime      @default(now())

  serviceSurface ServiceSurface @relation(...)
  region         Region         @relation(...)

  @@index([serviceSurfaceId, observedAt(sort: Desc)])   // ← KEY INDEX for LATERAL JOIN
  @@index([regionId])
}
```

**Critical index**: `@@index([serviceSurfaceId, observedAt(sort: Desc)])` — this is what enables LATERAL JOIN with `ORDER BY observedAt DESC LIMIT N` to be fast.

### `Incident`

```prisma
model Incident {
  id          String           @id @default(cuid())
  serviceId   String
  title       String
  status      IncidentStatus                            // OPEN | MONITORING | RESOLVED
  severity    IncidentSeverity                          // MINOR | MAJOR | CRITICAL
  startedAt   DateTime         @default(now())
  resolvedAt  DateTime?
  summary     String?
  sourceBadge BadgeType
  createdAt   DateTime         @default(now())

  service Service @relation(...)

  @@index([serviceId, startedAt(sort: Desc)])
}
```

### `CommunityReport`

User-submitted reports. Has comment/email/admin-reply fields.

```prisma
model CommunityReport {
  id           String     @id @default(cuid())
  serviceId    String
  surfaceId    String?                                  // optional affected surface
  reportType   ReportType                               // DOWN | SLOW | LOGIN | API_ERROR | OTHER
  countryCode  String?
  ipHash       String?
  email        String?
  comment      String?                                  // max 500 chars (enforce in app)
  adminReply   String?
  adminReplyAt DateTime?
  isVisible    Boolean    @default(true)                // moderation flag
  isSpam       Boolean    @default(false)
  createdAt    DateTime   @default(now())

  service Service         @relation(...)
  surface ServiceSurface? @relation(...)

  @@index([serviceId, createdAt(sort: Desc)])
  @@index([ipHash, createdAt(sort: Desc)])
  @@index([ipHash, serviceId, createdAt(sort: Desc)])
  @@index([surfaceId, createdAt(sort: Desc)])
  @@index([serviceId, reportType, createdAt(sort: Desc)])
}
```

### `Comment` (separate from CommunityReport)

```prisma
model Comment {
  id        String   @id @default(cuid())
  serviceId String
  pseudo    String   @default("Anonymous")
  content   String
  aiReply   String?
  ipHash    String?
  isVisible Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([serviceId, createdAt(sort: Desc)])
  @@index([ipHash, createdAt(sort: Desc)])
}
```

### Enums clés

```prisma
enum ServiceStatus { OPERATIONAL DEGRADED OUTAGE UNKNOWN }
enum IncidentStatus { OPEN MONITORING RESOLVED }
enum IncidentSeverity { MINOR MAJOR CRITICAL }
enum ReportType { DOWN SLOW LOGIN API_ERROR OTHER }
enum BadgeType { LIVE_MONITORING STATUS_PAGE_SYNC COMMUNITY_REPORTS }

enum ServiceCategory {
  LLM IMAGE VIDEO AUDIO DEV INFRA SEARCH PRODUCTIVITY
  AGENTS THREE_D DESIGN MLOPS VECTOR_DB ROLEPLAY
  MARKETING SUPPORT EDUCATION HR_AI LEGAL_AI
}
```

**NOTE** : there is **no `PerformanceLevel` field in the current schema**. The `PerformanceLevel` system (NORMAL/ELEVATED/SEVERE/UNKNOWN) is computed in-app from `Observation.latencyMs`, not stored.

---

## 3. Requêtes Prisma optimisées — Patterns à utiliser

### ❌ Pattern à BANNIR (cause de la catastrophe Neon 98 GB/jour)

```typescript
// NEVER DO THIS — causes ROW_NUMBER() OVER (PARTITION BY ...) full table scan
await prisma.service.findMany({
  include: {
    observations: {
      orderBy: { observedAt: "desc" },
      take: 1,
    },
  },
});
```

Cette pattern Prisma génère un `ROW_NUMBER()` qui scanne TOUTES les observations. **Interdit** sur homepage, category, ou toute page à fort trafic.

### ✅ Pattern LATERAL JOIN — à utiliser partout

```typescript
// Pour la homepage : latest observation per service surface
const result = await prisma.$queryRaw<Array<{
  serviceId: string;
  slug: string;
  name: string;
  status: string;
  latencyMs: number | null;
  observedAt: Date;
}>>`
  SELECT
    s.id AS "serviceId",
    s.slug,
    s.name,
    s.category,
    latest.status,
    latest."latencyMs",
    latest."observedAt"
  FROM "Service" s
  LEFT JOIN LATERAL (
    SELECT o.status, o."latencyMs", o."observedAt"
    FROM "Observation" o
    INNER JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
    WHERE ss."serviceId" = s.id
    ORDER BY o."observedAt" DESC
    LIMIT 1
  ) latest ON true
  ORDER BY s.tier DESC, s.name
  LIMIT 24;
`;
```

### ✅ Pattern avec filtre category (cast enum)

```typescript
// Pour les pages category : cast du string vers enum obligatoire
const categoryUpper = category.toUpperCase(); // "LLM", "DEV", etc.

const result = await prisma.$queryRaw`
  SELECT s.*, latest.status, latest."latencyMs"
  FROM "Service" s
  LEFT JOIN LATERAL (
    SELECT o.status, o."latencyMs"
    FROM "Observation" o
    INNER JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
    WHERE ss."serviceId" = s.id
    ORDER BY o."observedAt" DESC
    LIMIT 1
  ) latest ON true
  WHERE s.category = ${categoryUpper}::"ServiceCategory"
  ORDER BY s.name;
`;
```

### ✅ Pattern pour une page service (toutes surfaces + latest observation)

```typescript
// Utilisé dans getServiceDashboard(slug) :
const surfacesWithLatest = await prisma.$queryRaw`
  SELECT
    ss.id AS "surfaceId",
    ss.slug AS "surfaceSlug",
    ss."displayName",
    latest.status,
    latest."latencyMs",
    latest."httpStatus",
    latest."observedAt"
  FROM "ServiceSurface" ss
  INNER JOIN "Service" s ON s.id = ss."serviceId"
  LEFT JOIN LATERAL (
    SELECT o.status, o."latencyMs", o."httpStatus", o."observedAt"
    FROM "Observation" o
    WHERE o."serviceSurfaceId" = ss.id
    ORDER BY o."observedAt" DESC
    LIMIT 1
  ) latest ON true
  WHERE s.slug = ${slug}
    AND ss."isEnabled" = true
  ORDER BY ss.slug;
`;
```

### ✅ Pattern pour sparkline 24h (48 buckets de 30 min)

```typescript
// Observations bucketisées pour une surface précise
const sparklineData = await prisma.$queryRaw`
  WITH buckets AS (
    SELECT generate_series(
      date_trunc('hour', NOW() - INTERVAL '24 hours'),
      NOW(),
      INTERVAL '30 minutes'
    ) AS bucket_start
  )
  SELECT
    b.bucket_start,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY o."latencyMs") AS p50,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY o."latencyMs") AS p95,
    MODE() WITHIN GROUP (ORDER BY o.status) AS mode_status
  FROM buckets b
  LEFT JOIN "Observation" o
    ON o."serviceSurfaceId" = ${surfaceId}
    AND o."observedAt" >= b.bucket_start
    AND o."observedAt" < b.bucket_start + INTERVAL '30 minutes'
  GROUP BY b.bucket_start
  ORDER BY b.bucket_start;
`;
```

---

## 4. Architecture app (structure observée + cible)

### Structure actuelle (estimation, à vérifier)

```
src/
├── app/
│   ├── layout.tsx                          # root layout (GSC meta, PostHog init)
│   ├── page.tsx                             # homepage
│   ├── sitemap.ts                           # sitemap generator
│   ├── robots.ts                            # robots.txt
│   ├── category/
│   │   └── [category]/page.tsx
│   ├── [serviceSlug]/
│   │   ├── page.tsx                         # ← TO REBUILD
│   │   ├── down/page.tsx                    # ← TO NOINDEX (Push 1), DELETE (Push 2)
│   │   ├── error/[errorSlug]/page.tsx       # ← TO NOINDEX (Push 1), DELETE (Push 2)
│   │   └── [symptom]/page.tsx               # ← TO NOINDEX (Push 1), DELETE (Push 2)
│   ├── errors/
│   │   ├── page.tsx                         # à étudier séparément
│   │   └── [errorSlug]/page.tsx
│   ├── incidents/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── components/
│   ├── Header.tsx / Footer.tsx              # keep as is
│   ├── service/                             # ← TO CREATE (13 new components)
│   ├── ... (existing shared components)
├── lib/
│   ├── prisma.ts
│   ├── service-page/                        # ← TO CREATE
│   │   ├── types.ts
│   │   ├── getServiceDashboard.ts
│   │   ├── classifyServiceIssue.ts
│   │   └── structuredData.ts
│   └── ...
├── content/                                  # ← TO CREATE
│   └── top-services/
│       ├── types.ts
│       ├── top50.ts                         # converti depuis top50_v2.md
│       └── index.ts
└── ...
```

### Composants à créer (13 pour fiche service)

```
src/components/service/
├── ServiceHeroHeader.tsx         # bloc 1 — verdict + badge + CTA
├── ServiceSignalStrip.tsx        # bloc 2 — 4 KPI tiles
├── SurfaceHealthGrid.tsx         # bloc 3 — cards par surface
├── LatencySparklinePanel.tsx     # bloc 4a — sparkline p50/p95
├── UptimeHeatStrip.tsx           # bloc 4b — 48 buckets de 30min
├── DiagnosisPanel.tsx            # bloc 5 — classifier global/local
├── IncidentTimelinePanel.tsx     # bloc 6 — 5 derniers incidents
├── ErrorSignaturesPanel.tsx      # bloc 7 — accordion erreurs (ex /error/)
├── SymptomsPanel.tsx             # bloc 8 — chips symptômes (ex /[symptom]/)
├── CommunityEvidencePanel.tsx    # bloc 9 — reports + comments (existing reusable?)
├── ProviderSpecificPanel.tsx     # bloc 10 — contenu top50.ts
├── FallbackAlternativesPanel.tsx # bloc 11 — contenu top50.ts
├── MethodologyPanel.tsx          # bloc 12 — credibility footer
```

---

## 5. Design system — Tailwind

### Couleurs custom disponibles (`tailwind.config.ts`)

```typescript
// Slate palette (complete)
slate-50 → slate-950

// Semantic CSS vars (controlled via CSS)
color-background       → var(--background)
color-surface          → var(--surface)
color-surface-hover    → var(--surface-hover)
color-border           → var(--border)
color-text-primary     → var(--text-primary)
color-text-secondary   → var(--text-secondary)
color-text-muted       → var(--text-muted)
```

### Fonts

```typescript
font-mono  → "JetBrains Mono", ui-monospace
font-sans  → "system-ui", sans-serif
```

**Usage recommandé dans les nouveaux composants** :
- **`font-mono`** pour tout ce qui est data technique (HTTP codes, latency, timestamps, curl snippets, headers)
- **`font-sans`** pour narration, titres, labels UI

### Couleurs status recommandées (à créer ou réutiliser)

Le schéma a `ServiceStatus { OPERATIONAL DEGRADED OUTAGE UNKNOWN }`. Convention pour les nouveaux composants :

```typescript
// Suggested mapping using Tailwind classes
const STATUS_COLORS = {
  OPERATIONAL: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  DEGRADED:    "text-amber-500 bg-amber-500/10 border-amber-500/30",
  OUTAGE:      "text-red-500 bg-red-500/10 border-red-500/30",
  UNKNOWN:     "text-slate-400 bg-slate-500/10 border-slate-500/30",
};
```

**Before creating new colors, check existing usage in the codebase** — there might already be a status-color convention in `components/Header.tsx`, `components/ServiceCard.tsx`, or equivalent.

### Largeur cible des containers

- **Desktop** : `max-w-6xl mx-auto` (pas de panneau latéral — architecture V65 sans sidebar)
- **Mobile** : single column, sections collapsables à partir du bloc 6

---

## 6. SEO et indexation — état cible

### Pages à garder indexées

- `/` (homepage)
- `/category/[category]` (19 catégories)
- `/[serviceSlug]` (810 pages service) ← cœur du SEO
- `/incidents`
- `/about`, `/contact`
- `/errors` et `/errors/[errorSlug]` (décision séparée, probablement garder)

### Pages à noindex dès Push 1, supprimer après Push 2

- `/[serviceSlug]/down` (~810 pages)
- `/[serviceSlug]/error/[errorSlug]` (~2 400 pages)
- `/[serviceSlug]/[symptom]` (~60 pages)

### Structured data

**À INJECTER dans `/[serviceSlug]/page.tsx` :**
- `BreadcrumbList` (Home → Category → Service)
- `SoftwareApplication` ou `WebApplication` selon le service

**À NE PAS INJECTER :**
- `FAQPage` (Google a restreint les FAQ rich results aux sites santé/gov)
- `WebAPI` (trop spécifique, pas de bénéfice Google Search confirmé)
- `Dataset` (sauf si vraie page dataset exposée)

### Sitemap

Retirer de `src/app/sitemap.ts` :
- Toutes les URLs `/[slug]/down`
- Toutes les URLs `/[slug]/error/*`
- Toutes les URLs `/[slug]/[symptom]`

Garder :
- Homepage
- Catégories
- Service pages (810)
- Pages statiques utiles

### Metadata recommandée pour pages service

```typescript
// In src/app/[serviceSlug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const service = await getServiceBasic(params.serviceSlug);
  return {
    title: `${service.name} status: API, auth, latency & outage reports`,
    description: `Live technical status for ${service.name}: API health, auth, latency, incidents, error signatures, and community outage reports.`,
    alternates: { canonical: `/${service.slug}` },
    robots: { index: true, follow: true },
  };
}
```

Pour les pages dérivées (Push 1) :

```typescript
// In src/app/[serviceSlug]/down/page.tsx (and error/[errorSlug], [symptom])
export async function generateMetadata({ params }): Promise<Metadata> {
  const service = await getServiceBasic(params.serviceSlug);
  return {
    title: `...`,
    alternates: { canonical: `/${service.slug}` },
    robots: { index: false, follow: true },                        // ← key
  };
}
```

---

## 7. Variables d'environnement clés

```env
DATABASE_URL               # Neon pooled connection
DIRECT_URL                  # Neon direct (for migrations)
NEXT_PUBLIC_SITE_URL        # https://downforai.com
CRON_SECRET                 # dfa-cron-2026-prod-secure
NEXT_PUBLIC_POSTHOG_KEY     # phc_HVNiHPy9WRPOxsW7NocJDRPG6iiVkvhUr78db30Bk4B
NEXT_PUBLIC_POSTHOG_HOST    # https://eu.i.posthog.com
```

---

## 8. Middleware — bots bloqués

Ne pas modifier sans raison (coûte cher quand cassé) :

```typescript
// src/middleware.ts (current behavior)
const BLOCKED_BOTS = [
  "DotBot", "PetalBot", "Bytespider", "AhrefsBot", "Amazonbot",
  // + others
];
```

Si tu ajoutes du code serveur (getServiceDashboard), il NE DOIT PAS déclencher de requête DB quand le user agent est dans BLOCKED_BOTS (la middleware le renvoie avant).

---

## 9. NordVPN affiliate

**Lien présent dans le site — NE JAMAIS RETIRER.**

Il y a un lien d'affiliation CJ vers NordVPN dans le site (géré par Benjamin). Tout refactor doit le préserver. Probablement dans :
- Footer component
- Some service pages (`/[serviceSlug]/page.tsx`)
- AffiliateClick model tracks them

---

## 10. Performance baseline à préserver

**NE PAS CASSER** les métriques actuelles post-optimisations :

- PageSpeed Desktop : 100/100
- PageSpeed Mobile : 99/100
- LCP desktop : 0.4s
- Neon data transfer : ~1.85 GB/day (vs 98 GB/day avant optimisations)
- Vercel cache HIT rate : ~80%

Si une nouvelle requête fait monter Neon au-dessus de **5 GB/day**, c'est un signal de régression. Vérifier LATERAL JOIN et indexes.

---

**Fin de CODE_CONTEXT.md**
