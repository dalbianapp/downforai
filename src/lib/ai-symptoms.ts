import { ServiceCategory } from "@prisma/client";

export interface SymptomInfo {
  slug: string;
  title: string;
  description: string;
  icon: string;
  commonCauses: string[];
  solutions: string[];
}

// Mapping symptômes par catégorie
export const AI_SYMPTOM_MAPPING: Record<ServiceCategory, string[]> = {
  LLM: ["not-working", "api-error", "slow-response"],
  IMAGE: ["not-working", "not-generating", "queue-full"],
  VIDEO: ["not-working", "generation-failed", "slow-rendering"],
  AUDIO: ["not-working", "api-error", "transcription-failed"],
  DEV: ["not-working", "extension-broken", "completion-not-working"],
  INFRA: ["not-working", "gpu-unavailable", "deployment-failed"],
  SEARCH: ["not-working", "api-error", "slow-response"],
  PRODUCTIVITY: ["not-working", "login-issue", "sync-error"],
  AGENTS: ["not-working", "api-error", "task-failed"],
  DESIGN: ["not-working", "export-failed", "slow-rendering"],
  THREE_D: ["not-working", "generation-failed", "model-error"],
};

// Détails des symptômes
export const AI_SYMPTOMS: Record<string, SymptomInfo> = {
  "not-working": {
    slug: "not-working",
    title: "Not Working",
    description: "Service is completely down or unresponsive",
    icon: "❌",
    commonCauses: [
      "Server outage or maintenance",
      "Network connectivity issues",
      "Service overload or capacity limits",
      "Infrastructure problems",
    ],
    solutions: [
      "Check the official status page",
      "Wait a few minutes and try again",
      "Clear browser cache and cookies",
      "Try accessing from a different network",
      "Check if other users are experiencing the same issue",
    ],
  },
  "api-error": {
    slug: "api-error",
    title: "API Errors",
    description: "API returning errors or failing requests",
    icon: "⚡",
    commonCauses: [
      "Invalid API keys or authentication",
      "Rate limiting or quota exceeded",
      "API endpoint changes or deprecation",
      "Temporary server errors (500, 502, 503)",
    ],
    solutions: [
      "Verify your API key is valid and not expired",
      "Check your rate limits and usage quota",
      "Review API documentation for recent changes",
      "Implement exponential backoff retry logic",
      "Contact support if errors persist",
    ],
  },
  "slow-response": {
    slug: "slow-response",
    title: "Slow Response",
    description: "Service is unusually slow or timing out",
    icon: "🐢",
    commonCauses: [
      "High traffic or server load",
      "Network latency or bandwidth issues",
      "Large requests or complex operations",
      "Regional server problems",
    ],
    solutions: [
      "Reduce request size or complexity",
      "Use caching for repeated requests",
      "Try during off-peak hours",
      "Consider upgrading to a higher tier plan",
      "Use a CDN or edge caching if available",
    ],
  },
  "not-generating": {
    slug: "not-generating",
    title: "Not Generating",
    description: "Image/content generation is failing",
    icon: "🖼️",
    commonCauses: [
      "Prompt violates content policy",
      "Model capacity limits reached",
      "Invalid parameters or settings",
      "Account or credit issues",
    ],
    solutions: [
      "Revise your prompt to comply with content policies",
      "Try simpler prompts or lower resolution",
      "Check account balance and credits",
      "Wait and retry during off-peak hours",
      "Contact support for policy clarification",
    ],
  },
  "queue-full": {
    slug: "queue-full",
    title: "Queue Full",
    description: "Generation queue is overloaded",
    icon: "⏳",
    commonCauses: [
      "High demand exceeding capacity",
      "Limited GPU resources available",
      "Free tier limitations",
      "Peak usage times",
    ],
    solutions: [
      "Wait and retry in a few minutes",
      "Upgrade to paid tier for priority access",
      "Try during off-peak hours (late night, early morning)",
      "Use alternative services temporarily",
    ],
  },
  "generation-failed": {
    slug: "generation-failed",
    title: "Generation Failed",
    description: "Content generation errors",
    icon: "💥",
    commonCauses: [
      "Invalid input parameters",
      "Resource constraints (memory, GPU)",
      "Model compatibility issues",
      "Temporary service errors",
    ],
    solutions: [
      "Verify input parameters are correct",
      "Reduce output length or complexity",
      "Try a different model or settings",
      "Check service status and retry",
      "Report persistent errors to support",
    ],
  },
  "slow-rendering": {
    slug: "slow-rendering",
    title: "Slow Rendering",
    description: "Rendering is taking too long",
    icon: "🐌",
    commonCauses: [
      "High complexity scenes or effects",
      "Server resource constraints",
      "Network bandwidth limitations",
      "Queue backlog",
    ],
    solutions: [
      "Reduce scene complexity or resolution",
      "Use lower quality settings temporarily",
      "Upgrade to priority rendering tier",
      "Download for offline rendering if available",
    ],
  },
  "transcription-failed": {
    slug: "transcription-failed",
    title: "Transcription Failed",
    description: "Audio transcription errors",
    icon: "🎤",
    commonCauses: [
      "Audio file format not supported",
      "Poor audio quality or background noise",
      "File size exceeds limits",
      "Language not supported",
    ],
    solutions: [
      "Convert to supported format (MP3, WAV, M4A)",
      "Improve audio quality and reduce noise",
      "Split large files into smaller segments",
      "Verify language is supported",
      "Try manual upload if streaming fails",
    ],
  },
  "extension-broken": {
    slug: "extension-broken",
    title: "Extension Not Working",
    description: "IDE extension is unresponsive",
    icon: "🧩",
    commonCauses: [
      "Extension version incompatibility",
      "IDE version conflicts",
      "Authentication issues",
      "Local configuration problems",
    ],
    solutions: [
      "Update extension to latest version",
      "Restart IDE completely",
      "Re-authenticate with your account",
      "Check extension logs for errors",
      "Reinstall the extension if necessary",
    ],
  },
  "completion-not-working": {
    slug: "completion-not-working",
    title: "Code Completion Down",
    description: "Autocomplete is not functioning",
    icon: "💻",
    commonCauses: [
      "Connection to service lost",
      "Extension disabled or paused",
      "API quota exceeded",
      "Conflicting extensions",
    ],
    solutions: [
      "Check internet connection",
      "Verify extension is enabled",
      "Check API quota and billing",
      "Disable conflicting extensions",
      "Reload IDE window",
    ],
  },
  "gpu-unavailable": {
    slug: "gpu-unavailable",
    title: "GPU Unavailable",
    description: "No GPU capacity available",
    icon: "🖥️",
    commonCauses: [
      "All GPUs are currently in use",
      "Requested GPU type unavailable",
      "Region capacity constraints",
      "Account limits reached",
    ],
    solutions: [
      "Wait and retry in a few minutes",
      "Try different GPU type or region",
      "Use spot instances if available",
      "Scale down resource requirements",
      "Contact support for capacity planning",
    ],
  },
  "deployment-failed": {
    slug: "deployment-failed",
    title: "Deployment Failed",
    description: "Deployment or inference errors",
    icon: "🚀",
    commonCauses: [
      "Configuration errors in deployment",
      "Model compatibility issues",
      "Resource allocation problems",
      "Network or permissions errors",
    ],
    solutions: [
      "Review deployment logs for errors",
      "Verify model format and dependencies",
      "Check resource allocation settings",
      "Ensure proper permissions and network access",
      "Try deploying to different region",
    ],
  },
  "login-issue": {
    slug: "login-issue",
    title: "Login Issues",
    description: "Cannot sign in or authenticate",
    icon: "🔐",
    commonCauses: [
      "Incorrect credentials",
      "Two-factor authentication issues",
      "Account locked or suspended",
      "Browser cookies/cache problems",
    ],
    solutions: [
      "Verify username and password are correct",
      "Reset password if forgotten",
      "Check 2FA app or email for codes",
      "Clear browser cache and cookies",
      "Try incognito/private browsing mode",
      "Contact support if account is locked",
    ],
  },
  "sync-error": {
    slug: "sync-error",
    title: "Sync Error",
    description: "Synchronization problems",
    icon: "🔄",
    commonCauses: [
      "Network connectivity issues",
      "Conflicting changes",
      "Storage quota exceeded",
      "Service temporarily unavailable",
    ],
    solutions: [
      "Check internet connection",
      "Resolve any conflicting changes",
      "Free up storage space",
      "Force manual sync",
      "Check service status page",
    ],
  },
  "task-failed": {
    slug: "task-failed",
    title: "Task Failed",
    description: "Agent task execution failed",
    icon: "🤖",
    commonCauses: [
      "Invalid task configuration",
      "Agent timeout or resource limits",
      "API connection failures",
      "Insufficient permissions",
    ],
    solutions: [
      "Review task configuration and parameters",
      "Increase timeout or resource limits",
      "Verify API credentials and permissions",
      "Check agent logs for detailed errors",
      "Simplify task or break into smaller steps",
    ],
  },
  "export-failed": {
    slug: "export-failed",
    title: "Export Failed",
    description: "Unable to export or download",
    icon: "📤",
    commonCauses: [
      "File size exceeds limits",
      "Unsupported export format",
      "Network interruption",
      "Temporary server error",
    ],
    solutions: [
      "Try different export format",
      "Reduce file size or complexity",
      "Use stable internet connection",
      "Retry export after a few minutes",
      "Try downloading in smaller chunks",
    ],
  },
  "model-error": {
    slug: "model-error",
    title: "Model Error",
    description: "3D model generation errors",
    icon: "🧊",
    commonCauses: [
      "Invalid input geometry",
      "Model complexity too high",
      "Format conversion issues",
      "Rendering engine problems",
    ],
    solutions: [
      "Simplify input geometry",
      "Reduce polygon count or detail",
      "Try different export format",
      "Update rendering engine",
      "Check model for errors before generation",
    ],
  },
};

