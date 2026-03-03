// error-playbooks.ts - Service-specific error content by category

export type ReportType = "DOWN" | "SLOW" | "LOGIN" | "API_ERROR" | "OTHER";

export interface ErrorDefinition {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  causes: string[];
  fixSteps: string[];
  errorSignatures: string[];
  faq: Array<{ q: string; a: string }>;
  hasHowToSchema: boolean;
}

// Helper function to get relevant report types for each error
export function getRelevantReportTypes(slug: string): ReportType[] {
  const mapping: Record<string, ReportType[]> = {
    "api-error": ["API_ERROR"],
    "rate-limit-exceeded": ["API_ERROR"],
    "timeout-or-slow": ["SLOW"],
    "auth-error": ["LOGIN"],
    "model-unavailable": ["API_ERROR", "DOWN"],
    "generation-failed": ["DOWN", "API_ERROR"],
    "queue-full": ["SLOW"],
    "render-stuck": ["SLOW"],
    "upload-failed": ["API_ERROR", "OTHER"],
    "export-error": ["API_ERROR", "OTHER"],
    "moderation-block": ["API_ERROR", "OTHER"],
    "transcription-failed": ["API_ERROR", "DOWN"],
    "voice-generation-error": ["API_ERROR", "DOWN"],
    "slow-processing": ["SLOW"],
    "extension-not-working": ["DOWN", "OTHER"],
    "completion-failed": ["API_ERROR", "DOWN"],
    "webhook-failed": ["API_ERROR"],
    "gpu-unavailable": ["DOWN"],
    "deployment-failed": ["API_ERROR", "DOWN"],
    "inference-timeout": ["SLOW", "API_ERROR"],
    "region-unavailable": ["DOWN"],
    "billing-suspended": ["LOGIN", "API_ERROR"],
    "login-issue": ["LOGIN"],
    "sync-error": ["API_ERROR", "OTHER"],
    "ai-feature-broken": ["DOWN", "API_ERROR"],
    "task-failed": ["API_ERROR", "DOWN"],
    "timeout": ["SLOW"],
    "auth-integration-error": ["LOGIN", "API_ERROR"],
    "export-failed": ["API_ERROR", "OTHER"],
    "slow-rendering": ["SLOW"],
  };

  return mapping[slug] || ["API_ERROR", "DOWN", "OTHER"]; // Default fallback
}

export interface CategoryPlaybook {
  category: string;
  errors: ErrorDefinition[];
}

