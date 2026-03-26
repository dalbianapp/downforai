import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // Mark admin pages so root layout can skip Header/Footer
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-page", "1");

    if (!pathname.startsWith("/admin/login")) {
      const token = request.cookies.get("admin_token")?.value;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword || token !== adminPassword) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
