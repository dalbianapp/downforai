import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";

function verifyAuth(request: NextRequest): boolean {
  const token = request.cookies.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!(adminPassword && token === adminPassword);
}

function styleHeader(row: ExcelJS.Row, color = "1E293B") {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${color}` } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
  });
  row.height = 22;
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all data in parallel
    const [services, comments, reportComments, reports, incidents, affiliateClicks] = await Promise.all([
      prisma.service.findMany({
        select: {
          name: true,
          slug: true,
          category: true,
          websiteUrl: true,
          surfaces: {
            take: 1,
            orderBy: { createdAt: "asc" },
            select: {
              observations: {
                take: 1,
                orderBy: { observedAt: "desc" },
                select: { status: true },
              },
            },
          },
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.comment.findMany({
        select: {
          createdAt: true,
          pseudo: true,
          content: true,
          aiReply: true,
          isVisible: true,
          service: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.communityReport.findMany({
        where: { comment: { not: null } },
        select: {
          createdAt: true,
          countryCode: true,
          comment: true,
          adminReply: true,
          isVisible: true,
          service: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.communityReport.findMany({
        select: {
          createdAt: true,
          reportType: true,
          countryCode: true,
          comment: true,
          ipHash: true,
          isSpam: true,
          service: { select: { name: true, slug: true } },
          surface: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10000,
      }),
      prisma.incident.findMany({
        select: {
          startedAt: true,
          resolvedAt: true,
          title: true,
          status: true,
          severity: true,
          service: { select: { name: true, slug: true } },
        },
        orderBy: { startedAt: "desc" },
      }),
      prisma.affiliateClick.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "DownForAI Admin";
    workbook.created = new Date();

    // ── Sheet 1: Services ──────────────────────────────────
    const wsServices = workbook.addWorksheet("Services");
    wsServices.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Slug", key: "slug", width: 28 },
      { header: "Category", key: "category", width: 16 },
      { header: "Current Status", key: "status", width: 18 },
      { header: "Website URL", key: "url", width: 40 },
    ];
    styleHeader(wsServices.getRow(1), "1E293B");

    for (const svc of services) {
      const latestObs = svc.surfaces[0]?.observations[0];
      wsServices.addRow({
        name: svc.name,
        slug: svc.slug,
        category: svc.category,
        status: latestObs?.status || "NO DATA",
        url: svc.websiteUrl || "",
      });
    }

    // ── Sheet 2: Comments (both standalone + report comments) ──
    const wsComments = workbook.addWorksheet("Comments");
    wsComments.columns = [
      { header: "Date", key: "date", width: 20 },
      { header: "Service", key: "service", width: 22 },
      { header: "Source", key: "source", width: 14 },
      { header: "Pseudo / Country", key: "pseudo", width: 18 },
      { header: "Content", key: "content", width: 50 },
      { header: "AI Reply", key: "reply", width: 50 },
      { header: "Visible", key: "visible", width: 10 },
    ];
    styleHeader(wsComments.getRow(1), "1E40AF");

    for (const c of comments) {
      wsComments.addRow({
        date: c.createdAt.toISOString().replace("T", " ").slice(0, 19),
        service: c.service.name,
        source: "Discussion",
        pseudo: c.pseudo,
        content: c.content,
        reply: c.aiReply || "",
        visible: c.isVisible ? "Yes" : "No",
      });
    }
    for (const c of reportComments) {
      wsComments.addRow({
        date: c.createdAt.toISOString().replace("T", " ").slice(0, 19),
        service: c.service.name,
        source: "Report",
        pseudo: c.countryCode || "",
        content: c.comment || "",
        reply: c.adminReply || "",
        visible: c.isVisible ? "Yes" : "No",
      });
    }

    // ── Sheet 3: Reports ──────────────────────────────────
    const wsReports = workbook.addWorksheet("Reports");
    wsReports.columns = [
      { header: "Date", key: "date", width: 20 },
      { header: "Service", key: "service", width: 22 },
      { header: "Surface", key: "surface", width: 18 },
      { header: "Type", key: "type", width: 12 },
      { header: "Country", key: "country", width: 10 },
      { header: "Comment", key: "comment", width: 50 },
      { header: "IP Hash", key: "ipHash", width: 20 },
      { header: "Spam", key: "spam", width: 8 },
    ];
    styleHeader(wsReports.getRow(1), "166534");

    for (const r of reports) {
      wsReports.addRow({
        date: r.createdAt.toISOString().replace("T", " ").slice(0, 19),
        service: r.service.name,
        surface: r.surface?.displayName || "",
        type: r.reportType,
        country: r.countryCode || "",
        comment: r.comment || "",
        ipHash: r.ipHash || "",
        spam: r.isSpam ? "Yes" : "No",
      });
    }

    // ── Sheet 4: Incidents ──────────────────────────────────
    const wsIncidents = workbook.addWorksheet("Incidents");
    wsIncidents.columns = [
      { header: "Started", key: "started", width: 20 },
      { header: "Resolved", key: "resolved", width: 20 },
      { header: "Service", key: "service", width: 22 },
      { header: "Title", key: "title", width: 40 },
      { header: "Severity", key: "severity", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Duration (min)", key: "duration", width: 16 },
    ];
    styleHeader(wsIncidents.getRow(1), "7C2D12");

    for (const inc of incidents) {
      const durationMin = inc.resolvedAt
        ? Math.round((inc.resolvedAt.getTime() - inc.startedAt.getTime()) / 60000)
        : null;
      wsIncidents.addRow({
        started: inc.startedAt.toISOString().replace("T", " ").slice(0, 19),
        resolved: inc.resolvedAt ? inc.resolvedAt.toISOString().replace("T", " ").slice(0, 19) : "Active",
        service: inc.service.name,
        title: inc.title,
        severity: inc.severity,
        status: inc.status,
        duration: durationMin,
      });
    }

    // ── Sheet 5: Affiliate Clicks ──────────────────────────────────
    const wsAffiliate = workbook.addWorksheet("Affiliate Clicks");
    wsAffiliate.columns = [
      { header: "Date", key: "date", width: 20 },
      { header: "Partner", key: "partner", width: 14 },
      { header: "Service", key: "service", width: 30 },
      { header: "Page", key: "page", width: 40 },
    ];
    styleHeader(wsAffiliate.getRow(1), "1D4ED8");

    for (const click of affiliateClicks) {
      wsAffiliate.addRow({
        date: click.createdAt.toISOString().replace("T", " ").slice(0, 19),
        partner: click.partner,
        service: click.serviceName,
        page: click.page,
      });
    }

    // Apply zebra striping to all sheets
    for (const ws of [wsServices, wsComments, wsReports, wsIncidents, wsAffiliate]) {
      ws.eachRow((row, rowNum) => {
        if (rowNum === 1) return;
        if (rowNum % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
          });
        }
        row.eachCell((cell) => {
          cell.alignment = { vertical: "top", wrapText: true };
        });
        row.height = 16;
      });
      ws.views = [{ state: "frozen", ySplit: 1 }];
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `downforai-export-${date}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
