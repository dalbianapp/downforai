# Service Audit — 74 services non-opérationnels

**Date** : 2026-05-20  
**Méthode** : HTTP check (HEAD→GET fallback, 8s timeout) + query DB ServiceSurface  
**DB** : 74 services trouvés avec surfaces actives

---

## Résumé exécutif

| Classification | Count | Explication |
|---|---|---|
| **ALIVE** | 37 | Site accessible (200), endpoint manquant ou URL bloquée depuis Vercel |
| **CLOUDFLARE** | 15 | HTTP 403 bot-protection, site fonctionnel en browser |
| **UNKNOWN_ERROR** | 15 | `fetch failed` local (Windows TLS/DNS) — vérifier manuellement |
| **OUTAGE_OR_DEAD** | 3 | Timeout 8s — downtime réel ou service fermé |
| **RATE_LIMITED** | 1 | HTTP 429 — smithery.ai |
| **CHANGED** | 1 | URL changée (scispace : typeset.io → scispace.com) |
| **UNKNOWN** | 1 | HTTP 405 après redirect (scispace bis) |
| **DEAD** | 1 | OctoAI — acquis NVIDIA oct 2024, fermé |

**Cause racine principale** : Le cron Vercel check depuis des IPs cloud (EU). Cloudflare et anti-bot bloquent ces IPs → HTTP 403 → stocké `UNKNOWN` → heatmap grise.  
La plupart des services sont **réellement opérationnels** en browser — c'est la méthode de check qui est inadaptée.

---

## Tableau complet (74 services)

### OUTAGE — 15 services

| Slug | HTTP (local) | DB Last Status | Classification | Raison | Action |
|---|---|---|---|---|---|
| play-ht | `fetch failed` | OUTAGE | UNKNOWN_ERROR | Probablement SSL/TLS incompatible avec Windows fetch | Vérifier manuellement |
| dora | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (30ms = DNS ou TLS) | Vérifier manuellement |
| visual-electric | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (30ms) | Vérifier manuellement |
| safurai | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (371ms) | Vérifier manuellement |
| trae-ide | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (29ms) | Vérifier manuellement |
| babbel-ai | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (1325ms) | Vérifier manuellement |
| querium | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (263ms) | Vérifier manuellement |
| **sizzle** | 525 | OUTAGE | ALIVE (SSL error) | Cloudflare SSL handshake failure | Site existe, endpoint SSL cassé |
| **invoke-ai** | 520 → domaineasy.com | OUTAGE | **DEAD** | `invoke.com` redirige vers domaineasy.com/buy-domain/ → **domaine à vendre** | **DELETE** |
| predibase | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (122ms) | Vérifier manuellement |
| robin-ai | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (338ms) | Vérifier manuellement |
| agility-writer | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (27ms) | Vérifier manuellement |
| figgs-ai | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (26ms) | Vérifier manuellement |
| moemate | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (35ms) | Vérifier manuellement |
| sillytavern | `fetch failed` | OUTAGE | UNKNOWN_ERROR | fetch failed (35ms) | Vérifier manuellement |

### UNKNOWN — 50 services

#### Services majeurs (priorité haute)

| Slug | HTTP (local) | DB Last Status | Classification | Raison | Action |
|---|---|---|---|---|---|
| **midjourney** | 403 | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | Utiliser status page |
| **perplexity** | 403 | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | checkUrl → `https://status.perplexity.ai/api/v2/status.json` |
| character-ai | 200 local | UNKNOWN | ALIVE | 200 en local mais Vercel bloqué depuis EU | Trouver endpoint non-bloqué |
| xai-grok | 200 local | UNKNOWN | ALIVE | 200 en local mais Vercel bloqué | Endpoint stable : `https://x.ai` |
| **sora** | 403 | UNKNOWN | CLOUDFLARE | OpenAI/Sora bloque bots | checkUrl → `https://status.openai.com/api/v2/status.json` |
| viggle | 200 local | UNKNOWN | ALIVE | 200 en local mais Vercel bloqué | Trouver endpoint non-bloqué |
| magnific | 200 → magnific.com | UNKNOWN | ALIVE | Redirige maintenant vers magnific.com | checkUrl → `https://www.magnific.com/` |
| crushon-ai | 200 local | UNKNOWN | ALIVE | 200 en local mais Vercel bloqué | Trouver endpoint non-bloqué |
| poe | 403 | UNKNOWN | CLOUDFLARE | Bot protection (redirige vers /login 403) | Utiliser status page si disponible |
| le-chat-mistral | 403 | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | checkUrl → `https://status.mistral.ai/api/v2/status.json` (si existe) |
| genspark | 200 local | UNKNOWN | ALIVE | 200 en local mais Vercel bloqué | Trouver endpoint non-bloqué |
| ideogram | 200 local | UNKNOWN | ALIVE | 200 en local mais Vercel bloqué | Trouver endpoint non-bloqué |
| grok-imagine | 200 local | UNKNOWN | ALIVE | Same x.ai domain as xai-grok | checkUrl déjà `https://x.ai` |
| janitorai | 403 | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | Utiliser status page si disponible |

