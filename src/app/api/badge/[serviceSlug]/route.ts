import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 600;

const CACHE_SECONDS = 600;

const STATUS_COLORS: Record<string, { bg: string; label: string }> = {
  OPERATIONAL:      { bg: "#22c55e", label: "operational" },
  DEGRADED:         { bg: "#f59e0b", label: "degraded" },
  OUTAGE:           { bg: "#ef4444", label: "outage" },
  UNKNOWN:          { bg: "#6b7280", label: "unknown" },
  REPORTED_ISSUES:  { bg: "#f59e0b", label: "reported issues" },
};

function generateSVG(serviceName: string, status: string): string {
  const config = STATUS_COLORS[status] ?? STATUS_COLORS.UNKNOWN;
  const label = "status";
  const value = config.label;

  const labelWidth = Math.round(label.length * 6.5 + 12);
  const valueWidth = Math.round(value.length * 6.5 + 12);
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${serviceName}: ${value}">
  <title>${serviceName}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${config.bg}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="14" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="13">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="13">${value}</text>
  </g>
</svg>`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ serviceSlug: string }> }
) {
  const { serviceSlug } = await params;

  try {
    const result = await prisma.$queryRaw<Array<{ name: string; status: string | null }>>`
      SELECT s.name, latest.status
      FROM "Service" s
      LEFT JOIN LATERAL (
        SELECT o.status
        FROM "Observation" o
        INNER JOIN "ServiceSurface" ss ON ss.id = o."serviceSurfaceId"
        WHERE ss."serviceId" = s.id
        ORDER BY o."observedAt" DESC
        LIMIT 1
      ) latest ON true
      WHERE s.slug = ${serviceSlug}
      LIMIT 1
    `;

    if (result.length === 0) {
      return new NextResponse(generateSVG("unknown", "UNKNOWN"), {
        status: 404,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=60",
        },
      });
    }

    const service = result[0];
    const probeStatus = service.status ?? "UNKNOWN";

    let displayStatus = probeStatus;

    // Elevate to REPORTED_ISSUES if probes are OK but users are reporting
    if (probeStatus === "OPERATIONAL") {
      const reportCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM "CommunityReport" cr
        INNER JOIN "Service" s ON s.id = cr."serviceId"
        WHERE s.slug = ${serviceSlug}
          AND cr."createdAt" >= NOW() - INTERVAL '2 hours'
      `;
      if (Number(reportCount[0]?.count ?? 0) >= 5) {
        displayStatus = "REPORTED_ISSUES";
      }
    }

    return new NextResponse(generateSVG(service.name, displayStatus), {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
        "Vary": "Accept",
      },
    });
  } catch (error) {
    console.error("[badge] Error generating badge:", error);
    return new NextResponse(generateSVG("error", "UNKNOWN"), {
      status: 500,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
}