// Services Tier 1 et 2 pour les pages "Is X Down?"
export const TIER_1_2_SERVICES = [
  // Tier 1 (20)
  "openai",
  "anthropic",
  "google-gemini",
  "midjourney",
  "meta-llama",
  "microsoft-copilot",
  "stability-ai",
  "elevenlabs",
  "runway",
  "cursor",
  "github-copilot",
  "suno",
  "hugging-face",
  "perplexity",
  "character-ai",
  "poe",
  "adobe-firefly",
  "replicate",
  "thinking-machines",
  "cohere",
  // Tier 2 (20)
  "mistral",
  "deepseek",
  "inflection-pi",
  "together-ai",
  "pika",
  "luma-ai",
  "kling-ai",
  "descript",
  "v0-vercel",
  "replit-ai",
  "sora",
  "capcut",
  "figma",
  "adobe-photoshop-ai",
  "slack-ai",
  "zoom-ai",
  "devin",
  "zapier-ai",
  "google-veo",
  "photoroom",
];

// Services Tier 1 uniquement pour les pages symptômes
export const TIER_1_SERVICES = [
  "openai",
  "anthropic",
  "google-gemini",
  "midjourney",
  "meta-llama",
  "microsoft-copilot",
  "stability-ai",
  "elevenlabs",
  "runway",
  "cursor",
  "github-copilot",
  "suno",
  "hugging-face",
  "perplexity",
  "character-ai",
  "poe",
  "adobe-firefly",
  "replicate",
  "thinking-machines",
  "cohere",
];

