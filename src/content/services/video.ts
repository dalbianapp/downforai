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
};
