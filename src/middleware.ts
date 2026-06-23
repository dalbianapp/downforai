import { NextRequest, NextResponse } from "next/server";
import { isLegacyGoneRoute } from "@/lib/legacy-routes";

// Bots that waste resources without any SEO or AI value
const BLOCKED_BOTS = [
  "dotbot",
  "petalbot",
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "blexbot",
  "bytespider",
  "dataforseobot",
  "seznambot",
  "serpstatbot",
  "linkpadbot",
  "siteauditbot",
  "pageanalyzer",
  "sogou",
  "yandexbot",
  "amazonbot",
];

const DEAD_SERVICES = [
  "octoai", "invoke-ai", "phind", "3dfy-ai", "hour-one",
  "csm-ai", "play-ht", "dora", "visual-electric", "safurai",
  "querium", "predibase", "moemate",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";

  // Block parasite bots before any other logic
  if (BLOCKED_BOTS.some((bot) => userAgent.includes(bot))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 410 Gone for the permanently-removed legacy pages
  // (/[slug]/down · /[slug]/[symptom] · /[slug]/error/[errorSlug]). Runs before
  // any redirect so the 410 signal is what Google sees.
  if (isLegacyGoneRoute(pathname)) {
    return new NextResponse("410 Gone — this page has been permanently removed.", {
      status: 410,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // OpenGraph image routes waste crawl budget (explored-not-indexed). Keep them
  // reachable for social rendering, but tell crawlers not to index them.
  if (pathname.endsWith("/opengraph-image")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
  }

  // Return 410 Gone for permanently removed services
  const firstSegment = pathname.split("/")[1];
  if (firstSegment && DEAD_SERVICES.includes(firstSegment)) {
    return new NextResponse("This service has been permanently removed.", {
      status: 410,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Admin auth
  if (pathname.startsWith("/admin")) {
    if (!pathname.startsWith("/admin/login")) {
      const token = request.cookies.get("admin_token")?.value;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword || token !== adminPassword) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // All routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|ads.txt|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};
