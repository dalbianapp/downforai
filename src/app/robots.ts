import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://downforai.com";

  return {
    rules: [
      // Default: allow good bots
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
      // Block parasite SEO crawlers
      { userAgent: "DotBot", disallow: "/" },
      { userAgent: "PetalBot", disallow: "/" },
      { userAgent: "AhrefsBot", disallow: "/" },
      { userAgent: "SemrushBot", disallow: "/" },
      { userAgent: "MJ12bot", disallow: "/" },
      { userAgent: "BLEXBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "DataForSeoBot", disallow: "/" },
      { userAgent: "SeznamBot", disallow: "/" },
      { userAgent: "Sogou", disallow: "/" },
      { userAgent: "YandexBot", disallow: "/" },
      { userAgent: "SerpstatBot", disallow: "/" },
      { userAgent: "LinkpadBot", disallow: "/" },
      { userAgent: "SiteAuditBot", disallow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
