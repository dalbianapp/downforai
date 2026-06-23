import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/badge/:slug.svg",
        destination: "/api/badge/:slug",
      },
    ];
  },

  async redirects() {
    return [
      // /reports/ai-outages-may-2026 → /reports/2026-05
      {
        source: "/reports/ai-outages-may-2026",
        destination: "/reports/2026-05",
        permanent: true,
      },
      // NOTE: the old /[slug]/down, /[slug]/error/* and /[slug]/[symptom]
      // redirects were removed — those pages are now permanently gone and the
      // middleware returns 410 (see src/lib/legacy-routes.ts). A 301 here would
      // override the 410, so it must NOT be reintroduced.
    ];
  },
};

export default nextConfig;