// Helper function to get symptom info
export function getSymptomInfo(symptomSlug: string): SymptomInfo | null {
  return AI_SYMPTOMS[symptomSlug] || null;
}

// Helper to get symptoms for a category
export function getSymptomsForCategory(category: ServiceCategory): string[] {
  return AI_SYMPTOM_MAPPING[category] || [];
}

// ==================== GLOBAL ERRORS ====================

export interface ErrorInfo {
  slug: string;
  title: string;
  description: string;
  icon: string;
  commonCauses: string[];
  solutions: string[];
  technicalDetails?: string;
}

// Global error slugs for static generation
export const GLOBAL_ERRORS = [
  "api-error",
  "rate-limit",
  "timeout",
  "authentication-failed",
  "server-error",
  "maintenance",
  "network-error",
  "quota-exceeded",
  "service-unavailable",
  "connection-failed",
];

// Global error definitions
export const GLOBAL_ERROR_INFO: Record<string, ErrorInfo> = {
  "api-error": {
    slug: "api-error",
    title: "API Error",
    description: "The API returned an unexpected error response",
    icon: "⚡",
    commonCauses: [
      "Invalid API key or authentication credentials",
      "Malformed request parameters or payload",
      "API endpoint changes or deprecation",
      "Server-side processing errors",
      "Rate limiting or quota enforcement",
    ],
    solutions: [
      "Verify your API key is valid and properly formatted",
      "Check the API documentation for correct endpoint URLs and parameters",
      "Review error response codes (400, 401, 403, 500, etc.) for specific guidance",
      "Implement proper error handling and retry logic with exponential backoff",
      "Update to the latest SDK version if available",
      "Contact the service provider's support if errors persist",
    ],
    technicalDetails: "Common HTTP status codes: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 500 (Internal Server Error), 502 (Bad Gateway), 503 (Service Unavailable)",
  },
  "rate-limit": {
    slug: "rate-limit",
    title: "Rate Limit Exceeded",
    description: "You've sent too many requests and hit the API rate limit",
    icon: "🚦",
    commonCauses: [
      "Sending requests too quickly without proper throttling",
      "Using free tier with strict rate limits",
      "Multiple applications sharing the same API key",
      "Automated scripts or loops without rate limiting",
      "Burst traffic exceeding per-second limits",
    ],
    solutions: [
      "Implement exponential backoff and retry logic",
      "Add delays between API requests (respect rate limit headers)",
      "Upgrade to a higher tier plan with increased limits",
      "Cache responses to reduce redundant API calls",
      "Use batch endpoints when available",
      "Monitor rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset)",
      "Distribute load across multiple API keys if permitted",
    ],
    technicalDetails: "HTTP Status: 429 Too Many Requests. Check response headers for rate limit information and reset times.",
  },
  "timeout": {
    slug: "timeout",
    title: "Request Timeout",
    description: "The request took too long and timed out before completion",
    icon: "⏱️",
    commonCauses: [
      "Server overload or high traffic",
      "Large or complex requests requiring extended processing time",
      "Network latency or connectivity issues",
      "Database or backend service slowdowns",
      "Insufficient timeout configuration on client side",
    ],
    solutions: [
      "Increase timeout values in your client configuration",
      "Reduce request complexity or payload size",
      "Break large operations into smaller chunks",
      "Retry with exponential backoff after timeout",
      "Try during off-peak hours if server load is the issue",
      "Check your network connection stability",
      "Use asynchronous or webhook-based endpoints for long-running operations",
    ],
    technicalDetails: "HTTP Status: 408 (Request Timeout) or 504 (Gateway Timeout). Default timeouts vary by service (typically 30-120 seconds).",
  },
  "authentication-failed": {
    slug: "authentication-failed",
    title: "Authentication Failed",
    description: "Unable to verify your identity or credentials",
    icon: "🔐",
    commonCauses: [
      "Invalid, expired, or revoked API key",
      "Incorrect username or password",
      "Two-factor authentication (2FA) required but not provided",
      "Session expired or token invalidated",
      "IP address or domain restrictions",
      "Account suspended or disabled",
    ],
    solutions: [
      "Verify API key or credentials are correct and up-to-date",
      "Regenerate API key from your account dashboard",
      "Check if 2FA is enabled and provide the required code",
      "Ensure you're using the correct authentication method (Bearer token, API key, OAuth)",
      "Clear cookies and log in again for session-based authentication",
      "Verify your IP address is whitelisted if IP restrictions are enabled",
      "Contact support if your account appears to be locked or suspended",
    ],
    technicalDetails: "HTTP Status: 401 (Unauthorized) or 403 (Forbidden). Check WWW-Authenticate header for authentication scheme details.",
  },
  "server-error": {
    slug: "server-error",
    title: "Server Error",
    description: "The server encountered an internal error and couldn't complete your request",
    icon: "💥",
    commonCauses: [
      "Unhandled exceptions or bugs in server code",
      "Database connection failures or query errors",
      "Out of memory or resource exhaustion",
      "Dependency service failures",
      "Configuration errors or missing environment variables",
    ],
    solutions: [
      "Wait a few minutes and retry your request",
      "Check the service's official status page for known issues",
      "Reduce request complexity if possible",
      "Contact support with request details (timestamp, request ID, error message)",
      "Try alternative endpoints or methods if available",
      "Monitor the service's incident reports for updates",
    ],
    technicalDetails: "HTTP Status: 500 (Internal Server Error), 502 (Bad Gateway), 503 (Service Unavailable). These are server-side issues outside your control.",
  },
  "maintenance": {
    slug: "maintenance",
    title: "Scheduled Maintenance",
    description: "The service is temporarily unavailable due to planned maintenance",
    icon: "🔧",
    commonCauses: [
      "Planned system upgrades or updates",
      "Database migration or optimization",
      "Infrastructure changes or scaling",
      "Security patches or critical fixes",
      "Scheduled downtime for major releases",
    ],
    solutions: [
      "Check the service's status page or social media for maintenance schedule",
      "Wait until the maintenance window is complete",
      "Use alternative services temporarily if critical",
      "Subscribe to status notifications to get advance notice",
      "Plan your critical operations around known maintenance windows",
    ],
    technicalDetails: "HTTP Status: 503 (Service Unavailable). Response may include Retry-After header indicating when service will resume.",
  },
  "network-error": {
    slug: "network-error",
    title: "Network Error",
    description: "Unable to establish a connection to the service",
    icon: "🌐",
    commonCauses: [
      "No internet connectivity",
      "Firewall or proxy blocking the connection",
      "DNS resolution failures",
      "Network routing issues",
      "VPN or network configuration problems",
      "ISP or local network outages",
    ],
    solutions: [
      "Check your internet connection is working",
      "Try accessing the service from a different network",
      "Disable VPN or proxy temporarily to test",
      "Flush DNS cache (ipconfig /flushdns on Windows, sudo dscacheutil -flushcache on Mac)",
      "Check firewall settings and whitelist the service domain",
      "Restart your router or modem",
      "Contact your ISP if the problem persists",
    ],
    technicalDetails: "Common errors: ECONNREFUSED, ENOTFOUND, ETIMEDOUT, ERR_NAME_NOT_RESOLVED. These indicate client-side network issues.",
  },
  "quota-exceeded": {
    slug: "quota-exceeded",
    title: "Quota Exceeded",
    description: "You've used up your allocated quota or credits",
    icon: "📊",
    commonCauses: [
      "Monthly or daily quota limits reached",
      "Credits or tokens depleted",
      "Free tier limits exceeded",
      "Billing cycle reset not yet occurred",
      "Usage spike exceeding plan limits",
    ],
    solutions: [
      "Check your account dashboard for quota usage and limits",
      "Upgrade to a higher tier plan with increased quota",
      "Purchase additional credits or tokens if available",
      "Wait for quota reset at the next billing cycle",
      "Optimize your usage to reduce API calls (caching, batching)",
      "Enable billing alerts to monitor usage in real-time",
      "Review and clean up any inefficient or unnecessary API calls",
    ],
    technicalDetails: "HTTP Status: 429 (Too Many Requests) or 402 (Payment Required). Check response for quota reset time and current usage.",
  },
  "service-unavailable": {
    slug: "service-unavailable",
    title: "Service Unavailable",
    description: "The service is temporarily down or unreachable",
    icon: "❌",
    commonCauses: [
      "Unexpected server outage or crash",
      "Deployment or rollback in progress",
      "Infrastructure failures (cloud provider issues)",
      "DDoS attack or abnormal traffic",
      "Regional service disruption",
      "Capacity limits reached during high demand",
    ],
    solutions: [
      "Check the service's official status page immediately",
      "Wait 5-10 minutes and retry",
      "Follow the service's social media for real-time updates",
      "Try accessing from a different region if available",
      "Use an alternative service temporarily",
      "Report the outage if not already known",
      "Subscribe to status notifications for recovery updates",
    ],
    technicalDetails: "HTTP Status: 503 (Service Unavailable). This indicates temporary unavailability, usually resolved within minutes to hours.",
  },
  "connection-failed": {
    slug: "connection-failed",
    title: "Connection Failed",
    description: "Failed to establish or maintain a connection to the server",
    icon: "🔌",
    commonCauses: [
      "Server not responding or unreachable",
      "Network instability or packet loss",
      "Firewall or security software blocking connection",
      "SSL/TLS certificate issues",
      "Incorrect hostname or endpoint URL",
      "Server overload refusing new connections",
    ],
    solutions: [
      "Verify the endpoint URL is correct and properly formatted",
      "Check if the service is online (ping or status check)",
      "Try using HTTP instead of HTTPS to rule out SSL issues (not recommended for production)",
      "Disable security software temporarily to test",
      "Check if the server's SSL certificate is valid and not expired",
      "Use a different DNS server (e.g., 8.8.8.8, 1.1.1.1)",
      "Retry with a longer connection timeout",
      "Check server logs or contact support if you control the server",
    ],
    technicalDetails: "Common errors: ECONNREFUSED, ECONNRESET, SSL_ERROR. Can indicate either client or server-side connection issues.",
  },
};

// Helper function to get error info
export function getErrorInfo(errorSlug: string): ErrorInfo | null {
  return GLOBAL_ERROR_INFO[errorSlug] || null;
}