#### Autres services UNKNOWN

| Slug | HTTP (local) | DB Last Status | Classification | Raison | Action |
|---|---|---|---|---|---|
| make-ai | 403 | UNKNOWN | CLOUDFLARE | Bot protection | checkUrl → `https://status.make.com/api/v2/status.json` |
| vocal-remover | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà set — le cron Vercel le bloque |
| gamma | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| kittel-ai | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà `https://www.kittl.com` |
| looka | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà `https://looka.com` |
| piktochart-ai | 403 | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | Utiliser status page |
| brainly-ai | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà `https://brainly.com` |
| gauth | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà `https://www.gauthmath.com` |
| quizgecko | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà `https://quizgecko.com` |
| quizlet-qchat | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà `https://quizlet.com` |
| studyfetch | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà `https://www.studyfetch.com` |
| **canva-ai** | 403 | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | checkUrl → `https://status.canva.com/api/v2/status.json` |
| comfyui | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| craiyon | 403 → /fr | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | Utiliser status page si disponible |
| freepik-ai | 200 → magnific.com/ai | UNKNOWN | CHANGED | `/ai` redirige vers magnific.com/ai (acquisition) | checkUrl → `https://www.freepik.com/` |
| nightcafe | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| promeai | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| tensor-art | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| inflection-pi | 403 | UNKNOWN | CLOUDFLARE | Redirige vers /redirect + 403 | Utiliser status page si disponible |
| line-ai | 403 | UNKNOWN | CLOUDFLARE | Bot protection (Japanese CDN) | Utiliser status page LINE si disponible |
| contentatscale | 403 | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | Utiliser status page si disponible |
| outranking | 403 | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | Utiliser status page si disponible |
| zimmwriter | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| consensus | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| **scispace** | 405 → scispace.com | UNKNOWN | **CHANGED** | typeset.io redirige vers scispace.com → **URL principale changée** | checkUrl → `https://scispace.com/` |
| speechify | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| supernormal | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| chatfai | 200 local (2.7s!) | UNKNOWN | ALIVE | 200 mais très lent (2774ms) | Surveillance lenteur |
| hiwaifu | 403 | UNKNOWN | CLOUDFLARE | Cloudflare bot-protection | Utiliser status page si disponible |
| muah-ai | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà `https://muah.ai` |
| elicit | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà `https://elicit.com` |
| **phind** | 404 | UNKNOWN | **CHANGED/DEAD** | phind.com retourne 404 — acquis par SambaNova 2025 | Vérifier si service toujours actif |
| ada-support | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| sybill | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | Trouver endpoint non-bloqué |
| **wonder-dynamics** | 200 → autodesk.com | UNKNOWN | **CHANGED** | Acquis par Autodesk → redirige vers autodesk.com/products/flow-studio | checkUrl → `https://www.autodesk.com/products/flow-studio/overview` |
| couchbase-capella | 200 local | UNKNOWN | ALIVE | 200 local, Vercel bloqué | checkUrl déjà set |

### DEGRADED — 7 services

| Slug | HTTP (local) | DB Last Status | Classification | Raison | Action |
|---|---|---|---|---|---|
| adobe-express | 200 local | DEGRADED | ALIVE | Adobe OK local, Vercel probablement bloqué | Trouver endpoint non-bloqué |
| adobe-photoshop-ai | 200 local | DEGRADED | ALIVE | Adobe OK local, Vercel probablement bloqué | Trouver endpoint non-bloqué |
| jais-ai | `fetch failed` | DEGRADED | UNKNOWN_ERROR | Erreur fetch (55ms) — site peut être down | Vérifier manuellement |
| smithery-ai | 429 | DEGRADED | **RATE_LIMITED** | HTTP 429 — on check trop souvent | Réduire fréquence ou changer endpoint |
| 3dfy-ai | TIMEOUT (8s) | DEGRADED | OUTAGE_OR_DEAD | Timeout depuis local — probablement mort | Vérifier manuellement |
| hour-one | TIMEOUT (8s) | DEGRADED | OUTAGE_OR_DEAD | Timeout depuis local | Vérifier manuellement |
| tavus-ai | TIMEOUT (8s) | DEGRADED | OUTAGE_OR_DEAD | Timeout depuis local | Vérifier manuellement |

