# Cloudflare Fix — Endpoints alternatifs pour 45 services

**Date** : 2026-05-20  
**Méthode** : probe HTTP GET, timeout 5s, depuis machine Windows locale  
**Résultat** : 36 endpoints trouvés / 45 services (80%)

---

## Résumé

| Action | Count | Explication |
|---|---|---|
| **UPDATE_STATUS_PAGE** | 13 | Status page Atlassian JSON ou HTML — meilleure qualité de signal |
| **USE_FALLBACK** | 23 | robots.txt ou favicon — prouve que le site est UP, pas l'app |
| **NO_ENDPOINT** | 9 | Aucun endpoint accessible depuis cette machine |

---

## Tableau complet

### Status pages (qualité haute — JSON ou HTML Atlassian)

| Slug | Endpoint | Type | HTTP | Latency |
|---|---|---|---|---|
| character-ai | `https://status.character.ai/api/v2/status.json` | atlassian_json | 200 | 304ms |
| poe | `https://status.poe.com/api/v2/status.json` | atlassian_json | 200 | 270ms |
| ideogram | `https://status.ideogram.ai/api/v2/status.json` | atlassian_json | 200 | 542ms |
| canva-ai | `https://status.canva.com/api/v2/status.json` | atlassian_json | 200 | 723ms |
| inflection-pi | `https://status.inflection.ai/api/v2/status.json` | atlassian_json | 200 | 999ms |
| brainly-ai | `https://status.brainly.com/api/v2/status.json` | atlassian_json | 200 | 435ms |
| studyfetch | `https://status.studyfetch.com/api/v2/status.json` | atlassian_json | 200 | 307ms |
| couchbase-capella | `https://status.couchbase.com/api/v2/status.json` | atlassian_json | 200 | 287ms |
| adobe-express | `https://status.adobe.com/api/v2/status.json` | atlassian_json | 200 | 137ms |
| adobe-photoshop-ai | `https://status.adobe.com/api/v2/status.json` | atlassian_json | 200 | 136ms |
| midjourney | `https://status.midjourney.com/` | status_page | 200 | 83ms |
| janitorai | `https://status.janitorai.com/` | status_page | 200 | 1165ms |
| gamma | `https://status.gamma.app/` | status_page | 200 | 958ms |

### Fallback robots.txt (qualité réduite — détecte DOWN total, pas les pannes partielles)

| Slug | Endpoint | HTTP | Latency |
|---|---|---|---|
| xai-grok | `https://x.ai/robots.txt` | 200 | 356ms |
| grok-imagine | `https://x.ai/robots.txt` | 200 | 257ms |
| viggle | `https://viggle.ai/robots.txt` | 200 | 801ms |
| crushon-ai | `https://crushon.ai/robots.txt` | 200 | 483ms |
| genspark | `https://www.genspark.ai/robots.txt` | 200 | 316ms |
| line-ai | `https://line.me/robots.txt` | 200 | 1398ms |
| craiyon | `https://www.craiyon.com/robots.txt` | 200 | 662ms |
| hiwaifu | `https://www.hiwaifu.com/robots.txt` | 200 | 893ms |
| contentatscale | `https://contentatscale.ai/robots.txt` | 200 | 1218ms |
| outranking | `https://www.outranking.io/robots.txt` | 200 | 1027ms |
| nightcafe | `https://creator.nightcafe.studio/robots.txt` | 200 | 864ms |
| comfyui | `https://www.comfy.org/robots.txt` | 200 | 102ms |
| vocal-remover | `https://vocalremover.org/robots.txt` | 200 | 195ms |
| kittel-ai | `https://www.kittl.com/robots.txt` | 200 | 190ms |
| looka | `https://looka.com/robots.txt` | 200 | 396ms |
| promeai | `https://www.promeai.pro/robots.txt` | 200 | 81ms |
| consensus | `https://consensus.app/robots.txt` | 200 | 251ms |
| speechify | `https://speechify.com/robots.txt` | 200 | 213ms |
| supernormal | `https://supernormal.com/robots.txt` | 200 | 349ms |
| chatfai | `https://chatfai.com/robots.txt` | 200 | 130ms |
| sybill | `https://www.sybill.ai/robots.txt` | 200 | 244ms |
| smithery-ai | `https://smithery.ai/robots.txt` | 200 | 700ms |
| sizzle | `https://sizzleai.com/robots.txt` | 200 | 289ms |

### Aucun endpoint accessible (9 services — restent UNKNOWN)

| Slug | Raison |
|---|---|
| piktochart-ai | robots 403, favicon 403, status 404 — Cloudflare très agressif |
| tensor-art | fetch failed + robots 403 |
| gauth (gauthmath.com) | fetch failed + robots 403 |
| quizgecko | fetch failed + robots 404 |
| quizlet-qchat | robots 403, atlassian 403 |
| zimmwriter | fetch failed + robots 403 |
| muah-ai | fetch failed + robots 403 |
| elicit | status 404 + robots 404 |
| ada-support (ada.cx) | fetch failed + robots 403 |

---

## Notes importantes

### Endpoints robots.txt — limitation

`robots.txt` retourne 200 si le **serveur web** répond. Cela ne détecte pas :
- Les pannes applicatives (app crash, DB down, API timeout)
- Les dégradations de performance
- Les erreurs de login

Mais cela détecte :
- Le site totalement down (DNS failure, connexion refusée)
- Le serveur web arrêté ou en erreur 5xx

Pour les services majeurs (viggle, crushon-ai, genspark, etc.), c'est **mieux que UNKNOWN** car le heatmap affichera vert au lieu de gris.

### Services avec status page de vraie qualité

Pour character-ai, poe, ideogram, canva-ai, inflection-pi, brainly-ai, studyfetch, couchbase-capella, adobe, le endpoint `/api/v2/status.json` est de vraie qualité — c'est l'Atlassian Statuspage qui reflète l'état réel du service.

### Sizzle — à surveiller

`sizzle` a un SSL error (525) sur la homepage mais robots.txt répond 200. Le service est partiellement opérationnel (CDN alive, app SSL cassée).

---

## Script d'application

Fichier : `scripts/update-cloudflare-services.ts`  
Commande : `npx tsx scripts/update-cloudflare-services.ts` (dry-run par défaut)  
Pour appliquer : `npx tsx scripts/update-cloudflare-services.ts --apply`
