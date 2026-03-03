import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Database-based rate limiting (works on Vercel serverless)
async function checkRateLimitDB(
  ipHash: string,
  serviceId: string
): Promise<{ ok: boolean; reason?: string }> {
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);

  // Check 1: Max 1 report per service per 15 min per IP
  const serviceCount = await prisma.communityReport.count({
    where: {
      ipHash,
      serviceId,
      createdAt: { gte: fifteenMinAgo },
    },
  });

  if (serviceCount >= 1) {
    return {
      ok: false,
      reason: "You can only report once per service every 15 minutes",
    };
  }

  // Check 2: Max 5 reports global per 15 min per IP
  const globalCount = await prisma.communityReport.count({
    where: {
      ipHash,
      createdAt: { gte: fifteenMinAgo },
    },
  });

  if (globalCount >= 5) {
    return {
      ok: false,
      reason: "Too many reports. Please wait 15 minutes before reporting again",
    };
  }

  return { ok: true };
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sanitize comment (remove HTML tags, URLs, emails, normalize whitespace)
function sanitizeComment(comment: string): string {
  let clean = comment
    .replace(/<[^>]*>/g, "")           // Remove HTML tags
    .replace(/https?:\/\/\S+/gi, "")   // Remove URLs
    .replace(/www\.\S+/gi, "")         // Remove www links
    .replace(/\S+@\S+\.\S+/g, "")      // Remove email addresses
    .replace(/\s+/g, " ")              // Normalize whitespace
    .trim()
    .slice(0, 500);                    // Max 500 chars

  return clean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceSlug, reportType, surfaceId, email, comment, isDetailUpdate } = body;

    if (!serviceSlug || !reportType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Sanitize comment if provided
    const sanitizedComment = comment ? sanitizeComment(comment) : undefined;

    // Get client IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0] || "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    // Get country code (Vercel provides x-vercel-ip-country, Cloudflare provides cf-ipcountry)
    const countryCode = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || null;

    // Verify service exists first (needed for rate limit check)
    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Validate surfaceId if provided (must belong to this service)
    if (surfaceId) {
      const surface = await prisma.serviceSurface.findFirst({
        where: {
          id: surfaceId,
          serviceId: service.id,
        },
      });

      if (!surface) {
        return NextResponse.json(
          { error: "Invalid surface for this service" },
          { status: 400 }
        );
      }
    }

    // Special handling for detail updates (second submission with email/comment)
    if (isDetailUpdate && (email || sanitizedComment)) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      // Find the most recent report from this IP for this service
      const existingReport = await prisma.communityReport.findFirst({
        where: {
          ipHash,
          serviceId: service.id,
          reportType: reportType,
          createdAt: { gte: fiveMinAgo },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingReport) {
        // Update existing report with email/comment/surfaceId
        await prisma.communityReport.update({
          where: { id: existingReport.id },
          data: {
            surfaceId: surfaceId || undefined,
            email: email || undefined,
            comment: sanitizedComment,
          },
        });

        // Count reports in last 24h for this service
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newCount = await prisma.communityReport.count({
          where: {
            serviceId: service.id,
            createdAt: { gte: twentyFourHoursAgo },
          },
        });

        return NextResponse.json({ success: true, newCount }, { status: 200 });
      }
      // If no recent report found, fall through to create new one
    }

    // Check rate limits using database (only for new reports)
    const rateLimitCheck = await checkRateLimitDB(ipHash, service.id);

    if (!rateLimitCheck.ok) {
      return NextResponse.json(
        { error: rateLimitCheck.reason || "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Create community report
    await prisma.communityReport.create({
      data: {
        serviceId: service.id,
        surfaceId: surfaceId || undefined,
        reportType: reportType,
        countryCode,
        ipHash,
        email: email || undefined,
        comment: sanitizedComment,
      },
    });

    // Count reports in last 24h for this service
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newCount = await prisma.communityReport.count({
      where: {
        serviceId: service.id,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    return NextResponse.json({ success: true, newCount }, { status: 200 });
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
