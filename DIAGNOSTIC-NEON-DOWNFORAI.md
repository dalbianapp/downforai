# DIAGNOSTIC NEON — downforai.com vs statut-services.fr
**Date :** 2026-04-09  
**Contexte :** downforai.com consomme ~447 GB/8j vs ~65.8 GB/8j pour statut-services.fr → ratio 6.8×  
**Objectif :** Identifier les causes racines et estimer le gain après corrections

---

## 1. Tableau comparatif

| Métrique | statut-services.fr | downforai.com | Ratio |
|---|---|---|---|
| Pages SSG totales | ~0 (force-dynamic) | ~5 670 (810 services + 4 860 erreurs) | — |
| Revalidation service pages | force-dynamic | `revalidate = 60` | — |
| Revalidation error pages | ISR 300s | ISR 300s | 1× |
| Cron check-status | toutes les 5 min | toutes les 3 min | 1.7× |
| Cron aggregate-reports | toutes les 10 min | toutes les 10 min | 1× |
| Modèle observations | absent | surfaces + observations (take:150) | — |
| Polling client-side | aucun (SWR désactivé) | 2 instances SWR à 30s | — |
| Requêtes Prisma / render | 1-3 requêtes légères | 4-6 requêtes, dont include profond | ~4× |
| `take` observations / page | N/A | 150 par surface × N surfaces | — |

---

## 2. Coupables classés par impact estimé

| Rang | Coupable | Fichier | Gain estimé |
|---|---|---|---|
| 🔴 1 | `generateStaticParams` 810 services × revalidate:60 | `src/app/[serviceSlug]/page.tsx:25-28` | ~180 GB/8j |
| 🔴 2 | `include surfaces.observations take:150` par page | `src/app/[serviceSlug]/page.tsx:72-85` | ~120 GB/8j |
| 🟠 3 | `generateStaticParams` ~4 860 error pages × revalidate:300 | `src/app/[serviceSlug]/error/[errorSlug]/page.tsx:13-29` | ~60 GB/8j |
| 🟠 4 | Cron check-status toutes les 3 min au lieu de 5 min | `vercel.json:3` | ~20 GB/8j |
| 🟡 5 | Double polling SWR à 30s (QuickReport + WorldReportMap) | `src/components/QuickReport.tsx`, `WorldReportMap.tsx` | ~12 GB/8j |
| 🟡 6 | `/api/services/[slug]` avec `take:384` observations | `src/app/api/services/[slug]/route.ts` | ~8 GB/8j |

**Total estimé récupérable : ~400 GB/8j → retour à ~50 GB/8j**

---

## 3. Détail de chaque coupable

### 🔴 Coupable 1 — SSG × ISR sur 810 services pages (revalidate:60)

**Fichier :** `src/app/[serviceSlug]/page.tsx`  
**Lignes :** 25-28 (generateStaticParams) + 46 (revalidate)

```typescript
// ACTUEL — génère 810 pages, chacune re-exécutée toutes les 60s
export async function generateStaticParams() {
  const services = await prisma.service.findMany({ select: { slug: true } });
  return services.map(s => ({ serviceSlug: s.slug }));
}
export const revalidate = 60;
```

**Problème :** 810 pages × 1 régénération/min = 810 régénérations/min. Chaque régénération exécute 4-6 requêtes Prisma incluant `take:150` observations. Cela équivaut à >1 200 requêtes lourdes par minute.

**Correction — aligner sur statut-services (force-dynamic) :**
```typescript
// CORRIGÉ — pages dynamiques uniquement, zéro SSG cascade
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Supprimer entièrement generateStaticParams()
```

**Alternative moins radicale (garder SSG mais allonger revalidate) :**
```typescript
export const revalidate = 600; // 10 min au lieu de 60s → réduction 10×
```

**Gain estimé :** ~180 GB/8j (dominant)

---

### 🔴 Coupable 2 — `include surfaces.observations take:150`

**Fichier :** `src/app/[serviceSlug]/page.tsx`  
**Lignes :** 67-85

```typescript
// ACTUEL — charge jusqu'à 150 observations par surface
const serviceData = await prisma.service.findUnique({
  where: { slug: params.serviceSlug },
  include: {
    surfaces: {
      include: {
        observations: {
          where: { observedAt: { gte: since25h } },
          orderBy: { observedAt: 'desc' },
          take: 150,  // ← PROBLÈME : 150 rows × N surfaces × 810 pages
        },
      },
    },
    incidents: { take: 5 },
  },
});
```

**Problème :** Si un service a 3 surfaces et que chaque surface renvoie 150 observations, chaque render transfère 450 lignes depuis Neon. Multiplié par 810 pages à revalidate:60, c'est un volume considérable.

**Correction :**
```typescript
// CORRIGÉ — prendre uniquement les observations récentes nécessaires
const serviceData = await prisma.service.findUnique({
  where: { slug: params.serviceSlug },
  include: {
    surfaces: {
      include: {
        observations: {
          where: { observedAt: { gte: since25h } },
          orderBy: { observedAt: 'desc' },
          take: 10,  // ← 10 suffit pour afficher le statut récent
        },
      },
    },
    incidents: { take: 3 },  // 3 au lieu de 5
  },
});
```

**Gain estimé :** ~120 GB/8j (combiné avec coupable 1)

---

### 🟠 Coupable 3 — SSG 4 860 error pages × revalidate:300

**Fichier :** `src/app/[serviceSlug]/error/[errorSlug]/page.tsx`  
**Lignes :** 13-29

