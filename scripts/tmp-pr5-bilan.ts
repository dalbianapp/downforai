import { prisma } from "../src/lib/db";

const ALLOWLIST_55 = new Set([
  "adobe-photoshop-ai","ai21","airtable-ai","anthropic","anthropic-api","atlassian-ai",
  "brainly-ai","canva-ai","chatgpt","claude-chat","cloudflare-ai","cohere","couchbase-capella",
  "datadog-llm","deepgram","elastic-ai","elevenlabs","figma-ai","github-copilot","github-models",
  "gpt-image","grammarly","heygen","huggingchat","ideogram","inflection-pi","intercom-fin",
  "linear-ai","make-ai","miro-ai","mongodb-atlas-vector","moonshot-kimi","notion-ai","openai",
  "openai-api","openai-operator","pinecone","poe","render-ai","retool-ai","snowflake-cortex",
  "snyk-code-ai","sora","stability-ai","stable-audio","stable-video-diffusion","studyfetch",
  "supabase-ai","supabase-vector","synthesia","v0-vercel","vercel-infra","whisper-openai",
  "zapier-ai","zoom-ai"
]);

async function main() {
  const ACTIVATION = new Date("2026-06-20T06:49:00Z"); // PR5 koad69td0 Ready

  // Latest obs per service in the allowlist — post PR5 activation
  const allowlistObs = await prisma.$queryRaw<Array<{
    slug: string; status: string; officialStatus: string|null;
    httpDerivedStatus: string|null; statusSource: string|null; observedAt: Date;
  }>>`
    SELECT DISTINCT ON (s.slug)
      s.slug, o.status, o."officialStatus", o."httpDerivedStatus", o."statusSource", o."observedAt"
    FROM "Observation" o
    JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
    JOIN "Service" s ON s.id = ss."serviceId"
    WHERE s.slug = ANY(${[...ALLOWLIST_55]})
      AND o."statusSource" IS NOT NULL
    ORDER BY s.slug, o."observedAt" DESC
  `;

  // Services with derived status different from http (real divergences)
  const divergences = allowlistObs.filter(r => r.status !== r.httpDerivedStatus);
  const postActivation = allowlistObs.filter(r => r.observedAt >= ACTIVATION);
  const preActivation = allowlistObs.filter(r => r.observedAt < ACTIVATION);

  const statusCounts = { OPERATIONAL: 0, DEGRADED: 0, OUTAGE: 0, UNKNOWN: 0 };
  allowlistObs.forEach(r => { statusCounts[r.status as keyof typeof statusCounts]++; });

  console.log(`=== PR5 BILAN — ${new Date().toISOString()} ===`);
  console.log(`Allowlist 55 services — observations trouvées : ${allowlistObs.length}`);
  console.log(`  POST-activation (≥07:20 UTC) : ${postActivation.length}`);
  console.log(`  pré-activation (<07:20 UTC)  : ${preActivation.length}`);
  console.log(`\nDistribution des statuts écrits :`);
  console.log(`  OPERATIONAL: ${statusCounts.OPERATIONAL} | DEGRADED: ${statusCounts.DEGRADED} | OUTAGE: ${statusCounts.OUTAGE} | UNKNOWN: ${statusCounts.UNKNOWN}`);
  console.log(`\nDivergences actives (status != httpDerived) : ${divergences.length}`);
  divergences.forEach(r => {
    const age = Math.round((Date.now() - r.observedAt.getTime()) / 60000);
    console.log(`  🔴 ${r.slug.padEnd(26)} status=${r.status.padEnd(12)} official=${r.officialStatus} http=${r.httpDerivedStatus} (${age}m ago)`);
  });

  // Services not yet covered post-activation
  const notYetPostAct = [...ALLOWLIST_55].filter(slug => !postActivation.some(r => r.slug === slug));
  if (notYetPostAct.length > 0) {
    console.log(`\n⚠️  Pas encore d'obs post-activation pour ${notYetPostAct.length} services :`);
    console.log(`  ${notYetPostAct.join(", ")}`);
  }

  // Control: non-allowlist services — confirm status === httpDerivedStatus
  const controlObs = await prisma.$queryRaw<Array<{
    slug: string; status: string; httpDerivedStatus: string|null;
  }>>`
    SELECT DISTINCT ON (s.slug) s.slug, o.status, o."httpDerivedStatus"
    FROM "Observation" o
    JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
    JOIN "Service" s ON s.id = ss."serviceId"
    WHERE o."statusSource" IS NOT NULL
      AND o."statusSource" != 'HTTP_CHECK'
      AND s.slug NOT IN ('openai','anthropic','cohere','elevenlabs','ai21',
        'adobe-photoshop-ai','airtable-ai','anthropic-api','atlassian-ai','brainly-ai',
        'canva-ai','chatgpt','claude-chat','cloudflare-ai','couchbase-capella','datadog-llm',
        'deepgram','elastic-ai','figma-ai','github-copilot','github-models','gpt-image',
        'grammarly','heygen','huggingchat','ideogram','inflection-pi','intercom-fin',
        'linear-ai','make-ai','miro-ai','mongodb-atlas-vector','moonshot-kimi','notion-ai',
        'openai-api','openai-operator','pinecone','poe','render-ai','retool-ai',
        'snowflake-cortex','snyk-code-ai','sora','stability-ai','stable-audio',
        'stable-video-diffusion','studyfetch','supabase-ai','supabase-vector','synthesia',
        'v0-vercel','vercel-infra','whisper-openai','zapier-ai','zoom-ai')
    ORDER BY s.slug, o."observedAt" DESC
    LIMIT 10
  `;
  const wrongControl = controlObs.filter(r => r.status !== r.httpDerivedStatus);
  console.log(`\n=== HORS ALLOWLIST (contrôle) ===`);
  console.log(`Services avec statusSource non-HTTP_CHECK hors allowlist : ${controlObs.length}`);
  console.log(`Dont status != httpDerived (anomalie) : ${wrongControl.length}`);
  if (wrongControl.length > 0) {
    wrongControl.forEach(r => console.log(`  🔴 ANOMALIE: ${r.slug} status=${r.status} http=${r.httpDerivedStatus}`));
  } else {
    console.log("✅ Aucune anomalie — hors allowlist inchangé");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