export const ERROR_PLAYBOOKS: CategoryPlaybook[] = [
  // ==================== LLM ====================
  {
    category: "LLM",
    errors: [
      {
        slug: "api-error",
        title: "API Error (500 / 502 / 503)",
        metaTitle: "API Error — Fix & Live Status",
        description:
          "When {service} returns an API error (HTTP 500, 502, or 503), it typically means the servers are experiencing issues, undergoing maintenance, or handling an unexpected surge in traffic. This is usually a server-side problem, not something wrong with your code.",
        causes: [
          "Server overload due to high demand or viral usage spike",
          "Scheduled or unscheduled maintenance on {service} infrastructure",
          "Bug or deployment issue on {service}'s backend",
          "Regional outage affecting specific data centers",
          "Upstream dependency failure (cloud provider, database, etc.)",
        ],
        fixSteps: [
          "Check {service}'s official status page for known incidents",
          "Check this page for live community reports and recent incidents",
          "Wait 2-5 minutes and retry your request",
          "Implement exponential backoff in your code (wait 1s, 2s, 4s, 8s between retries)",
          "If using the API, check your SDK version is up to date",
          "Try a different model or endpoint if available",
        ],
        errorSignatures: [
          "500 Internal Server Error",
          "502 Bad Gateway",
          "503 Service Unavailable",
          "The server had an error while processing your request",
          "An error occurred",
          "Something went wrong",
          "We're experiencing high demand",
          "Service temporarily unavailable",
          "upstream connect error",
          "gateway timeout",
        ],
        faq: [
          {
            q: "Is {service} API down right now?",
            a: "Check the live status indicator at the top of this page. If it shows 'Degraded' or 'Outage', {service} is experiencing issues. Community reports below show what other users are seeing right now.",
          },
          {
            q: "How long do {service} API errors usually last?",
            a: "Most API errors resolve within 15-60 minutes. Major outages can last 1-4 hours. Check our incidents timeline for historical resolution times.",
          },
          {
            q: "What should I do if {service} API keeps returning errors?",
            a: "First, check if the issue is widespread using the reports on this page. If it's just you, verify your API key, check your rate limits, and ensure your request format is correct. If the issue is global, wait for {service} to resolve it.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "rate-limit-exceeded",
        title: "Rate Limit Exceeded (429)",
        metaTitle: "Rate Limit Exceeded (429) — Fix & Live Status",
        description:
          "A 429 'Rate Limit Exceeded' error from {service} means you've sent too many requests in a given time period. This is a protective measure to ensure fair usage across all users. It can be triggered by your individual usage or by {service}-wide capacity constraints.",
        causes: [
          "Exceeded your plan's requests-per-minute (RPM) or tokens-per-minute (TPM) limit",
          "Organization or project-level quota exhausted for the billing period",
          "Too many concurrent/parallel requests from the same API key",
          "{service} is throttling all users due to high global demand",
          "Free tier limits reached — upgrade required for higher throughput",
        ],
        fixSteps: [
          "Check your usage dashboard on {service}'s platform to see current consumption",
          "Implement exponential backoff: wait 1s after first 429, then 2s, 4s, 8s",
          "Reduce concurrency — send fewer parallel requests",
          "Use batching or queuing to spread requests over time",
          "Consider upgrading your plan for higher rate limits",
          "If available, use {service}'s batch/async API for non-urgent requests",
        ],
        errorSignatures: [
          "429 Too Many Requests",
          "Rate limit reached",
          "Rate limit exceeded",
          "Too many requests",
          "insufficient_quota",
          "quota_exceeded",
          "TPM limit exceeded",
          "RPM limit exceeded",
          "You exceeded your current quota",
          "Please try again later",
        ],
        faq: [
          {
            q: "Why am I getting rate limited on {service}?",
            a: "You've either exceeded your plan's request limits (RPM/TPM) or {service} is experiencing high demand and throttling globally. Check your usage dashboard and the live status on this page.",
          },
          {
            q: "How do I fix {service} rate limit errors?",
            a: "Implement exponential backoff, reduce parallel requests, and check if you need to upgrade your plan. See the step-by-step fix guide above.",
          },
          {
            q: "Is {service} rate limiting everyone right now?",
            a: "Check the community reports below. If many users are reporting 'API Errors' or 'Slow' at the same time, it's likely a global issue, not just your account.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "timeout-or-slow",
        title: "Timeout or Slow Response",
        metaTitle: "Timeout / Slow Response — Fix & Live Status",
        description:
          "When {service} is timing out or responding very slowly, requests take much longer than usual or fail entirely. This can affect both API calls and the web interface. Slow responses often indicate server overload, network issues, or problems with specific models.",
        causes: [
          "{service} servers are overloaded with high traffic",
          "Your prompt or request is too large (long context, large input)",
          "The specific model you're using is under heavy load",
          "Network latency between your location and {service}'s servers",
          "Streaming connection interrupted or unstable",
        ],
        fixSteps: [
          "Check if {service} is experiencing widespread slowness using reports on this page",
          "Try reducing your prompt size or using a smaller/faster model",
          "Enable streaming if available (reduces perceived latency)",
          "Set appropriate timeout values in your client (30-120s for LLMs)",
          "Try again in a few minutes — load spikes are often temporary",
          "Check if the issue is region-specific by testing from a different location",
        ],
        errorSignatures: [
          "Request timed out",
          "timeout",
          "ETIMEDOUT",
          "ECONNRESET",
          "Connection timed out",
          "The request took too long",
          "Slow response",
          "504 Gateway Timeout",
          "Response not received",
          "Stream interrupted",
        ],
        faq: [
          {
            q: "Why is {service} so slow right now?",
            a: "Check the live status above and recent community reports. If many users report 'Slow', {service} is likely experiencing high demand or infrastructure issues.",
          },
          {
            q: "How long does {service} usually take to respond?",
            a: "Normal response time depends on the model and prompt size. GPT-4 class models typically take 2-15 seconds. If you're seeing 30+ seconds or timeouts, something is wrong.",
          },
          {
            q: "Is {service} timing out for everyone?",
            a: "Look at the community reports below. A spike in 'Slow' or 'Down' reports indicates a widespread issue, not a problem on your end.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "auth-error",
        title: "Authentication Failed / Invalid API Key",
        metaTitle: "Authentication Error — Fix & Live Status",
        description:
          "An authentication error from {service} means your API key, token, or login credentials were rejected. This can happen when keys expire, are misconfigured, or when {service}'s authentication service itself is having problems.",
        causes: [
          "API key is invalid, expired, or revoked",
          "Wrong API key for the organization or project",
          "Environment variable not set or set incorrectly",
          "Billing issue — account suspended due to payment failure",
          "{service}'s authentication servers are experiencing issues",
        ],
        fixSteps: [
          "Verify your API key is correct — regenerate it from {service}'s dashboard if needed",
          "Check that the key is assigned to the right organization/project",
          "Ensure the environment variable (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.) is properly set",
          "Check your billing status — overdue payments can disable keys",
          "If using OAuth/SSO, try logging out and back in",
          "Check this page — if others report auth issues, it may be a {service}-wide problem",
        ],
        errorSignatures: [
          "401 Unauthorized",
          "403 Forbidden",
          "Invalid API key",
          "Authentication failed",
          "Invalid authentication",
          "Incorrect API key provided",
          "invalid_api_key",
          "permission_denied",
          "API key not found",
          "Your account has been disabled",
        ],
        faq: [
          {
            q: "Why is my {service} API key not working?",
            a: "The most common cause is an expired, revoked, or misconfigured key. Regenerate your key from {service}'s dashboard and make sure it's correctly set in your environment.",
          },
          {
            q: "Is {service} authentication down?",
            a: "Check the community reports below. If multiple users report 'Login Issues' at the same time, {service}'s auth system may be having problems.",
          },
          {
            q: "How do I fix {service} 401/403 errors?",
            a: "Follow the step-by-step guide above. Most auth errors are fixed by regenerating your API key and checking your billing status.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "model-unavailable",
        title: "Model Unavailable / Overloaded",
        metaTitle: "Model Unavailable — Fix & Live Status",
        description:
          "When {service} reports a model as unavailable or overloaded, the specific AI model you're trying to use cannot process requests right now. This is often temporary and happens during peak usage times, model updates, or capacity issues.",
        causes: [
          "The model is overloaded with too many concurrent users",
          "Model is being updated or undergoing maintenance",
          "The model has been deprecated or renamed",
          "Your plan doesn't include access to this specific model",
          "Regional capacity issue — model available in some regions but not others",
        ],
        fixSteps: [
          "Check if {service} has announced any model changes or deprecations",
          "Try a different model version (e.g., gpt-4 instead of gpt-4-turbo, claude-3-haiku instead of claude-3-opus)",
          "Wait 5-10 minutes and retry — overload is often temporary",
          "Check your plan's model access — some models are limited to higher tiers",
          "Verify the exact model name/ID — typos or outdated names cause this error",
          "Check this page for community reports on model availability",
        ],
        errorSignatures: [
          "Model not found",
          "model_not_found",
          "The model is currently overloaded",
          "Model is at capacity",
          "This model is not available",
          "model_overloaded",
          "The model does not exist",
          "Access denied to model",
          "Model temporarily unavailable",
          "capacity_exceeded",
        ],
        faq: [
          {
            q: "Why is {service} model not available?",
            a: "The model may be overloaded, under maintenance, deprecated, or not included in your plan. Check {service}'s announcements and try an alternative model.",
          },
          {
            q: "Is {service} model overloaded right now?",
            a: "Check the live status and community reports on this page. A spike in reports usually indicates widespread capacity issues.",
          },
          {
            q: "What alternative models can I use on {service}?",
            a: "Most providers offer multiple models. Try a smaller or newer version — these often have more available capacity.",
          },
        ],
        hasHowToSchema: false,
      },
    ],
  },

  // ==================== IMAGE ====================
  {
    category: "IMAGE",
    errors: [
      {
        slug: "generation-failed",
        title: "Image Generation Failed",
        metaTitle: "Image Generation Failed — Fix & Live Status",
        description:
          "When {service} fails to generate an image, your request was processed but the image could not be created. This can happen due to server issues, content policy violations, unsupported parameters, or service outages.",
        causes: [
          "{service} servers are overloaded or experiencing an outage",
          "Your prompt was flagged by the content/safety filter",
          "Invalid parameters (unsupported resolution, aspect ratio, or format)",
          "The generation model encountered an internal error",
          "Your account has reached its generation limit",
        ],
        fixSteps: [
          "Check {service}'s status on this page for ongoing issues",
          "Review your prompt for terms that may trigger the safety filter",
          "Try a simpler prompt to test if generation works at all",
          "Verify your parameters are within supported ranges (resolution, format)",
          "Check your remaining generation credits/quota",
          "Try regenerating — transient errors often resolve on retry",
        ],
        errorSignatures: [
          "Generation failed",
          "Failed to generate image",
          "Image generation error",
          "Unable to create image",
          "Generation timed out",
          "An error occurred during generation",
          "The request could not be completed",
          "Job failed",
          "Rendering error",
        ],
        faq: [
          {
            q: "Why is {service} not generating my image?",
            a: "Check the live status above. If {service} is operational, your prompt may be triggering the content filter, or your parameters may be outside supported ranges.",
          },
          {
            q: "Is {service} image generation down?",
            a: "Check the community reports below. A spike in 'Down' reports means {service} is experiencing widespread issues.",
          },
          {
            q: "How do I fix {service} generation errors?",
            a: "Try a simpler prompt first. If that works, gradually add complexity. Check the fix steps above for detailed troubleshooting.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "queue-full",
        title: "Generation Queue Full / Long Wait",
        metaTitle: "Queue Full / Long Wait — Fix & Live Status",
        description:
          "When {service}'s generation queue is full, your request has been accepted but is waiting in line behind other users. During peak times, wait times can range from minutes to hours depending on your plan and the service's capacity.",
        causes: [
          "High demand — many users generating images simultaneously",
          "GPU capacity is limited during peak hours",
          "Free tier users are deprioritized behind paid users",
          "{service} is experiencing capacity constraints after a viral moment",
          "Specific model or style is overloaded",
        ],
        fixSteps: [
          "Check this page to see if others are experiencing long queues",
          "If on a free plan, consider upgrading for priority queue access",
          "Try generating during off-peak hours (early morning, late night UTC)",
          "Use a smaller resolution or simpler model for faster processing",
          "Try an alternative AI image generator while waiting",
          "Check {service}'s announcements for capacity updates",
        ],
        errorSignatures: [
          "Queue full",
          "Generation queued",
          "Waiting in queue",
          "Position in queue:",
          "High demand",
          "Please wait",
          "Estimated wait time:",
          "The server is busy",
          "Too many jobs in queue",
          "Try again later",
        ],
        faq: [
          {
            q: "Why is {service} queue so long?",
            a: "High demand or limited GPU capacity. Check reports on this page — if many users report 'Slow', it's a global capacity issue.",
          },
          {
            q: "How long is the {service} queue right now?",
            a: "Wait times vary. Check the community reports below for real-time user experiences.",
          },
          {
            q: "How do I skip the queue on {service}?",
            a: "Most services offer priority access for paid plans. You can also try off-peak hours or alternative services.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "upload-failed",
        title: "Image Upload Failed / Processing Error",
        metaTitle: "Upload Failed — Fix & Live Status",
        description:
          "When {service} fails to upload or process your image, the file couldn't be received or interpreted by the server. This typically relates to file format, size, network issues, or service problems.",
        causes: [
          "File is too large (exceeds maximum file size)",
          "Unsupported image format (not PNG, JPG, or WebP)",
          "Network connection interrupted during upload",
          "{service}'s upload servers are experiencing issues",
          "Image is corrupted or has invalid metadata",
        ],
        fixSteps: [
          "Check the file size — most services limit to 4-20MB",
          "Convert your image to PNG or JPG format",
          "Check your internet connection stability",
          "Try compressing the image before uploading",
          "Clear browser cache and try again",
          "Check this page for ongoing {service} issues",
        ],
        errorSignatures: [
          "Upload failed",
          "File too large",
          "Unsupported format",
          "Invalid image",
          "Processing error",
          "Could not process image",
          "Upload timed out",
          "File type not supported",
        ],
        faq: [
          {
            q: "Why can't I upload images to {service}?",
            a: "Check your file format (PNG/JPG recommended), file size (under the limit), and internet connection. If everything looks correct, {service} may be having upload issues — check the status above.",
          },
          {
            q: "What image formats does {service} support?",
            a: "Most AI image services support PNG, JPG, and WebP. Check {service}'s documentation for exact format requirements.",
          },
          {
            q: "Is {service} upload broken right now?",
            a: "Check the community reports below. If others are also having upload issues, it's likely a service-side problem.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "moderation-block",
        title: "Content Blocked / Safety Filter",
        metaTitle: "Content Blocked (Safety Filter) — Fix & Live Status",
        description:
          "When {service} blocks your content, the safety filter has flagged your prompt or uploaded image as potentially violating the content policy. This can happen with perfectly innocent prompts that contain ambiguous terms.",
        causes: [
          "Prompt contains words that trigger the safety filter",
          "Uploaded reference image was flagged",
          "Combination of terms interpreted as unsafe by the AI",
          "Overly aggressive safety filter (false positive)",
          "Content policy recently updated with stricter rules",
        ],
        fixSteps: [
          "Review {service}'s content policy and usage guidelines",
          "Rephrase your prompt — remove or replace ambiguous terms",
          "Use negative prompts to clarify what you don't want",
          "Try breaking your prompt into simpler, less ambiguous parts",
          "If you believe it's a false positive, report it to {service}",
          "Try a different phrasing that describes the same concept",
        ],
        errorSignatures: [
          "Content policy violation",
          "Your request was rejected",
          "Unsafe content detected",
          "This prompt has been blocked",
          "Content filter triggered",
          "Moderation flag",
          "Banned prompt",
          "Request flagged",
          "safety_filter",
        ],
        faq: [
          {
            q: "Why was my {service} prompt blocked?",
            a: "The safety filter detected terms or combinations it considers potentially unsafe. This can be a false positive. Try rephrasing your prompt with different wording.",
          },
          {
            q: "How do I avoid {service} content blocks?",
            a: "Use clear, specific language. Avoid ambiguous terms. Use negative prompts to clarify intent. Check {service}'s content policy for specific guidelines.",
          },
          {
            q: "Is {service} safety filter too strict?",
            a: "Many users experience false positives. If your content is appropriate and keeps getting blocked, try different wording or report the issue to {service}.",
          },
        ],
        hasHowToSchema: false,
      },
    ],
  },

  // ==================== VIDEO ====================
  {
    category: "VIDEO",
    errors: [
      {
        slug: "generation-failed",
        title: "Video Generation Failed",
        metaTitle: "Video Generation Failed — Fix & Live Status",
        description:
          "When {service} fails to generate a video, the rendering process encountered an error. Video generation is GPU-intensive and more prone to failures than image generation, especially for longer clips or complex prompts.",
        causes: [
          "{service} servers are overloaded or out of GPU capacity",
          "Prompt is too complex or ambiguous for the model",
          "Selected duration or resolution exceeds supported limits",
          "Content safety filter rejected the prompt",
          "Internal rendering pipeline error",
        ],
        fixSteps: [
          "Check {service}'s live status on this page",
          "Try a shorter video duration (e.g., 4s instead of 16s)",
          "Simplify your prompt — fewer elements, clearer description",
          "Lower the resolution if possible",
          "Try regenerating — transient GPU errors are common",
          "Check your remaining credits/quota",
        ],
        errorSignatures: [
          "Generation failed",
          "Video rendering error",
          "Failed to generate video",
          "Job failed",
          "Rendering timed out",
          "Unable to create video",
          "An error occurred during generation",
          "Processing error",
        ],
        faq: [
          {
            q: "Why did {service} fail to generate my video?",
            a: "Video generation is resource-intensive. Check the live status above — if {service} is having issues, wait and retry. Otherwise, simplify your prompt or reduce duration.",
          },
          {
            q: "Is {service} video generation working?",
            a: "Check community reports below for real-time user experiences.",
          },
          {
            q: "How can I make {service} video generation more reliable?",
            a: "Use shorter durations, simpler prompts, and standard resolutions. Retry on failure — transient errors are normal.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "render-stuck",
        title: "Rendering Stuck / Processing Timeout",
        metaTitle: "Rendering Stuck — Fix & Live Status",
        description:
          "When {service} video rendering gets stuck, the progress bar stops moving or the processing time far exceeds the expected duration. This is common during peak usage when GPU resources are constrained.",
        causes: [
          "GPU queue is backed up — your job is waiting",
          "The rendering process crashed silently",
          "Complex scene or long duration causing timeout",
          "Server-side error that didn't report back properly",
          "{service} is experiencing high demand",
        ],
        fixSteps: [
          "Wait up to 15-30 minutes before assuming it's stuck",
          "Check this page for reports of widespread slowness",
          "Cancel and resubmit the job if possible",
          "Try a shorter or simpler generation",
          "Clear your browser and try fresh",
          "Contact {service} support if credits were consumed without output",
        ],
        errorSignatures: [
          "Stuck at 99%",
          "Processing...",
          "Rendering in progress",
          "Still processing",
          "Taking longer than expected",
          "Job queued",
          "Estimated time remaining: unknown",
          "Processing timeout",
        ],
        faq: [
          {
            q: "Why is {service} rendering stuck?",
            a: "Video rendering is GPU-heavy. During peak times, jobs queue up. If stuck for 30+ minutes with no progress, cancel and retry.",
          },
          {
            q: "How long should {service} video rendering take?",
            a: "Typically 2-15 minutes depending on length and complexity. Anything over 30 minutes likely means an issue.",
          },
          {
            q: "Will I lose credits if {service} rendering fails?",
            a: "Policies vary. Check {service}'s terms — most services refund credits for failed generations.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "upload-failed",
        title: "Video Upload Failed",
        metaTitle: "Upload Failed — Fix & Live Status",
        description:
          "When {service} fails to accept your video upload, the file could not be received or processed. Video files are large, making uploads more prone to network timeouts and format issues.",
        causes: [
          "File too large",
          "Unsupported video format or codec",
          "Network timeout during upload",
          "{service} upload servers down",
          "Video corrupted or invalid",
        ],
        fixSteps: [
          "Check file size limits (varies by service)",
          "Convert to MP4 (H.264) — the most widely supported format",
          "Compress the video before uploading",
          "Try a stable wired connection instead of WiFi",
          "Check this page for ongoing upload issues",
          "Try uploading a smaller test video first",
        ],
        errorSignatures: [
          "Upload failed",
          "File too large",
          "Unsupported format",
          "Upload timed out",
          "Could not process video",
          "Invalid file",
        ],
        faq: [
          {
            q: "Why can't I upload video to {service}?",
            a: "Check file size, format (MP4 H.264 recommended), and your connection. If the issue persists, check the status above.",
          },
          {
            q: "What video formats does {service} accept?",
            a: "MP4 with H.264 encoding is the safest bet. Check {service}'s documentation for exact limits.",
          },
          {
            q: "Is {service} having upload issues?",
            a: "Check community reports below for real-time feedback from other users.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "export-error",
        title: "Export Failed / Download Error",
        metaTitle: "Export Failed — Fix & Live Status",
        description:
          "When {service} fails to export or download your generated video, the file is ready but can't be delivered to you. This is usually a server-side or browser issue.",
        causes: [
          "Export server is overloaded",
          "Browser blocking the download",
          "Export format not supported",
          "Video file corrupted during processing",
          "{service} CDN/storage issue",
        ],
        fixSteps: [
          "Try a different export format if available",
          "Disable browser popup/download blockers",
          "Try right-click → 'Save link as'",
          "Clear browser cache and retry",
          "Try a different browser",
          "Check this page for widespread export issues",
        ],
        errorSignatures: [
          "Export failed",
          "Download error",
          "Could not export",
          "File not available",
          "Export timed out",
          "Unable to download",
        ],
        faq: [
          {
            q: "Why can't I download my {service} video?",
            a: "Try a different browser, disable download blockers, or try a different export format. If the issue is widespread, {service} may be having CDN issues.",
          },
          {
            q: "Is {service} export working?",
            a: "Check community reports below. If others can't download either, it's a service issue.",
          },
          {
            q: "Will my video be lost if {service} export fails?",
            a: "Usually no — generated videos are stored temporarily. Retry the export. Check {service}'s retention policy for how long outputs are kept.",
          },
        ],
        hasHowToSchema: false,
      },
    ],
  },

  // ==================== AUDIO ====================
  {
    category: "AUDIO",
    errors: [
      {
        slug: "transcription-failed",
        title: "Transcription Failed / Audio Not Recognized",
        metaTitle: "Transcription Failed — Fix & Live Status",
        description:
          "When {service} fails to transcribe audio, the speech-to-text engine could not process your file. This can be due to audio quality, unsupported languages, format issues, or service problems.",
        causes: [
          "Audio quality too low (background noise, distortion)",
          "Unsupported audio format or codec",
          "Language not supported or auto-detection failed",
          "Audio file too long or too large",
          "{service} transcription service is down",
        ],
        fixSteps: [
          "Ensure audio is clear with minimal background noise",
          "Convert to WAV or MP3 format",
          "Specify the language explicitly if possible",
          "Try a shorter audio segment first",
          "Check file size against {service}'s limits",
          "Check this page for service-wide issues",
        ],
        errorSignatures: [
          "Transcription failed",
          "Could not recognize speech",
          "No speech detected",
          "Audio format not supported",
          "Transcription error",
          "Unable to process audio",
          "Language not supported",
        ],
        faq: [
          {
            q: "Why did {service} fail to transcribe my audio?",
            a: "Most failures are due to audio quality, format, or file size. Try clear audio in WAV/MP3 format. If the issue is widespread, check the status above.",
          },
          {
            q: "What audio formats does {service} support?",
            a: "WAV, MP3, and M4A are widely supported. Check {service}'s documentation for exact format requirements.",
          },
          {
            q: "Is {service} transcription down?",
            a: "Check community reports below for real-time feedback.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "voice-generation-error",
        title: "Voice Generation Error / TTS Failed",
        metaTitle: "Voice Generation Error — Fix & Live Status",
        description:
          "When {service} fails to generate voice or speech, the text-to-speech engine encountered an error. This can relate to the selected voice, input text, API issues, or service capacity.",
        causes: [
          "Selected voice/model is temporarily unavailable",
          "Input text too long or contains unsupported characters",
          "API rate limit or quota exceeded",
          "{service} TTS servers are overloaded",
          "Voice cloning processing error",
        ],
        fixSteps: [
          "Try a different voice or model",
          "Shorten your input text",
          "Remove special characters or unusual formatting",
          "Check your quota/credits",
          "Retry after a few minutes",
          "Check this page for service issues",
        ],
        errorSignatures: [
          "Voice generation failed",
          "TTS error",
          "Could not generate audio",
          "Voice not available",
          "Synthesis failed",
          "Generation error",
          "Voice model error",
        ],
        faq: [
          {
            q: "Why is {service} voice generation not working?",
            a: "Try a different voice, shorter text, or check your credits. If the issue is global, check the status on this page.",
          },
          {
            q: "Is {service} text-to-speech down?",
            a: "Check the live status and community reports above.",
          },
          {
            q: "How do I fix {service} TTS errors?",
            a: "Follow the troubleshooting steps above. Most TTS errors are resolved by switching voices or shortening input.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "upload-failed",
        title: "Audio Upload Failed / Format Error",
        metaTitle: "Audio Upload Failed — Fix & Live Status",
        description:
          "When {service} can't accept your audio upload, the file format, size, or encoding may be incompatible, or the upload service is experiencing issues.",
        causes: [
          "File too large for the service's limits",
          "Unsupported audio format or encoding",
          "Network timeout during upload",
          "Corrupted audio file",
          "{service} upload service down",
        ],
        fixSteps: [
          "Check file size limits in {service}'s documentation",
          "Convert to MP3 or WAV (standard formats)",
          "Compress audio if file is too large",
          "Try a stable internet connection",
          "Upload a short test file first",
          "Check this page for upload issues",
        ],
        errorSignatures: [
          "Upload failed",
          "File too large",
          "Unsupported audio format",
          "Upload timed out",
          "Could not process file",
          "Invalid audio file",
        ],
        faq: [
          {
            q: "Why can't I upload audio to {service}?",
            a: "Check file format (MP3/WAV recommended), size limits, and your connection.",
          },
          {
            q: "What's the maximum audio file size for {service}?",
            a: "Varies by service. Check {service}'s documentation for exact limits.",
          },
          {
            q: "Is {service} upload working?",
            a: "Check community reports below for real-time status.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "slow-processing",
        title: "Slow Processing / Queue Delay",
        metaTitle: "Slow Processing — Fix & Live Status",
        description:
          "When {service} is processing audio slowly, your request is in a queue or the servers are handling heavy load. Audio processing time depends on file length, task complexity, and current demand.",
        causes: [
          "High demand on {service}'s servers",
          "Long audio file takes more processing time",
          "GPU/compute resources are constrained",
          "Free tier users deprioritized",
          "Specific feature (voice cloning, etc.) is overloaded",
        ],
        fixSteps: [
          "Check this page for reports of global slowness",
          "Try shorter audio segments",
          "Try during off-peak hours",
          "Consider upgrading for priority processing",
          "Cancel and resubmit if stuck for too long",
          "Try an alternative service while waiting",
        ],
        errorSignatures: [
          "Processing...",
          "Queue position:",
          "Estimated wait:",
          "Taking longer than expected",
          "Still processing",
          "High demand",
        ],
        faq: [
          {
            q: "Why is {service} processing so slow?",
            a: "Check the reports on this page. If many users report 'Slow', it's a capacity issue.",
          },
          {
            q: "How long should {service} audio processing take?",
            a: "Typically seconds to a few minutes. Anything over 10 minutes likely indicates an issue.",
          },
          {
            q: "Can I speed up {service} processing?",
            a: "Use shorter files, off-peak hours, or a paid plan for priority access.",
          },
        ],
        hasHowToSchema: false,
      },
    ],
  },

  // ==================== DEV ====================
  {
    category: "DEV",
    errors: [
      {
        slug: "extension-not-working",
        title: "IDE Extension Not Responding",
        metaTitle: "Extension Not Working — Fix & Live Status",
        description:
          "When {service}'s IDE extension stops working, code completions, suggestions, and AI features become unavailable in your editor. This can be caused by extension crashes, authentication issues, or service outages.",
        causes: [
          "{service} extension crashed or lost connection",
          "Extension version is outdated",
          "Authentication token expired",
          "IDE update broke compatibility",
          "{service} backend servers are down",
          "Network/firewall blocking the extension's connection",
        ],
        fixSteps: [
          "Restart your IDE (VS Code, JetBrains, etc.)",
          "Check the extension is up to date",
          "Sign out and sign back in to {service}",
          "Check the extension's output log for errors",
          "Disable and re-enable the extension",
          "Check this page for {service} outages",
        ],
        errorSignatures: [
          "Extension not responding",
          "Connection lost",
          "Unable to connect",
          "Extension error",
          "Not authenticated",
          "Service unavailable",
          "Extension crashed",
          "Copilot is not available",
        ],
        faq: [
          {
            q: "Why is {service} not working in my IDE?",
            a: "Try restarting your IDE, updating the extension, and signing in again. If the issue is widespread, check the status above.",
          },
          {
            q: "Is {service} extension down?",
            a: "Check community reports below. If many developers are reporting issues, it's a service-side problem.",
          },
          {
            q: "How do I fix {service} in VS Code?",
            a: "Restart VS Code, check for extension updates, re-authenticate, and check the Output panel for {service} logs.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "completion-failed",
        title: "Code Completion Not Working",
        metaTitle: "Code Completion Not Working — Fix & Live Status",
        description:
          "When {service} stops providing code completions or suggestions, the AI assistant is failing to generate or deliver predictions to your editor. This reduces productivity significantly.",
        causes: [
          "{service} backend is slow or down",
          "File type or language not supported",
          "Context too large for the model",
          "Rate limit reached for completions",
          "Extension conflict in the IDE",
        ],
        fixSteps: [
          "Check if {service} is operational on this page",
          "Verify the file type is supported",
          "Try typing in a new file to test",
          "Check if completions are enabled in settings",
          "Disable other AI extensions that may conflict",
          "Check your subscription status",
        ],
        errorSignatures: [
          "No suggestions",
          "Completions unavailable",
          "Unable to generate suggestions",
          "Inline suggestions disabled",
          "No results",
          "AI assistant not available",
        ],
        faq: [
          {
            q: "Why is {service} not giving me code suggestions?",
            a: "Check if {service} is operational, your subscription is active, and the file type is supported.",
          },
          {
            q: "Is {service} code completion down?",
            a: "Check the live status and reports on this page.",
          },
          {
            q: "How do I get {service} completions working again?",
            a: "Restart IDE, check settings, update extension, and verify subscription.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "api-error",
        title: "API Error / SDK Error",
        metaTitle: "API / SDK Error — Fix & Live Status",
        description:
          "When {service}'s API or SDK returns an error, your programmatic integration with the service has encountered a problem. This can affect CI/CD pipelines, automated workflows, and custom integrations.",
        causes: [
          "{service} API servers are down or degraded",
          "SDK version is outdated or incompatible",
          "Invalid request format or parameters",
          "Authentication/API key issue",
          "Rate limit exceeded on API calls",
        ],
        fixSteps: [
          "Check {service}'s API status on this page",
          "Update your SDK to the latest version",
          "Verify your API key and permissions",
          "Check the request format against {service}'s documentation",
          "Implement error handling and retries",
          "Check rate limits on your account",
        ],
        errorSignatures: [
          "API error",
          "SDK error",
          "Request failed",
          "500 Internal Server Error",
          "Connection refused",
          "ECONNREFUSED",
          "Fetch failed",
          "Network error",
        ],
        faq: [
          {
            q: "Is {service} API down?",
            a: "Check the live status and reports above.",
          },
          {
            q: "How do I fix {service} SDK errors?",
            a: "Update your SDK, check your API key, and verify request format. See the troubleshooting steps above.",
          },
          {
            q: "Why is my {service} integration failing?",
            a: "Most integration failures are due to outdated SDKs, expired API keys, or rate limits. Check each systematically.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "auth-error",
        title: "Authentication or License Error",
        metaTitle: "Auth / License Error — Fix & Live Status",
        description:
          "When {service} rejects your authentication, your license, API key, or login credentials are invalid or expired. For dev tools, this often relates to subscription status or organization permissions.",
        causes: [
          "Subscription expired or payment failed",
          "API key revoked or expired",
          "Organization removed your access",
          "SSO/OAuth token expired",
          "{service} auth servers are down",
        ],
        fixSteps: [
          "Check your subscription status on {service}'s dashboard",
          "Regenerate your API key or token",
          "Sign out and back in",
          "Check with your organization admin for permissions",
          "Verify billing information is up to date",
          "Check this page for auth service issues",
        ],
        errorSignatures: [
          "License expired",
          "Authentication failed",
          "Invalid token",
          "Subscription required",
          "401 Unauthorized",
          "Access denied",
          "Not authorized",
          "License validation failed",
        ],
        faq: [
          {
            q: "Why is my {service} license not working?",
            a: "Check your subscription status, payment method, and API key validity.",
          },
          {
            q: "Is {service} authentication down?",
            a: "Check community reports below for login-related issues.",
          },
          {
            q: "How do I renew my {service} license?",
            a: "Visit {service}'s billing page, update payment info, and reactivate if needed.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "webhook-failed",
        title: "Webhook Failed / Integration Error",
        metaTitle: "Webhook / Integration Error — Fix & Live Status",
        description:
          "When {service}'s webhooks or integrations fail, automated workflows, notifications, and connected services stop receiving updates. This breaks CI/CD pipelines and team collaboration tools.",
        causes: [
          "Webhook endpoint is unreachable or returning errors",
          "{service}'s webhook delivery service is down",
          "Authentication changed on the receiving end",
          "Payload format changed after an update",
          "Rate limit on webhook deliveries",
        ],
        fixSteps: [
          "Check the webhook delivery logs in {service}'s settings",
          "Verify your endpoint URL is correct and reachable",
          "Check authentication credentials on both sides",
          "Test with a simple webhook receiver (e.g., webhook.site)",
          "Check this page for {service} integration issues",
          "Re-register the webhook if needed",
        ],
        errorSignatures: [
          "Webhook delivery failed",
          "Integration error",
          "Connection refused",
          "Endpoint not found",
          "Webhook timed out",
          "Delivery failed after retries",
          "Integration disconnected",
        ],
        faq: [
          {
            q: "Why are {service} webhooks not working?",
            a: "Check webhook logs, endpoint availability, and authentication. If {service}-wide, check the status above.",
          },
          {
            q: "Is {service} webhook service down?",
            a: "Check community reports below.",
          },
          {
            q: "How do I debug {service} webhook failures?",
            a: "Check delivery logs, test with webhook.site, verify credentials, and check for payload format changes.",
          },
        ],
        hasHowToSchema: false,
      },
    ],
  },

  // ==================== INFRA ====================
  {
    category: "INFRA",
    errors: [
      {
        slug: "gpu-unavailable",
        title: "GPU Unavailable / No Capacity",
        metaTitle: "GPU Unavailable — Fix & Live Status",
        description:
          "When {service} reports no GPU availability, there are no compute resources to run your model. GPU scarcity is a major issue in AI infrastructure, especially for high-demand GPU types like A100 and H100.",
        causes: [
          "All GPUs of the requested type are in use",
          "Regional capacity exhausted",
          "Spot/preemptible instances were reclaimed",
          "Specific GPU type not available in your region",
          "{service} is experiencing a capacity crunch",
        ],
        fixSteps: [
          "Try a different GPU type (e.g., A10 instead of A100)",
          "Try a different region",
          "Use on-demand instead of spot instances",
          "Set up auto-retry with {service}'s queue system",
          "Check this page for capacity updates",
          "Consider reserved instances for guaranteed access",
        ],
        errorSignatures: [
          "No GPU available",
          "GPU capacity exceeded",
          "No available machines",
          "Resource not available",
          "Insufficient capacity",
          "Out of capacity",
          "No instances available",
          "GPU quota exceeded",
        ],
        faq: [
          {
            q: "Why are {service} GPUs unavailable?",
            a: "GPU demand exceeds supply, especially for popular types. Try different GPU types, regions, or off-peak hours.",
          },
          {
            q: "When will {service} GPUs be available?",
            a: "Capacity fluctuates. Check community reports for real-time availability feedback.",
          },
          {
            q: "How do I get guaranteed GPU access on {service}?",
            a: "Consider reserved instances, enterprise plans, or multi-provider setups.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "deployment-failed",
        title: "Deployment Failed / Build Error",
        metaTitle: "Deployment Failed — Fix & Live Status",
        description:
          "When {service} fails to deploy your model or application, the build, packaging, or startup process encountered an error. This can block your production pipeline.",
        causes: [
          "Build dependencies failed to install",
          "Docker image or container configuration error",
          "Model file too large or corrupted",
          "Insufficient resources allocated for startup",
          "{service} deployment infrastructure issue",
        ],
        fixSteps: [
          "Check build logs for specific error messages",
          "Verify all dependencies and versions",
          "Test your deployment locally first",
          "Check resource allocation (RAM, GPU, disk)",
          "Try redeploying from scratch",
          "Check this page for {service} infrastructure issues",
        ],
        errorSignatures: [
          "Deployment failed",
          "Build error",
          "Container failed to start",
          "Health check failed",
          "Model failed to load",
          "Out of memory",
          "Startup timeout",
          "Build timed out",
        ],
        faq: [
          {
            q: "Why did my {service} deployment fail?",
            a: "Check build logs for the specific error. Common causes are dependency issues, resource limits, and model loading errors.",
          },
          {
            q: "Is {service} deployment service down?",
            a: "Check the live status and reports above.",
          },
          {
            q: "How do I fix {service} deployment errors?",
            a: "Follow the troubleshooting steps above. Start with build logs and work through dependencies, resources, and configuration.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "inference-timeout",
        title: "Inference Timeout / Model Loading Error",
        metaTitle: "Inference Timeout — Fix & Live Status",
        description:
          "When {service} inference times out, the model took too long to load, initialize, or generate a response. Large models can have cold start times of 30-120 seconds, and inference itself can timeout under load.",
        causes: [
          "Cold start — model loading into GPU memory",
          "Model is too large for allocated resources",
          "Input is too large or complex",
          "Infrastructure overloaded",
          "{service} inference endpoint is degraded",
        ],
        fixSteps: [
          "Increase timeout values in your client",
          "Use a smaller model variant if available",
          "Keep the endpoint warm with periodic requests",
          "Check if auto-scaling is configured",
          "Reduce input size",
          "Check this page for infrastructure issues",
        ],
        errorSignatures: [
          "Inference timeout",
          "Model loading",
          "Cold start",
          "504 Gateway Timeout",
          "Request timed out",
          "Model initialization failed",
          "Prediction timed out",
          "Worker not ready",
        ],
        faq: [
          {
            q: "Why is {service} inference timing out?",
            a: "Large models have cold starts (30-120s). If timeouts persist, the model may need more resources or {service} may be overloaded.",
          },
          {
            q: "How do I reduce {service} cold start time?",
            a: "Keep endpoints warm, use smaller models, or use {service}'s dedicated/reserved infrastructure.",
          },
          {
            q: "Is {service} inference slow for everyone?",
            a: "Check community reports below for real-time performance feedback.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "region-unavailable",
        title: "Region Unavailable / Endpoint Down",
        metaTitle: "Region Unavailable — Fix & Live Status",
        description:
          "When a {service} region or endpoint is unavailable, the specific data center or geographic zone you're targeting is down or unreachable. Other regions may still be operational.",
        causes: [
          "Data center outage in the specific region",
          "Maintenance window for that region",
          "Network routing issue to the region",
          "Region-specific capacity exhaustion",
          "DNS or certificate issue for the regional endpoint",
        ],
        fixSteps: [
          "Try a different region if your architecture allows it",
          "Check {service}'s status page for region-specific issues",
          "Verify the endpoint URL is correct for the region",
          "Check your DNS resolution",
          "Set up multi-region failover",
          "Check this page for regional reports",
        ],
        errorSignatures: [
          "Region unavailable",
          "Endpoint not found",
          "Connection refused",
          "DNS resolution failed",
          "Service unavailable in this region",
          "Regional outage",
          "Endpoint unreachable",
        ],
        faq: [
          {
            q: "Why is {service} region unavailable?",
            a: "The specific data center or region may be down for maintenance or experiencing an outage. Try a different region or check the status page.",
          },
          {
            q: "Is {service} down everywhere?",
            a: "Check community reports below for reports from different regions. Regional issues affect only specific geographies.",
          },
          {
            q: "How do I set up multi-region failover?",
            a: "Use load balancing or service mesh to automatically route to healthy regions. Consult {service}'s documentation for multi-region setup.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "billing-suspended",
        title: "Account / Billing Suspended",
        metaTitle: "Billing Suspended — Fix & Live Status",
        description:
          "When {service} suspends your account due to billing issues, all your deployments, API access, and resources are paused or terminated. This can happen silently and cause production outages.",
        causes: [
          "Payment method expired or declined",
          "Usage exceeded spending limit",
          "Billing information incomplete or outdated",
          "Abuse detection triggered (false positive)",
          "Organization billing admin changed settings",
        ],
        fixSteps: [
          "Check your billing dashboard on {service} immediately",
          "Update your payment method",
          "Check for any spending alerts or limit notifications",
          "Contact {service} support if you believe it's an error",
          "Set up billing alerts to prevent future suspensions",
          "Consider backup payment methods",
        ],
        errorSignatures: [
          "Account suspended",
          "Billing issue",
          "Payment required",
          "Account disabled",
          "402 Payment Required",
          "Quota exhausted",
          "Spending limit reached",
          "Account frozen",
          "Service paused due to billing",
        ],
        faq: [
          {
            q: "Why was my {service} account suspended?",
            a: "Check your billing dashboard for payment issues, spending limit alerts, or failed charges. Update your payment method immediately.",
          },
          {
            q: "How do I unsuspend my {service} account?",
            a: "Update your payment method in the billing dashboard and contact {service} support to reactivate your account.",
          },
          {
            q: "Will I lose my data if {service} suspends my account?",
            a: "Suspension policies vary. Most services retain data for a grace period. Check {service}'s terms for data retention details.",
          },
        ],
        hasHowToSchema: true,
      },
    ],
  },

  // ==================== SEARCH ====================
  {
    category: "SEARCH",
    errors: [
      {
        slug: "api-error",
        title: "Search API Error / Query Failed",
        metaTitle: "API Error — Fix & Live Status",
        description:
          "When {service}'s search API returns an error, your query could not be processed. This affects both direct searches and applications built on {service}'s API.",
        causes: [
          "{service} search infrastructure is down",
          "Invalid query format or parameters",
          "API version mismatch",
          "Backend index or database issue",
          "Network connectivity problem",
        ],
        fixSteps: [
          "Check {service}'s live status on this page",
          "Verify your query format and parameters",
          "Check API version in your request",
          "Try a simpler query to isolate the issue",
          "Implement retry logic",
          "Check {service}'s documentation for recent API changes",
        ],
        errorSignatures: [
          "Search failed",
          "Query error",
          "Internal server error",
          "500 error",
          "Service unavailable",
          "Search index unavailable",
          "Bad request",
        ],
        faq: [
          {
            q: "Is {service} search API down?",
            a: "Check the live status and community reports above for real-time feedback.",
          },
          {
            q: "Why is my {service} search query failing?",
            a: "Verify query syntax, check for API changes, and ensure your request format matches {service}'s documentation.",
          },
          {
            q: "How do I fix {service} search API errors?",
            a: "Follow the troubleshooting steps above. Most errors are due to query format or service issues.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "rate-limit-exceeded",
        title: "Rate Limit / Quota Exceeded",
        metaTitle: "Rate Limit / Quota — Fix & Live Status",
        description:
          "When {service} rate limits your searches, you've exceeded the allowed number of queries per time period. This is common for both free and paid tiers.",
        causes: [
          "Exceeded plan's queries-per-minute or per-day limit",
          "Burst of requests triggered protection",
          "Free tier limits reached",
          "Shared IP rate limiting",
          "Organization-wide quota exhausted",
        ],
        fixSteps: [
          "Check your usage on {service}'s dashboard",
          "Implement request queuing and backoff",
          "Upgrade your plan for higher limits",
          "Cache results to reduce repeat queries",
          "Spread requests over time",
          "Check this page for global throttling issues",
        ],
        errorSignatures: [
          "Rate limit exceeded",
          "429 Too Many Requests",
          "Quota exceeded",
          "Too many requests",
          "Slow down",
          "Request throttled",
        ],
        faq: [
          {
            q: "Why am I being rate limited on {service}?",
            a: "You've exceeded your plan's query limits. Check your usage dashboard and implement request throttling.",
          },
          {
            q: "How do I increase my {service} rate limit?",
            a: "Upgrade to a higher tier plan or implement caching to reduce redundant queries.",
          },
          {
            q: "Is {service} throttling everyone?",
            a: "Check community reports below. Global throttling affects all users; individual rate limits are account-specific.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "auth-error",
        title: "API Key Invalid / Authentication Error",
        metaTitle: "Auth Error — Fix & Live Status",
        description:
          "When {service} rejects your API key or credentials, your authentication is invalid. This blocks all API access until resolved.",
        causes: [
          "API key expired or revoked",
          "Wrong API key for the project/environment",
          "Key permissions insufficient for the requested operation",
          "Billing issue suspended API access",
          "{service} auth service is down",
        ],
        fixSteps: [
          "Verify your API key in {service}'s dashboard",
          "Regenerate the key if expired",
          "Check key permissions and scopes",
          "Verify billing status",
          "Check this page for auth service issues",
          "Ensure the key is correctly set in your environment",
        ],
        errorSignatures: [
          "Invalid API key",
          "401 Unauthorized",
          "Authentication failed",
          "API key not found",
          "Forbidden",
          "Access denied",
          "Invalid credentials",
        ],
        faq: [
          {
            q: "Why is my {service} API key not working?",
            a: "The key may be expired, revoked, or incorrectly configured. Regenerate it from your dashboard and verify it's set correctly.",
          },
          {
            q: "Is {service} authentication down?",
            a: "Check community reports below for auth-related issues.",
          },
          {
            q: "How do I fix {service} auth errors?",
            a: "Regenerate your API key, check billing status, and verify permissions. See troubleshooting steps above.",
          },
        ],
        hasHowToSchema: true,
      },
    ],
  },

  // ==================== PRODUCTIVITY ====================
  {
    category: "PRODUCTIVITY",
    errors: [
      {
        slug: "login-issue",
        title: "Login Failed / SSO Error",
        metaTitle: "Login Issue — Fix & Live Status",
        description:
          "When you can't log into {service}, the authentication system is rejecting your credentials or the SSO/OAuth flow is broken. This blocks access to all AI features.",
        causes: [
          "{service} auth/login servers are down",
          "SSO provider issue (Google, Microsoft, etc.)",
          "Password recently changed or expired",
          "Browser cookies/cache blocking login",
          "Two-factor authentication issue",
        ],
        fixSteps: [
          "Try logging in from an incognito/private window",
          "Clear browser cookies for {service}",
          "Try a different login method (email vs Google vs SSO)",
          "Reset your password if needed",
          "Disable browser extensions that may interfere",
          "Check this page for widespread login issues",
        ],
        errorSignatures: [
          "Login failed",
          "Authentication error",
          "SSO error",
          "Unable to sign in",
          "Session expired",
          "Invalid credentials",
          "OAuth error",
          "Access denied",
        ],
        faq: [
          {
            q: "Why can't I log into {service}?",
            a: "Try incognito mode, clear cookies, or use a different login method. If the issue is widespread, check the status above.",
          },
          {
            q: "Is {service} login down?",
            a: "Check community reports below for login-related issues.",
          },
          {
            q: "How do I fix {service} SSO errors?",
            a: "Try a different SSO provider or use email/password login. Clear cookies and try incognito mode.",
          },
        ],
        hasHowToSchema: true,
      },
      {
        slug: "sync-error",
        title: "Sync Failed / Data Not Updating",
        metaTitle: "Sync Error — Fix & Live Status",
        description:
          "When {service} stops syncing, changes you make aren't saved or propagated across devices. AI features may use stale data or produce inconsistent results.",
        causes: [
          "{service} sync servers are experiencing issues",
          "Network connectivity problem",
          "Conflicting edits from multiple users",
          "Storage quota exceeded",
          "Offline mode not syncing back properly",
        ],
        fixSteps: [
          "Check your internet connection",
          "Force a manual sync in {service}'s settings",
          "Check if you've exceeded storage limits",
          "Close and reopen the application",
          "Check this page for sync-related reports",
          "Try logging out and back in",
        ],
        errorSignatures: [
          "Sync failed",
          "Changes not saved",
          "Unable to sync",
          "Conflict detected",
          "Last synced: [old date]",
          "Offline mode",
          "Saving failed",
        ],
        faq: [
          {
            q: "Why isn't {service} syncing?",
            a: "Check your internet connection, storage quota, and for conflicts. If the issue is widespread, check the status above.",
          },
          {
            q: "Is {service} sync down?",
            a: "Check community reports below for sync-related issues.",
          },
          {
            q: "How do I force {service} to sync?",
            a: "Try manual sync in settings, log out and back in, or restart the app.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "ai-feature-broken",
        title: "AI Feature Not Available / Disabled",
        metaTitle: "AI Feature Broken — Fix & Live Status",
        description:
          "When {service}'s AI features stop working, the AI-powered capabilities (writing, summarizing, generating, etc.) are unavailable while the rest of the app may work fine.",
        causes: [
          "{service}'s AI backend provider is experiencing issues",
          "AI feature disabled by admin or plan limitation",
          "AI quota/credits exhausted for the billing period",
          "Feature is in beta and temporarily unavailable",
          "Browser or app version doesn't support the feature",
        ],
        fixSteps: [
          "Check if the AI feature is enabled in your settings/plan",
          "Verify your AI credits/quota haven't been exhausted",
          "Update the app or browser to the latest version",
          "Try the AI feature on a different document/project",
          "Check this page for {service} AI backend issues",
          "Contact your admin if the feature was disabled",
        ],
        errorSignatures: [
          "AI not available",
          "Feature disabled",
          "AI credits exhausted",
          "This feature requires a paid plan",
          "AI is temporarily unavailable",
          "Feature not supported",
          "AI assistant is offline",
        ],
        faq: [
          {
            q: "Why is {service} AI not working?",
            a: "Check your plan includes AI features, verify credits/quota, and ensure the app is updated. If the issue is widespread, check the status above.",
          },
          {
            q: "Is {service} AI backend down?",
            a: "Check community reports below for AI-specific issues.",
          },
          {
            q: "How do I enable {service} AI features?",
            a: "Check your plan/subscription includes AI, verify credits, and ensure the feature is enabled in settings.",
          },
        ],
        hasHowToSchema: false,
      },
    ],
  },

  // ==================== AGENTS ====================
  {
    category: "AGENTS",
    errors: [
      {
        slug: "task-failed",
        title: "Agent Task Failed / Execution Error",
        metaTitle: "Task Failed — Fix & Live Status",
        description:
          "When {service} agent fails a task, the automated workflow or AI agent could not complete the assigned action. Agent failures can cascade and affect dependent workflows.",
        causes: [
          "Agent encountered an unexpected state or edge case",
          "External service the agent depends on is down",
          "Task exceeded time or resource limits",
          "Permissions issue on the target system",
          "Agent's reasoning hit a dead end",
        ],
        fixSteps: [
          "Check the task execution logs for specific errors",
          "Verify all connected services are operational",
          "Check permissions on target systems",
          "Try breaking the task into smaller steps",
          "Retry the task",
          "Check this page for {service} issues",
        ],
        errorSignatures: [
          "Task failed",
          "Execution error",
          "Agent error",
          "Workflow failed",
          "Step failed",
          "Action could not be completed",
          "Agent stopped",
          "Maximum retries exceeded",
        ],
        faq: [
          {
            q: "Why did my {service} agent task fail?",
            a: "Check execution logs for specific errors. Verify connected services are operational and permissions are correct.",
          },
          {
            q: "Is {service} agent service down?",
            a: "Check the live status and community reports above.",
          },
          {
            q: "How do I debug {service} agent failures?",
            a: "Check task logs, verify dependencies, check permissions, and try simpler tasks to isolate the issue.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "api-error",
        title: "API Error / Webhook Failed",
        metaTitle: "API / Webhook Error — Fix & Live Status",
        description:
          "When {service}'s API or webhooks fail, triggers don't fire, data doesn't flow, and automated workflows stop running.",
        causes: [
          "{service} API servers are down",
          "Webhook endpoint is unreachable",
          "API authentication expired",
          "Payload format changed",
          "Rate limit on API/webhook calls",
        ],
        fixSteps: [
          "Check {service}'s API status on this page",
          "Verify webhook URLs and authentication",
          "Check API request format against documentation",
          "Review webhook delivery logs",
          "Implement retry logic for transient failures",
          "Update API client library",
        ],
        errorSignatures: [
          "API error",
          "Webhook failed",
          "Connection refused",
          "Request failed",
          "Delivery failed",
          "500 Internal Server Error",
          "Timeout",
        ],
        faq: [
          {
            q: "Why are {service} webhooks failing?",
            a: "Check webhook delivery logs, endpoint availability, and authentication. If widespread, check the status above.",
          },
          {
            q: "Is {service} API down?",
            a: "Check the live status and community reports above.",
          },
          {
            q: "How do I fix {service} webhook errors?",
            a: "Verify endpoint URLs, check authentication, and review delivery logs. See troubleshooting steps above.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "timeout",
        title: "Task Timeout / Agent Stuck",
        metaTitle: "Agent Stuck / Timeout — Fix & Live Status",
        description:
          "When a {service} agent gets stuck or times out, the AI is running indefinitely without completing or has exceeded the maximum allowed execution time.",
        causes: [
          "Task is too complex for the agent to resolve",
          "Infinite loop in agent reasoning",
          "External API the agent calls is slow/down",
          "Resource limits exceeded",
          "{service} processing queue backed up",
        ],
        fixSteps: [
          "Cancel the stuck task if possible",
          "Break complex tasks into simpler sub-tasks",
          "Check if external services are operational",
          "Set shorter timeout limits",
          "Retry with a clearer task description",
          "Check this page for platform issues",
        ],
        errorSignatures: [
          "Task timed out",
          "Agent stuck",
          "Execution timeout",
          "Maximum time exceeded",
          "Still running...",
          "No response",
          "Agent unresponsive",
        ],
        faq: [
          {
            q: "Why is my {service} agent stuck?",
            a: "The task may be too complex, or the agent hit an edge case. Cancel and retry with a simpler task description.",
          },
          {
            q: "How long should {service} agent tasks take?",
            a: "Typical tasks complete in seconds to a few minutes. Anything over 10 minutes likely indicates an issue.",
          },
          {
            q: "Can I cancel a stuck {service} agent task?",
            a: "Most platforms allow task cancellation. Check {service}'s dashboard or API for cancel/abort options.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "auth-integration-error",
        title: "Integration Auth Failed / Connection Lost",
        metaTitle: "Integration Auth Error — Fix & Live Status",
        description:
          "When {service} loses connection to an integrated service (Slack, GitHub, Gmail, etc.), the authentication between the two services has expired or been revoked.",
        causes: [
          "OAuth token expired and couldn't auto-refresh",
          "Connected service changed security settings",
          "User revoked permissions on the connected service",
          "Connected service is down",
          "{service}'s integration middleware is having issues",
        ],
        fixSteps: [
          "Disconnect and reconnect the integration in {service}'s settings",
          "Re-authorize the connected service",
          "Check if the connected service is operational",
          "Verify permissions haven't been changed",
          "Check this page for integration issues",
          "Contact {service} support if reconnection fails",
        ],
        errorSignatures: [
          "Integration disconnected",
          "Auth token expired",
          "Connection lost",
          "Re-authentication required",
          "Permission denied",
          "OAuth error",
          "Integration error",
        ],
        faq: [
          {
            q: "Why did my {service} integration disconnect?",
            a: "OAuth tokens expire, or permissions were changed. Disconnect and reconnect the integration to re-authorize.",
          },
          {
            q: "How do I fix {service} integration errors?",
            a: "Re-authorize the connection in {service}'s settings. Check the connected service is operational.",
          },
          {
            q: "Will I lose data if {service} integration breaks?",
            a: "Existing data usually remains. New data won't sync until the integration is reconnected.",
          },
        ],
        hasHowToSchema: false,
      },
    ],
  },

  // ==================== DESIGN ====================
  {
    category: "DESIGN",
    errors: [
      {
        slug: "export-failed",
        title: "Export Failed / Download Error",
        metaTitle: "Export Failed — Fix & Live Status",
        description:
          "When {service} can't export your design, the rendering or file generation process failed. This can block deliverables and deadlines.",
        causes: [
          "Design is too complex for the export engine",
          "Export server overloaded",
          "Browser memory issue for large files",
          "Export format not supported for this design type",
          "{service} CDN or storage issue",
        ],
        fixSteps: [
          "Try a different export format (PNG, SVG, PDF)",
          "Reduce design complexity or export in sections",
          "Try exporting from a desktop app instead of browser",
          "Clear browser cache and retry",
          "Check this page for export issues",
          "Try a lower resolution first",
        ],
        errorSignatures: [
          "Export failed",
          "Download error",
          "Rendering failed",
          "Could not generate file",
          "Export timed out",
          "File generation error",
        ],
        faq: [
          {
            q: "Why can't I export from {service}?",
            a: "Try a different format, reduce complexity, or use the desktop app. If the issue is widespread, check the status above.",
          },
          {
            q: "Is {service} export working?",
            a: "Check community reports below for export-related issues.",
          },
          {
            q: "What export formats does {service} support?",
            a: "Most design tools support PNG, SVG, PDF, and JPG. Check {service}'s documentation for format-specific limitations.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "ai-feature-broken",
        title: "AI Feature Not Responding",
        metaTitle: "AI Feature Broken — Fix & Live Status",
        description:
          "When {service}'s AI features (auto-layout, AI generation, remove background, etc.) stop working, the AI backend is unavailable while the core design tool continues to function.",
        causes: [
          "{service}'s AI backend is down",
          "AI feature is in beta and temporarily disabled",
          "Your plan doesn't include AI features",
          "Browser version doesn't support the feature",
          "AI processing queue is full",
        ],
        fixSteps: [
          "Check if AI features are included in your plan",
          "Try refreshing the page or restarting the app",
          "Update your browser to the latest version",
          "Check this page for AI backend issues",
          "Try the feature on a simpler design element",
          "Wait a few minutes and retry",
        ],
        errorSignatures: [
          "AI not available",
          "Feature disabled",
          "AI generation failed",
          "This feature is unavailable",
          "AI processing error",
          "AI assistant error",
        ],
        faq: [
          {
            q: "Why isn't {service} AI working?",
            a: "Check your plan includes AI features, update your browser, and verify the AI backend is operational using the status above.",
          },
          {
            q: "Is {service} AI down?",
            a: "Check community reports below for AI-specific issues.",
          },
          {
            q: "How do I enable {service} AI features?",
            a: "Verify your plan includes AI, update your app/browser, and check feature is enabled in settings.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "slow-rendering",
        title: "Slow Rendering / Preview Lag",
        metaTitle: "Slow Rendering — Fix & Live Status",
        description:
          "When {service} renders slowly, the design preview, canvas, or AI-generated elements take too long to load or update.",
        causes: [
          "Design file is very large or complex",
          "Browser running low on memory",
          "{service} rendering servers are overloaded",
          "Too many concurrent users on the same project",
          "Hardware acceleration disabled in browser",
        ],
        fixSteps: [
          "Close unnecessary browser tabs to free memory",
          "Enable hardware acceleration in browser settings",
          "Simplify the design or break into smaller pages",
          "Try the desktop app if available",
          "Check this page for rendering issues",
          "Try a different browser (Chrome usually performs best)",
        ],
        errorSignatures: [
          "Slow rendering",
          "Preview lag",
          "Canvas not responding",
          "Loading...",
          "Rendering...",
          "Page unresponsive",
        ],
        faq: [
          {
            q: "Why is {service} so slow?",
            a: "Close unused tabs, enable hardware acceleration, and simplify your design. If the issue is widespread, check the status above.",
          },
          {
            q: "Is {service} rendering slow for everyone?",
            a: "Check community reports below for rendering performance feedback.",
          },
          {
            q: "How do I speed up {service}?",
            a: "Use the desktop app, enable hardware acceleration, close browser tabs, and simplify complex designs.",
          },
        ],
        hasHowToSchema: false,
      },
    ],
  },

  // ==================== THREE_D ====================
  {
    category: "THREE_D",
    errors: [
      {
        slug: "generation-failed",
        title: "3D Generation Failed / Model Error",
        metaTitle: "3D Generation Failed — Fix & Live Status",
        description:
          "When {service} fails to generate a 3D model, the AI could not create the requested object. 3D generation is computationally intensive and more prone to failures than 2D generation.",
        causes: [
          "{service} GPU resources are exhausted",
          "Prompt is too vague or complex for the model",
          "Unsupported geometry or material type requested",
          "Generation model encountered an internal error",
          "Account credits exhausted",
        ],
        fixSteps: [
          "Try a simpler object description",
          "Check your remaining generation credits",
          "Try a different output format if available",
          "Retry — transient GPU errors are common",
          "Check this page for service issues",
          "Try generating from an image reference instead of text",
        ],
        errorSignatures: [
          "Generation failed",
          "3D model error",
          "Mesh generation failed",
          "Unable to create model",
          "Generation timed out",
          "Processing error",
        ],
        faq: [
          {
            q: "Why did {service} 3D generation fail?",
            a: "Try a simpler prompt, check your credits, and verify the service is operational using the status above.",
          },
          {
            q: "Is {service} 3D generation working?",
            a: "Check community reports below for real-time feedback.",
          },
          {
            q: "How do I make {service} 3D generation more reliable?",
            a: "Use simple, clear prompts, standard formats, and retry on failure. Transient GPU errors are normal.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "slow-rendering",
        title: "Slow 3D Rendering / Processing",
        metaTitle: "Slow 3D Rendering — Fix & Live Status",
        description:
          "When {service} 3D rendering is slow, the model generation or processing is taking longer than expected. 3D generation typically takes 1-10 minutes depending on complexity.",
        causes: [
          "High demand on GPU resources",
          "Complex model with many polygons/textures",
          "Multiple concurrent generation requests",
          "{service} processing queue is backed up",
          "High-resolution output taking extra time",
        ],
        fixSteps: [
          "Wait up to 10 minutes for complex models",
          "Check this page for widespread slowness",
          "Try a lower resolution or simpler output",
          "Cancel and retry if stuck",
          "Try during off-peak hours",
          "Consider a paid plan for priority access",
        ],
        errorSignatures: [
          "Processing...",
          "Rendering...",
          "Generating mesh...",
          "Still processing",
          "Queue position:",
          "Estimated time remaining:",
        ],
        faq: [
          {
            q: "Why is {service} 3D rendering so slow?",
            a: "3D generation is GPU-intensive. Check reports on this page for capacity issues. Try simpler models or off-peak hours.",
          },
          {
            q: "How long should {service} 3D rendering take?",
            a: "Typically 1-10 minutes. Anything over 15 minutes likely indicates an issue or queue backup.",
          },
          {
            q: "Can I speed up {service} 3D rendering?",
            a: "Use lower resolution, simpler models, paid plans for priority, or try off-peak hours.",
          },
        ],
        hasHowToSchema: false,
      },
      {
        slug: "export-error",
        title: "3D Export Failed / Format Error",
        metaTitle: "3D Export Failed — Fix & Live Status",
        description:
          "When {service} can't export your 3D model, the file conversion or download process failed. Common formats include OBJ, FBX, GLB, and STL.",
        causes: [
          "Export format not supported for this model type",
          "Model is too complex for the export engine",
          "Browser blocking the download",
          "{service} export service is down",
          "File generation error during format conversion",
        ],
        fixSteps: [
          "Try a different export format (GLB, OBJ, FBX)",
          "Try exporting without textures first",
          "Disable browser download blockers",
          "Check this page for export issues",
          "Try right-click → Save link as",
          "Retry the export",
        ],
        errorSignatures: [
          "Export failed",
          "Format error",
          "Download failed",
          "Conversion error",
          "File not available",
          "Export timed out",
        ],
        faq: [
          {
            q: "Why can't I export my {service} 3D model?",
            a: "Try a different format (GLB recommended), disable download blockers, and check the status above for export issues.",
          },
          {
            q: "What 3D formats does {service} support?",
            a: "Most services support GLB, OBJ, FBX, and STL. Check {service}'s documentation for format-specific features.",
          },
          {
            q: "Is {service} export broken?",
            a: "Check community reports below for export-related issues.",
          },
        ],
        hasHowToSchema: false,
      },
    ],
  },
];

// Service-specific links
export const SERVICE_SPECIFIC_LINKS: Record<
  string,
  {
    statusPage?: string;
    documentation?: string;
    dashboard?: string;
    usagePage?: string;
    supportPage?: string;
  }
> = {
  openai: {
    statusPage: "https://status.openai.com",
    documentation: "https://platform.openai.com/docs",
    dashboard: "https://platform.openai.com",
    usagePage: "https://platform.openai.com/usage",
    supportPage: "https://help.openai.com",
  },
  anthropic: {
    statusPage: "https://status.anthropic.com",
    documentation: "https://docs.anthropic.com",
    dashboard: "https://console.anthropic.com",
    usagePage: "https://console.anthropic.com/settings/usage",
    supportPage: "https://support.anthropic.com",
  },
  "google-gemini": {
    statusPage: "https://status.cloud.google.com",
    documentation: "https://ai.google.dev/docs",
    dashboard: "https://aistudio.google.com",
  },
  midjourney: {
    statusPage: "https://status.midjourney.com",
    documentation: "https://docs.midjourney.com",
  },
  mistral: {
    statusPage: "https://status.mistral.ai",
    documentation: "https://docs.mistral.ai",
    dashboard: "https://console.mistral.ai",
  },
  "github-copilot": {
    statusPage: "https://www.githubstatus.com",
    documentation: "https://docs.github.com/copilot",
  },
  cursor: {
    documentation: "https://docs.cursor.com",
  },
  "hugging-face": {
    statusPage: "https://status.huggingface.co",
    documentation: "https://huggingface.co/docs",
  },
  replicate: {
    documentation: "https://replicate.com/docs",
    dashboard: "https://replicate.com/dashboard",
  },
  elevenlabs: {
    documentation: "https://docs.elevenlabs.io",
    dashboard: "https://elevenlabs.io/app",
  },
  "stability-ai": {
    statusPage: "https://status.stability.ai",
    documentation: "https://platform.stability.ai/docs",
    dashboard: "https://platform.stability.ai",
  },
  groq: {
    documentation: "https://console.groq.com/docs",
    dashboard: "https://console.groq.com",
  },
  deepseek: {
    documentation: "https://platform.deepseek.com/api-docs",
    dashboard: "https://platform.deepseek.com",
  },
  perplexity: {
    documentation: "https://docs.perplexity.ai",
  },
  "together-ai": {
    documentation: "https://docs.together.ai",
    dashboard: "https://api.together.xyz",
  },
};

// Helper functions
export function getErrorsForCategory(category: string): ErrorDefinition[] {
  const playbook = ERROR_PLAYBOOKS.find((p) => p.category === category);
  return playbook?.errors || [];
}

export function getErrorInfo(category: string, errorSlug: string): ErrorDefinition | null {
  const errors = getErrorsForCategory(category);
  return errors.find((e) => e.slug === errorSlug) || null;
}

export function getServiceLinks(serviceSlug: string) {
  return SERVICE_SPECIFIC_LINKS[serviceSlug] || {};
}