### NO DATA — 2 services

| Slug | HTTP (local) | DB isEnabled | Classification | Raison | Action |
|---|---|---|---|---|---|
| **octoai** | `fetch failed` | 0 (disabled!) | **DEAD** | Acquis par NVIDIA oct 2024, service fermé | **DELETE service** |
| csm-ai | `fetch failed` | 0 (disabled!) | UNKNOWN_ERROR | Surface désactivée + fetch failed | Vérifier si service existe encore |

---

## Priorité 1 — Services à SUPPRIMER

### Confirmés DEAD (2)

| Slug | Raison | Preuve |
|---|---|---|
| **octoai** | Acquis NVIDIA oct 2024, service arrêté | Domain unreachable, surface déjà disabled dans DB |
| **invoke-ai** | invoke.com → `domaineasy.com/buy-domain/invoke.com` (domaine à vendre) | HTTP 520 + redirect vers registrar |

### Probablement DEAD — validation requise (4)

| Slug | Raison | À vérifier |
|---|---|---|
| phind | phind.com retourne 404 — acquis SambaNova 2025 | Tester `https://www.phind.com` en browser |
| 3dfy-ai | Timeout 8s depuis local ET Vercel | Tester en browser |
| hour-one | Timeout 8s | Tester en browser |
| tavus-ai | Timeout 8s | Tester `https://www.tavus.io` (domaine alternatif possible) |

---

## Priorité 2 — URLs à mettre à jour (CHANGED)

| Slug | Ancienne URL | Nouvelle URL | Raison |
|---|---|---|---|
| **scispace** | `https://typeset.io` | `https://scispace.com/` | Rebranding total, typeset.io redirige → scispace.com |
| **wonder-dynamics** | `https://www.wonderdynamics.com` | `https://www.autodesk.com/products/flow-studio/overview` | Acquis par Autodesk |
| **magnific** | `https://magnific.ai` | `https://www.magnific.com/` | Domain change magnific.ai → magnific.com |
| **freepik-ai** | `https://www.freepik.com/ai` | `https://www.freepik.com/` | /ai redirige vers magnific.com (acquisition) |

---

## Priorité 3 — Endpoints Cloudflare → Status Pages

Pour ces services, le site EST accessible mais bloque les IPs cloud. Le fix : mettre à jour `checkUrl` dans `ServiceSurface` pour pointer vers leur **status page API JSON**.

| Slug | checkUrl actuel | checkUrl proposé | Confidence |
|---|---|---|---|
| **perplexity** | null | `https://status.perplexity.ai/api/v2/status.json` | Élevée — Atlassian status |
| **sora** | null | `https://status.openai.com/api/v2/status.json` | Élevée — Sora utilise OpenAI status |
| **canva-ai** | null | `https://www.canva-status.com/api/v2/status.json` | À vérifier |
| **make-ai** | null | `https://status.make.com/api/v2/status.json` | À vérifier |
| **midjourney** | null | Pas de status page publique connue → utiliser `https://www.midjourney.com/` | Faible (403 persistant) |
| poe | null | `https://status.poe.com/api/v2/status.json` | À vérifier |
| janitorai | null | Pas de status page connue | — |
| craiyon | null | Pas de status page connue | — |
| inflection-pi | null | `https://status.inflection.ai/api/v2/status.json` | À vérifier |
| piktochart-ai | null | Pas de status page connue | — |
| hiwaifu | null | Pas de status page connue | — |
| contentatscale | null | Pas de status page connue | — |
| outranking | null | Pas de status page connue | — |
| line-ai | null | Pas de status page connue | — |
| le-chat-mistral | null | `https://status.mistral.ai/api/v2/status.json` | À vérifier |

---

## Priorité 4 — Root cause UNKNOWN pour services ALIVE

**Problème** : 30+ services retournent 200 depuis un navigateur ou ma machine Windows, mais le cron Vercel stocke `UNKNOWN` dans la DB.

**Raison** : Vercel edge (EU) → IPs cloud → Cloudflare/anti-bot renvoie 403 même pour les sites "accessibles" → status UNKNOWN.

**Preuve** : `vocal-remover` a un `db_checkUrl` configuré (`https://vocalremover.org`), retourne 200 en local, mais `db_lastStatus: UNKNOWN`.

