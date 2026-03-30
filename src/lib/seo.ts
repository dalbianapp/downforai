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

// ==================== TITLE TRUNCATION (3 levels) ====================

/**
 * Truncate SEO title to ~60 chars with 3 progressive levels:
 * Level 1: full title
 * Level 2: remove site suffix (e.g. " | DownForAI")
 * Level 3: hard truncate with "…"
 */
export function truncateTitle(
  full: string,
  withoutSuffix?: string
): string {
  if (full.length <= 60) return full;
  if (withoutSuffix && withoutSuffix.length <= 60) return withoutSuffix;
  const base = withoutSuffix || full;
  return base.slice(0, 57) + "…";
}

/**
 * Truncate meta description to ~160 chars.
 */
export function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

// ==================== FAQ JSON-LD ====================

export interface JsonLdFAQPage {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export function generateFAQJsonLd(
  faq: Array<{ q: string; a: string }>
): JsonLdFAQPage {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
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
