import type { TopServiceContent } from "@/content/top-services/types";

// THREE_D — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start three-d-2.ts and register it in ./index.ts if it grows.
export const THREE_D: Record<string, TopServiceContent> = {
  tripo3d: {
    slug: "tripo3d",
    providerSummary:
      "Text/image-to-3D model generation. Used in game dev, AR/VR, product design workflows.",
    docsUrl: "https://platform.tripo3d.ai/docs",
    pricingUrl: "https://www.tripo3d.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "tripo3d.ai", description: "", criticality: "critical" },
      { name: "Tripo API", description: "", criticality: "high" },
      { name: "Generation backend", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation queue delays",
        scope: "partial",
        signal: "3D generation takes much longer than typical",
        quickCheck: "Wait several minutes; 3D generation is inherently slow",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance in Tripo3D account",
      },
      {
        pattern: "Specific format export errors",
        scope: "partial",
        signal: "Specific output format fails to export",
        quickCheck: "Try a different output format (GLB, OBJ, FBX)",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Tripo3D is degraded",
        alternative:
          "Meshy, Luma Genie, Rodin (Deemos) can reduce downtime for 3D generation",
        switchingCost: "low",
        note: "Different quality profiles",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "3D generation takes minutes — distinguish queue delay from actual failure before reporting outage",
    ],
  },
  meshy: {
    slug: "meshy",
    providerSummary:
      "Meshy generates 3D models from text or images (with separate texturing and rigging stages) through a web app and an API, on a credit-based plan. Each stage is a queued GPU job, so a model can be created while its texturing or rigging step stalls.",
    docsUrl: "https://docs.meshy.ai",
    pricingUrl: "https://www.meshy.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "meshy.ai web app", description: "Generation workspace", criticality: "critical" },
      { name: "Generation pipeline", description: "Text/image-to-3D, texturing, rigging", criticality: "critical" },
      { name: "Meshy API", description: "Programmatic generation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Jobs stuck at a stage (texturing or refine)",
        scope: "partial",
        signal: "The base mesh appears but the texturing or refine step stays in progress or fails",
        quickCheck: "Retry the stage from the task; if every job stalls at the same stage, that pipeline is degraded",
      },
      {
        pattern: "Long queue times at peak",
        scope: "partial",
        signal: "Tasks wait far beyond the usual estimate before starting",
        quickCheck: "Check the task list for any progress; a universal wait is GPU capacity, not an account issue",
      },
      {
        pattern: "API returns 429 or credit errors",
        scope: "local",
        signal: "Programmatic calls rejected with rate-limit or insufficient-credit responses while the web app works",
        quickCheck: "Check plan limits and the credit balance in the dashboard before treating it as an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Meshy's pipeline is down",
        alternative: "Tripo AI, Rodin (Deemos) or Luma Genie (monitored on DownForAI) generate 3D assets from text or images",
        switchingCost: "medium",
        note: "Output formats and rigging conventions differ between tools",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  alpha3d: {
    slug: "alpha3d",
    providerSummary:
      "Alpha3D converts 2D product images into 3D models for e-commerce and games through a web app and API, on credit-based plans. Generation is a queued job; failures are stuck jobs and credit limits.",
    docsUrl: "https://www.alpha3d.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "alpha3d.io app", description: "Upload and library", criticality: "critical" },
      { name: "Generation queue", description: "2D to 3D jobs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Jobs stuck processing",
        scope: "partial",
        signal: "Uploads never finish for everyone",
        quickCheck: "Try a simple image; a universal stall is the queue",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Alpha3D is down",
        alternative: "Meshy, Tripo AI or Kaedim (monitored on DownForAI) turn images into 3D models",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "anything-world": {
    slug: "anything-world",
    providerSummary:
      "Anything World animates and rigs 3D models with AI for games and creators, through a web platform and Unity/Unreal SDKs; anything.world now redirects to everythinguniver.se. Failures are rigging jobs stuck and SDK calls failing.",
    docsUrl: "https://anything.world",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "anything.world → everythinguniver.se", description: "Web platform", criticality: "critical" },
      { name: "Animation pipeline", description: "Auto-rigging jobs", criticality: "critical" },
      { name: "SDK / API", description: "Unity and Unreal", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Rigging jobs stuck",
        scope: "partial",
        signal: "Models stay processing",
        quickCheck: "Try a simple model; a universal stall is the pipeline",
      },
      {
        pattern: "SDK requests failing",
        scope: "partial",
        signal: "Runtime loads error in the engine",
        quickCheck: "Check the API key; if every call fails, the backend is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Anything World is down",
        alternative: "Kinetix or Krikey AI (monitored on DownForAI) generate character animations",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Unity / Unreal SDKs"],
    operatorNotes: [
      "anything.world redirected to everythinguniver.se when this entry was written; docs.anything.world was unreachable, so the docs link points to the main site.",
    ],
  },
  avaturn: {
    slug: "avaturn",
    providerSummary:
      "Avaturn generates realistic 3D avatars from a selfie, exported to game engines or embedded in apps through an iframe SDK, on free and developer plans. Incidents are avatar generation failing and the embed not loading in customer apps.",
    docsUrl: "https://docs.avaturn.me",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "avaturn.me app", description: "Avatar creation", criticality: "critical" },
      { name: "Generation backend", description: "Selfie to avatar", criticality: "critical" },
      { name: "Embed SDK", description: "Iframe in customer apps", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Avatar generation failing",
        scope: "partial",
        signal: "Selfies process but no avatar appears",
        quickCheck: "Try a clear frontal photo; universal failure is the backend",
      },
      {
        pattern: "Embed blank in customer apps",
        scope: "partial",
        signal: "The iframe does not load",
        quickCheck: "Check the embed origin settings; if every app is blank, the service is down",
      },
      {
        pattern: "Export failing",
        scope: "local",
        signal: "GLB or FBX download errors",
        quickCheck: "Retry a different format",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Avaturn is down",
        alternative: "in3D (monitored on DownForAI) also builds avatars from phone captures",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "backflip-ai": {
    slug: "backflip-ai",
    providerSummary:
      "Backflip generates 3D models from text and images for product design and prototyping through a web app, on credit-based plans. Generation is a queued job; failures are stuck jobs and credit limits.",
    docsUrl: "https://www.backflip.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "backflip.ai app", description: "Generator", criticality: "critical" },
      { name: "Generation queue", description: "Text and image to 3D", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations stuck",
        scope: "partial",
        signal: "Jobs never finish for everyone",
        quickCheck: "Try a simple prompt; a universal stall is the queue",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Backflip is down",
        alternative: "Meshy or Tripo AI (monitored on DownForAI) generate 3D models from prompts",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  cascadeur: {
    slug: "cascadeur",
    providerSummary:
      "Cascadeur is a desktop animation tool (Windows, macOS, Linux) with AI-assisted posing and physics, sold as free and paid licences. Everything runs locally, so the only online dependencies are licence activation and downloads.",
    docsUrl: "https://cascadeur.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "cascadeur.com", description: "Downloads and licences", criticality: "high" },
      { name: "Licence activation", description: "Sign-in from the app", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Licence activation failing",
        scope: "local",
        signal: "The app cannot sign in or validate the plan",
        quickCheck: "Check connectivity; the app itself keeps working offline once activated",
      },
      {
        pattern: "Download or update unavailable",
        scope: "global",
        signal: "Installers do not download",
        quickCheck: "Check DownForAI's probe of the site",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cascadeur is unavailable",
        alternative: "Plask or Krikey AI (monitored on DownForAI) generate animations in the browser; existing Cascadeur installs keep working",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "cascadeur.com/documentation returned 404 when this entry was written; the docs link points to the main site.",
    ],
  },
  get3d: {
    slug: "get3d",
    providerSummary:
      "GET3D is an NVIDIA research model generating textured 3D shapes, published as code on GitHub with a GitHub Pages project site; there is no hosted service. Availability only concerns the project page and repository.",
    docsUrl: "https://nv-tlabs.github.io/GET3D/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "nv-tlabs.github.io/GET3D", description: "Project page", criticality: "medium" },
      { name: "GitHub repository", description: "Code and weights links", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Project page unavailable",
        scope: "global",
        signal: "The page errors",
        quickCheck: "GitHub Pages outage; the repository usually stays reachable",
      },
      {
        pattern: "Local runs failing",
        scope: "local",
        signal: "Training or inference errors on your machine",
        quickCheck: "CUDA and dependency versions; not a service issue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need hosted 3D generation instead of research code",
        alternative: "Meshy or Tripo AI (monitored on DownForAI) offer hosted text-to-3D",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub"],
    operatorNotes: [
      "Research code, not a service: DownForAI monitors the project page only.",
    ],
  },
  "immersity-ai": {
    slug: "immersity-ai",
    providerSummary:
      "Immersity AI (formerly LeiaPix) converts 2D images and videos into 3D and depth-based animations through a web app, on credit-based plans; www.immersity.ai redirects to immersity.ai. Conversion is a queued job; video conversions are the slow, failure-prone part.",
    docsUrl: "https://www.immersity.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "immersity.ai app", description: "Conversion", criticality: "critical" },
      { name: "Conversion backend", description: "Depth estimation and rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Video conversions stuck",
        scope: "partial",
        signal: "Videos stay processing while images convert",
        quickCheck: "Video jobs run on a separate, heavier pipeline",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Exports refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Immersity is down",
        alternative: "Luma Genie or Polycam (monitored on DownForAI) cover related 3D capture needs; 2D-to-3D animation has no direct monitored equivalent",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  in3d: {
    slug: "in3d",
    providerSummary:
      "in3D creates full-body 3D avatars from phone scans through its iOS app and an SDK for apps, on free and developer plans. Scans are processed in the cloud; failures are processing stuck and SDK calls failing.",
    docsUrl: "https://in3d.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "in3D app", description: "Scanning", criticality: "critical" },
      { name: "Processing backend", description: "Scan to avatar", criticality: "critical" },
      { name: "SDK / API", description: "Developer integration", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Scans stuck processing",
        scope: "partial",
        signal: "Avatars never finish for everyone",
        quickCheck: "Retry a scan in good lighting; universal stalls are the backend",
      },
      {
        pattern: "SDK requests failing",
        scope: "local",
        signal: "Integration calls error",
        quickCheck: "Check the API key and quotas",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "in3D is down",
        alternative: "Avaturn (monitored on DownForAI) builds avatars from a selfie",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Apple App Store"],
    operatorNotes: [],
  },
  kaedim: {
    slug: "kaedim",
    providerSummary:
      "Kaedim turns 2D concept art into 3D assets with AI plus in-house artists, through a web app, plugins and an API, on subscription with asset credits. Turnaround is hours by design, so a delay is not necessarily an outage.",
    docsUrl: "https://docs.kaedim3d.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Kaedim app", description: "Uploads and library", criticality: "critical" },
      { name: "Generation pipeline", description: "AI plus human refinement", criticality: "critical" },
      { name: "API and plugins", description: "Unity, Unreal, Blender", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Assets late beyond the usual turnaround",
        scope: "partial",
        signal: "Jobs exceed the quoted hours for everyone",
        quickCheck: "Check the dashboard's queue estimate; backlog, not outage, is the usual cause",
      },
      {
        pattern: "Uploads failing",
        scope: "partial",
        signal: "Images do not submit",
        quickCheck: "Try a small file; universal failure is the app",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Submissions refused for your account",
        quickCheck: "Check the plan's asset allowance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kaedim is down",
        alternative: "Meshy, Tripo AI or Alpha3D (monitored on DownForAI) generate 3D assets from images",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  kinetix: {
    slug: "kinetix",
    providerSummary:
      "Kinetix generates character animations from video and text, sold mainly as an SDK for user-generated emotes in games, with a web studio; www.kinetix.tech redirects to kinetix.tech. Incidents are generation jobs stuck and SDK calls failing inside games.",
    docsUrl: "https://www.kinetix.tech",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Kinetix studio", description: "Web app", criticality: "high" },
      { name: "Generation backend", description: "Video and text to animation", criticality: "critical" },
      { name: "SDK / API", description: "In-game emotes", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Animations stuck generating",
        scope: "partial",
        signal: "Jobs never finish for everyone",
        quickCheck: "Try a short clip; a universal stall is the backend",
      },
      {
        pattern: "SDK requests failing in games",
        scope: "partial",
        signal: "Players cannot create or load emotes",
        quickCheck: "Check the API key; if every game is affected, the backend is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kinetix is down",
        alternative: "Plask, Move.ai or Krikey AI (monitored on DownForAI) produce animations from video",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "docs.kinetix.tech was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "krikey-ai": {
    slug: "krikey-ai",
    providerSummary:
      "Krikey AI generates 3D character animations from text and video, with an editor and exports to game engines, on credit-based plans. Generation is a queued job; failures are stuck jobs and credit limits.",
    docsUrl: "https://www.krikey.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "krikey.ai app", description: "Editor", criticality: "critical" },
      { name: "Generation backend", description: "Text and video to animation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Animations stuck generating",
        scope: "partial",
        signal: "Jobs never finish for everyone",
        quickCheck: "Try a short prompt; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation or export refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Krikey is down",
        alternative: "Kinetix or Plask (monitored on DownForAI) generate character animations",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "luma-genie": {
    slug: "luma-genie",
    providerSummary:
      "Genie is Luma AI's text-to-3D generator, offered inside Luma's web platform alongside its capture and video products. It shares Luma's accounts and infrastructure, so Genie incidents usually coincide with wider Luma outages.",
    docsUrl: "https://docs.lumalabs.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lumalabs.ai", description: "Web platform", criticality: "critical" },
      { name: "Genie generation", description: "Text to 3D", criticality: "critical" },
      { name: "Luma accounts", description: "Sign-in and credits", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations stuck or failing",
        scope: "partial",
        signal: "Genie jobs never finish while the site loads",
        quickCheck: "Check whether Luma's video generation also stalls; shared GPU capacity affects both",
      },
      {
        pattern: "Sign-in failing",
        scope: "partial",
        signal: "Luma accounts cannot log in",
        quickCheck: "Shared across Luma products",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the Luma plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Genie is down",
        alternative: "Meshy or Tripo AI (monitored on DownForAI) offer text-to-3D",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Luma AI platform"],
    operatorNotes: [
      "DownForAI monitors lumalabs.ai; the DB has no Luma status surface for this entry.",
    ],
  },
  lumirithmic: {
    slug: "lumirithmic",
    providerSummary:
      "Lumirithmic provides photorealistic 3D head capture for studios and enterprises as a B2B service with capture hardware and cloud processing. It has no self-serve app; incidents are processing delays seen by clients.",
    docsUrl: "https://www.lumirithmic.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lumirithmic.com", description: "Website", criticality: "medium" },
      { name: "Client processing pipeline", description: "Capture to 3D head", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Processing delayed",
        scope: "partial",
        signal: "Captures do not come back in the agreed time",
        quickCheck: "Contact the account team; there is no public status surface",
      },
      {
        pattern: "Website unreachable",
        scope: "global",
        signal: "The site errors",
        quickCheck: "Does not necessarily affect client deliveries",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need head or face capture elsewhere",
        alternative: "Avaturn (monitored on DownForAI) generates head avatars from a selfie at lower fidelity",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "B2B service with no public app: DownForAI monitors the website only.",
    ],
  },
  "masterpiece-studio": {
    slug: "masterpiece-studio",
    providerSummary:
      "Masterpiece Studio offered VR and AI tools for creating and editing 3D models (later Masterpiece X). masterpiecestudio.com returned 404 when this entry was written, so the product appears discontinued or moved.",
    docsUrl: "https://masterpiecestudio.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "masterpiecestudio.com", description: "Website (404 when written)", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Site returns 404",
        scope: "global",
        signal: "The homepage is gone",
        quickCheck: "Treat the product as unavailable until the company publishes a new address",
      },
      {
        pattern: "Old accounts inaccessible",
        scope: "local",
        signal: "Logins have nowhere to go",
        quickCheck: "Export from local installs if any",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You relied on Masterpiece Studio",
        alternative: "Meshy, Tripo AI or Womp (monitored on DownForAI) cover AI 3D creation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Website returned 404 when this entry was written; the DownForAI probe will read as down.",
    ],
  },
  "move-ai": {
    slug: "move-ai",
    providerSummary:
      "Move AI does markerless motion capture from video with the Move One phone app, the multi-camera Move Pro and a web platform where jobs are processed in the cloud, on credit-based plans; www.move.ai redirects to move.ai. Incidents are processing stuck and uploads failing.",
    docsUrl: "https://docs.move.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Move web platform", description: "Uploads and results", criticality: "critical" },
      { name: "Processing pipeline", description: "Video to motion data", criticality: "critical" },
      { name: "Move One app", description: "Capture", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Jobs stuck processing",
        scope: "partial",
        signal: "Takes never finish for everyone",
        quickCheck: "Try a short take; a universal stall is the pipeline",
      },
      {
        pattern: "Uploads failing from the app",
        scope: "local",
        signal: "Takes do not reach the platform",
        quickCheck: "Check the phone's connectivity and storage; retry from Wi-Fi",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Processing refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Move AI is down",
        alternative: "Plask or Kinetix (monitored on DownForAI) extract motion from video",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["App stores"],
    operatorNotes: [],
  },
  "plask-ai": {
    slug: "plask-ai",
    providerSummary:
      "Plask extracts motion from video and animates characters in a browser editor, on credit-based plans. Motion extraction is a queued job; failures are stuck extractions and credit limits; the docs host was unreachable when this entry was written.",
    docsUrl: "https://plask.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "plask.ai editor", description: "Browser app", criticality: "critical" },
      { name: "Motion extraction backend", description: "Video to animation", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Extractions stuck",
        scope: "partial",
        signal: "Jobs never finish for everyone",
        quickCheck: "Try a short clip; a universal stall is the backend",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Extraction refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Plask is down",
        alternative: "Move.ai or Kinetix (monitored on DownForAI) extract motion from video",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "docs.plask.ai returned 404 when this entry was written; the docs link points to the main site.",
    ],
  },
  "point-e": {
    slug: "point-e",
    providerSummary:
      "Point-E is OpenAI's open-source text-to-3D point cloud model, published as code and weights on GitHub with no hosted service. Availability concerns the repository only; runs happen on your own hardware.",
    docsUrl: "https://github.com/openai/point-e",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "github.com/openai/point-e", description: "Repository", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Repository unavailable",
        scope: "global",
        signal: "GitHub errors",
        quickCheck: "GitHub outage; local clones keep working",
      },
      {
        pattern: "Local inference failing",
        scope: "local",
        signal: "Errors on your machine",
        quickCheck: "Dependency and GPU issues; the project is unmaintained research code",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need hosted text-to-3D",
        alternative: "Meshy or Tripo AI (monitored on DownForAI)",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub"],
    operatorNotes: [
      "Research code, not a service: DownForAI monitors the GitHub page only.",
    ],
  },
  "polycam-ai": {
    slug: "polycam-ai",
    providerSummary:
      "Polycam captures objects and spaces as 3D models with LiDAR, photogrammetry and Gaussian splats on iOS, Android and the web, with cloud processing for photo captures, on freemium plans. Incidents are cloud processing stuck and sign-in or sync failures.",
    docsUrl: "https://learn.poly.cam",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Polycam apps and web", description: "Capture and library", criticality: "critical" },
      { name: "Cloud processing", description: "Photogrammetry and splats", criticality: "critical" },
      { name: "Sync and sharing", description: "Library and public links", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Photo captures stuck processing",
        scope: "partial",
        signal: "Uploads never finish while LiDAR scans work",
        quickCheck: "LiDAR processing is on-device; photo mode depends on the cloud",
      },
      {
        pattern: "Library not syncing",
        scope: "partial",
        signal: "Captures do not appear on the web",
        quickCheck: "Sign out and in; universal failures are the backend",
      },
      {
        pattern: "Exports locked",
        scope: "local",
        signal: "Formats require Pro for your account",
        quickCheck: "Plan limitation, not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Polycam is down",
        alternative: "Luma Genie (monitored on DownForAI) sits alongside Luma's capture tools; LiDAR scans keep working on-device",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["App stores"],
    operatorNotes: [
      "learn.poly.cam refuses automated requests (403) but is Polycam's help centre.",
    ],
  },
  "promethean-ai": {
    slug: "promethean-ai",
    providerSummary:
      "Promethean AI is a desktop assistant for building virtual worlds inside Unreal, Unity, Blender and other tools, sold as licences with a free tier. It runs locally with a cloud-backed assistant; failures are licence and assistant connectivity problems.",
    docsUrl: "https://www.prometheanai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "prometheanai.com", description: "Downloads and licences", criticality: "high" },
      { name: "Assistant backend", description: "Cloud services used by the app", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Assistant not responding in the editor",
        scope: "partial",
        signal: "Commands time out for every user",
        quickCheck: "The backend is degraded; asset browsing keeps working locally",
      },
      {
        pattern: "Licence activation failing",
        scope: "local",
        signal: "The app cannot validate the plan",
        quickCheck: "Check connectivity; contact support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Promethean is unavailable",
        alternative: "Spline AI or Womp (monitored on DownForAI) cover lighter scene building; otherwise work directly in the engine",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Unreal / Unity / Blender"],
    operatorNotes: [],
  },
  "rodin-3d": {
    slug: "rodin-3d",
    providerSummary:
      "Rodin is Deemos' text and image-to-3D generator, served through the Hyper3D web app and API; hyperhuman.deemos.com/rodin now redirects to hyper3d.ai. Generation is a queued GPU job on credit-based plans.",
    docsUrl: "https://developer.hyper3d.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "hyper3d.ai app", description: "Generator", criticality: "critical" },
      { name: "Generation queue", description: "GPU jobs", criticality: "critical" },
      { name: "Hyper3D API", description: "Developer access", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations queued for a long time",
        scope: "partial",
        signal: "Jobs stay waiting for everyone",
        quickCheck: "Peak demand; a total stall is the queue backend",
      },
      {
        pattern: "API errors while the app works",
        scope: "partial",
        signal: "API calls fail; web generations succeed",
        quickCheck: "The API path is separate; check your key and retry",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Generation refused for your account",
        quickCheck: "Check the balance",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Rodin is down",
        alternative: "Meshy or Tripo AI (monitored on DownForAI) generate 3D from text and images",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "hyperhuman.deemos.com/rodin redirects to hyper3d.ai; DownForAI's probe follows the redirect.",
    ],
  },
  "rodin-gen-1": {
    slug: "rodin-gen-1",
    providerSummary:
      "Rodin Gen-1 is a specific generation of Deemos' Rodin model family, exposed through the same Hyper3D platform as newer versions; hyperhuman.deemos.com redirects to hyper3d.ai. Its availability follows the platform's, and older model versions can be retired.",
    docsUrl: "https://developer.hyper3d.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "hyper3d.ai platform", description: "Shared with newer Rodin versions", criticality: "critical" },
      { name: "Gen-1 model endpoint", description: "Version selection", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model version no longer selectable",
        scope: "global",
        signal: "Gen-1 disappears from the version list or API",
        quickCheck: "Version retirement; move to the current Rodin model",
      },
      {
        pattern: "Platform-wide generation stall",
        scope: "partial",
        signal: "All versions queue without completing",
        quickCheck: "Shared queue backend",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Gen-1 is unavailable",
        alternative: "Meshy or Tripo AI (monitored on DownForAI) are alternatives; otherwise use the current Rodin version",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hyper3D platform"],
    operatorNotes: [
      "Same platform as the rodin-3d entry; hyperhuman.deemos.com redirects to hyper3d.ai.",
    ],
  },
  "shap-e": {
    slug: "shap-e",
    providerSummary:
      "Shap-E is OpenAI's open-source conditional 3D generation model (implicit functions), published as code and weights on GitHub with no hosted service. Availability concerns the repository only.",
    docsUrl: "https://github.com/openai/shap-e",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "github.com/openai/shap-e", description: "Repository", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Repository unavailable",
        scope: "global",
        signal: "GitHub errors",
        quickCheck: "GitHub outage; local clones keep working",
      },
      {
        pattern: "Weights download failing",
        scope: "local",
        signal: "Checkpoint fetch errors at first run",
        quickCheck: "The weights are fetched from OpenAI's storage; retry later",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need hosted text-to-3D",
        alternative: "Meshy or Tripo AI (monitored on DownForAI)",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["GitHub", "OpenAI checkpoint storage"],
    operatorNotes: [
      "Research code, not a service: DownForAI monitors the GitHub page only.",
    ],
  },
  "spline-ai": {
    slug: "spline-ai",
    providerSummary:
      "Spline is a browser-based 3D design tool with AI generation features, real-time collaboration and embeddable scenes served from Spline's runtime, on freemium plans. An outage can affect scenes embedded on customer websites, not just the editor.",
    docsUrl: "https://docs.spline.design",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.spline.design", description: "Editor", criticality: "critical" },
      { name: "Spline runtime and exports", description: "Embedded scenes on customer sites", criticality: "critical" },
      { name: "AI generation", description: "Spline AI features", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Embedded scenes not loading on websites",
        scope: "partial",
        signal: "Viewer embeds stay blank while the editor works",
        quickCheck: "Check the scene URL in the browser; self-hosted exports are unaffected",
      },
      {
        pattern: "Editor not saving",
        scope: "partial",
        signal: "Changes fail to sync",
        quickCheck: "Keep the tab open; universal failures are the backend",
      },
      {
        pattern: "AI generation failing",
        scope: "partial",
        signal: "AI features error; editing works",
        quickCheck: "The AI layer is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Spline is down",
        alternative: "Womp (monitored on DownForAI) covers browser 3D modelling; exported scenes can be self-hosted",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "viverse-create": {
    slug: "viverse-create",
    providerSummary:
      "VIVERSE Create is HTC's browser platform for building and publishing 3D worlds with AI-assisted tools, tied to HTC accounts. create.viverse.com did not answer DownForAI's probe when this entry was written; docs.viverse.com does.",
    docsUrl: "https://docs.viverse.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "create.viverse.com", description: "Editor", criticality: "critical" },
      { name: "Published worlds", description: "Viewer", criticality: "high" },
      { name: "HTC account sign-in", description: "Authentication", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Editor not loading",
        scope: "partial",
        signal: "The page hangs for everyone",
        quickCheck: "Check docs.viverse.com; if only the editor fails, the platform is degraded",
      },
      {
        pattern: "Sign-in failing",
        scope: "partial",
        signal: "HTC account login errors",
        quickCheck: "Shared HTC identity service",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "VIVERSE Create is down",
        alternative: "Spline AI or Womp (monitored on DownForAI) cover browser-based 3D creation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["HTC account services"],
    operatorNotes: [
      "create.viverse.com timed out for automated requests when this entry was written; the probe may read as down.",
    ],
  },
  "womp-3d": {
    slug: "womp-3d",
    providerSummary:
      "Womp is a browser-based 3D modelling tool with cloud rendering and AI-assisted shape creation, on freemium plans. Its incidents are the editor failing to load, renders stuck and projects not saving.",
    docsUrl: "https://womp.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "womp.com editor", description: "Browser app", criticality: "critical" },
      { name: "Cloud rendering", description: "Render queue", criticality: "high" },
      { name: "Project storage", description: "Saves and sharing", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders stuck",
        scope: "partial",
        signal: "Render jobs never finish for everyone",
        quickCheck: "The render queue is separate from the editor",
      },
      {
        pattern: "Projects not saving",
        scope: "partial",
        signal: "Changes fail to sync",
        quickCheck: "Keep the tab open; export locally if possible",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Womp is down",
        alternative: "Spline AI (monitored on DownForAI) covers browser 3D design",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "help.womp.com was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "wonder-dynamics": {
    slug: "wonder-dynamics",
    providerSummary:
      "Wonder Dynamics' Wonder Studio, now Autodesk Flow Studio, replaces actors in footage with CG characters through cloud processing, on Autodesk subscriptions. The Autodesk product page blocks probes; incidents are processing jobs stuck and Autodesk sign-in problems.",
    docsUrl: "https://www.autodesk.com/products/flow-studio/overview",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Flow Studio web app", description: "Projects and processing", criticality: "critical" },
      { name: "Processing pipeline", description: "Video to CG", criticality: "critical" },
      { name: "Autodesk account", description: "Sign-in and licensing", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Jobs stuck processing",
        scope: "partial",
        signal: "Shots never finish for everyone",
        quickCheck: "Try a short clip; a universal stall is the pipeline",
      },
      {
        pattern: "Sign-in failing",
        scope: "partial",
        signal: "Autodesk account login errors",
        quickCheck: "Shared Autodesk identity service; other Autodesk products are affected too",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Flow Studio is down",
        alternative: "Move.ai (monitored on DownForAI) extracts motion from video for manual CG workflows",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Autodesk account services"],
    operatorNotes: [
      "The Autodesk product page returns 403 to automated requests, so DownForAI's probe reads as blocked rather than down.",
    ],
  },
};
