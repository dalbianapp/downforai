# DownForAI — Slug Mapping (top50.md v2 ↔ Prisma DB)

> Croisement des 58 slugs du `top50_v2.md` avec les slugs existants en DB Neon.
> Version : 1.0 — 17 avril 2026

---

## 🟢 Résultat global

**58 / 58 slugs du top50.md EXISTENT dans la DB.**

Pas d'orphelin, pas de slug à renommer dans top50.ts. Tous les objets de `TOP_SERVICE_CONTENT` trouveront leur service correspondant via `prisma.service.findUnique({ where: { slug } })`.

---

## 📋 Liste validée des 58 slugs ⭐⭐⭐/⭐⭐/⭐

### Top 50 mondial (50)

| # | Slug | Niveau | DB ✅ |
|---|------|--------|------|
| 1 | `chatgpt` | ⭐⭐⭐ | ✅ |
| 2 | `openai` | ⭐⭐⭐ | ✅ |
| 3 | `claude-chat` | ⭐⭐⭐ | ✅ |
| 4 | `anthropic` | ⭐⭐⭐ | ✅ |
| 5 | `github-copilot` | ⭐⭐⭐ | ✅ |
| 6 | `google-gemini` | ⭐⭐⭐ | ✅ |
| 7 | `deepseek` | ⭐⭐⭐ | ✅ |
| 8 | `perplexity` | ⭐⭐⭐ | ✅ |
| 9 | `ollama` | ⭐⭐⭐ | ✅ |
| 10 | `cursor` | ⭐⭐⭐ | ✅ |
| 11 | `xai-grok` | ⭐⭐ | ✅ |
| 12 | `microsoft-copilot` | ⭐⭐ | ✅ |
| 13 | `character-ai` | ⭐⭐ | ✅ |
| 14 | `poe` | ⭐⭐ | ✅ |
| 15 | `le-chat-mistral` | ⭐⭐ | ✅ |
| 16 | `mistral` | ⭐⭐ | ✅ |
| 17 | `cohere` | ⭐⭐ | ✅ |
| 18 | `groq` | ⭐⭐ | ✅ |
| 19 | `together-ai` | ⭐⭐ | ✅ |
| 20 | `hugging-face` | ⭐⭐ | ✅ |
| 21 | `replicate` | ⭐⭐ | ✅ |
| 22 | `lmstudio` | ⭐⭐ | ✅ |
| 23 | `claude-code` | ⭐⭐ | ✅ |
| 24 | `midjourney` | ⭐⭐ | ✅ |
| 25 | `stability-ai` | ⭐⭐ | ✅ |
| 26 | `leonardo-ai` | ⭐⭐ | ✅ |
| 27 | `ideogram` | ⭐⭐ | ✅ |
| 28 | `runway` | ⭐⭐ | ✅ |
| 29 | `kling-ai` | ⭐⭐ | ✅ |
| 30 | `pika` | ⭐⭐ | ✅ |
| 31 | `luma-dream-machine` | ⭐⭐ | ✅ |
| 32 | `elevenlabs` | ⭐⭐ | ✅ |
| 33 | `suno` | ⭐⭐ | ✅ |
| 34 | `udio` | ⭐⭐ | ✅ |
| 35 | `heygen` | ⭐⭐ | ✅ |
| 36 | `v0-vercel` | ⭐⭐ | ✅ |
| 37 | `bolt-new` | ⭐⭐ | ✅ |
| 38 | `lovable` | ⭐⭐ | ✅ |
| 39 | `codeium` | ⭐⭐ | ✅ |
| 40 | `replit-ai` | ⭐⭐ | ✅ |
| 41 | `devin` | ⭐⭐ | ✅ |
| 42 | `tabnine` | ⭐⭐ | ✅ |
| 43 | `jetbrains-ai` | ⭐⭐ | ✅ |
| 44 | `pinecone` | ⭐⭐ | ✅ |
| 45 | `weaviate` | ⭐⭐ | ✅ |
| 46 | `qdrant` | ⭐⭐ | ✅ |
| 47 | `openrouter` | ⭐⭐ | ✅ |
| 48 | `fireworks-ai` | ⭐⭐ | ✅ |
| 49 | `notion-ai` | ⭐⭐ | ✅ |
| 50 | `canva-ai` | ⭐⭐ | ✅ |

### Performers GSC (8)

