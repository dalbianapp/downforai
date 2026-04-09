import { NextRequest, NextResponse } from "next/server";

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
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";

  // Block parasite bots before any other logic
  if (BLOCKED_BOTS.some((bot) => userAgent.includes(bot))) {
    return new NextResponse("Forbidden", { status: 403 });
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
