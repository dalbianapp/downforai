// ============================================
// CRON: all-checks — combine check-status + check-status-pages
// Remplace les 2 crons séparés (*/15 chacun) par un seul toutes les 30 min.
// Neon peut s'auto-suspendre entre les runs (gap > 5 min auto-suspend delay).
// ============================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = `https://${request.headers.get("host")}`;
  const headers: HeadersInit = { authorization: authHeader };

  const startTime = Date.now();
  console.log("[all-checks] starting check-status + check-status-pages...");

  // Les deux checks sont indépendants — lancer en parallèle
  const [statusRes, pagesRes] = await Promise.allSettled([
    fetch(`${base}/api/cron/check-status`, { headers }),
    fetch(`${base}/api/cron/check-status-pages`, { headers }),
  ]);

  async function parseResult(res: PromiseSettledResult<Response>) {
    if (res.status === "rejected") return { error: res.reason?.message ?? "failed" };
    try { return await res.value.json(); } catch { return { httpStatus: res.value.status }; }
  }

  const [checkStatus, checkStatusPages] = await Promise.all([
    parseResult(statusRes),
    parseResult(pagesRes),
  ]);

  const duration = Date.now() - startTime;
  console.log(`[all-checks] done in ${duration}ms`);

  return NextResponse.json({
    ok: true,
    duration: `${duration}ms`,
    checkStatus,
    checkStatusPages,
  });
}
