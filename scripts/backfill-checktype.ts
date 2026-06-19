/**
 * Backfill checkType + signalConfidence on ServiceSurface from existing checkUrl values.
 *
 * Classification rules (applied in priority order):
 *   /api/v2/status.json   → ATLASSIAN_JSON  / HIGH
 *   status.cloud.google   → GCP_JSON        / MEDIUM
 *   health.aws.amazon     → AWS_HEALTH      / MEDIUM
 *   azure.status.micro    → AZURE_STATUS    / MEDIUM
 *   hostname status.*     → STATUS_HTML     / MEDIUM
 *   /robots.txt           → ROBOTS_TXT      / LOW
 *   null / same as website → HOMEPAGE       / LOW
 *
 * Default (report only): prints counts per category.
 * --commit: writes checkType + signalConfidence to DB.
 */

import { prisma } from "../src/lib/db";

const COMMIT = process.argv.includes("--commit");

type CheckTypeVal =
  | "HOMEPAGE"
  | "STATUS_HTML"
  | "ATLASSIAN_JSON"
  | "GCP_JSON"
  | "AWS_HEALTH"
  | "AZURE_STATUS"
  | "ROBOTS_TXT"
  | "UNKNOWN";

type SignalConfidenceVal = "HIGH" | "MEDIUM" | "LOW";

type Classification = { checkType: CheckTypeVal; signalConfidence: SignalConfidenceVal };

function classify(checkUrl: string | null, websiteUrl: string | null): Classification {
  if (!checkUrl || checkUrl === websiteUrl) {
    return { checkType: "HOMEPAGE", signalConfidence: "LOW" };
  }

  const u = checkUrl.toLowerCase();

  if (u.endsWith("/api/v2/status.json")) {
    return { checkType: "ATLASSIAN_JSON", signalConfidence: "HIGH" };
  }

  if (u.includes("status.cloud.google.com")) {
    return { checkType: "GCP_JSON", signalConfidence: "MEDIUM" };
  }

  if (u.includes("health.aws.amazon.com")) {
    return { checkType: "AWS_HEALTH", signalConfidence: "MEDIUM" };
  }

  if (u.includes("azure.status.microsoft")) {
    return { checkType: "AZURE_STATUS", signalConfidence: "MEDIUM" };
  }

  if (u.endsWith("/robots.txt")) {
    return { checkType: "ROBOTS_TXT", signalConfidence: "LOW" };
  }

  // Status HTML: hostname starts with "status." or known status hosting platforms
  try {
    const parsed = new URL(checkUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (
      host.startsWith("status.") ||
      host.endsWith(".statuspage.io") ||
      host.includes("instatus.com") ||
      host.includes("neonstatus.com") ||
      path === "/status" ||
      path.startsWith("/status/") ||
      path === "/api/status"
    ) {
      return { checkType: "STATUS_HTML", signalConfidence: "MEDIUM" };
    }
  } catch {
    // Malformed URL
  }

  return { checkType: "HOMEPAGE", signalConfidence: "LOW" };
}

async function main() {
  const surfaces = await prisma.serviceSurface.findMany({
    select: {
      id: true,
      checkUrl: true,
      service: { select: { slug: true, websiteUrl: true } },
    },
  });

  const counts: Record<CheckTypeVal, number> = {
    HOMEPAGE: 0,
    STATUS_HTML: 0,
    ATLASSIAN_JSON: 0,
    GCP_JSON: 0,
    AWS_HEALTH: 0,
    AZURE_STATUS: 0,
    ROBOTS_TXT: 0,
    UNKNOWN: 0,
  };

  const updates: Array<{ id: string; slug: string; checkUrl: string | null } & Classification> = [];

  for (const surface of surfaces) {
    const c = classify(surface.checkUrl, surface.service.websiteUrl);
    counts[c.checkType]++;
    updates.push({ id: surface.id, slug: surface.service.slug, checkUrl: surface.checkUrl, ...c });
  }

  console.log("\n=== BACKFILL REPORT — checkType distribution ===");
  console.log(`Total surfaces: ${surfaces.length}`);
  for (const [type, count] of Object.entries(counts)) {
    if (count > 0) console.log(`  ${type.padEnd(18)} ${count}`);
  }

  if (!COMMIT) {
    console.log("\n[DRY-RUN] Pass --commit to write to DB.");
    console.log("\nSample ATLASSIAN_JSON surfaces:");
    updates
      .filter(u => u.checkType === "ATLASSIAN_JSON")
      .slice(0, 10)
      .forEach(u => console.log(`  ${u.slug.padEnd(30)} ${u.checkUrl}`));
    console.log("\nSample STATUS_HTML surfaces:");
    updates
      .filter(u => u.checkType === "STATUS_HTML")
      .slice(0, 10)
      .forEach(u => console.log(`  ${u.slug.padEnd(30)} ${u.checkUrl}`));
    console.log("\nSample HOMEPAGE surfaces:");
    updates
      .filter(u => u.checkType === "HOMEPAGE")
      .slice(0, 10)
      .forEach(u => console.log(`  ${u.slug.padEnd(30)} ${u.checkUrl ?? "(null — falls back to websiteUrl)"}`));
    return;
  }

  // --commit: write checkType + signalConfidence for all surfaces
  console.log("\n[COMMIT] Writing checkType + signalConfidence to DB...");
  let written = 0;
  for (const u of updates) {
    await prisma.serviceSurface.update({
      where: { id: u.id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { checkType: u.checkType as any, signalConfidence: u.signalConfidence as any },
    });
    written++;
  }
  console.log(`Done. Updated ${written} ServiceSurface rows.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
