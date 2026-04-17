import type { ServiceDashboardData } from "./types";

export function buildBreadcrumbJsonLd(service: {
  slug: string;
  name: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://downforai.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: service.category.replace(/_/g, " "),
        item: `https://downforai.com/category/${service.category
          .toLowerCase()
          .replace(/_/g, "-")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.name,
        item: `https://downforai.com/${service.slug}`,
      },
    ],
  };
}

export function buildSoftwareApplicationJsonLd(
  service: {
    slug: string;
    name: string;
    description: string | null;
    websiteUrl: string | null;
  },
  // dashboard param reserved for future enrichment (uptime, etc.)
  _dashboard: ServiceDashboardData
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: service.name,
    description:
      service.description ??
      `${service.name} AI service status and monitoring`,
    url:
      service.websiteUrl ?? `https://downforai.com/${service.slug}`,
    applicationCategory: "Artificial Intelligence",
    operatingSystem: "Web",
  };
}