| # | Slug | Niveau | DB ✅ |
|---|------|--------|------|
| 51 | `voicemod` | ⭐ | ✅ |
| 52 | `tripo3d` | ⭐ | ✅ |
| 53 | `magnific` | ⭐ | ✅ |
| 54 | `minimax-hailuo` | ⭐ | ✅ |
| 55 | `whisper-openai` | ⭐ | ✅ |
| 56 | `tencent-hunyuan` | ⭐ | ✅ |
| 57 | `openart` | ⭐ | ✅ |
| 58 | `luma-ai` | ⭐ | ✅ |

---

## ⚠️ Doublons DB détectés (à nettoyer — pas bloquant)

Ta DB contient 4 paires de slugs qui pourraient être ambigus. **Ces doublons n'impactent pas le sprint actuel** car le top50.md utilise la version canonique de chaque paire. Mais à résoudre plus tard pour la cohérence.

### 🔴 Doublon 1 : `anthropic` vs `anthropic-api`

- **top50.md utilise** : `anthropic` (traité comme "Anthropic API" directement)
- **DB a aussi** : `anthropic-api`
- **Question** : les deux pointent vers la même infra (api.anthropic.com) ?
- **Recommandation** :
  - Si les deux existent, le top50.md enrichit uniquement `anthropic`. `anthropic-api` reste non-enrichi.
  - À résoudre plus tard : soit fusionner en DB (supprimer `anthropic-api`), soit réassigner le contenu top50 vers `anthropic-api`.

### 🔴 Doublon 2 : `openai` vs `openai-api`

- **top50.md utilise** : `openai` (traité comme "OpenAI API")
- **DB a aussi** : `openai-api`
- **Même question, même recommandation** que le doublon 1.

### 🔴 Doublon 3 : `groq` vs `groq-api`

- **top50.md utilise** : `groq`
- **DB a aussi** : `groq-api`
- **Même traitement**.

### 🟢 Faux doublon : `microsoft-copilot` vs `microsoft-365-copilot`

- **top50.md utilise** : `microsoft-copilot` (consumer AI assistant)
- **DB a aussi** : `microsoft-365-copilot`
- **Ce sont 2 PRODUITS DIFFÉRENTS** (consumer Copilot vs M365 Copilot intégré à Office). Microsoft lui-même les distingue. **Garder les 2 en DB**, pas un doublon.

---

## 🎯 Actions recommandées pour résoudre les doublons

**Option A — Après le sprint, quand tout est stable :**

```sql
-- Si tu confirmes que les pages `*-api` sont vides/redondantes :
-- 1. Vérifier qu'elles n'ont pas de surfaces/observations précieuses
SELECT s.slug, COUNT(ss.id) AS surfaces
FROM "Service" s
LEFT JOIN "ServiceSurface" ss ON ss."serviceId" = s.id
WHERE s.slug IN ('anthropic-api', 'openai-api', 'groq-api')
GROUP BY s.slug;

-- 2. Si vides, les supprimer
DELETE FROM "Service" WHERE slug IN ('anthropic-api', 'openai-api', 'groq-api');

-- 3. Après suppression, un redirect 301 dans next.config.ts :
-- /anthropic-api → /anthropic
-- /openai-api → /openai
-- /groq-api → /groq
```

**Option B — Si `*-api` sont utilisés actuellement :**

Modifier le `top50.ts` pour pointer vers les versions `-api` à la place :

```typescript
export const TOP_SERVICE_CONTENT = {
  // ...
  "anthropic-api": { /* contenu de la fiche "Anthropic API" */ },
  "openai-api":    { /* contenu de la fiche "OpenAI API"    */ },
  "groq-api":      { /* contenu de la fiche "Groq"          */ },
  // ...
};
```

**Ma recommandation** : **Option A plus tard** (après stabilisation du sprint), car :
- Supprimer 3 pages réduit encore ta surface indexable (bon pour le SEO)
- Consolide le trafic SEO sur les pages qui comptent
- Les utilisateurs cherchent "openai down", pas "openai api down" en volume

---

## 📝 Note pour Claude Code

**Quand Claude Code génère `src/content/top-services/top50.ts`, utiliser EXACTEMENT les slugs du tableau validé ci-dessus.**

Test de validation à faire passer avant commit :

```typescript
// src/content/top-services/validate.test.ts
it("all top50 slugs exist in Service table", async () => {
  const dbSlugs = await prisma.service.findMany({ select: { slug: true } });
  const dbSet = new Set(dbSlugs.map((s) => s.slug));
  const contentSlugs = Object.keys(TOP_SERVICE_CONTENT);
  const orphans = contentSlugs.filter((s) => !dbSet.has(s));
  expect(orphans).toEqual([]);  // doit être vide
});
```

---

**Fin de SLUG_MAPPING.md**
