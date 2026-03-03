import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceSlug = searchParams.get("service");

    if (!serviceSlug) {
      return NextResponse.json(
        { error: "Missing service parameter" },
        { status: 400 }
      );
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Get reports from last 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reports = await prisma.communityReport.findMany({
      where: {
        serviceId: service.id,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      select: {
        reportType: true,
        countryCode: true,
      },
    });

    // Count total
    const total24h = reports.length;

    // Group by type
    const byType: Record<string, number> = {};
    reports.forEach((report) => {
      byType[report.reportType] = (byType[report.reportType] || 0) + 1;
    });

    // Group by country
    const byCountry: Record<string, number> = {};
    reports.forEach((report) => {
      if (report.countryCode) {
        byCountry[report.countryCode] = (byCountry[report.countryCode] || 0) + 1;
      }
    });

    return NextResponse.json(
      { total24h, byType, byCountry },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