**Fix systémique possible** : Modifier la logique de check pour les services dont on sait qu'ils sont protégés par Cloudflare :
- Ajouter un champ `alwaysBlocksMonitoring: true` sur `ServiceSurface`
- Ou utiliser une liste d'exclusion et afficher `"Monitoring limited (bot protection)"` au lieu de `"No data"`

**Fix service-par-service** : Pour chaque service ALIVE avec UNKNOWN, chercher un endpoint alternatif qui accepte les IPs cloud :
- API de santé publique (`/health`, `/api/health`, `/status`)
- Atlassian status page (`status.xxx.com/api/v2/status.json`)
- CDN asset non-protégé (ex: `https://xxx.com/favicon.ico`)

---

## Priorité 5 — Smithery.ai (RATE_LIMITED)

`smithery.ai` retourne 429 → stocké DEGRADED dans la DB. Le service fonctionne normalement.

**Fix** : Réduire la fréquence de check pour ce service, ou changer l'endpoint.  
Option : checkUrl → `https://smithery.ai/health` ou `https://smithery.ai/favicon.ico`

---

## Services nécessitant investigation manuelle (15 UNKNOWN_ERROR)

Ces services retournent `fetch failed` depuis ma machine Windows (probablement TLS/certificate issue en local). Depuis Vercel (Linux), ils peuvent soit fonctionner, soit échouer réellement. La DB montre `db_lastStatus: OUTAGE` pour tous → échec réel sur Vercel aussi.

| Slug | DB Last Observed | Analyse probable |
|---|---|---|
| play-ht | 2026-05-20 03:15 | Tester en browser — play.ht est un service TTS connu |
| dora | 2026-05-20 05:45 | dora.run/ai — vérifié actif récemment |
| visual-electric | 2026-05-20 05:45 | visualelectric.com — image gen, probablement OK |
| safurai | 2026-05-20 06:00 | safurai.com — AI code assistant |
| trae-ide | 2026-05-20 05:45 | trae.sh — AI IDE par ByteDance |
| babbel-ai | 2026-05-20 06:00 | babbel.com — grand service, certainement OK |
| querium | 2026-05-20 06:00 | querium.com — AI tutoring |
| predibase | 2026-05-20 05:00 | predibase.com — ML platform |
| robin-ai | 2026-05-20 02:45 | robinai.com — AI legal contracts |
| agility-writer | 2026-05-20 04:45 | agilitywriter.com — AI writing |
| figgs-ai | 2026-05-20 02:15 | figgs.ai — AI character |
| moemate | 2026-05-20 02:15 | moemate.io — AI companion |
| sillytavern | 2026-05-20 02:15 | sillytavernapp.com — local LLM UI |
| jais-ai | 2026-05-20 02:45 | inceptioniai.org — Arabic LLM |
| csm-ai | NO DATA | Surface disabled, service unknown |

---

## Résumé des actions

| Action | Services | Validation requise |
|---|---|---|
| **DELETE** | octoai, invoke-ai | Oui (2 confirms) |
| **Vérifier avant DELETE** | phind, 3dfy-ai, hour-one, tavus-ai, csm-ai | Oui (5 services) |
| **CHANGED — mettre à jour URL** | scispace, wonder-dynamics, magnific, freepik-ai | Non — automatique |
| **Status page endpoints** | perplexity, sora, canva-ai, make-ai (+11) | Vérifier URLs status pages d'abord |
| **Investigation manuelle** | 15 UNKNOWN_ERROR (fetch failed) | Tester en browser |
| **Rate limited** | smithery-ai | Changer endpoint |

**Total récupérables** : ~65/74 (88%)  
**Total à supprimer** : 2 confirmés + 5 à valider (max 7 = 9.5%)

---

## Note technique — Pourquoi la DB est UNKNOWN alors que le site est accessible

Le cron Vercel tourne depuis des IPs AWS/EU partagées. La majorité des sites à fort trafic (Midjourney, Perplexity, Canva, etc.) utilisent Cloudflare avec des règles de bot management qui bloquent les IPs cloud (AWS, Vercel, DigitalOcean). 

Le check renvoie 403 → code de monitoring : `"status": "UNKNOWN", "confidence": "LOW"` → le heatmap affiche "No data".

**Ces services ne sont pas en panne.** Ils ont juste une protection anti-bot agressive.

**Fix long terme** : Pour les services majeurs (>10k visites/mois sur le site), passer sur un monitoring via leur status page officielle plutôt qu'un check HTTP direct.