```typescript
// ACTUEL — génère ~4 860 pages (810 services × ~6 erreurs/catégorie)
export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    select: { slug: true, category: true },
  });
  return services.flatMap(service =>
    getErrorsForCategory(service.category).map(error => ({
      serviceSlug: service.slug,
      errorSlug: error.slug,
    }))
  );
}
export const revalidate = 300;
```

**Problème :** 4 860 pages × 1 régénération/5min = 972 régénérations/min. Le contenu des pages d'erreur est quasi-statique (les erreurs ne changent pas). La régénération toutes les 5 minutes est inutile.

**Correction :**
```typescript
// CORRIGÉ — contenu statique, pas de régénération automatique
export const revalidate = 86400; // 24h — les erreurs AI ne changent pas toutes les 5 min

// OU : désactiver generateStaticParams et passer en force-dynamic
// pour éviter le build time + les regenerations ISR
```

**Gain estimé :** ~60 GB/8j

---

### 🟠 Coupable 4 — Cron check-status toutes les 3 minutes

**Fichier :** `vercel.json`  
**Ligne :** 3

```json
// ACTUEL
{ "path": "/api/cron/check-status", "schedule": "*/3 * * * *" }
```

**Problème :** statut-services tourne à `*/5 * * * *`. La différence de 2 minutes représente 240 exécutions/jour supplémentaires. Si chaque exécution check 810 services, le volume est significatif.

**Correction :**
```json
// CORRIGÉ — aligner sur statut-services
{ "path": "/api/cron/check-status", "schedule": "*/5 * * * *" }
```

**Gain estimé :** ~20 GB/8j (ratio 3/5 = 40% de réduction des cron runs)

---

### 🟡 Coupable 5 — Double polling SWR à 30 secondes

**Fichiers :**  
- `src/components/QuickReport.tsx` — SWR sur `/api/services/[slug]`, `refreshInterval: 30000`
- `src/components/WorldReportMap.tsx` — SWR sur le même endpoint, `refreshInterval: 30000`

**Problème :** Deux composants indépendants pollent le même endpoint toutes les 30 secondes. SWR ne déduplique pas les requêtes entre composants distincts. Résultat : 2 requêtes/30s = 4 requêtes DB/min par utilisateur actif.

**statut-services comparaison :** SWR uniquement dans le composant `ReportButton`, pas de polling automatique. Les données fraîches arrivent via ISR, pas via polling client.

**Correction :**
```typescript
// Option 1 : centraliser le SWR dans un Context Provider
// src/contexts/ServiceDataContext.tsx
const { data } = useSWR(`/api/services/${slug}`, fetcher, {
  refreshInterval: 60000, // 60s au lieu de 30s
});
// Tous les composants consomment ce contexte → 1 seule requête

// Option 2 : désactiver le refreshInterval et utiliser ISR
// Retirer refreshInterval: 30000 des deux composants
```

**Gain estimé :** ~12 GB/8j (dépend du trafic)

---

### 🟡 Coupable 6 — `/api/services/[slug]` avec `take:384`

**Fichier :** `src/app/api/services/[slug]/route.ts`  
**Estimation ligne :** ~45-60

**Problème :** L'endpoint API qui alimente le SWR retourne 384 observations par appel. Chaque poll (toutes les 30s × 2 composants) transfère 384 lignes depuis Neon vers Vercel puis vers le client.

**Correction :**
```typescript
// ACTUEL
observations: { take: 384 }

// CORRIGÉ — retourner seulement les données nécessaires à l'affichage
observations: { 
  take: 24,  // 24 points pour un graphique 24h suffit
  orderBy: { observedAt: 'desc' }
}
```

**Gain estimé :** ~8 GB/8j (réduction 16× du volume par requête)

---

## 4. Plan de correction priorisé

| Priorité | Action | Effort | Impact |
|---|---|---|---|
| 1 | Passer `[serviceSlug]/page.tsx` en `force-dynamic` ou augmenter revalidate à 600s | 5 min | ~180 GB/8j |
| 2 | Réduire `take: 150` → `take: 10` dans l'include observations | 2 min | ~120 GB/8j |
| 3 | Augmenter `revalidate` des error pages de 300s → 86400s | 2 min | ~60 GB/8j |
| 4 | Passer le cron de `*/3` → `*/5` dans vercel.json | 1 min | ~20 GB/8j |
| 5 | Centraliser SWR + passer refreshInterval à 60s | 30 min | ~12 GB/8j |
| 6 | Réduire `take:384` → `take:24` dans l'API route | 2 min | ~8 GB/8j |

**Total estimé après corrections 1-4 (quick wins, 10 min de travail) : ~380 GB/8j économisés → de 447 GB à ~67 GB, aligné avec statut-services.**

---

## Conclusion

L'écart de 6.8× s'explique principalement par **deux décisions architecturales** :

1. **`generateStaticParams` sur les pages de service** — transforme 810 pages dynamiques en 810 pages SSG qui se régénèrent agressivement. statut-services utilise `force-dynamic`, ce qui signifie que les pages ne sont générées qu'à la demande, pas en cascade ISR.

2. **Le modèle `surfaces → observations`** — absent de statut-services, il multiplie le volume de données transférées par render. Avec `take:150`, chaque render d'une page service peut transférer des centaines de lignes supplémentaires par rapport à statut-services.

Les corrections 1 et 2 seules (10 minutes de travail) devraient ramener la consommation Neon dans une plage comparable à statut-services.
