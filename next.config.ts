import type { NextConfig } from "next";

// All valid symptom slugs — explicit list prevents catching legitimate routes
// (e.g. /category/llm would only redirect if "llm" were in this list)
const SYMPTOM_SLUGS = [
  "api-error",
  "authentication-failed",
  "completion-not-working",
  "connection-failed",
  "deployment-failed",
  "export-failed",
  "extension-broken",
  "generation-failed",
  "gpu-unavailable",
  "login-issue",
  "maintenance",
  "model-error",
  "network-error",
  "not-generating",
  "not-working",
  "queue-full",
  "quota-exceeded",
  "rate-limit",
  "server-error",
  "service-unavailable",
  "slow-rendering",
  "slow-response",
  "sync-error",
  "task-failed",
  "timeout",
  "transcription-failed",
].join("|");

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  async redirects() {
    return [
      // /[serviceSlug]/down → /[serviceSlug]
      {
        source: "/:serviceSlug/down",
        destination: "/:serviceSlug",
        permanent: true,
      },
      // /[serviceSlug]/error/[errorSlug] → /[serviceSlug]
      {
        source: "/:serviceSlug/error/:errorSlug",
        destination: "/:serviceSlug",
        permanent: true,
      },
      // /[serviceSlug]/[symptom] → /[serviceSlug]
      // Explicit slug list: only matches known symptom pages, never catches
      // /category/*, /about/*, /incidents/*, etc.
      {
        source: `/:serviceSlug/:symptom(${SYMPTOM_SLUGS})`,
        destination: "/:serviceSlug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
