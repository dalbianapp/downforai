import type { TopServiceContent } from "@/content/top-services/types";

// IMAGE — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start image-2.ts and register it in ./index.ts if it grows.
export const IMAGE: Record<string, TopServiceContent> = {
  midjourney: {
    slug: "midjourney",
    providerSummary:
      "AI image generator. Accessible via website and Discord-based workflows; no public official API should be assumed.",
    officialStatusUrl: "https://status.midjourney.com",
    docsUrl: "https://docs.midjourney.com",
    pricingUrl: "https://midjourney.com/explore",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/midjourney", label: "Midjourney Discord" },
      { type: "reddit", url: "https://reddit.com/r/midjourney", label: "r/midjourney" },
      { type: "x", url: "https://x.com/midjourney", label: "@midjourney" },
    ],
    monitoredSurfaces: [
      { name: "midjourney.com", description: "", criticality: "critical" },
      { name: "Discord bot", description: "", criticality: "high" },
      { name: "Image generation queue", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue delays during peak hours",
        scope: "partial",
        signal: "Generation jobs take longer than usual",
        quickCheck: "Check status.midjourney.com; wait during peak hours",
      },
      {
        pattern: "Discord bot downtime",
        scope: "partial",
        signal: "Discord bot unresponsive while midjourney.com may work",
        quickCheck: "Try midjourney.com web interface directly",
      },
      {
        pattern: "Content filter prompt rejections",
        scope: "local",
        signal: "Specific prompts rejected consistently",
        quickCheck: "Rephrase prompt; check Midjourney content policy",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Midjourney is degraded",
        alternative:
          "Leonardo AI, Ideogram, DALL-E 3 (via ChatGPT) can reduce downtime for image workflows",
        switchingCost: "low",
      },
      {
        scenario: "Technical alternative needed",
        alternative: "Flux on Replicate/Fal",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Unofficial API wrappers violate TOS and are actively rate-limited or blocked — not viable for production integrations",
    ],
  },
  "stability-ai": {
    slug: "stability-ai",
    providerSummary:
      "Creators of Stable Diffusion. Offers API, DreamStudio, and open-weight models.",
    officialStatusUrl: "https://status.stability.ai",
    docsUrl: "https://platform.stability.ai/docs",
    pricingUrl: "https://platform.stability.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.stability.ai", description: "", criticality: "critical" },
      { name: "DreamStudio", description: "", criticality: "high" },
      { name: "Model catalog", description: "", criticality: "medium" },
    ],
    modelFamilies: [
      "Stable Diffusion 3.5",
      "SDXL",
      "Stable Video",
      "Stable Audio",
    ],
    knownFailurePatterns: [
      {
        pattern: "Credit depletion (often mistaken for outage)",
        scope: "local",
        signal: "Requests fail with payment/quota error",
        quickCheck: "Check credit balance in DreamStudio; not a platform outage",
      },
      {
        pattern: "SD3.5-specific errors",
        scope: "partial",
        signal: "SD3.5 endpoint fails while others work",
        quickCheck: "Check status.stability.ai for model-specific component",
      },
      {
        pattern: "NSFW filter false positives",
        scope: "local",
        signal: "Safe prompts rejected by content filter",
        quickCheck: "Rephrase prompt; adjust style modifiers",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Stability API is degraded",
        alternative: "Replicate/Fal (host SD models) can reduce downtime",
        switchingCost: "low",
      },
      {
        scenario: "Heavy users needing resilience",
        alternative: "Self-hosting via ComfyUI/A1111",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "SD models are open-weight — self-hosting via ComfyUI or Automatic1111 is a resilient fallback for production",
    ],
  },
  "leonardo-ai": {
    slug: "leonardo-ai",
    providerSummary:
      "Image generator with strong game-dev asset training (characters, environments).",
    docsUrl: "https://docs.leonardo.ai",
    pricingUrl: "https://leonardo.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "leonardo.ai", description: "", criticality: "critical" },
      { name: "Leonardo API", description: "", criticality: "high" },
      { name: "Canvas editor", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Daily token quota depletion (often mistaken for outage)",
        scope: "local",
        signal: "Generation fails with quota error",
        quickCheck: "Check token balance; tokens reset daily",
      },
      {
        pattern: "Canvas save errors",
        scope: "partial",
        signal: "Canvas edits fail to save",
        quickCheck: "Retry save; check browser console for errors",
      },
      {
        pattern: "Specific model availability",
        scope: "partial",
        signal: "Specific fine-tuned models unavailable",
        quickCheck: "Try a different model; check Leonardo status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Leonardo is degraded",
        alternative: "Midjourney, Ideogram, Playground AI can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Tokens reset daily — many 'down' reports are quota exhaustion, not outages",
    ],
  },
  ideogram: {
    slug: "ideogram",
    providerSummary:
      "Image generator with strong typographic fidelity — high quality for text-in-image workflows (logos, posters, UI mockups).",
    docsUrl: "https://developer.ideogram.ai",
    pricingUrl: "https://ideogram.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ideogram.ai", description: "", criticality: "critical" },
      { name: "Ideogram API", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Text rendering failures on edge-case characters",
        scope: "partial",
        signal: "Unusual characters or scripts not rendered correctly",
        quickCheck: "Simplify text content; check Ideogram docs for supported scripts",
      },
      {
        pattern: "API quota limits",
        scope: "local",
        signal: "429 responses from Ideogram API",
        quickCheck: "Check quota in Ideogram dashboard",
      },
      {
        pattern: "Content filter rejections",
        scope: "local",
        signal: "Specific prompts rejected by content filter",
        quickCheck: "Rephrase prompt; check Ideogram content policy",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Ideogram is degraded",
        alternative:
          "Flux with careful prompting or DALL-E 3 can reduce downtime for text-heavy images",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Ideogram model/API versions evolve; consult current docs rather than hard-coding versions",
    ],
  },
  "luma-dream-machine": {
    slug: "luma-dream-machine",
    providerSummary:
      "Luma Labs' video generation product. Strong on camera movement and realism.",
    docsUrl: "https://docs.lumalabs.ai",
    pricingUrl: "https://lumalabs.ai/dream-machine",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "lumalabs.ai/dream-machine",
        description: "",
        criticality: "critical",
      },
      { name: "Dream Machine API", description: "", criticality: "high" },
      { name: "Mobile apps", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue during peak",
        scope: "partial",
        signal: "Long queue times during peak demand",
        quickCheck: "Wait or try off-peak; check Luma status",
      },
      {
        pattern: "iOS app auth issues",
        scope: "local",
        signal: "iOS app fails to authenticate while web works",
        quickCheck: "Try web interface; reinstall iOS app",
      },
      {
        pattern: "Extend/reverse specific errors",
        scope: "partial",
        signal: "Extend or reverse features fail while basic generation works",
        quickCheck: "Retry with a fresh generation",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dream Machine is degraded",
        alternative: "Runway, Kling, Pika can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Luma Labs also offers Genie (3D) as a separate product — don't conflate the two",
    ],
  },
  "canva-ai": {
    slug: "canva-ai",
    providerSummary:
      "Canva's AI suite (Magic Write, Magic Design, Magic Edit, Magic Expand). Bundled within Canva platform.",
    officialStatusUrl: "https://www.canva.com/status",
    docsUrl: "https://www.canva.com/help/",
    pricingUrl: "https://www.canva.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "canva.com", description: "", criticality: "critical" },
      { name: "Mobile apps", description: "", criticality: "high" },
      { name: "Magic Studio backends", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Canva platform outages cascade",
        scope: "partial",
        signal: "All Canva features including AI unavailable",
        quickCheck: "Check canva.com/status for platform-wide issues",
      },
      {
        pattern: "Specific Magic tool failures",
        scope: "partial",
        signal: "One Magic tool fails while others work",
        quickCheck: "Try a different Magic tool; check Canva status",
      },
      {
        pattern: "Credit depletion (Pro feature)",
        scope: "local",
        signal: "Magic tool fails with credit error",
        quickCheck: "Check Magic Studio credit balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Canva AI is degraded",
        alternative: "Figma AI, Adobe Express AI can reduce downtime for design AI",
        switchingCost: "low",
      },
      {
        scenario: "Image generation specifically",
        alternative: "Midjourney/DALL-E",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Canva AI is bundled — an AI-tool outage affects specific Magic tools while Canva core editor remains usable",
    ],
  },
  magnific: {
    slug: "magnific",
    providerSummary:
      "AI image upscaler with creative reimagining (not just pixel upscaling — adds detail). Used by pro designers.",
    docsUrl: "https://magnific.ai/documentation",
    pricingUrl: "https://magnific.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "magnific.ai", description: "", criticality: "critical" },
      { name: "Upscale API", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Upscale fails with credit error",
        quickCheck: "Check credit balance in Magnific account",
      },
      {
        pattern: "Large-image upload timeouts",
        scope: "partial",
        signal: "Upload times out for very large images",
        quickCheck: "Reduce image size before upload; try again",
      },
      {
        pattern: "Specific style model errors",
        scope: "partial",
        signal: "Specific style/model combination fails",
        quickCheck: "Try a different style preset; check Magnific status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Magnific is degraded",
        alternative:
          "Topaz Gigapixel (desktop), Upscayl (free open-source), SUPIR via Replicate can reduce downtime for upscaling",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Magnific's creative mode adds detail — pure upscalers (Topaz) have different output characteristics; not a pixel-perfect swap",
    ],
  },
  openart: {
    slug: "openart",
    providerSummary:
      "AI image platform aggregating multiple models (Stable Diffusion, Flux, custom) with workflows and LoRA support.",
    docsUrl: "https://openart.ai/blog/guides",
    pricingUrl: "https://openart.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "openart.ai", description: "", criticality: "critical" },
      { name: "Generation backend", description: "", criticality: "high" },
      { name: "Model catalog", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance in OpenArt account",
      },
      {
        pattern: "Specific model availability",
        scope: "partial",
        signal: "Specific model unavailable while others work",
        quickCheck: "Try a different model; check OpenArt status",
      },
      {
        pattern: "LoRA loading errors",
        scope: "partial",
        signal: "LoRA fails to apply to generation",
        quickCheck: "Try without LoRA; check LoRA compatibility with base model",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "OpenArt is degraded",
        alternative:
          "Civitai (model sharing focus), direct Flux on Replicate, Midjourney can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  civitai: {
    slug: "civitai",
    providerSummary:
      "Community hub for sharing and discovering Stable Diffusion models, LoRAs, embeddings, and workflows. Popular with image gen enthusiasts and creators.",
    docsUrl: "https://wiki.civitai.com",
    pricingUrl: "https://civitai.com/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/civitai", label: "Discord", verified: true },
      { type: "reddit", url: "https://reddit.com/r/civitai", label: "r/civitai", verified: false },
    ],
    monitoredSurfaces: [
      { name: "civitai.com", description: "Web interface", criticality: "critical" },
      { name: "Model Downloads", description: "CDN model download delivery", criticality: "critical" },
      { name: "On-site Generation", description: "In-browser AI generation", criticality: "high" },
      { name: "API", description: "Civitai API endpoint", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "CDN download slowness during peak",
        scope: "global",
        signal: "Slow or failed model downloads",
        quickCheck: "Try at off-peak hours or use HuggingFace mirror",
      },
      {
        pattern: "On-site generation queue backed up",
        scope: "global",
        signal: "Long wait times for in-browser generation",
        quickCheck: "Download model and run locally via ComfyUI/A1111",
      },
      {
        pattern: "NSFW filter changes perceived as outage",
        scope: "partial",
        signal: "Previously accessible content suddenly blocked",
        quickCheck: "Check Civitai announcements for policy changes",
      },
      {
        pattern: "Model upload processing delays",
        scope: "global",
        signal: "Uploads stuck in processing state",
        quickCheck: "Check Civitai Discord for known processing queue issues",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Civitai is degraded",
        alternative:
          "Hugging Face (model hub), Tensor.Art, or direct ComfyUI with local models can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Civitai is primarily a model sharing platform — generation is secondary. If downloads work but on-site gen is down, users can still pull models for local use.",
    ],
  },
  "krea-ai": {
    slug: "krea-ai",
    providerSummary:
      "Real-time AI image generation and enhancement. Canvas-style editor with generative AI, upscaling, and design tools.",
    docsUrl: "https://www.krea.ai/docs",
    pricingUrl: "https://www.krea.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "krea.ai", description: "Web canvas editor", criticality: "critical" },
      { name: "Real-time Generation", description: "Real-time generation backend", criticality: "critical" },
      { name: "Upscale API", description: "Image upscaling endpoint", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Real-time canvas lag or freeze",
        scope: "global",
        signal: "Generation backend overloaded",
        quickCheck: "Reload the canvas; try non-real-time mode",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "User exhausted generation credits",
        quickCheck: "Check credit balance in account settings",
      },
      {
        pattern: "Specific model unavailable",
        scope: "partial",
        signal: "One style or model fails while others work",
        quickCheck: "Switch to a different generation model",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Krea AI is degraded",
        alternative:
          "Magnific (upscaling), Leonardo AI (generation), or Ideogram can reduce downtime for specific workflows",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  photoroom: {
    slug: "photoroom",
    providerSummary:
      "AI product photography. Background removal, scene generation, batch editing. Strong in e-commerce.",
    docsUrl: "https://help.photoroom.com",
    pricingUrl: "https://www.photoroom.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "photoroom.com", description: "Web editor", criticality: "critical" },
      { name: "Mobile Apps", description: "iOS and Android apps", criticality: "critical" },
      { name: "API", description: "Background removal and editing API", criticality: "high" },
      { name: "Batch Processing", description: "Bulk image processing pipeline", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Batch processing queue delays",
        scope: "global",
        signal: "Bulk jobs take much longer than expected",
        quickCheck: "Check API status; process smaller batches",
      },
      {
        pattern: "Background removal quality on edge cases",
        scope: "local",
        signal: "Complex backgrounds not removed correctly",
        quickCheck: "Try manual refinement tools; not always an outage",
      },
      {
        pattern: "API rate limits",
        scope: "local",
        signal: "429 errors on high-volume API usage",
        quickCheck: "Check API plan limits; implement exponential backoff",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Photoroom is degraded",
        alternative:
          "Remove.bg (background removal), Mokker AI, or Canva can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  recraft: {
    slug: "recraft",
    providerSummary:
      "AI design tool generating both vector and raster images. Strong for brand-consistent design output.",
    docsUrl: "https://www.recraft.ai/docs",
    pricingUrl: "https://www.recraft.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "recraft.ai", description: "Web design tool", criticality: "critical" },
      { name: "Generation API", description: "Image generation API", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation queue delays",
        scope: "global",
        signal: "Image generation takes much longer than usual",
        quickCheck: "Retry; switch to raster mode if vector mode is slower",
      },
      {
        pattern: "Vector export issues",
        scope: "partial",
        signal: "SVG export fails or is malformed",
        quickCheck: "Export as PNG first; try vector export again after refresh",
      },
      {
        pattern: "Style consistency on complex prompts",
        scope: "local",
        signal: "Style transfer produces inconsistent results",
        quickCheck: "Simplify prompt; reapply brand style settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Recraft is degraded",
        alternative:
          "Figma AI, Canva AI, or Ideogram can reduce downtime for design workflows",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "freepik-ai": {
    slug: "freepik-ai",
    providerSummary:
      "Freepik's AI image generator and design resource platform. Integrated AI tools for stock assets.",
    docsUrl: "https://www.freepik.com/ai/help",
    pricingUrl: "https://www.freepik.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "freepik.com", description: "Web platform", criticality: "critical" },
      { name: "AI Image Generator", description: "Freepik AI generation tool", criticality: "critical" },
      { name: "Pikaso", description: "Real-time generative canvas", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation quota on free tier",
        scope: "local",
        signal: "Daily generation limit reached",
        quickCheck: "Check quota in account; upgrade plan or wait for daily reset",
      },
      {
        pattern: "Pikaso real-time canvas lag",
        scope: "global",
        signal: "Real-time generation slow or unresponsive",
        quickCheck: "Use standard generation mode; check Freepik status",
      },
      {
        pattern: "Download CDN issues",
        scope: "global",
        signal: "Asset downloads slow or failing",
        quickCheck: "Retry download; check for CDN issues in status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Freepik AI is degraded",
        alternative:
          "Leonardo AI, Playground AI, or Canva AI can reduce downtime for AI image generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "adobe-firefly": {
    slug: "adobe-firefly",
    providerSummary:
      "Adobe's AI image generator. Integrated in Photoshop, Illustrator, Express. Commercially safe (trained on licensed content).",
    officialStatusUrl: "https://status.adobe.com",
    docsUrl: "https://helpx.adobe.com/firefly",
    pricingUrl: "https://www.adobe.com/products/firefly/plans.html",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "firefly.adobe.com", description: "Firefly web app", criticality: "critical" },
      { name: "Firefly in Photoshop/Illustrator", description: "Creative Cloud integration", criticality: "critical" },
      { name: "Firefly API", description: "Developer API for Firefly generation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generative credits exhausted for the billing period",
        quickCheck: "Check credit balance in Adobe account; purchase additional credits",
      },
      {
        pattern: "Content filter rejections",
        scope: "local",
        signal: "Prompt rejected by Adobe content policy",
        quickCheck: "Rephrase prompt; review Adobe Firefly content guidelines",
      },
      {
        pattern: "Creative Cloud sync issues",
        scope: "global",
        signal: "Firefly results not syncing to CC Libraries",
        quickCheck: "Check Creative Cloud status; force CC sync from desktop app",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Adobe Firefly is degraded",
        alternative:
          "Midjourney (web), Ideogram, or Stability AI can reduce downtime for image generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Firefly's commercial safety (trained on licensed content) is its differentiator — alternatives may not offer the same IP indemnification for enterprise use.",
    ],
  },
  "figma-ai": {
    slug: "figma-ai",
    providerSummary:
      "Figma's native AI features. Auto-layout suggestions, component generation, text editing, prototype generation.",
    officialStatusUrl: "https://status.figma.com",
    docsUrl: "https://help.figma.com/hc/en-us/categories/360002051613-AI",
    pricingUrl: "https://www.figma.com/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "figma.com", description: "Figma web and desktop editor", criticality: "critical" },
      { name: "AI Features Backend", description: "Figma AI generation and suggestions", criticality: "high" },
      { name: "FigJam AI", description: "FigJam AI features (separate from Design)", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Figma platform outages cascade to AI features",
        scope: "global",
        signal: "Figma core editor down — AI features also unavailable",
        quickCheck: "Check status.figma.com; editor outages affect AI features too",
      },
      {
        pattern: "AI feature-specific failures while editor works",
        scope: "partial",
        signal: "Figma loads but AI generation/suggestions fail",
        quickCheck: "Check status for AI features specifically; editor still usable without AI",
      },
      {
        pattern: "FigJam AI separate from Design AI",
        scope: "partial",
        signal: "FigJam AI down while Design AI works or vice versa",
        quickCheck: "Test both products separately; check status breakdown by product",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Figma AI is degraded",
        alternative:
          "Figma core editor still works without AI; Canva AI or Framer AI for specific workflows",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "grok-imagine": {
    slug: "grok-imagine",
    providerSummary:
      "Grok Imagine is xAI's image (and short video) generation feature inside Grok, available in the Grok app, on grok.com and within X. It shares Grok's infrastructure and quotas, so its availability follows Grok and X rather than a standalone service.",
    docsUrl: "https://docs.x.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "grok.com / Grok app", description: "Where Imagine is used", criticality: "critical" },
      { name: "Image generation backend", description: "xAI inference for Imagine", criticality: "critical" },
      { name: "X integration", description: "Grok inside the X app", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation quota exhausted on the free tier",
        scope: "local",
        signal: "Imagine refuses new requests with a limit message while text chat keeps working",
        quickCheck: "Check the remaining daily allowance in Grok; limits reset on a rolling basis and are not an outage",
      },
      {
        pattern: "Images fail while Grok text works",
        scope: "partial",
        signal: "Prompts return an error or a blank result on every attempt; chat answers normally",
        quickCheck: "Retry a simple prompt; if it still fails for everyone, the image backend is saturated",
      },
      {
        pattern: "Prompt rejected by the content filter",
        scope: "local",
        signal: "A refusal message for specific prompts only",
        quickCheck: "Rephrase; this is policy enforcement rather than a failure",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Grok Imagine is unavailable",
        alternative: "Midjourney, Ideogram or GPT Image (OpenAI) (monitored on DownForAI) cover text-to-image with similar quality",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Grok / xAI platform", "X (for in-app usage)"],
    operatorNotes: [
      "DownForAI probes x.ai; xAI publishes a status page but Grok Imagine has no dedicated entry, so community reports and the xAI Grok service page are the references.",
    ],
  },
  "tensor-art": {
    slug: "tensor-art",
    providerSummary:
      "Tensor.Art is a community image-generation platform hosting thousands of Stable Diffusion and Flux checkpoints and LoRAs, with free daily credits and paid plans. Generation runs on shared GPU queues, so waiting time is the main symptom of trouble.",
    docsUrl: "https://tensor.art",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "tensor.art web app", description: "Model browsing and generation", criticality: "critical" },
      { name: "GPU generation queue", description: "Image renders", criticality: "critical" },
      { name: "Model hosting", description: "Checkpoint and LoRA downloads", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations queued for minutes or failing at peak",
        scope: "partial",
        signal: "Tasks sit in 'waiting' far longer than usual, sometimes failing after the wait",
        quickCheck: "Try a smaller resolution or fewer steps; if everything queues, the GPU pool is saturated",
      },
      {
        pattern: "A specific model fails to load",
        scope: "local",
        signal: "One checkpoint or LoRA errors while others generate normally",
        quickCheck: "Switch to another model; a single-model failure is a hosting issue for that file, not an outage",
      },
      {
        pattern: "Daily credits exhausted",
        scope: "local",
        signal: "Generation refused with a credit prompt for your account only",
        quickCheck: "Check the credit balance; it refills daily",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Tensor.Art is down or its queue is stalled",
        alternative: "SeaArt AI, Civitai or Leonardo AI (monitored on DownForAI) run many of the same community models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "seaart-ai": {
    slug: "seaart-ai",
    providerSummary:
      "SeaArt AI is a web and mobile image-generation platform with community models, a character/roleplay side and a stamina-style credit system, running on shared GPU queues. Slow queues and model-loading errors are its typical incidents.",
    docsUrl: "https://docs.seaart.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "seaart.ai web app", description: "Generation and model library", criticality: "critical" },
      { name: "GPU generation queue", description: "Image renders", criticality: "critical" },
      { name: "Mobile apps", description: "iOS and Android clients", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck in the queue at peak",
        scope: "partial",
        signal: "Tasks wait far longer than the estimate or fail after queuing",
        quickCheck: "Lower the resolution or batch size; a universal stall is GPU saturation",
      },
      {
        pattern: "Model or LoRA fails to load for a generation",
        scope: "local",
        signal: "One model errors while others work",
        quickCheck: "Switch models; single-model errors are file-hosting issues, not platform downtime",
      },
      {
        pattern: "Stamina depleted mistaken for an outage",
        scope: "local",
        signal: "Generation refused with a stamina/credit prompt for your account",
        quickCheck: "Check the balance in the profile; it regenerates daily",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SeaArt AI is down",
        alternative: "Tensor.Art, Civitai or Leonardo AI (monitored on DownForAI) offer the same community-model generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  artbreeder: {
    slug: "artbreeder",
    providerSummary:
      "Artbreeder is a long-running web app for creating and blending AI images (Mixer, Collager, Splicer and prompt-based tools) with a free tier and credit-based plans. Its tools share one generation backend, so slow queues affect all of them at once.",
    docsUrl: "https://www.artbreeder.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "artbreeder.com web app", description: "Tools and gallery", criticality: "critical" },
      { name: "Generation backend", description: "Image renders and blends", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders queue for a long time or fail",
        scope: "partial",
        signal: "Every tool shows long 'generating' states; the gallery still browses",
        quickCheck: "Try one low-cost generation; a universal wait is backend capacity",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused with a credit message for your account",
        quickCheck: "Check the balance; free credits refill monthly",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Artbreeder is down",
        alternative: "Leonardo AI, Playground AI or NightCafe (monitored on DownForAI) cover creative image generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "bria-ai": {
    slug: "bria-ai",
    providerSummary:
      "Bria provides commercially licensed visual generation and editing through APIs (generation, background removal, expansion, product shots) and a platform console, aimed at enterprises. Its users are developers, so incidents look like API errors and quota rejections.",
    docsUrl: "https://docs.bria.ai",
    pricingUrl: "https://bria.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Bria API", description: "Generation and editing endpoints", criticality: "critical" },
      { name: "Platform console", description: "Keys, usage, playground", criticality: "high" },
      { name: "bria.ai", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API 5xx or timeouts on generation endpoints",
        scope: "partial",
        signal: "Requests fail across models while the console loads",
        quickCheck: "Retry with backoff; test from the console playground",
      },
      {
        pattern: "429 or usage quota exceeded",
        scope: "local",
        signal: "Requests rejected with rate or quota messages for your account",
        quickCheck: "Check plan limits and usage in the console",
      },
      {
        pattern: "Model version retired",
        scope: "local",
        signal: "Calls to an older model version return not-found",
        quickCheck: "Consult the model versions in the docs and update the request",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Bria's API is down",
        alternative: "Stability AI or Adobe Firefly (monitored on DownForAI) offer commercially safe generation APIs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  clipdrop: {
    slug: "clipdrop",
    providerSummary:
      "Clipdrop (Stability AI) bundles image tools — background removal, cleanup, upscaling, relighting, text-to-image — in a web app, mobile apps and an API, on free daily limits and paid plans. Each tool is a separate model job, so one tool can stall while others work.",
    docsUrl: "https://clipdrop.co/apis/docs",
    pricingUrl: "https://clipdrop.co/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "clipdrop.co web app", description: "Tools", criticality: "critical" },
      { name: "Clipdrop API", description: "Programmatic access", criticality: "high" },
      { name: "Per-tool model jobs", description: "Cleanup, remove background, upscale, generate", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One tool fails while others work",
        scope: "partial",
        signal: "For example cleanup errors but background removal succeeds",
        quickCheck: "Try a different tool; a single-tool failure is that model's service",
      },
      {
        pattern: "Daily free limit reached",
        scope: "local",
        signal: "Tools refuse new jobs with an upgrade prompt for your account",
        quickCheck: "Wait for the daily reset or upgrade; not an outage",
      },
      {
        pattern: "API credits exhausted or key invalid",
        scope: "local",
        signal: "API calls return 402 or 401",
        quickCheck: "Check the API dashboard for remaining credits and the key",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Clipdrop is down",
        alternative: "Remove.bg, PhotoRoom or PicWish (monitored on DownForAI) cover background removal and cleanup",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Stability AI infrastructure"],
    operatorNotes: [],
  },
  comfyui: {
    slug: "comfyui",
    providerSummary:
      "ComfyUI is the open-source node-based interface for diffusion models, run locally (or on rented GPUs) by users; Comfy Org maintains it, the docs and a model registry. There is no hosted ComfyUI to be down: failures are custom nodes, missing models or local hardware.",
    docsUrl: "https://docs.comfy.org",
    communityLinks: [
      { type: "github", url: "https://github.com/comfyanonymous/ComfyUI", label: "comfyanonymous/ComfyUI", verified: true },
    ],
    monitoredSurfaces: [
      { name: "comfy.org / docs", description: "Website, docs, registry", criticality: "low" },
      { name: "Local ComfyUI install", description: "User-run server", criticality: "critical" },
      { name: "Model downloads", description: "Hugging Face, Civitai", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Workflow fails on a missing node or model",
        scope: "local",
        signal: "Red nodes or 'model not found' when loading a shared workflow",
        quickCheck: "Install the missing custom nodes via the Manager and place the checkpoint in the right models folder",
      },
      {
        pattern: "Custom node breaks the install after an update",
        scope: "local",
        signal: "ComfyUI fails to start with an import error naming a custom node",
        quickCheck: "Disable or update that node; start with --disable-all-custom-nodes to confirm",
      },
      {
        pattern: "Out of VRAM",
        scope: "local",
        signal: "CUDA out-of-memory errors on large workflows",
        quickCheck: "Lower resolution or batch size, use lowvram flags or a smaller model",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your ComfyUI setup is broken",
        alternative: "Fooocus or Easy Diffusion (monitored on DownForAI) run locally with less setup; Fal.ai Flux hosts the same models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face and Civitai for models"],
    operatorNotes: [
      "DownForAI checks comfy.org's robots.txt only; a green probe says nothing about your local install.",
    ],
  },
  craiyon: {
    slug: "craiyon",
    providerSummary:
      "Craiyon (formerly DALL·E Mini) is a free, ad-supported web image generator with a paid tier for faster, watermark-free results. Its free queue is the main thing users hit: waits stretch under load long before anything is actually down.",
    docsUrl: "https://www.craiyon.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "craiyon.com web app", description: "Generator", criticality: "critical" },
      { name: "Generation queue", description: "Free and paid tiers", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Very long free-tier waits",
        scope: "partial",
        signal: "Generations take minutes or show a queue message; paid users are faster",
        quickCheck: "Retry off-peak; a long queue is congestion, not an outage",
      },
      {
        pattern: "Page blocked by an ad or content blocker",
        scope: "local",
        signal: "The generator button does nothing with a strict blocker enabled",
        quickCheck: "Allow craiyon.com in the blocker or try a private window",
      },
      {
        pattern: "Edge challenge instead of the site",
        scope: "local",
        signal: "A verification page or 403, often on VPNs",
        quickCheck: "Disable the VPN and complete the check",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Craiyon is down or too slow",
        alternative: "Mage.space, Playground AI or NightCafe (monitored on DownForAI) offer free image generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "craiyon.com refuses automated requests, so DownForAI checks robots.txt reachability only.",
    ],
  },
  "cutout-pro": {
    slug: "cutout-pro",
    providerSummary:
      "Cutout.pro offers background removal, photo enhancement, cartoon filters and related tools as a web app and an API, on credit-based plans. Each tool is a model job; the API and the web tools share credits and infrastructure.",
    docsUrl: "https://www.cutout.pro",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "cutout.pro web app", description: "Tools", criticality: "critical" },
      { name: "Cutout.pro API", description: "Programmatic access", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Uploads process forever or fail",
        scope: "partial",
        signal: "Every tool hangs after upload",
        quickCheck: "Try a small image; a universal stall is backend capacity",
      },
      {
        pattern: "Credits exhausted or API key errors",
        scope: "local",
        signal: "Jobs refused with a credit message or API returns 402",
        quickCheck: "Check the balance in the account before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cutout.pro is down",
        alternative: "Remove.bg, PicWish or Clipdrop (monitored on DownForAI) offer the same background and enhancement tools",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "deep-dream-generator": {
    slug: "deep-dream-generator",
    providerSummary:
      "Deep Dream Generator is a community AI art site (text-to-image and the original Deep Dream style transfer) that runs on an 'energy' credit system with free daily refills. Generation runs on shared GPUs, so waiting time rises with load.",
    docsUrl: "https://deepdreamgenerator.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "deepdreamgenerator.com web app", description: "Generator and gallery", criticality: "critical" },
      { name: "GPU queue", description: "Image renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations stuck in processing",
        scope: "partial",
        signal: "Tasks remain queued far beyond the usual time for everyone",
        quickCheck: "Retry a smaller size; a universal wait is GPU capacity",
      },
      {
        pattern: "Energy depleted",
        scope: "local",
        signal: "Generation refused with an energy message for your account",
        quickCheck: "Energy refills daily; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Deep Dream Generator is down",
        alternative: "NightCafe, StarryAI or Artbreeder (monitored on DownForAI) are comparable community art generators",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  designify: {
    slug: "designify",
    providerSummary:
      "Designify was a background-removal and product-photo automation tool; it has since been folded into Canva, and designify.com now redirects to Canva's AI photo-editing features. Anything users still reach is Canva's platform.",
    docsUrl: "https://www.designify.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "designify.com", description: "Redirects to Canva", criticality: "low" },
      { name: "Canva AI photo editing", description: "Where the features now live", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Old Designify links or API no longer work",
        scope: "local",
        signal: "Bookmarked tools or API keys fail after the migration",
        quickCheck: "Expected; use Canva's editor or another background-removal service",
      },
      {
        pattern: "Canva editor unavailable",
        scope: "global",
        signal: "The redirected Canva page errors or will not load",
        quickCheck: "Check the Canva AI page on DownForAI",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need background removal now",
        alternative: "Remove.bg, PhotoRoom or Clipdrop (monitored on DownForAI) offer the same feature",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Canva"],
    operatorNotes: [
      "designify.com redirects to canva.com; the DownForAI probe reflects Canva's site.",
    ],
  },
  dreamina: {
    slug: "dreamina",
    providerSummary:
      "Dreamina is CapCut/ByteDance's AI image and video generation web app (international version of Jimeng), running on ByteDance's generation backend with a daily credit allowance. Video generations are long queued jobs; images are near real time.",
    docsUrl: "https://dreamina.capcut.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "dreamina.capcut.com web app", description: "Generator", criticality: "critical" },
      { name: "Image generation", description: "Fast renders", criticality: "critical" },
      { name: "Video generation queue", description: "Long jobs", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Video generations stuck while images work",
        scope: "partial",
        signal: "Video tasks stay queued or fail; image prompts return normally",
        quickCheck: "Retry one short clip later; the video queue is separate",
      },
      {
        pattern: "Daily credits used up",
        scope: "local",
        signal: "Generation refused with a credit message for your account",
        quickCheck: "Credits refresh daily; not an outage",
      },
      {
        pattern: "Sign-in via CapCut account failing",
        scope: "local",
        signal: "Login loops or the account is unavailable in your region",
        quickCheck: "Try another sign-in provider; some regions are restricted",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dreamina is down",
        alternative: "Ideogram, Leonardo AI or Kling AI (monitored on DownForAI) cover image and video generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["CapCut / ByteDance accounts"],
    operatorNotes: [],
  },
  "easy-diffusion": {
    slug: "easy-diffusion",
    providerSummary:
      "Easy Diffusion is a one-click installer and web UI for running Stable Diffusion locally on Windows, macOS and Linux. It has no hosted component: the project page is static, and every failure is on the user's machine.",
    docsUrl: "https://easydiffusion.github.io",
    communityLinks: [
      { type: "github", url: "https://github.com/easydiffusion/easydiffusion", label: "easydiffusion/easydiffusion", verified: true },
    ],
    monitoredSurfaces: [
      { name: "easydiffusion.github.io", description: "Project page", criticality: "low" },
      { name: "Local install", description: "User-run UI and models", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Installer fails or first start hangs",
        scope: "local",
        signal: "The setup script stops downloading dependencies or models",
        quickCheck: "Check disk space and antivirus interference; rerun the installer",
      },
      {
        pattern: "Out of memory during generation",
        scope: "local",
        signal: "Renders fail on large sizes or several images at once",
        quickCheck: "Reduce size and batch, enable the low-VRAM setting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your local setup is not working",
        alternative: "Fooocus or ComfyUI (monitored on DownForAI) are other local options; Mage.space hosts the same models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face / Civitai for models"],
    operatorNotes: [
      "DownForAI probes a static GitHub Pages site; it does not reflect any user's install.",
    ],
  },
  "faceapp-ai": {
    slug: "faceapp-ai",
    providerSummary:
      "FaceApp is a mobile app (iOS, Android) applying AI face edits — ageing, smiles, styles — with processing done on FaceApp's servers and a Pro subscription. It is app-only, so incidents mean edits that fail to process or subscriptions not recognised.",
    docsUrl: "https://www.faceapp.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "FaceApp mobile apps", description: "Primary client", criticality: "critical" },
      { name: "Processing backend", description: "Server-side face edits", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Edits fail with a processing error",
        scope: "partial",
        signal: "Every filter fails after upload while the app opens normally",
        quickCheck: "Try a different photo and network; if all filters fail, the backend is degraded",
      },
      {
        pattern: "Pro not recognised",
        scope: "local",
        signal: "Pro filters locked after purchase or on a new device",
        quickCheck: "Use 'restore purchases' with the same store account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "FaceApp is down",
        alternative: "Remini AI or Meitu AI (monitored on DownForAI) offer AI face and photo edits on mobile",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [
      "DownForAI probes the marketing site; app incidents surface through community reports.",
    ],
  },
  "fal-ai-flux": {
    slug: "fal-ai-flux",
    providerSummary:
      "fal.ai serves FLUX and many other image and video models through a fast inference API with a playground, billed per generation. Developers see incidents as 429s, queued requests or model-specific errors, published on fal's status page.",
    officialStatusUrl: "https://status.fal.ai/",
    docsUrl: "https://docs.fal.ai",
    pricingUrl: "https://fal.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "fal.ai API and queue", description: "Model endpoints", criticality: "critical" },
      { name: "Playground / dashboard", description: "Keys, usage, testing", criticality: "high" },
      { name: "Per-model capacity", description: "FLUX variants and other models", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Requests queued far longer than usual",
        scope: "partial",
        signal: "Queue positions climb and results arrive late for a specific model",
        quickCheck: "Check status.fal.ai and switch to another FLUX variant or model",
      },
      {
        pattern: "429 rate limits",
        scope: "local",
        signal: "Requests rejected with rate-limit errors while the status page is green",
        quickCheck: "Check the account's concurrency limits; contact fal to raise them",
      },
      {
        pattern: "Billing or balance errors",
        scope: "local",
        signal: "Requests refused with a payment or balance message",
        quickCheck: "Add credit or a payment method in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "fal.ai is degraded",
        alternative: "Replicate or Together AI (monitored on DownForAI) also serve FLUX models; Black Forest Labs' own API is another route",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  flux: {
    slug: "flux",
    providerSummary:
      "FLUX is Black Forest Labs' image-model family: open weights (dev, schnell) that run locally or on any provider, plus the pro models served through BFL's own API and partners. 'FLUX is down' therefore points at BFL's API, a hosting provider, or local hardware.",
    docsUrl: "https://docs.bfl.ml",
    communityLinks: [
      { type: "github", url: "https://github.com/black-forest-labs/flux", label: "black-forest-labs/flux", verified: true },
    ],
    monitoredSurfaces: [
      { name: "bfl.ai / BFL API", description: "Hosted pro models", criticality: "high" },
      { name: "Third-party providers", description: "fal, Replicate, Together and others", criticality: "high" },
      { name: "Open weights", description: "Local runs via ComfyUI, Fooocus", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "BFL API 429 or credit errors",
        scope: "local",
        signal: "Requests rejected with rate-limit or insufficient-credit messages",
        quickCheck: "Check the account balance and limits; providers hosting FLUX offer an alternative path",
      },
      {
        pattern: "Provider-specific degradation",
        scope: "partial",
        signal: "FLUX errors on one provider while others serve it normally",
        quickCheck: "Switch provider; the model is the same",
      },
      {
        pattern: "Out of VRAM locally",
        scope: "local",
        signal: "FLUX dev fails to load on smaller GPUs",
        quickCheck: "Use a quantised (fp8/GGUF) variant or FLUX schnell",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "FLUX is unavailable from your source",
        alternative: "Fal.ai Flux, Stability AI or Ideogram (monitored on DownForAI) offer hosted alternatives",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hosting providers", "Hugging Face for weights"],
    operatorNotes: [
      "blackforestlabs.ai redirects to bfl.ai; DownForAI probes the website, not the API.",
    ],
  },
  fooocus: {
    slug: "fooocus",
    providerSummary:
      "Fooocus is an open-source, Midjourney-style local UI for Stable Diffusion XL that hides most settings; it runs on the user's GPU or in Colab. The project is in maintenance mode and has no hosted service, so failures are always local.",
    docsUrl: "https://github.com/lllyasviel/Fooocus",
    communityLinks: [
      { type: "github", url: "https://github.com/lllyasviel/Fooocus", label: "lllyasviel/Fooocus", verified: true },
    ],
    monitoredSurfaces: [
      { name: "GitHub repository", description: "Downloads and issues", criticality: "low" },
      { name: "Local install", description: "User-run UI", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "First launch stuck downloading models",
        scope: "local",
        signal: "The console shows model downloads stalling",
        quickCheck: "Check the connection to Hugging Face; place the checkpoints manually if needed",
      },
      {
        pattern: "Colab session refused or ended",
        scope: "local",
        signal: "Free Colab blocks or disconnects the Fooocus notebook",
        quickCheck: "Colab restricts some UIs on free tiers; run locally or on a paid runtime",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fooocus will not run",
        alternative: "ComfyUI or Easy Diffusion (monitored on DownForAI) are other local options; Fal.ai Flux hosts comparable models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face for models", "Google Colab when used remotely"],
    operatorNotes: [
      "DownForAI probes the GitHub repository page; it says nothing about local installs.",
    ],
  },
  "fotor-ai": {
    slug: "fotor-ai",
    providerSummary:
      "Fotor is an online photo editor with AI tools (generator, enhancer, background remover, headshots) on web and mobile, using credits for AI features. The editor itself works without AI; AI tools depend on Fotor's generation backend.",
    docsUrl: "https://www.fotor.com",
    pricingUrl: "https://www.fotor.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "fotor.com editor", description: "Web app", criticality: "critical" },
      { name: "AI tools backend", description: "Generation and enhancement", criticality: "high" },
      { name: "Mobile apps", description: "iOS and Android", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI tools fail while the editor works",
        scope: "partial",
        signal: "Manual edits save but AI generator or enhancer errors",
        quickCheck: "Retry one AI tool later; the AI backend is separate from the editor",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "AI features refused with a credit message for your account",
        quickCheck: "Check the balance in the account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fotor AI is down",
        alternative: "Pixlr AI, Canva AI or PicWish (monitored on DownForAI) offer comparable online AI photo editing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "gpt-image": {
    slug: "gpt-image",
    providerSummary:
      "GPT Image is OpenAI's image generation inside ChatGPT and through the Images API (gpt-image models). It shares ChatGPT's and the API's infrastructure, so it follows OpenAI's status page, plus its own per-plan generation limits and content policy.",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://platform.openai.com/docs/guides/image-generation",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ChatGPT image generation", description: "Consumer surface", criticality: "critical" },
      { name: "Images API", description: "Developer surface", criticality: "critical" },
      { name: "OpenAI platform", description: "Shared infrastructure", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation limit reached on your plan",
        scope: "local",
        signal: "ChatGPT says you have reached the image limit and asks to wait or upgrade; text chat works",
        quickCheck: "Free and Plus plans have image caps; wait for the reset — this is not an outage",
      },
      {
        pattern: "Images slow or failing at peak while text works",
        scope: "partial",
        signal: "Requests hang or return an error for everyone; status.openai.com lists an image component incident",
        quickCheck: "Check the status page and retry later",
      },
      {
        pattern: "Prompt refused by policy",
        scope: "local",
        signal: "A refusal for specific prompts (people, brands, styles)",
        quickCheck: "Rephrase; this is enforcement rather than failure",
      },
      {
        pattern: "API 429 on the image endpoints",
        scope: "local",
        signal: "Images API rejects requests with rate-limit responses",
        quickCheck: "Check the organisation's image rate limits in the platform console",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "GPT Image is unavailable",
        alternative: "Midjourney, Ideogram or Grok Imagine (monitored on DownForAI) cover text-to-image generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI platform"],
    operatorNotes: [],
  },
  "lensa-ai": {
    slug: "lensa-ai",
    providerSummary:
      "Lensa (Prisma Labs) is a mobile photo-editing app known for its AI 'Magic Avatars', processed on Prisma's servers per pack purchase. It is app-only; the product page on prisma-ai.com currently returns 404.",
    docsUrl: "https://prisma-ai.com/lensa",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Lensa mobile app", description: "Primary client", criticality: "critical" },
      { name: "Avatar processing backend", description: "Magic Avatars generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Avatar pack stuck processing",
        scope: "partial",
        signal: "Purchased avatars remain 'in progress' far beyond the estimate",
        quickCheck: "Wait; processing runs in a queue — contact support through the app if a pack exceeds a day",
      },
      {
        pattern: "Purchase not delivered",
        scope: "local",
        signal: "The store charged you but the pack or subscription is missing",
        quickCheck: "Use 'restore purchases' and keep the receipt for support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Lensa is down",
        alternative: "Remini AI or FaceApp AI (monitored on DownForAI) offer AI portrait features on mobile",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [
      "The DB website URL answers 404; DownForAI's technical signal for Lensa is unreliable.",
    ],
  },
  letsenhance: {
    slug: "letsenhance",
    providerSummary:
      "Let's Enhance is a web upscaler and photo enhancer with an API, billed by image credits. Jobs run on shared GPUs, so processing time and failures scale with load and image size.",
    docsUrl: "https://letsenhance.io",
    pricingUrl: "https://letsenhance.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "letsenhance.io web app", description: "Upload and enhance", criticality: "critical" },
      { name: "Processing queue", description: "Upscaling jobs", criticality: "critical" },
      { name: "API", description: "Programmatic access", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Jobs stuck in processing",
        scope: "partial",
        signal: "Uploads never finish enhancing, for small images too",
        quickCheck: "Retry a tiny image; a universal stall is GPU capacity",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Processing refused with a credit message for your account",
        quickCheck: "Check the balance before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Let's Enhance is down",
        alternative: "Topaz Photo AI, Remini or Magnific AI (monitored on DownForAI) cover upscaling and enhancement",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "letz-ai": {
    slug: "letz-ai",
    providerSummary:
      "Letz AI is a web image-generation platform with custom models trained on your own photos or products, on credit-based plans. Model training is a long job; generation is fast once a model exists.",
    docsUrl: "https://letz.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "letz.ai web app", description: "Generator and training", criticality: "critical" },
      { name: "Training queue", description: "Custom model jobs", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model training stuck",
        scope: "partial",
        signal: "Training jobs stay queued far beyond the estimate",
        quickCheck: "Wait; training runs on a separate queue from generation",
      },
      {
        pattern: "Generations failing across models",
        scope: "partial",
        signal: "Every prompt errors while the site loads",
        quickCheck: "Retry later; a universal failure is backend capacity",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Letz AI is down",
        alternative: "Leonardo AI, Scenario or Krea AI (monitored on DownForAI) support custom-model generation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "luminar-neo-ai": {
    slug: "luminar-neo-ai",
    providerSummary:
      "Luminar Neo is Skylum's desktop photo editor (Windows, macOS) with AI tools such as Sky AI, Relight and Enhance, sold by subscription or licence. Editing runs locally; only activation, extension downloads and cloud-assisted generative features touch Skylum's servers.",
    docsUrl: "https://skylum.com/support",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Luminar Neo desktop app", description: "Local editing", criticality: "high" },
      { name: "Skylum account / activation", description: "Licence checks", criticality: "critical" },
      { name: "Generative cloud features", description: "Server-assisted tools", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Activation or sign-in failing",
        scope: "local",
        signal: "The app cannot verify the licence or loops on login",
        quickCheck: "Check the Skylum account status; offline mode covers editing while activation servers recover",
      },
      {
        pattern: "Generative tools erroring while local tools work",
        scope: "partial",
        signal: "GenErase or similar cloud features fail; Sky AI and standard edits work",
        quickCheck: "Retry later; cloud features depend on Skylum's servers",
      },
      {
        pattern: "Slow or crashing AI tools on weak GPUs",
        scope: "local",
        signal: "AI tools take very long or crash on integrated graphics",
        quickCheck: "Check the system requirements and update GPU drivers",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Luminar Neo cloud features are down",
        alternative: "Topaz Photo AI or PhotoDirector AI (monitored on DownForAI) are desktop editors with local AI tools",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "mage-space": {
    slug: "mage-space",
    providerSummary:
      "Mage.space is a web image generator offering many community Stable Diffusion and FLUX models, including unfiltered ones, with a free tier and subscriptions for faster generation. It runs on shared GPU queues.",
    docsUrl: "https://www.mage.space",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "mage.space web app", description: "Generator", criticality: "critical" },
      { name: "GPU queue", description: "Renders per model", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Free-tier generations queued for a long time",
        scope: "partial",
        signal: "Free users wait minutes while subscribers render quickly",
        quickCheck: "Retry off-peak; a long free queue is congestion",
      },
      {
        pattern: "One model errors while others generate",
        scope: "local",
        signal: "A specific checkpoint fails to load",
        quickCheck: "Switch model; single-model failures are hosting issues for that file",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Mage.space is down",
        alternative: "SeaArt AI, Tensor.Art or Civitai (monitored on DownForAI) host the same community models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "meitu-ai": {
    slug: "meitu-ai",
    providerSummary:
      "Meitu is a Chinese photo and beauty-editing company whose apps (Meitu, BeautyCam and others) bundle AI filters, portrait enhancement and generative effects processed on Meitu's servers. Its AI features are used almost entirely inside the mobile apps.",
    docsUrl: "https://www.meitu.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Meitu mobile apps", description: "Primary clients", criticality: "critical" },
      { name: "AI effects backend", description: "Server-side processing", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI effects fail while basic editing works",
        scope: "partial",
        signal: "Generative filters error or hang; manual tools save normally",
        quickCheck: "Retry later; server-side effects saturate at peak, especially during viral filter trends",
      },
      {
        pattern: "Feature unavailable in your region",
        scope: "local",
        signal: "A filter shown in marketing is missing from the app",
        quickCheck: "Meitu ships features by region and app version; update the app",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Meitu AI is down",
        alternative: "FaceApp AI or Remini AI (monitored on DownForAI) offer comparable mobile portrait effects",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI probes meitu.com, the corporate site; app incidents show up through community reports.",
    ],
  },
  "napkin-ai": {
    slug: "napkin-ai",
    providerSummary:
      "Napkin AI turns text into diagrams and visuals inside a web editor, with export to slides and documents, on free and paid plans. Visual generation is a server-side job triggered from the editor.",
    docsUrl: "https://www.napkin.ai",
    pricingUrl: "https://www.napkin.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.napkin.ai", description: "Editor", criticality: "critical" },
      { name: "Visual generation backend", description: "Diagram rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Visuals never generate from the text",
        scope: "partial",
        signal: "The spark button spins without producing options, on any document",
        quickCheck: "Try a short paragraph; a universal stall is the generation backend",
      },
      {
        pattern: "Exports failing",
        scope: "partial",
        signal: "Downloads or exports to PowerPoint error while editing works",
        quickCheck: "Retry with a single visual; the export service is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Napkin AI is down",
        alternative: "Gamma or Canva AI (monitored on DownForAI) can generate visuals and slides from text",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  nightcafe: {
    slug: "nightcafe",
    providerSummary:
      "NightCafe is a community AI art platform offering many models (Stable Diffusion, FLUX, DALL·E and others) with daily free credits, challenges and a marketplace. Generation runs on shared queues and each model family can degrade separately.",
    docsUrl: "https://help.nightcafe.studio",
    pricingUrl: "https://creator.nightcafe.studio/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "creator.nightcafe.studio", description: "Web app", criticality: "critical" },
      { name: "Generation queues", description: "Per-model rendering", criticality: "critical" },
      { name: "Third-party models", description: "DALL·E, Ideogram and other relayed models", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Creations stuck in the queue",
        scope: "partial",
        signal: "Jobs show as queued far longer than usual, across models",
        quickCheck: "Try a smaller job; a universal wait is GPU capacity",
      },
      {
        pattern: "A relayed model fails while native ones work",
        scope: "partial",
        signal: "Only DALL·E or another third-party model errors",
        quickCheck: "Switch to a native model; the failure is the upstream provider",
      },
      {
        pattern: "Daily credits exhausted",
        scope: "local",
        signal: "Creation refused with a credit message for your account",
        quickCheck: "Credits refill daily; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "NightCafe is down",
        alternative: "Playground AI, StarryAI or Leonardo AI (monitored on DownForAI) are comparable community generators",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers for relayed models"],
    operatorNotes: [
      "creator.nightcafe.studio refuses automated requests, so DownForAI checks robots.txt reachability only.",
    ],
  },
  "photodirector-ai": {
    slug: "photodirector-ai",
    providerSummary:
      "PhotoDirector is CyberLink's photo editor (desktop and mobile) with AI tools such as generative fill, sky replacement and portrait effects; desktop tools run locally while several generative features and the mobile app use CyberLink's cloud. Licensing runs on a CyberLink account.",
    docsUrl: "https://www.cyberlink.com/products/photodirector",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "PhotoDirector desktop", description: "Local editing", criticality: "high" },
      { name: "CyberLink account / activation", description: "Licence checks", criticality: "critical" },
      { name: "Cloud AI features", description: "Server-assisted generation", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generative AI tools failing while local tools work",
        scope: "partial",
        signal: "Cloud-based features error; standard edits save fine",
        quickCheck: "Retry later; cloud features depend on CyberLink's servers",
      },
      {
        pattern: "Sign-in or subscription check failing",
        scope: "local",
        signal: "The app reports it cannot verify the subscription",
        quickCheck: "Check the CyberLink account and internet access; a grace period keeps editing available",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "PhotoDirector cloud features are down",
        alternative: "Luminar Neo AI or Topaz Photo AI (monitored on DownForAI) run AI edits locally",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "photor-ai": {
    slug: "photor-ai",
    providerSummary:
      "Photor is a web tool that scores and ranks your photos with AI to pick the best ones, plus lightweight edits. It is a small hosted service: uploads and analysis run on its backend and fail together.",
    docsUrl: "https://photor.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "photor.io web app", description: "Upload and ranking", criticality: "critical" },
      { name: "Analysis backend", description: "Scoring jobs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Uploads analyse forever",
        scope: "partial",
        signal: "Scores never appear for any batch",
        quickCheck: "Try a single small photo; a universal stall is the analysis backend",
      },
      {
        pattern: "Upload rejected",
        scope: "local",
        signal: "Large or unusual formats fail to upload",
        quickCheck: "Convert to JPEG under the size limit before assuming an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Photor is down",
        alternative: "Fotor AI or Pixlr AI (monitored on DownForAI) cover general AI photo tools",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  picso: {
    slug: "picso",
    providerSummary:
      "PicSo is an AI art generator app (mobile and web) for text-to-image and style effects, monetised through credits and subscriptions. It is app-centric; generation runs on PicSo's servers.",
    docsUrl: "https://picso.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "PicSo mobile app", description: "Primary client", criticality: "critical" },
      { name: "Generation backend", description: "Renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations fail or never finish",
        scope: "partial",
        signal: "Every prompt errors or stays pending in the app",
        quickCheck: "Update the app and retry after a few minutes",
      },
      {
        pattern: "Credits or subscription not applied",
        scope: "local",
        signal: "Purchased credits missing after payment",
        quickCheck: "Use 'restore purchases' with the same store account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "PicSo is down",
        alternative: "StarryAI, Wombo Dream or NightCafe (monitored on DownForAI) offer mobile-friendly art generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [],
  },
  picwish: {
    slug: "picwish",
    providerSummary:
      "PicWish provides background removal, photo enhancement, retouching and related tools as a web app, desktop and mobile apps and an API, on credit-based plans. Web tools and the API share the same processing backend.",
    docsUrl: "https://picwish.com",
    pricingUrl: "https://picwish.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "picwish.com web app", description: "Tools", criticality: "critical" },
      { name: "PicWish API", description: "Programmatic access", criticality: "high" },
      { name: "Processing backend", description: "Model jobs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Processing stuck for every tool",
        scope: "partial",
        signal: "Uploads hang across background removal and enhancement",
        quickCheck: "Try a small image; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted or API quota errors",
        scope: "local",
        signal: "Jobs refused with a credit message or API 402/429",
        quickCheck: "Check the balance in the account or API console",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "PicWish is down",
        alternative: "Remove.bg, Cutout.pro or Clipdrop (monitored on DownForAI) offer the same tools",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "pixlr-ai": {
    slug: "pixlr-ai",
    providerSummary:
      "Pixlr is a browser photo editor (Pixlr X and E) with AI tools — generative fill, background removal, image generator — on a free ad-supported tier and subscriptions. The editor runs largely in the browser; AI tools call Pixlr's backend.",
    docsUrl: "https://pixlr.com",
    pricingUrl: "https://pixlr.com/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "pixlr.com editor", description: "Browser app", criticality: "critical" },
      { name: "AI tools backend", description: "Generative features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI tools failing while manual editing works",
        scope: "partial",
        signal: "Generative fill or the generator errors; layers and filters work",
        quickCheck: "Retry later; the AI backend is separate from the editor",
      },
      {
        pattern: "Editor blocked by an ad blocker on the free tier",
        scope: "local",
        signal: "Pixlr asks to disable the blocker or the editor will not load",
        quickCheck: "Allow pixlr.com or use a paid plan; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Pixlr AI is down",
        alternative: "Fotor AI, Canva AI or PhotoRoom (monitored on DownForAI) cover online AI photo editing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "playground-ai": {
    slug: "playground-ai",
    providerSummary:
      "Playground started as a free Stable Diffusion image generator and has repositioned as an AI design tool for graphics, logos and product images, still on free and paid plans. Generation runs on Playground's own models and GPUs.",
    docsUrl: "https://playground.com",
    pricingUrl: "https://playground.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "playground.com web app", description: "Design and generation", criticality: "critical" },
      { name: "Generation backend", description: "Playground models", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations slow or failing at peak",
        scope: "partial",
        signal: "Designs never render for anyone while the site loads",
        quickCheck: "Retry a simple prompt later; a universal failure is backend capacity",
      },
      {
        pattern: "Free daily limit reached",
        scope: "local",
        signal: "Generation refused with an upgrade prompt for your account",
        quickCheck: "Wait for the reset; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Playground is down",
        alternative: "Ideogram, Leonardo AI or Canva AI (monitored on DownForAI) cover design-oriented generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The pricing page now lives under playgroundai.com/design; the DB tracks playground.com.",
    ],
  },
  promeai: {
    slug: "promeai",
    providerSummary:
      "PromeAI is a web design-generation platform (sketch rendering, photo-to-render, image and video generation) aimed at architects and designers, on credit-based plans. It sits behind bot protection and runs generation on shared queues.",
    docsUrl: "https://www.promeai.pro",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "promeai.pro web app", description: "Tools", criticality: "critical" },
      { name: "Generation queue", description: "Renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders queued for a long time",
        scope: "partial",
        signal: "Tasks stay in queue across tools",
        quickCheck: "Try a lower quality setting; a universal wait is capacity",
      },
      {
        pattern: "Edge challenge or 403",
        scope: "local",
        signal: "A verification page or access denied, often from VPNs",
        quickCheck: "Disable the VPN and complete the check",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "PromeAI is down",
        alternative: "Krea AI or Leonardo AI (monitored on DownForAI) handle sketch-to-render and design generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "promeai.pro refuses automated requests; DownForAI checks robots.txt reachability only.",
    ],
  },
  remini: {
    slug: "remini",
    providerSummary:
      "Remini (Bending Spoons) is a photo and video enhancer — face restoration, upscaling, AI photos — available as mobile apps and a web app, with a free trial and subscriptions. Enhancements run on Remini's servers, so queues are the usual complaint.",
    docsUrl: "https://remini.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Remini mobile apps", description: "Primary clients", criticality: "critical" },
      { name: "remini.ai web app", description: "Browser client", criticality: "high" },
      { name: "Enhancement backend", description: "Processing queue", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Enhancements stuck in the queue",
        scope: "partial",
        signal: "Photos stay 'processing' far longer than usual for everyone",
        quickCheck: "Wait and retry one photo; the queue backs up at peak",
      },
      {
        pattern: "Video enhance failing while photos work",
        scope: "partial",
        signal: "Video jobs error or never finish; photo jobs succeed",
        quickCheck: "Retry a shorter clip; video runs on a separate pipeline",
      },
      {
        pattern: "Trial or subscription state wrong",
        scope: "local",
        signal: "Features locked after a purchase",
        quickCheck: "Use 'restore purchases' with the same store account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Remini is down",
        alternative: "Topaz Photo AI, Let's Enhance or Magnific AI (monitored on DownForAI) cover enhancement and upscaling",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [
      "Two DB entries exist (remini and remini-ai) for the same product.",
    ],
  },
  "remini-ai": {
    slug: "remini-ai",
    providerSummary:
      "Remini AI (second entry for the same Bending Spoons product) restores old, blurry or low-resolution photos to high definition and generates AI portraits from a few selfies. Both features are server-side jobs billed through the subscription.",
    docsUrl: "https://remini.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Remini apps and web", description: "Clients", criticality: "critical" },
      { name: "AI photos generation", description: "Portrait packs", criticality: "high" },
      { name: "Restoration backend", description: "Enhancement jobs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI photo packs take much longer than the estimate",
        scope: "partial",
        signal: "Portrait generations stay pending for hours",
        quickCheck: "Wait; packs are batch jobs and clear after the peak",
      },
      {
        pattern: "Restoration fails on specific files",
        scope: "local",
        signal: "One photo errors repeatedly while others process",
        quickCheck: "Re-export the photo as JPEG; unusual formats or very large files fail",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Remini is down",
        alternative: "Let's Enhance or Topaz Photo AI (monitored on DownForAI) restore and upscale photos",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [
      "Duplicate of the remini entry in the DB.",
    ],
  },
  "remove-bg": {
    slug: "remove-bg",
    providerSummary:
      "remove.bg (Canva) removes image backgrounds through a web app, desktop and mobile apps, plugins and a widely used API, on credit-based plans. The API and the web tool share one processing backend.",
    docsUrl: "https://www.remove.bg/api",
    pricingUrl: "https://www.remove.bg/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "remove.bg web app", description: "Upload and download", criticality: "critical" },
      { name: "remove.bg API", description: "Programmatic access", criticality: "critical" },
      { name: "Processing backend", description: "Segmentation jobs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API returns 5xx or times out",
        scope: "partial",
        signal: "Integrations fail across images while the website may still load",
        quickCheck: "Retry with backoff; test one image on the website to confirm the backend state",
      },
      {
        pattern: "402 insufficient credits or 429 rate limit",
        scope: "local",
        signal: "API rejects requests with credit or rate errors for your key",
        quickCheck: "Check the account's credits and per-minute limits",
      },
      {
        pattern: "Free preview only",
        scope: "local",
        signal: "Full-resolution download is unavailable without credits",
        quickCheck: "Expected on the free tier; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "remove.bg is down",
        alternative: "PhotoRoom, Clipdrop or PicWish (monitored on DownForAI) offer background removal with APIs",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Canva infrastructure"],
    operatorNotes: [],
  },
  rendernet: {
    slug: "rendernet",
    providerSummary:
      "RenderNet is an image and video generation platform focused on consistent characters and poses, on credit-based plans; its domain now redirects to a new brand (affogato.ai). Generation runs on shared GPU queues.",
    docsUrl: "https://rendernet.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "rendernet.ai → affogato.ai", description: "Web app", criticality: "critical" },
      { name: "Generation queue", description: "Character renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders queued or failing",
        scope: "partial",
        signal: "Jobs stay pending across tools",
        quickCheck: "Retry a smaller job; a universal wait is GPU capacity",
      },
      {
        pattern: "Old links or logins broken after the rebrand",
        scope: "local",
        signal: "Bookmarks or saved credentials no longer work on the new domain",
        quickCheck: "Sign in on the redirected site; account migration is expected after a rebrand",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "RenderNet is down",
        alternative: "Leonardo AI or Scenario (monitored on DownForAI) support consistent characters",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "rendernet.ai redirects to affogato.ai; DownForAI's probe follows the redirect.",
    ],
  },
  scenario: {
    slug: "scenario",
    providerSummary:
      "Scenario is a generation platform for game studios: custom-trained models, style-consistent assets, an API and team workspaces, on credit-based plans. Model training and batch generation are queued jobs distinct from single renders.",
    docsUrl: "https://docs.scenario.com",
    pricingUrl: "https://www.scenario.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.scenario.com", description: "Workspace", criticality: "critical" },
      { name: "Scenario API", description: "Programmatic generation", criticality: "high" },
      { name: "Training and generation queues", description: "GPU jobs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model training stuck",
        scope: "partial",
        signal: "Training jobs stay queued far beyond the estimate",
        quickCheck: "Wait; training runs on a separate queue from generation",
      },
      {
        pattern: "API 429 or credit errors",
        scope: "local",
        signal: "Programmatic calls rejected for your workspace only",
        quickCheck: "Check plan limits and credits in the workspace settings",
      },
      {
        pattern: "Generations failing across models",
        scope: "partial",
        signal: "Every render errors while the workspace loads",
        quickCheck: "Retry later; a universal failure is backend capacity",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Scenario is down",
        alternative: "Leonardo AI or Letz AI (monitored on DownForAI) offer custom-model generation for assets",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  starryai: {
    slug: "starryai",
    providerSummary:
      "StarryAI is a mobile-first AI art generator (with a web version) offering daily free credits and subscriptions, with generation on StarryAI's servers. Its incidents are app-side queue stalls and credit issues.",
    docsUrl: "https://starryai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "StarryAI mobile apps", description: "Primary clients", criticality: "critical" },
      { name: "Generation backend", description: "Renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Creations stuck generating",
        scope: "partial",
        signal: "Jobs remain pending in the app for everyone",
        quickCheck: "Wait and retry one creation; peak-time queues clear",
      },
      {
        pattern: "Daily credits exhausted",
        scope: "local",
        signal: "Generation refused with a credit message for your account",
        quickCheck: "Credits refill daily; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "StarryAI is down",
        alternative: "Wombo Dream, NightCafe or PicSo (monitored on DownForAI) are comparable art apps",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [],
  },
  "stockimg-ai": {
    slug: "stockimg-ai",
    providerSummary:
      "Stockimg.ai generates stock-style images, logos, posters and book covers from text in a web app, on credit-based plans. It is a small hosted generator with a single backend.",
    docsUrl: "https://stockimg.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "stockimg.ai web app", description: "Generator", criticality: "critical" },
      { name: "Generation backend", description: "Renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations fail across templates",
        scope: "partial",
        signal: "Every category errors or hangs",
        quickCheck: "Retry a simple prompt later; a universal failure is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused with a credit message for your account",
        quickCheck: "Check the balance before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Stockimg.ai is down",
        alternative: "Ideogram, Recraft or Freepik AI (monitored on DownForAI) generate stock-style visuals",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  stylar: {
    slug: "stylar",
    providerSummary:
      "Stylar was an AI image creation and style-transfer platform that rebranded as Dzine (dzine.ai); stylar.ai no longer answers. Users of the old brand are now on Dzine's platform and credits.",
    docsUrl: "https://www.stylar.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "stylar.ai", description: "Legacy domain (unreachable)", criticality: "low" },
      { name: "dzine.ai", description: "Successor platform", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "stylar.ai unreachable",
        scope: "global",
        signal: "The old domain times out",
        quickCheck: "Expected after the rebrand; use dzine.ai",
      },
      {
        pattern: "Dzine generations queued",
        scope: "partial",
        signal: "Renders stay pending on the successor platform",
        quickCheck: "Retry a smaller job; a universal wait is capacity",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need style-transfer generation now",
        alternative: "Krea AI, Leonardo AI or Recraft (monitored on DownForAI) cover style-driven image creation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The DB website URL (stylar.ai) is dead; consider re-pointing the service to dzine.ai.",
    ],
  },
  "topaz-photo-ai": {
    slug: "topaz-photo-ai",
    providerSummary:
      "Topaz Photo AI is a desktop app (Windows, macOS) and Lightroom/Photoshop plugin for AI sharpening, denoising and upscaling, licensed per user. Processing runs locally on the GPU; only licence activation and model downloads touch Topaz's servers.",
    docsUrl: "https://docs.topazlabs.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Topaz Photo AI desktop", description: "Local processing", criticality: "high" },
      { name: "Licence and model servers", description: "Activation and model downloads", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model download stuck on first use",
        scope: "local",
        signal: "The app downloads models for each filter and stalls",
        quickCheck: "Check the connection and firewall; downloads resume on restart",
      },
      {
        pattern: "Licence activation failing",
        scope: "local",
        signal: "The app cannot verify the account after login",
        quickCheck: "Log out and in; check the Topaz account status — offline use works after activation",
      },
      {
        pattern: "Very slow processing on unsupported GPUs",
        scope: "local",
        signal: "Enhancements take minutes per image",
        quickCheck: "Update GPU drivers and check the AI processor setting in preferences",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Topaz Photo AI is not working",
        alternative: "Let's Enhance, Remini or Magnific AI (monitored on DownForAI) upscale and enhance in the cloud",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "wombo-dream": {
    slug: "wombo-dream",
    providerSummary:
      "Dream by WOMBO is a mobile-first AI art app (with a web version at dream.ai) with styles and premium tiers; wombo.art redirects to dream.ai. Generation runs on WOMBO's servers, and the app is where nearly all usage happens.",
    docsUrl: "https://dream.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Dream mobile apps", description: "Primary clients", criticality: "critical" },
      { name: "dream.ai web app", description: "Browser client", criticality: "medium" },
      { name: "Generation backend", description: "Renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Artwork never finishes generating",
        scope: "partial",
        signal: "The progress screen hangs for every style",
        quickCheck: "Update the app and retry later; a universal hang is backend capacity",
      },
      {
        pattern: "Premium not recognised",
        scope: "local",
        signal: "Premium styles locked after purchase",
        quickCheck: "Use 'restore purchases' with the same store account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dream by WOMBO is down",
        alternative: "StarryAI, PicSo or NightCafe (monitored on DownForAI) are comparable art apps",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [
      "wombo.art redirects to dream.ai; DownForAI's probe follows the redirect.",
    ],
  },
};
