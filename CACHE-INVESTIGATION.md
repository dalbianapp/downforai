# Cache Investigation — downforai.com

**Date :** 2026-04-09  
**Constat :** 1.7% cache hit rate sur Vercel (45 HIT / 686 BYPASS / 1840 MISS sur 2571 requêtes en 12h)

---

## TL;DR

**Cause principale identifiée : la root layout appelle `headers()` de `next/server`.**

En Next.js, appeler `headers()` dans un Server Component force le mode dynamique sur TOUTE la page, y compris les enfants. Cela annule tous les `revalidate = 60` configurés dans les pages individuelles. Chaque requête de chaque visiteur (humain OU bot) déclenche une régénération complète côté serveur → requête Prisma → transfert Neon.

---

## Fichier coupable

**`src/app/layout.tsx` — lignes 8 et 49**

```typescript
import { headers } from "next/server"; // ligne 8

export default async function RootLayout({ children }) {
  const headersList = await headers(); // ligne 49 — CASSE TOUT LE CACHE
  const isAdmin = headersList.get("x-admin-page") === "1";
  // ...
}
```

`headers()` est un Dynamic API en Next.js. Son appel dans la root layout marque TOUTES les pages du site comme dynamiques (`ƒ` dans le build output au lieu de `●`). Cela explique pourquoi le taux de HIT est de 1.7% : le cache Vercel Edge ne peut pas mettre en cache des réponses dynamiques.

---

## Pages et leur config revalidate

| Fichier | revalidate | dynamicParams | Statut réel |
|---|---|---|---|
| `app/page.tsx` | 60 | — | ❌ forcé dynamique |
| `app/[serviceSlug]/page.tsx` | 60 | true | ❌ forcé dynamique |
| `app/[serviceSlug]/down/page.tsx` | 60 | — | ❌ forcé dynamique |
| `app/[serviceSlug]/error/[errorSlug]/page.tsx` | 300 | — | ❌ forcé dynamique |
| `app/[serviceSlug]/[symptom]/page.tsx` | 300 | — | ❌ forcé dynamique |
| `app/category/[category]/page.tsx` | 120 | — | ❌ forcé dynamique |
| `app/incidents/page.tsx` | 60 | — | ❌ forcé dynamique |
| `app/errors/[errorSlug]/page.tsx` | 3600 | — | ❌ forcé dynamique |
| `app/about/page.tsx` | — | — | ❌ forcé dynamique |
| `app/errors/page.tsx` | — | — | ❌ forcé dynamique |

**Toutes les pages sont en pratique dynamiques** malgré leur `revalidate` bien configuré.

---

## Autres sources de cache-busting vérifiées

| Source | Résultat |
|---|---|
| `noStore()` / `unstable_noStore` | ❌ Non trouvé |
| `force-dynamic` export | ❌ Non trouvé |
| `cache: 'no-store'` dans fetch | ❌ Non trouvé |
| PostHog cookies | ✅ Client-side uniquement, pas d'impact serveur |
| Admin login cookies (`admin_token`) | ✅ Uniquement sur `/admin`, pas d'impact public |
| Query strings (utm_source etc.) | 🟡 Non mesurable sans accès aux logs Vercel |

---

## Pourquoi `headers()` a été introduit

Le middleware injecte `x-admin-page: 1` sur les routes `/admin/*`. La root layout lit ce header pour ne PAS afficher le Header/Footer sur les pages admin. C'est la seule raison de cet appel `headers()`.

---

## Solution recommandée (à valider par Benjamin)

### Option A — Restructurer avec un route group (recommandée, propre)

Créer `src/app/(site)/layout.tsx` avec Header/Footer, déplacer toutes les pages publiques dedans. L'admin reste à `src/app/admin/` avec son propre layout. La root layout devient minimaliste et sans `headers()`.

**Impact :** Refactoring structurel, ~30-40 fichiers déplacés dans `(site)/`.

### Option B — Lire le pathname via l'URL (rapide)

Dans la root layout, utiliser un signal alternatif ne nécessitant pas `headers()`. Par exemple :
- Passer le check admin au layout `/admin/layout.tsx` via CSS global qui cache Header/Footer
- Utiliser un cookie plutôt qu'un header (les cookies ont le même problème via `cookies()`)

**Impact :** Difficile sans `headers()` ou `cookies()` dans un server layout.

### Option C — Route group minimal (recommandée rapide)

Wrapper uniquement les pages admin dans un group `(admin)` avec son propre root-level layout qui skipe Header/Footer, sans toucher aux pages publiques.

**Impact :** Beaucoup moins de fichiers à déplacer qu'Option A.

---

## Impact estimé si la root layout est corrigée

| Métrique | Avant | Après |
|---|---|---|
| Cache hit rate | ~1.7% | ~60-85% attendu |
| Requêtes Prisma/jour | ~25 000 | ~4 000-7 000 |
| Transfert Neon/jour | ~25-30 GB | ~3-5 GB |
| Coût Neon mensuel | Élevé | Divisé par ~6 |

**Note :** Ce chiffre s'additionne aux gains du pooler Neon (Tâche 1 précédente) et du blocage des bots parasites (Tâche 1 de ce sprint). L'effet combiné devrait descendre sous 5 GB/jour.
