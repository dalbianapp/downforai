import type { TopServiceContent } from "@/content/top-services/types";

// VIDEO — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start video-2.ts and register it in ./index.ts if it grows.
export const VIDEO: Record<string, TopServiceContent> = {
  runway: {
    slug: "runway",
    providerSummary:
      "Video AI. Gen-4 and Act-Two (character animation); professional video editor.",
    officialStatusUrl: "https://status.runwayml.com",
    docsUrl: "https://docs.runwayml.com",
    pricingUrl: "https://runwayml.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "runwayml.com", description: "", criticality: "critical" },
      { name: "API", description: "", criticality: "high" },
      { name: "Render queue", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Render times mistaken for stuck jobs",
        scope: "local",
        signal: "Job appears stuck but is still processing",
        quickCheck: "Wait several minutes; video renders are not instant",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance; credits reset monthly per tier",
      },
      {
        pattern: "Tool-specific errors",
        scope: "partial",
        signal: "Specific Runway tool fails while others work",
        quickCheck: "Check status.runwayml.com for tool-specific components",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Runway is degraded",
        alternative: "Kling AI, Luma Dream Machine, Pika can reduce downtime for video workflows",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Renders take minutes — don't refresh UI too early. Credits reset monthly per tier.",
    ],
  },
  "kling-ai": {
    slug: "kling-ai",
    providerSummary:
      "Chinese video AI. Strong quality; active feature development (image-to-video, camera controls).",
    docsUrl: "https://docs.kling.ai",
    pricingUrl: "https://klingai.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "klingai.com", description: "", criticality: "critical" },
      { name: "Mobile apps", description: "", criticality: "high" },
      { name: "Kling API", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue times during high demand",
        scope: "partial",
        signal: "Long queue wait times during peak periods",
        quickCheck: "Check klingai.com queue status; try off-peak",
      },
      {
        pattern: "Prompt filter rejections",
        scope: "local",
        signal: "Specific prompts rejected by content filter",
        quickCheck: "Rephrase prompt; check Kling content policy",
      },
      {
        pattern: "Payment method complications in some regions",
        scope: "local",
        signal: "Payment fails for users in certain regions",
        quickCheck: "Check supported payment methods for your region",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kling is degraded",
        alternative: "Runway, Hailuo AI (MiniMax), Luma Dream Machine can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  pika: {
    slug: "pika",
    providerSummary: "Video AI with unique effects (Pikadditions, Pikascenes, lipsync).",
    docsUrl: "https://pika.art/help",
    pricingUrl: "https://pika.art/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "pika.art", description: "", criticality: "critical" },
      { name: "Discord integration", description: "", criticality: "high" },
      { name: "Render queue", description: "", criticality: "medium" },
      { name: "Pikadditions feature", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue delays during peak",
        scope: "partial",
        signal: "Renders take longer than usual during peak hours",
        quickCheck: "Check Pika status; try off-peak",
      },
      {
        pattern: "Specific effect (Pikadditions) failures",
        scope: "partial",
        signal: "Pikadditions fails while other features work",
        quickCheck: "Check Pika status for feature-specific issues",
      },
      {
        pattern: "Audio sync issues",
        scope: "partial",
        signal: "Generated video audio out of sync",
        quickCheck: "Retry generation; check Pika Discord for known issues",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Generic video generation needed",
        alternative: "Runway, Luma, Kling can reduce downtime",
        switchingCost: "low",
      },
      {
        scenario: "Pikadditions-specific effects",
        alternative: "No direct equivalent available",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Pika has unique effects (Pikadditions for inserting objects) with limited direct alternatives — outages on that feature are more impactful",
    ],
  },
  heygen: {
    slug: "heygen",
    providerSummary:
      "AI avatar video generation. Marketing, training, localization use cases.",
    officialStatusUrl: "https://status.heygen.com",
    docsUrl: "https://docs.heygen.com",
    pricingUrl: "https://heygen.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "heygen.com", description: "", criticality: "critical" },
      { name: "API", description: "", criticality: "high" },
      { name: "Render pipeline", description: "", criticality: "medium" },
      { name: "Avatar IV generator", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Long renders (minutes)",
        scope: "local",
        signal: "Avatar video renders take several minutes",
        quickCheck: "Wait for render to complete; check HeyGen status for queue issues",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance in HeyGen dashboard",
      },
      {
        pattern: "Avatar-specific bugs",
        scope: "partial",
        signal: "Specific avatar types fail while others work",
        quickCheck: "Try a different avatar; check HeyGen status",
      },
      {
        pattern: "Voice cloning approval delays",
        scope: "partial",
        signal: "Voice clone pending for extended time",
        quickCheck: "Check HeyGen support; approval may have manual steps",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HeyGen is degraded",
        alternative:
          "Synthesia, D-ID, Colossyan can reduce downtime for avatar video",
        switchingCost: "low",
        note: "Different avatar libraries",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "HeyGen API supports Zapier and similar integrations — monitor render queue depth for early signal",
    ],
  },
  "minimax-hailuo": {
    slug: "minimax-hailuo",
    providerSummary:
      "MiniMax's video AI (Hailuo). Chinese origin; strong realism and motion.",
    docsUrl: "https://www.minimaxi.com/en",
    pricingUrl: "https://hailuoai.video/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "hailuoai.video", description: "", criticality: "critical" },
      { name: "MiniMax API", description: "", criticality: "high" },
      { name: "Generation queue", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue delays during peak (global demand)",
        scope: "partial",
        signal: "Generation queue significantly backed up during peak hours",
        quickCheck: "Wait for queue to clear; try off-peak",
      },
      {
        pattern: "Regional access patterns",
        scope: "partial",
        signal: "Access quality varies by geographic region",
        quickCheck: "Test from different networks; use VPN if needed",
      },
      {
        pattern: "Content policy rejections",
        scope: "local",
        signal: "Specific prompts rejected by content filter",
        quickCheck: "Rephrase prompt; check MiniMax content policy",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hailuo is degraded",
        alternative: "Kling AI, Runway, Pika can reduce downtime for video generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "luma-ai": {
    slug: "luma-ai",
    providerSummary:
      "Luma Labs' 3D capture (NeRF-based scene reconstruction) and Genie 3D object generation. Distinct from Dream Machine (video).",
    docsUrl: "https://docs.lumalabs.ai",
    pricingUrl: "https://lumalabs.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lumalabs.ai", description: "", criticality: "critical" },
      { name: "Capture API", description: "", criticality: "high" },
      { name: "Genie API", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Capture upload failures (large files)",
        scope: "partial",
        signal: "Large NeRF capture uploads fail or time out",
        quickCheck: "Reduce capture size; check upload progress; retry",
      },
      {
        pattern: "Genie generation queue",
        scope: "partial",
        signal: "Genie 3D generation queued for extended time",
        quickCheck: "Wait for queue to clear; try off-peak",
      },
      {
        pattern: "iOS app-specific bugs",
        scope: "local",
        signal: "iOS capture app fails while web interface works",
        quickCheck: "Try web interface; check for iOS app updates",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Luma Genie is degraded",
        alternative:
          "Polycam, Meshy, Tripo3D can reduce downtime for 3D capture/generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Luma Labs ships multiple products under the Luma brand (Dream Machine for video, Genie for 3D, Capture for NeRF) — disambiguate which product users mean",
    ],
  },
  synthesia: {
    slug: "synthesia",
    providerSummary:
      "Enterprise AI avatar video creation. Training videos, marketing, localization. SOC 2 compliant.",
    officialStatusUrl: "https://status.synthesia.io",
    docsUrl: "https://docs.synthesia.io",
    pricingUrl: "https://www.synthesia.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "synthesia.io", description: "Web editor and dashboard", criticality: "critical" },
      { name: "Render Pipeline", description: "Video generation and rendering", criticality: "critical" },
      { name: "Avatar Library", description: "Avatar asset delivery", criticality: "high" },
      { name: "API", description: "Synthesia REST API", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Long render times",
        scope: "global",
        signal: "Videos stuck in rendering for more than 10 minutes",
        quickCheck: "Check status.synthesia.io for render pipeline health",
      },
      {
        pattern: "Avatar-specific glitches",
        scope: "partial",
        signal: "Specific avatar produces artifacts or fails",
        quickCheck: "Switch to a different avatar to isolate the issue",
      },
      {
        pattern: "Voice cloning delays",
        scope: "global",
        signal: "Custom voice generation queued",
        quickCheck: "Use a standard voice as fallback while custom voice processes",
      },
      {
        pattern: "Enterprise SSO issues",
        scope: "local",
        signal: "Login fails for enterprise users via SSO",
        quickCheck: "Check with IT; try direct email login as fallback",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Synthesia is degraded",
        alternative:
          "HeyGen, D-ID, or Colossyan can reduce downtime for avatar video (different avatar libraries)",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  capcut: {
    slug: "capcut",
    providerSummary:
      "ByteDance's video editor with AI features (auto-captions, background removal, AI effects, text-to-video). Massive mobile user base.",
    docsUrl: "https://www.capcut.com/help",
    pricingUrl: "https://www.capcut.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "capcut.com", description: "Web editor", criticality: "critical" },
      { name: "Mobile Apps", description: "iOS and Android apps", criticality: "critical" },
      { name: "Desktop App", description: "Mac and Windows desktop app", criticality: "high" },
      { name: "AI Features Backend", description: "Auto-caption, background removal, effects", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Export failures on large projects",
        scope: "global",
        signal: "Export hangs or produces corrupted files",
        quickCheck: "Try lower resolution export first; check render server status",
      },
      {
        pattern: "AI caption sync issues",
        scope: "global",
        signal: "Auto-captions out of sync with audio",
        quickCheck: "Regenerate captions; check AI feature backend status",
      },
      {
        pattern: "Cloud save delays",
        scope: "global",
        signal: "Projects not saving or syncing",
        quickCheck: "Save locally; check cloud sync status",
      },
      {
        pattern: "Mobile app crashes",
        scope: "local",
        signal: "App crashes on specific devices or large projects",
        quickCheck: "Update app; clear cache; try web editor instead",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CapCut is degraded",
        alternative:
          "Descript, Canva Video, or InShot can reduce downtime for video editing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  pixverse: {
    slug: "pixverse",
    providerSummary:
      "Chinese AI video platform. Text/image-to-video generation. Featured in a16z top 100 Gen AI consumer apps.",
    docsUrl: "https://www.pixverse.ai/help",
    pricingUrl: "https://www.pixverse.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "pixverse.ai", description: "Web interface", criticality: "critical" },
      { name: "Generation Queue", description: "Video generation backend", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation queue delays",
        scope: "global",
        signal: "Jobs wait significantly longer than expected",
        quickCheck: "Check queue position in the platform; retry during off-peak",
      },
      {
        pattern: "Content filter rejections",
        scope: "local",
        signal: "Prompt rejected by content moderation",
        quickCheck: "Rephrase prompt; check content policy guidelines",
      },
      {
        pattern: "Regional access limitations",
        scope: "partial",
        signal: "Inconsistent access from certain regions",
        quickCheck: "Test from different network; may have geo-restrictions",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "PixVerse is degraded",
        alternative:
          "Kling AI, Runway, or Pika can reduce downtime for AI video generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  haiper: {
    slug: "haiper",
    providerSummary:
      "Video AI from former DeepMind researchers. High quality, fast generation.",
    docsUrl: "https://haiper.ai/docs",
    pricingUrl: "https://haiper.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "haiper.ai", description: "Web interface", criticality: "critical" },
      { name: "Generation Queue", description: "Video generation pipeline", criticality: "critical" },
      { name: "API", description: "Developer API", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation queue during peak hours",
        scope: "global",
        signal: "Jobs wait unusually long",
        quickCheck: "Retry off-peak; check Haiper announcements for capacity issues",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "User runs out of generation credits",
        quickCheck: "Check credit balance; upgrade plan or wait for reset",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Haiper is degraded",
        alternative:
          "Runway, Kling, or Pika can reduce downtime for AI video generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  veed: {
    slug: "veed",
    providerSummary:
      "Online video editor with AI features (auto-subtitles, background removal, AI avatars, eye contact correction).",
    officialStatusUrl: "https://status.veed.io",
    docsUrl: "https://help.veed.io",
    pricingUrl: "https://www.veed.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "veed.io", description: "Web editor", criticality: "critical" },
      { name: "Render Pipeline", description: "Video rendering and export", criticality: "critical" },
      { name: "Subtitle Engine", description: "Auto-subtitle generation", criticality: "high" },
      { name: "AI Feature Backends", description: "Avatar, eye contact, background removal", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Render timeouts on long videos",
        scope: "global",
        signal: "Export hangs or fails on videos over 30 minutes",
        quickCheck: "Check status.veed.io; export in shorter segments",
      },
      {
        pattern: "Subtitle accuracy issues",
        scope: "global",
        signal: "Auto-generated subtitles are inaccurate",
        quickCheck: "Not always an outage — try re-generating; use manual correction",
      },
      {
        pattern: "Export failures",
        scope: "global",
        signal: "Export starts but produces corrupted or empty file",
        quickCheck: "Check render pipeline status; retry with lower resolution",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "VEED is degraded",
        alternative:
          "Descript, Kapwing, or CapCut can reduce downtime for video editing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "descript-video": {
    slug: "descript-video",
    providerSummary:
      "Descript's video-specific features. Screen recording, AI editing, clip generation. Shares infrastructure with main Descript.",
    officialStatusUrl: "https://status.descript.com",
    docsUrl: "https://help.descript.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Descript Video Editor", description: "Video editing and recording (shared with Descript)", criticality: "critical" },
      { name: "Screen Recording Backend", description: "Descript screen recorder", criticality: "high" },
      { name: "Clip Generation", description: "AI clip creation from long-form video", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Video export failures",
        scope: "global",
        signal: "Video export hangs or produces corrupted output",
        quickCheck: "Check status.descript.com — shared with main Descript platform",
      },
      {
        pattern: "Screen recording fails to upload",
        scope: "global",
        signal: "Local recording saved but cloud upload fails",
        quickCheck: "Keep local recording; retry upload when service recovers",
      },
      {
        pattern: "Clip generation errors",
        scope: "global",
        signal: "AI clip selection or highlight generation fails",
        quickCheck: "Retry; manually select clips as fallback",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Descript Video is degraded",
        alternative:
          "Loom (screen recording), Kapwing (editing), or CapCut can reduce downtime for specific workflows",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Descript and Descript Video share the same backend — check status.descript.com for both products.",
    ],
  },
  animatediff: {
    slug: "animatediff",
    providerSummary:
      "AnimateDiff is an open-source motion module that turns Stable Diffusion image models into short-video generators, used inside ComfyUI, AUTOMATIC1111 and similar local tools. It is code and weights, not a service: the project page is static and every failure is local.",
    docsUrl: "https://github.com/guoyww/AnimateDiff",
    communityLinks: [
      { type: "github", url: "https://github.com/guoyww/AnimateDiff", label: "guoyww/AnimateDiff", verified: true },
    ],
    monitoredSurfaces: [
      { name: "animatediff.github.io", description: "Project page", criticality: "low" },
      { name: "Local pipelines", description: "ComfyUI / A1111 integrations", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Motion module incompatible with the base model",
        scope: "local",
        signal: "Errors or garbled output when pairing a module with the wrong SD version",
        quickCheck: "Match the module (SD1.5 vs SDXL) to the checkpoint and update the extension",
      },
      {
        pattern: "Out of VRAM on longer clips",
        scope: "local",
        signal: "Generation crashes past a certain frame count or resolution",
        quickCheck: "Reduce frames and resolution or enable low-VRAM options",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need hosted short-video generation instead",
        alternative: "Kling AI, Pika or Luma Dream Machine (monitored on DownForAI) generate clips without local setup",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Stable Diffusion checkpoints", "ComfyUI / A1111"],
    operatorNotes: [
      "DownForAI probes a static GitHub Pages site; it reflects nothing about local pipelines.",
    ],
  },
  "animoto-ai": {
    slug: "animoto-ai",
    providerSummary:
      "Animoto is a web slideshow and marketing-video maker with AI-assisted templates and scripts, rendering videos in the cloud on subscription plans. The editor is browser-based; rendering and export depend on Animoto's backend.",
    docsUrl: "https://help.animoto.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "animoto.com editor", description: "Web app", criticality: "critical" },
      { name: "Rendering / export", description: "Cloud video production", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Videos stuck producing",
        scope: "partial",
        signal: "Exports stay 'producing' far longer than usual across projects",
        quickCheck: "Wait; the render queue backs up at peak — retry the export once it clears",
      },
      {
        pattern: "Media uploads failing",
        scope: "local",
        signal: "Photos or clips fail to upload while the editor works",
        quickCheck: "Check file formats and size; retry on another network",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Animoto is down",
        alternative: "FlexClip AI, InVideo or Wave.video AI (monitored on DownForAI) offer template-based video creation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "captions-ai": {
    slug: "captions-ai",
    providerSummary:
      "Captions is a mobile and desktop app for talking videos: automatic captions, AI dubbing, eye contact correction and an AI creator, with processing on Captions' servers and a subscription. Each AI feature is a separate processing job.",
    docsUrl: "https://help.captions.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Captions apps (iOS, desktop, web)", description: "Clients", criticality: "critical" },
      { name: "Processing backend", description: "Captioning, dubbing, generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Processing stuck after upload",
        scope: "partial",
        signal: "Captions or dubbing never complete for any video",
        quickCheck: "Try a short clip; a universal stall is backend capacity",
      },
      {
        pattern: "One AI feature fails while captions work",
        scope: "partial",
        signal: "Dubbing or eye contact errors; transcription succeeds",
        quickCheck: "Each feature runs on its own pipeline; retry the failing one later",
      },
      {
        pattern: "Subscription not recognised",
        scope: "local",
        signal: "Pro features locked after purchase or on a new device",
        quickCheck: "Use 'restore purchases' with the same store account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Captions is down",
        alternative: "VEED, Descript Video or CapCut (monitored on DownForAI) offer auto-captions and AI dubbing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store billing"],
    operatorNotes: [],
  },
  cogvideo: {
    slug: "cogvideo",
    providerSummary:
      "CogVideo / CogVideoX are open text-to-video models from Zhipu (THUDM), released on GitHub and Hugging Face and served in Zhipu's Qingying product and API. For most users it is weights to run locally or on a provider, not a hosted service.",
    docsUrl: "https://github.com/THUDM/CogVideo",
    communityLinks: [
      { type: "github", url: "https://github.com/THUDM/CogVideo", label: "THUDM/CogVideo", verified: true },
    ],
    monitoredSurfaces: [
      { name: "GitHub repository", description: "Code and releases", criticality: "low" },
      { name: "Hugging Face weights", description: "Model files", criticality: "medium" },
      { name: "Zhipu hosted product / API", description: "Qingying and the API", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Local run exceeds GPU memory",
        scope: "local",
        signal: "Generation fails to allocate memory at the default resolution",
        quickCheck: "Enable CPU offload or use the smaller model variant",
      },
      {
        pattern: "Hosted API quota or region errors",
        scope: "local",
        signal: "Zhipu's API refuses requests for your account or from your region",
        quickCheck: "Check the account's balance and regional availability",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need hosted video generation",
        alternative: "Kling AI, MiniMax Hailuo or Vidu (monitored on DownForAI) are hosted Chinese video generators",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub", "Zhipu AI platform"],
    operatorNotes: [
      "DownForAI probes the GitHub page; it does not reflect any inference capacity.",
    ],
  },
  colossyan: {
    slug: "colossyan",
    providerSummary:
      "Colossyan generates presenter-style videos with AI actors from scripts or documents, aimed at corporate training, on plans with monthly video minutes. Videos are rendered in the cloud, so the render queue is the usual bottleneck.",
    docsUrl: "https://help.colossyan.com",
    pricingUrl: "https://www.colossyan.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.colossyan.com", description: "Editor", criticality: "critical" },
      { name: "Render queue", description: "Avatar video generation", criticality: "critical" },
      { name: "Voice / avatar assets", description: "Speech and presenter models", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Videos stuck rendering",
        scope: "partial",
        signal: "Generations stay in progress far beyond the estimate for every project",
        quickCheck: "Wait; renders queue behind other users — do not re-submit duplicates",
      },
      {
        pattern: "Voice generation fails for a language or voice",
        scope: "partial",
        signal: "One voice errors while others render",
        quickCheck: "Switch voice; the failure is the speech provider for that voice",
      },
      {
        pattern: "Monthly minutes exhausted",
        scope: "local",
        signal: "Rendering refused with a minutes message for your workspace",
        quickCheck: "Check the plan usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Colossyan is down",
        alternative: "Synthesia, HeyGen or Elai.io (monitored on DownForAI) generate comparable avatar videos",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party speech providers"],
    operatorNotes: [],
  },
  "deepbrain-ai": {
    slug: "deepbrain-ai",
    providerSummary:
      "DeepBrain AI's product, now branded AI Studios (aistudios.com), turns scripts into avatar-presenter videos and dubs existing videos, on plans with monthly minutes. deepbrain.io redirects to the new brand; rendering runs in the cloud.",
    docsUrl: "https://help.deepbrain.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "aistudios.com editor", description: "Web app", criticality: "critical" },
      { name: "Render queue", description: "Avatar video generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Exports stuck in the queue",
        scope: "partial",
        signal: "Videos stay 'generating' for everyone",
        quickCheck: "Wait; the queue clears after peaks — avoid duplicate submissions",
      },
      {
        pattern: "Minutes or credits exhausted",
        scope: "local",
        signal: "Generation refused with a usage message for your account",
        quickCheck: "Check plan usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AI Studios is down",
        alternative: "HeyGen, Synthesia or Colossyan (monitored on DownForAI) are comparable avatar platforms",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "deepbrain.io redirects to aistudios.com; DownForAI's probe follows the redirect.",
    ],
  },
  domoai: {
    slug: "domoai",
    providerSummary:
      "DomoAI generates and restyles videos (video-to-anime, image-to-video) through a web app and a Discord bot, on credit-based plans. Generation is queued on shared GPUs, and Discord adds its own failure modes.",
    docsUrl: "https://domoai.app",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "domoai.app web app", description: "Generator", criticality: "critical" },
      { name: "Discord bot", description: "Alternative interface", criticality: "high" },
      { name: "GPU queue", description: "Video renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Jobs queued for a long time",
        scope: "partial",
        signal: "Renders wait far beyond the estimate across users",
        quickCheck: "Try a shorter clip; a universal wait is GPU capacity",
      },
      {
        pattern: "Discord bot not responding while the web app works",
        scope: "partial",
        signal: "Commands in Discord get no reply; the web app generates",
        quickCheck: "Use the web app; check Discord's own status for a platform incident",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "DomoAI is down",
        alternative: "Kaiber, Viggle or Pika (monitored on DownForAI) cover video restyling and animation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Discord for the bot interface"],
    operatorNotes: [],
  },
  "elai-io": {
    slug: "elai-io",
    providerSummary:
      "Elai.io creates presenter videos with digital avatars from text, documents or URLs, with an API, on plans with monthly minutes. Rendering runs in the cloud; the help centre was unreachable when this entry was written.",
    docsUrl: "https://elai.io",
    pricingUrl: "https://elai.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.elai.io", description: "Editor", criticality: "critical" },
      { name: "Render queue", description: "Avatar video generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck or failing",
        scope: "partial",
        signal: "Videos stay in progress or error for every project",
        quickCheck: "Retry a one-scene video; a universal failure is the render backend",
      },
      {
        pattern: "Minutes exhausted",
        scope: "local",
        signal: "Rendering refused with a minutes message for your account",
        quickCheck: "Check the plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Elai.io is down",
        alternative: "Synthesia, HeyGen or Vidnoz (monitored on DownForAI) generate comparable avatar videos",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "filmora-ai": {
    slug: "filmora-ai",
    providerSummary:
      "Filmora is Wondershare's desktop and mobile video editor with AI features — AI copilot, text-to-video, smart cutout, AI music — billed by subscription plus AI credits. Editing runs locally; AI features and licence checks call Wondershare's servers.",
    docsUrl: "https://filmora.wondershare.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Filmora desktop / mobile", description: "Local editing", criticality: "high" },
      { name: "Wondershare account / licence", description: "Activation", criticality: "critical" },
      { name: "AI features backend", description: "Cloud-assisted tools", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI tools failing while editing works",
        scope: "partial",
        signal: "Text-to-video or AI copilot error; timeline editing and export work",
        quickCheck: "Retry later; AI features depend on Wondershare's servers",
      },
      {
        pattern: "AI credits exhausted",
        scope: "local",
        signal: "AI features refused with a credit message for your account",
        quickCheck: "Check the AI credit balance in the account",
      },
      {
        pattern: "Sign-in or activation failing",
        scope: "local",
        signal: "The app cannot verify the subscription",
        quickCheck: "Sign out and in with the Wondershare ID; check the account status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Filmora AI features are down",
        alternative: "CapCut or VEED (monitored on DownForAI) offer AI-assisted editing; Filmora's manual editing keeps working",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "flexclip-ai": {
    slug: "flexclip-ai",
    providerSummary:
      "FlexClip is an online video maker with templates and AI tools (text-to-video, AI script, auto subtitles), rendering exports in the cloud on freemium plans. The browser editor works independently of the AI tools.",
    docsUrl: "https://help.flexclip.com",
    pricingUrl: "https://www.flexclip.com/pricing.html",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "flexclip.com editor", description: "Web app", criticality: "critical" },
      { name: "Export / render", description: "Cloud rendering", criticality: "critical" },
      { name: "AI tools backend", description: "Generation features", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Exports stuck or failing",
        scope: "partial",
        signal: "Videos never finish rendering across projects",
        quickCheck: "Try a short export at lower resolution; a universal failure is the render backend",
      },
      {
        pattern: "AI tools failing while editing works",
        scope: "partial",
        signal: "Text-to-video or AI subtitles error; manual editing and export work",
        quickCheck: "Retry later; the AI backend is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "FlexClip is down",
        alternative: "InVideo, Animoto AI or Wave.video AI (monitored on DownForAI) offer template-based video creation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  fliki: {
    slug: "fliki",
    providerSummary:
      "Fliki turns text into videos with AI voiceovers, stock media and avatars, on credit-based plans, with everything rendered in the cloud. Voice synthesis and video rendering are separate steps that can fail independently.",
    docsUrl: "https://fliki.ai",
    pricingUrl: "https://fliki.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.fliki.ai", description: "Editor", criticality: "critical" },
      { name: "Voice synthesis", description: "TTS generation", criticality: "high" },
      { name: "Render queue", description: "Video export", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Voiceover fails while the video renders",
        scope: "partial",
        signal: "Scenes export silent or the voice step errors",
        quickCheck: "Switch voice; a single-voice failure is the speech provider",
      },
      {
        pattern: "Exports stuck",
        scope: "partial",
        signal: "Renders stay in progress across projects",
        quickCheck: "Wait; the queue clears after peaks",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fliki is down",
        alternative: "Pictory, InVideo or Lumen5 (monitored on DownForAI) create text-to-video with voiceover",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party speech providers"],
    operatorNotes: [],
  },
  genmo: {
    slug: "genmo",
    providerSummary:
      "Genmo develops the open Mochi video model and runs a hosted playground for it, with the weights published on GitHub and Hugging Face. Hosted generation is queued on shared GPUs; the open weights need substantial hardware to run locally.",
    docsUrl: "https://www.genmo.ai",
    communityLinks: [
      { type: "github", url: "https://github.com/genmoai/mochi", label: "genmoai/mochi", verified: true },
    ],
    monitoredSurfaces: [
      { name: "genmo.ai playground", description: "Hosted generation", criticality: "critical" },
      { name: "Open weights", description: "Mochi on Hugging Face", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Playground queue very long",
        scope: "partial",
        signal: "Generations wait far beyond the estimate for everyone",
        quickCheck: "Retry off-peak; the hosted playground has limited capacity",
      },
      {
        pattern: "Local Mochi run exceeds GPU memory",
        scope: "local",
        signal: "The model fails to load on consumer GPUs",
        quickCheck: "Mochi needs multi-GPU or heavy quantisation; use a provider that hosts it",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Genmo is down",
        alternative: "Luma Dream Machine, Pika or Kling AI (monitored on DownForAI) offer hosted text-to-video",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face hub"],
    operatorNotes: [],
  },
  "google-veo": {
    slug: "google-veo",
    providerSummary:
      "Veo is Google DeepMind's video-generation model, reachable through the Gemini app, Flow (Google's filmmaking tool), YouTube Shorts and the Gemini / Vertex AI APIs. Each surface has its own quota and rollout, so 'Veo is down' usually means one of them.",
    docsUrl: "https://deepmind.google/models/veo/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Gemini app video generation", description: "Consumer surface", criticality: "critical" },
      { name: "Flow", description: "Creator tool", criticality: "high" },
      { name: "Gemini API / Vertex AI", description: "Developer access", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Daily video limit reached in the Gemini app",
        scope: "local",
        signal: "Gemini refuses new videos with a limit message; text works",
        quickCheck: "Plans cap daily Veo generations; wait for the reset",
      },
      {
        pattern: "Flow credits exhausted or generations queued",
        scope: "local",
        signal: "Flow shows insufficient credits or long waits",
        quickCheck: "Check the AI credits balance on the plan; queues lengthen at peak",
      },
      {
        pattern: "API returns quota or region errors",
        scope: "local",
        signal: "Vertex or Gemini API calls fail with quota or unsupported-region messages",
        quickCheck: "Check the project's quota and regional availability for the Veo model",
      },
      {
        pattern: "Feature not available in your country",
        scope: "local",
        signal: "Video options are absent from Gemini or Flow",
        quickCheck: "Veo rolls out by region; this is availability, not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Veo is unavailable",
        alternative: "OpenAI Sora, Runway or Kling AI (monitored on DownForAI) cover text-to-video generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Google Gemini platform", "Google Cloud Vertex AI"],
    operatorNotes: [
      "DownForAI probes the DeepMind model page; incidents are visible in the Gemini or Google Cloud status pages.",
    ],
  },
  "hedra-video": {
    slug: "hedra-video",
    providerSummary:
      "Hedra generates expressive talking-character videos from an image and audio or text (Character-3 model), through a web app and an API, on credit-based plans. Renders are queued GPU jobs, typically a few minutes each.",
    docsUrl: "https://www.hedra.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "hedra.com web app", description: "Studio", criticality: "critical" },
      { name: "Render queue", description: "Character video generation", criticality: "critical" },
      { name: "Hedra API", description: "Programmatic access", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders queued far longer than usual",
        scope: "partial",
        signal: "Jobs stay in queue for everyone",
        quickCheck: "Try a shorter clip; a universal wait is GPU capacity",
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
        scenario: "Hedra is down",
        alternative: "HeyGen or Tavus (monitored on DownForAI) produce talking-avatar videos",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  hotshot: {
    slug: "hotshot",
    providerSummary:
      "Hotshot is a web platform for generating short AI video clips and GIFs from text, on free and paid tiers. Generation runs on Hotshot's own models and GPUs.",
    docsUrl: "https://hotshot.co",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "hotshot.co web app", description: "Generator", criticality: "critical" },
      { name: "GPU queue", description: "Clip generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Clips never finish generating",
        scope: "partial",
        signal: "Jobs remain pending for everyone",
        quickCheck: "Retry later; a universal stall is backend capacity",
      },
      {
        pattern: "Free limit reached",
        scope: "local",
        signal: "Generation refused with an upgrade prompt for your account",
        quickCheck: "Wait for the reset; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Hotshot is down",
        alternative: "Pika, Luma Dream Machine or Kling AI (monitored on DownForAI) generate short clips",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  invideo: {
    slug: "invideo",
    providerSummary:
      "InVideo is an online video platform whose AI product generates full videos from prompts (script, stock footage, voiceover, avatars), alongside a template editor, on plans with monthly AI minutes. Generation and export are cloud jobs.",
    docsUrl: "https://help.invideo.io",
    pricingUrl: "https://invideo.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ai.invideo.io", description: "AI video generator", criticality: "critical" },
      { name: "Render / export", description: "Cloud rendering", criticality: "critical" },
      { name: "Stock media and voices", description: "Third-party assets", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "AI generation stuck at scripting or rendering",
        scope: "partial",
        signal: "Projects stay 'generating' for everyone",
        quickCheck: "Retry a short prompt; a universal stall is backend capacity",
      },
      {
        pattern: "Export fails or produces a watermark unexpectedly",
        scope: "local",
        signal: "Exports error or plan features missing after payment",
        quickCheck: "Check the plan status and AI minutes in the account",
      },
      {
        pattern: "Voiceover or stock footage missing in the output",
        scope: "partial",
        signal: "Videos render silent or with placeholder media",
        quickCheck: "Regenerate the affected scenes; asset providers fail independently",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "InVideo is down",
        alternative: "Pictory, Fliki or Lumen5 (monitored on DownForAI) generate videos from text",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Stock media and speech providers"],
    operatorNotes: [],
  },
  "jimeng-ai": {
    slug: "jimeng-ai",
    providerSummary:
      "Jimeng is ByteDance's Chinese image and video generation platform (the domestic counterpart of Dreamina), attached to the Jianying (CapCut China) ecosystem with daily credits. Accounts are China-centric, which explains most reports from abroad.",
    docsUrl: "https://jimeng.jianying.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "jimeng.jianying.com", description: "Web app", criticality: "critical" },
      { name: "Generation queue", description: "Image and video renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Login requires a Chinese account",
        scope: "local",
        signal: "Sign-up refuses foreign phone numbers",
        quickCheck: "Use Dreamina, the international version, instead",
      },
      {
        pattern: "Video generations queued at peak",
        scope: "partial",
        signal: "Video tasks wait far longer than images",
        quickCheck: "Retry later; video runs on a separate queue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Jimeng is unavailable",
        alternative: "Dreamina, Kling AI or Vidu (monitored on DownForAI) offer comparable generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["ByteDance / Jianying accounts"],
    operatorNotes: [],
  },
  kaiber: {
    slug: "kaiber",
    providerSummary:
      "Kaiber is a creative video platform (Superstudio) for generating and transforming videos and music visuals with multiple models, on credit-based plans. Generation is queued on shared GPUs.",
    docsUrl: "https://helpcenter.kaiber.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "kaiber.ai web app", description: "Superstudio", criticality: "critical" },
      { name: "GPU queue", description: "Video renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck in the queue",
        scope: "partial",
        signal: "Jobs remain queued for everyone",
        quickCheck: "Try a shorter clip; a universal wait is GPU capacity",
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
        scenario: "Kaiber is down",
        alternative: "DomoAI, Pika or Runway (monitored on DownForAI) cover video generation and transformation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "kapwing-ai": {
    slug: "kapwing-ai",
    providerSummary:
      "Kapwing is a browser video editor with AI tools — auto subtitles, dubbing, text-to-video, smart cut — on freemium plans, exporting through Kapwing's cloud. The editor and the AI tools rely on different backends.",
    docsUrl: "https://www.kapwing.com",
    pricingUrl: "https://www.kapwing.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "kapwing.com editor", description: "Web app", criticality: "critical" },
      { name: "Export / render", description: "Cloud rendering", criticality: "critical" },
      { name: "AI tools backend", description: "Subtitles, dubbing, generation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Exports stuck processing",
        scope: "partial",
        signal: "Renders never complete across projects",
        quickCheck: "Try a short export; a universal stall is the render backend",
      },
      {
        pattern: "AI subtitles or dubbing failing while editing works",
        scope: "partial",
        signal: "AI tools error; timeline editing and manual export work",
        quickCheck: "Retry later; the AI backend is separate",
      },
      {
        pattern: "Upload or import from a URL failing",
        scope: "local",
        signal: "Importing from YouTube or other links errors",
        quickCheck: "Download and upload the file directly; link import depends on the source site",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kapwing is down",
        alternative: "VEED, CapCut or Descript Video (monitored on DownForAI) offer online AI editing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "help.kapwing.com answered 404 when this entry was written; the docs link points to the main site.",
    ],
  },
  "ltx-studio": {
    slug: "ltx-studio",
    providerSummary:
      "LTX Studio (Lightricks) is an AI filmmaking platform: script to storyboard to generated shots, with the open LTX-Video model behind it, on plans with compute credits. ltx.studio now redirects to ltx.io; generation is queued on shared GPUs.",
    docsUrl: "https://ltx.studio",
    pricingUrl: "https://ltx.io/studio/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "ltx.io/studio", description: "Web app", criticality: "critical" },
      { name: "Generation queue", description: "Shot rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Shots stuck generating",
        scope: "partial",
        signal: "Scenes stay in progress for everyone",
        quickCheck: "Retry a single shot; a universal stall is GPU capacity",
      },
      {
        pattern: "Compute credits exhausted",
        scope: "local",
        signal: "Generation refused with a credit message for your account",
        quickCheck: "Check the plan's compute balance",
      },
      {
        pattern: "Project fails to load after the domain change",
        scope: "local",
        signal: "Old bookmarks or embeds error",
        quickCheck: "Open the project from ltx.io/studio; the domain moved",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LTX Studio is down",
        alternative: "Runway, Kling AI or Morph Studio (monitored on DownForAI) support multi-shot AI video creation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "ltx.studio redirects to ltx.io/studio; DownForAI's probe follows the redirect.",
    ],
  },
  lumen5: {
    slug: "lumen5",
    providerSummary:
      "Lumen5 converts articles and scripts into marketing videos with templates, stock media and AI voiceover, rendering in the cloud on subscription plans. Rendering and media fetching are the parts that fail.",
    docsUrl: "https://help.lumen5.com",
    pricingUrl: "https://lumen5.com/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lumen5.com editor", description: "Web app", criticality: "critical" },
      { name: "Render queue", description: "Video export", criticality: "critical" },
      { name: "Stock media library", description: "Third-party assets", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck or failing",
        scope: "partial",
        signal: "Exports never complete across projects",
        quickCheck: "Try a short video; a universal failure is the render backend",
      },
      {
        pattern: "Stock media not loading",
        scope: "partial",
        signal: "Media search returns nothing while editing works",
        quickCheck: "Upload your own media; the stock provider is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Lumen5 is down",
        alternative: "Pictory, InVideo or FlexClip AI (monitored on DownForAI) turn text into marketing videos",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Stock media providers"],
    operatorNotes: [],
  },
  "magic-hour": {
    slug: "magic-hour",
    providerSummary:
      "Magic Hour is an all-in-one AI video suite (lip sync, face swap, video-to-video, text-to-video, image generation) that routes to several models, with a web app and an API on credit-based plans. Each tool is a separate model job.",
    docsUrl: "https://docs.magichour.ai",
    pricingUrl: "https://magichour.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "magichour.ai web app", description: "Tools", criticality: "critical" },
      { name: "Magic Hour API", description: "Programmatic access", criticality: "high" },
      { name: "Per-tool model jobs", description: "Lip sync, face swap, generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One tool fails while others render",
        scope: "partial",
        signal: "For example lip sync errors but text-to-video works",
        quickCheck: "Try another tool; a single-tool failure is that model's backend",
      },
      {
        pattern: "Jobs queued for a long time",
        scope: "partial",
        signal: "Renders wait far beyond the estimate across tools",
        quickCheck: "Try a shorter clip; a universal wait is GPU capacity",
      },
      {
        pattern: "API 429 or credit errors",
        scope: "local",
        signal: "Programmatic calls rejected for your account",
        quickCheck: "Check the credit balance and limits in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Magic Hour is down",
        alternative: "Runway, Kling AI or HeyGen (monitored on DownForAI) cover generation and lip sync",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party video models"],
    operatorNotes: [],
  },
  "morph-studio": {
    slug: "morph-studio",
    providerSummary:
      "Morph Studio is a web platform for AI-generated cinematic videos with a storyboard-style workflow and several models, on credit-based plans. Generation runs on shared GPU queues.",
    docsUrl: "https://www.morphstudio.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "morphstudio.com web app", description: "Storyboard and generation", criticality: "critical" },
      { name: "GPU queue", description: "Shot rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Shots stuck generating",
        scope: "partial",
        signal: "Jobs stay in progress for everyone",
        quickCheck: "Retry a single shot; a universal stall is capacity",
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
        scenario: "Morph Studio is down",
        alternative: "LTX Studio, Runway or Kling AI (monitored on DownForAI) support shot-by-shot AI video",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  munch: {
    slug: "munch",
    providerSummary:
      "Munch repurposes long videos into short social clips with AI (highlights, captions, trend matching); getmunch.com now redirects to munchstudio.com. Processing long uploads is the main job and the main failure point.",
    docsUrl: "https://www.getmunch.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "munchstudio.com web app", description: "Upload and clips", criticality: "critical" },
      { name: "Processing pipeline", description: "Long-video analysis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Uploads stuck processing",
        scope: "partial",
        signal: "Videos never produce clips across projects",
        quickCheck: "Try a short video; a universal stall is the pipeline",
      },
      {
        pattern: "Import from a link failing",
        scope: "local",
        signal: "YouTube or other links fail to import",
        quickCheck: "Upload the file directly; link fetching depends on the source site",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Munch is down",
        alternative: "Opus Clip or Vidnoz (monitored on DownForAI) cover video repurposing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "getmunch.com redirects to munchstudio.com; DownForAI's probe follows the redirect.",
    ],
  },
  "opus-clip": {
    slug: "opus-clip",
    providerSummary:
      "OpusClip turns long videos into short viral clips with AI curation, captions and reframing, from uploads or YouTube links, on credit-based plans. Its jobs are long processing runs, and link imports depend on the source platform.",
    docsUrl: "https://help.opus.pro",
    pricingUrl: "https://www.opus.pro/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "clip.opus.pro web app", description: "Projects and clips", criticality: "critical" },
      { name: "Processing pipeline", description: "Clip generation", criticality: "critical" },
      { name: "Link import", description: "YouTube and other sources", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "YouTube link import fails",
        scope: "partial",
        signal: "Links error at import while file uploads process",
        quickCheck: "Download and upload the file; YouTube changes break link fetching periodically",
      },
      {
        pattern: "Projects stuck processing",
        scope: "partial",
        signal: "Clips never appear for any project",
        quickCheck: "Try a short file; a universal stall is the pipeline",
      },
      {
        pattern: "Credits consumed but clips missing",
        scope: "local",
        signal: "The balance drops after a failed project",
        quickCheck: "Check the project again after refresh; contact support with the project id if empty",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "OpusClip is down",
        alternative: "Munch or Vidnoz (monitored on DownForAI) offer clip repurposing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["YouTube for link imports"],
    operatorNotes: [],
  },
  oxolo: {
    slug: "oxolo",
    providerSummary:
      "Oxolo generates e-commerce product videos from a product URL with AI avatars and voiceovers, on subscription plans, rendering in the cloud. Its pipeline scrapes the product page first, then renders the video.",
    docsUrl: "https://www.oxolo.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "oxolo.com web app", description: "Projects", criticality: "critical" },
      { name: "Render pipeline", description: "Avatar video generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Product URL fails to import",
        scope: "local",
        signal: "The page cannot be parsed for a specific store",
        quickCheck: "Enter product details manually; scraping depends on the store's site",
      },
      {
        pattern: "Renders stuck",
        scope: "partial",
        signal: "Videos stay in progress for everyone",
        quickCheck: "Wait; renders queue at peak",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Oxolo is down",
        alternative: "HeyGen, Synthesia or Vidnoz (monitored on DownForAI) create avatar product videos",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  pictory: {
    slug: "pictory",
    providerSummary:
      "Pictory turns scripts, articles and long videos into short videos with stock footage, captions and AI voices, rendering in the cloud on subscription plans. Rendering and voice synthesis are separate steps.",
    docsUrl: "https://help.pictory.ai",
    pricingUrl: "https://pictory.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.pictory.ai", description: "Editor", criticality: "critical" },
      { name: "Render queue", description: "Video export", criticality: "critical" },
      { name: "AI voices", description: "Speech synthesis", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Downloads stuck generating",
        scope: "partial",
        signal: "Exports never complete across projects",
        quickCheck: "Try a short project; a universal stall is the render backend",
      },
      {
        pattern: "AI voice fails to generate",
        scope: "partial",
        signal: "Scenes export silent or the voice step errors",
        quickCheck: "Switch voice; a single-voice failure is the speech provider",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Pictory is down",
        alternative: "InVideo, Fliki or Lumen5 (monitored on DownForAI) offer text-to-video with voiceover",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party speech providers", "Stock media providers"],
    operatorNotes: [],
  },
  rizzle: {
    slug: "rizzle",
    providerSummary:
      "Rizzle is a short-form video creation platform for text-to-video and podcast-to-video, rendering in the cloud on subscription plans. It is a small hosted service with one render pipeline.",
    docsUrl: "https://rizzle.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "rizzle.com web app", description: "Editor", criticality: "critical" },
      { name: "Render pipeline", description: "Video generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck or failing",
        scope: "partial",
        signal: "Videos never complete for any project",
        quickCheck: "Retry a short video; a universal failure is the backend",
      },
      {
        pattern: "Podcast import failing",
        scope: "local",
        signal: "RSS or audio imports error",
        quickCheck: "Upload the audio file directly",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Rizzle is down",
        alternative: "Pictory or InVideo (monitored on DownForAI) generate short videos from text",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  shuffll: {
    slug: "shuffll",
    providerSummary:
      "Shuffll produces branded marketing videos with AI scripting and a guided recording studio, rendering in the cloud for business customers. Recording in the browser and rendering are the two failure points.",
    docsUrl: "https://shuffll.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "shuffll.com studio", description: "Web app and recorder", criticality: "critical" },
      { name: "Render pipeline", description: "Video production", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Browser recording not starting",
        scope: "local",
        signal: "Camera or microphone permission errors in the studio",
        quickCheck: "Allow camera and microphone in the browser and reload",
      },
      {
        pattern: "Renders stuck",
        scope: "partial",
        signal: "Videos stay in production for everyone",
        quickCheck: "Wait; renders queue at peak",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Shuffll is down",
        alternative: "Synthesia or Colossyan (monitored on DownForAI) produce branded presenter videos",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  sora: {
    slug: "sora",
    providerSummary:
      "Sora is OpenAI's video-generation product (sora.com and the Sora app) bundled with ChatGPT plans, with per-plan generation limits, moderation and regional restrictions. It runs on OpenAI's platform and is reported on the OpenAI status page.",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://help.openai.com/en/collections/10743746-sora",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sora.com / Sora app", description: "Generation UI", criticality: "critical" },
      { name: "Generation queue", description: "Video rendering", criticality: "critical" },
      { name: "OpenAI account / plan", description: "Entitlements", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations queued for a long time at peak",
        scope: "partial",
        signal: "Videos stay 'queued' or 'generating' well beyond the estimate for everyone",
        quickCheck: "Check status.openai.com; queues lengthen after launches and feature drops",
      },
      {
        pattern: "Plan limit reached",
        scope: "local",
        signal: "New generations refused with a monthly or daily limit message",
        quickCheck: "Plus and Pro plans cap generations; wait for the reset",
      },
      {
        pattern: "Prompt or upload blocked by moderation",
        scope: "local",
        signal: "Requests rejected for people, brands or restricted content",
        quickCheck: "Rephrase or use a different reference; this is policy enforcement",
      },
      {
        pattern: "Not available in your region",
        scope: "local",
        signal: "sora.com shows a regional restriction after login",
        quickCheck: "Sora launched without several regions (parts of Europe); this is availability, not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sora is unavailable",
        alternative: "Google Veo, Runway or Kling AI (monitored on DownForAI) cover text-to-video generation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["OpenAI platform"],
    operatorNotes: [
      "sora.com refuses automated requests (403); DownForAI relies on the OpenAI status page for this service.",
    ],
  },
  "stable-video-diffusion": {
    slug: "stable-video-diffusion",
    providerSummary:
      "Stable Video Diffusion is Stability AI's open image-to-video model, available as weights and through Stability's API and partner platforms. For most users it is run locally or via a host; Stability's API follows the company's status page.",
    officialStatusUrl: "https://status.stability.ai",
    docsUrl: "https://stability.ai/stable-video",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Stability AI API", description: "Hosted image-to-video", criticality: "high" },
      { name: "Open weights", description: "Local runs via ComfyUI and others", criticality: "medium" },
      { name: "stability.ai", description: "Website", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API 5xx or long polling on video jobs",
        scope: "partial",
        signal: "Generation requests fail or results never become ready",
        quickCheck: "Check status.stability.ai; retry with backoff",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "API rejects requests with a balance message",
        quickCheck: "Top up in the Stability account",
      },
      {
        pattern: "Local run out of VRAM",
        scope: "local",
        signal: "The model fails to load or generate on smaller GPUs",
        quickCheck: "Lower frames and resolution; use the smaller SVD variant",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Stable Video Diffusion is unavailable",
        alternative: "Luma Dream Machine, Pika or Kling AI (monitored on DownForAI) offer hosted image-to-video",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hosting providers", "Hugging Face for weights"],
    operatorNotes: [],
  },
  "steve-ai": {
    slug: "steve-ai",
    providerSummary:
      "Steve AI generates animated and live-action-style videos from scripts and prompts for businesses, rendering in the cloud on subscription plans. It is a single hosted pipeline with a browser editor.",
    docsUrl: "https://www.steve.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "steve.ai web app", description: "Editor", criticality: "critical" },
      { name: "Render pipeline", description: "Video generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck or failing",
        scope: "partial",
        signal: "Videos never complete for any project",
        quickCheck: "Retry a short script; a universal failure is the backend",
      },
      {
        pattern: "Plan limits reached",
        scope: "local",
        signal: "Downloads refused with a plan message for your account",
        quickCheck: "Check plan usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Steve AI is down",
        alternative: "InVideo, Pictory or Vidnoz (monitored on DownForAI) generate business videos from text",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  synthesys: {
    slug: "synthesys",
    providerSummary:
      "Synthesys offers AI voiceovers, avatars and video generation in one web platform on subscription plans, rendering in the cloud. Voice and video are separate pipelines and can fail independently.",
    docsUrl: "https://synthesys.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "synthesys.io web app", description: "Studio", criticality: "critical" },
      { name: "Voice synthesis", description: "TTS", criticality: "high" },
      { name: "Video render pipeline", description: "Avatar videos", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Video renders stuck while voices generate",
        scope: "partial",
        signal: "Avatar videos stay in progress; voiceovers download fine",
        quickCheck: "Wait; the video pipeline queues separately",
      },
      {
        pattern: "Plan minutes exhausted",
        scope: "local",
        signal: "Generation refused with a usage message for your account",
        quickCheck: "Check plan usage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Synthesys is down",
        alternative: "Synthesia, HeyGen or Elai.io (monitored on DownForAI) offer avatars and voiceovers",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "tavus-ai": {
    slug: "tavus-ai",
    providerSummary:
      "Tavus provides an API for personalised and conversational video with digital replicas — replica training, video generation and real-time conversational video (CVI). Developers see incidents as API errors or replicas stuck in training.",
    docsUrl: "https://docs.tavus.io",
    pricingUrl: "https://www.tavus.io/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Tavus API", description: "Replicas, videos, conversations", criticality: "critical" },
      { name: "Replica training", description: "Long-running jobs", criticality: "high" },
      { name: "Conversational video (CVI)", description: "Real-time sessions", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Replica training stuck",
        scope: "partial",
        signal: "Replicas stay in training far beyond the usual hours",
        quickCheck: "Wait; training is queued — contact support if it exceeds a day",
      },
      {
        pattern: "Conversation sessions failing to start",
        scope: "partial",
        signal: "CVI sessions error or drop while video generation works",
        quickCheck: "Create a test conversation from the dashboard; real-time runs on a separate service",
      },
      {
        pattern: "API 429 or credit errors",
        scope: "local",
        signal: "Requests rejected with limit or balance messages for your account",
        quickCheck: "Check plan limits and credits in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Tavus is down",
        alternative: "HeyGen or Hedra (monitored on DownForAI) generate avatar videos; real-time conversational video has few substitutes",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "topaz-video": {
    slug: "topaz-video",
    providerSummary:
      "Topaz Video AI is a desktop app (Windows, macOS) for AI upscaling, denoising, frame interpolation and stabilisation, licensed per user; processing runs on the local GPU. Only licence activation and model downloads depend on Topaz's servers.",
    docsUrl: "https://docs.topazlabs.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Topaz Video AI desktop", description: "Local processing", criticality: "high" },
      { name: "Licence and model servers", description: "Activation and downloads", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model download failing on first use of a filter",
        scope: "local",
        signal: "The app stalls downloading models",
        quickCheck: "Check the connection and firewall; downloads resume on restart",
      },
      {
        pattern: "Licence activation failing",
        scope: "local",
        signal: "The app cannot verify the account",
        quickCheck: "Log out and in; offline use works after activation",
      },
      {
        pattern: "Very slow processing or crashes on unsupported GPUs",
        scope: "local",
        signal: "Exports take hours or the app crashes",
        quickCheck: "Update GPU drivers and check the AI processor setting; meet the system requirements",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Topaz Video AI is not working",
        alternative: "Magic Hour or Remini (monitored on DownForAI) offer cloud video upscaling",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  videopoet: {
    slug: "videopoet",
    providerSummary:
      "VideoPoet is a Google Research model for zero-shot video generation presented on a research site; it has no public product, and its ideas fed into Veo. There is nothing for users to be 'down' beyond the research page.",
    docsUrl: "https://sites.research.google/videopoet",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sites.research.google/videopoet", description: "Research page", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Research page unreachable",
        scope: "global",
        signal: "The site times out or errors",
        quickCheck: "No product depends on it",
      },
      {
        pattern: "Looking for a VideoPoet API",
        scope: "local",
        signal: "No endpoint exists",
        quickCheck: "Use Google Veo, the productised successor",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You want Google's video generation",
        alternative: "Google Veo (monitored on DownForAI) is the available product",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Research project only; the DownForAI probe is informational.",
    ],
  },
  vidnoz: {
    slug: "vidnoz",
    providerSummary:
      "Vidnoz is an online AI video platform with avatars, templates, talking photos and voiceovers on freemium plans, rendering in the cloud. Its many tools share one render backend and one credit balance.",
    docsUrl: "https://www.vidnoz.com",
    pricingUrl: "https://www.vidnoz.com/pricing.html",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "vidnoz.com web app", description: "Tools and editor", criticality: "critical" },
      { name: "Render backend", description: "Avatar and tool jobs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck across tools",
        scope: "partial",
        signal: "Avatar videos and talking photos stay in progress for everyone",
        quickCheck: "Try a short job; a universal stall is capacity",
      },
      {
        pattern: "Free credits exhausted",
        scope: "local",
        signal: "Generation refused with a credit message for your account",
        quickCheck: "Credits refill daily on the free tier",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vidnoz is down",
        alternative: "HeyGen, Elai.io or Virbo (Wondershare) (monitored on DownForAI) offer avatar video tools",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  vidu: {
    slug: "vidu",
    providerSummary:
      "Vidu is Shengshu Technology's video-generation platform (text, image and reference-to-video) with international and Chinese versions and an API, on credit-based plans; vidu.studio now redirects to vidu.com. Generation is queued on shared GPUs.",
    docsUrl: "https://www.vidu.studio",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "vidu.com web app", description: "Generator", criticality: "critical" },
      { name: "GPU queue", description: "Video renders", criticality: "critical" },
      { name: "Vidu API", description: "Developer access", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders queued for a long time",
        scope: "partial",
        signal: "Jobs wait far beyond the estimate for everyone",
        quickCheck: "Try a shorter clip; a universal wait is GPU capacity",
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
        scenario: "Vidu is down",
        alternative: "Kling AI, MiniMax Hailuo or Pixverse (monitored on DownForAI) are comparable generators",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "vidu.studio redirects to vidu.com; DownForAI's probe follows the redirect.",
    ],
  },
  viggle: {
    slug: "viggle",
    providerSummary:
      "Viggle animates characters from an image with motion from a video or text prompt, through a web app and a Discord bot, on credit-based plans. Generation is queued on shared GPUs, and Discord adds its own failure modes.",
    docsUrl: "https://viggle.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "viggle.ai web app", description: "Generator", criticality: "critical" },
      { name: "Discord bot", description: "Alternative interface", criticality: "high" },
      { name: "GPU queue", description: "Animation renders", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Jobs queued for a long time",
        scope: "partial",
        signal: "Renders wait far beyond the estimate for everyone",
        quickCheck: "Try a shorter clip; a universal wait is GPU capacity",
      },
      {
        pattern: "Discord bot silent while the web app works",
        scope: "partial",
        signal: "Commands get no reply in Discord; the web app generates",
        quickCheck: "Use the web app; check Discord's own status",
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
        scenario: "Viggle is down",
        alternative: "DomoAI, Kling AI or Hedra (monitored on DownForAI) cover character animation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Discord for the bot interface"],
    operatorNotes: [
      "viggle.ai blocks direct homepage probes, so DownForAI checks robots.txt reachability only.",
    ],
  },
  "wave-video-ai": {
    slug: "wave-video-ai",
    providerSummary:
      "Wave.video is an online video platform (editor, live streaming, hosting) with AI tools for text-to-video and repurposing, on freemium plans. Editing, rendering and streaming are separate services.",
    docsUrl: "https://wave.video",
    pricingUrl: "https://wave.video/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "wave.video editor", description: "Web app", criticality: "critical" },
      { name: "Render / export", description: "Cloud rendering", criticality: "critical" },
      { name: "Live streaming", description: "Multistreaming service", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Exports stuck",
        scope: "partial",
        signal: "Renders never complete across projects",
        quickCheck: "Try a short export; a universal stall is the render backend",
      },
      {
        pattern: "AI text-to-video failing while editing works",
        scope: "partial",
        signal: "AI generation errors; manual editing and export work",
        quickCheck: "Retry later; the AI backend is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Wave.video is down",
        alternative: "FlexClip AI, InVideo or Animoto AI (monitored on DownForAI) offer template-based video creation",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "wonder-share-virbo": {
    slug: "wonder-share-virbo",
    providerSummary:
      "Virbo is Wondershare's AI avatar video generator (web, desktop and mobile) for multilingual spokesperson videos and AI dubbing, on subscription plans with monthly minutes. Rendering runs in Wondershare's cloud.",
    docsUrl: "https://virbo.wondershare.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Virbo web / apps", description: "Clients", criticality: "critical" },
      { name: "Render pipeline", description: "Avatar video generation", criticality: "critical" },
      { name: "Wondershare account", description: "Licence and minutes", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck or failing",
        scope: "partial",
        signal: "Videos stay in progress for everyone",
        quickCheck: "Wait; renders queue at peak",
      },
      {
        pattern: "Minutes exhausted or plan not recognised",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the Wondershare account plan and remaining minutes",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Virbo is down",
        alternative: "HeyGen, Synthesia or Vidnoz (monitored on DownForAI) generate comparable avatar videos",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  zebracat: {
    slug: "zebracat",
    providerSummary:
      "Zebracat generates marketing videos from text with AI scenes, voiceovers and stock or generated footage, on credit-based plans, rendering in the cloud. It is one hosted pipeline behind a browser editor.",
    docsUrl: "https://www.zebracat.ai",
    pricingUrl: "https://www.zebracat.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "zebracat.ai web app", description: "Editor", criticality: "critical" },
      { name: "Render pipeline", description: "Video generation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck or failing",
        scope: "partial",
        signal: "Videos never complete for any project",
        quickCheck: "Retry a short script; a universal failure is the backend",
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
        scenario: "Zebracat is down",
        alternative: "InVideo, Pictory or Fliki (monitored on DownForAI) generate marketing videos from text",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
};
