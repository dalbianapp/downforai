import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

const BASE = "https://downforai.com";

// CheckTypes that point at an official status feed (vs HOMEPAGE/ROBOTS_TXT etc.).
const STATUS_FEED_TYPES = new Set(["ATLASSIAN_JSON", "STATUS_HTML", "AWS_HEALTH", "GCP_JSON", "AZURE_STATUS"]);

const META = {
  name: "DownForAI — AI service status directory",
  description:
    "Directory of monitored AI services with live status badge URLs and DownForAI pages. One entry per service.",
  license: "CC-BY-4.0",
  license_url: "https://creativecommons.org/licenses/by/4.0/",
  attribution: "DownForAI (https://downforai.com)",
  source: `${BASE}/ai-status-services.json`,
};

/**
 * Machine-readable, CC-BY-4.0 directory of every monitored AI service. Meant to be
 * referenced by awesome-lists, dashboards, and tooling that need a stable list of
 * AI services with their status badge + DownForAI URL.
 */
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      select: {
        slug: true,
        name: true,
        category: true,
        monitoringCapability: true,
        surfaces: {
          where: { isEnabled: true },
          select: { checkUrl: true, checkType: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = services.map((s) => {
      // For services monitored via an official status feed, expose the status URL —
      // prefer a real status-feed surface, fall back to any surface with a URL.
      const isOfficial =
        s.monitoringCapability === "OFFICIAL_STATUS_API" || s.monitoringCapability === "OFFICIAL_STATUS_PAGE";
      const official = isOfficial
        ? s.surfaces.find((su) => su.checkUrl && STATUS_FEED_TYPES.has(su.checkType))?.checkUrl ??
          s.surfaces.find((su) => su.checkUrl)?.checkUrl ?? null
        : null;

      return {
        slug: s.slug,
        name: s.name,
        category: s.category.toLowerCase().replace(/_/g, "-"),
        downforai_url: `${BASE}/${s.slug}`,
        badge_url: `${BASE}/api/badge/${s.slug}.svg`,
        official_status_url: official,
        monitoring_capability: s.monitoringCapability,
      };
    });

    return NextResponse.json(
      { ...META, generated_at: new Date().toISOString(), count: data.length, services: data },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    // Always return the documented JSON shape — never a Next.js HTML 500 at a .json URL.
    console.error("[ai-status-services.json] error:", error);
    return NextResponse.json(
      { ...META, generated_at: new Date().toISOString(), count: 0, services: [], error: "temporarily_unavailable" },
      {
        status: 503,
        headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" },
      },
    );
  }
}
