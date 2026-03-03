export interface JsonLdWebApplication {
  "@context": "https://schema.org";
  "@type": "WebApplication";
  name: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
}

export interface JsonLdWebSite {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": "required name=search_term_string";
  };
}

export function generateWebApplicationJsonLd(
  name: string,
  url: string
): JsonLdWebApplication {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    applicationCategory: "AI Service",
    operatingSystem: "Web",
  };
}

export function generateWebSiteJsonLd(
  siteName: string,
  siteUrl: string
): JsonLdWebSite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
