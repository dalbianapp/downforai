import type { TopServiceContent } from "@/content/top-services/types";

// AUDIO — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start audio-2.ts and register it in ./index.ts if it grows.
export const AUDIO: Record<string, TopServiceContent> = {
  elevenlabs: {
    slug: "elevenlabs",
    providerSummary:
      "High-throughput AI voice TTS API. Voice cloning, dubbing, audiobooks, conversational AI.",
    officialStatusUrl: "https://status.elevenlabs.io",
    docsUrl: "https://elevenlabs.io/docs",
    pricingUrl: "https://elevenlabs.io/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/elevenlabs", label: "ElevenLabs Discord" },
      { type: "x", url: "https://x.com/elevenlabsio", label: "@elevenlabsio" },
      { type: "reddit", url: "https://reddit.com/r/ElevenLabs", label: "r/ElevenLabs" },
    ],
    monitoredSurfaces: [
      {
        name: "api.elevenlabs.io",
        description: "TTS, STT, Dubbing, Voice Lab",
        criticality: "critical",
      },
      { name: "Web UI", description: "", criticality: "high" },
      { name: "Mobile apps", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Character quota depletion",
        scope: "local",
        signal: "TTS requests fail with quota error",
        quickCheck: "Check character balance; quota resets monthly",
      },
      {
        pattern: "Voice cloning approval delays",
        scope: "partial",
        signal: "Voice clone submission pending for extended time",
        quickCheck: "Check ElevenLabs support; approval has manual review steps",
      },
      {
        pattern: "Specific voice unavailability",
        scope: "partial",
        signal: "Specific voice ID returns error while others work",
        quickCheck: "Try a different voice; check if voice was removed from library",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ElevenLabs is degraded",
        alternative: "OpenAI TTS, Play.ht, Cartesia (low-latency) can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Streaming TTS has strict latency requirements — p95 >500ms degrades product UX meaningfully; monitor closely",
    ],
  },
  suno: {
    slug: "suno",
    providerSummary:
      "AI music generator producing full songs from text prompts. Also instrumentals and custom lyrics.",
    docsUrl: "https://suno.com/docs",
    pricingUrl: "https://suno.com/pricing",
    communityLinks: [
      { type: "discord", url: "https://discord.gg/suno", label: "Suno Discord" },
      { type: "reddit", url: "https://reddit.com/r/SunoAI", label: "r/SunoAI" },
    ],
    monitoredSurfaces: [
      { name: "suno.com", description: "", criticality: "critical" },
      { name: "Mobile app", description: "", criticality: "high" },
      { name: "Generation queue", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue during peak",
        scope: "partial",
        signal: "Generation jobs take longer during peak demand",
        quickCheck: "Wait and retry; check Suno Discord for status",
      },
      {
        pattern: "Credit depletion",
        scope: "local",
        signal: "Generation fails with credit error",
        quickCheck: "Check credit balance; credits reset on billing cycle",
      },
      {
        pattern: "Copyright filter prompt rejections",
        scope: "local",
        signal: "Specific prompts rejected for copyright reasons",
        quickCheck: "Rephrase prompt; avoid referencing copyrighted artists/songs",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Suno is degraded",
        alternative:
          "Udio, Beatoven.ai, AIVA can reduce downtime for music generation",
        switchingCost: "low",
        note: "Different style outputs",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Copyright-related filters cause some specific prompts to fail — not always an outage signal",
    ],
  },
  udio: {
    slug: "udio",
    providerSummary:
      "Music AI generator. Slightly more technical controls than Suno; popular with musicians.",
    docsUrl: "https://udio.com/help",
    pricingUrl: "https://www.udio.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "udio.com", description: "", criticality: "critical" },
      { name: "Generation API", description: "", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Queue times",
        scope: "partial",
        signal: "Generation jobs queued during peak demand",
        quickCheck: "Wait and retry; try off-peak hours",
      },
      {
        pattern: "Copyright filter rejections similar to Suno",
        scope: "local",
        signal: "Prompts rejected for copyright reasons",
        quickCheck: "Rephrase prompt; avoid referencing copyrighted material",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Udio is degraded",
        alternative: "Suno, Beatoven, local Riffusion can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  voicemod: {
    slug: "voicemod",
    providerSummary:
      "Real-time AI voice changer for gaming, streaming, meetings. Desktop-first with voice library and effects.",
    docsUrl: "https://help.voicemod.net",
    pricingUrl: "https://www.voicemod.net/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Voicemod desktop app", description: "", criticality: "critical" },
      { name: "License server", description: "", criticality: "high" },
      { name: "Voice library CDN", description: "", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "License activation failures",
        scope: "partial",
        signal: "License fails to activate or validate",
        quickCheck: "Check Voicemod license server status; retry activation",
      },
      {
        pattern: "Voice library download failures",
        scope: "partial",
        signal: "Voice effects fail to download from CDN",
        quickCheck: "Check CDN connectivity; retry download",
      },
      {
        pattern: "Audio routing config issues (often mistaken for outage)",
        scope: "local",
        signal: "Voicemod not affecting audio output",
        quickCheck: "Verify audio device routing in OS settings and Voicemod settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Voicemod is degraded",
        alternative:
          "MorphVOX, Clownfish Voice Changer, native OBS audio filters can reduce downtime",
        switchingCost: "low",
        note: "Reduced feature set",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Most 'Voicemod is down' reports are local audio routing configuration rather than platform outages — real outages are license-server-side",
    ],
  },
  "whisper-openai": {
    slug: "whisper-openai",
    providerSummary:
      "OpenAI's speech-to-text model. Available via OpenAI API, as open-weight model, and on third-party hosts (Groq, etc.).",
    officialStatusUrl: "https://status.openai.com",
    docsUrl: "https://platform.openai.com/docs/guides/speech-to-text",
    pricingUrl: "https://openai.com/api/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      {
        name: "api.openai.com Audio endpoint",
        description: "Whisper and successors",
        criticality: "critical",
      },
    ],
    knownFailurePatterns: [
      {
        pattern: "Same as OpenAI API (rate limits, 5xx)",
        scope: "partial",
        signal: "429 or 5xx from OpenAI Audio endpoint",
        quickCheck: "Check status.openai.com for Audio/API component",
      },
      {
        pattern: "Audio file size/format limits",
        scope: "local",
        signal: "Upload fails for large or unsupported format files",
        quickCheck: "Convert to supported format (mp3, mp4, wav); check max file size limit",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "OpenAI Whisper API is degraded",
        alternative:
          "AssemblyAI, Deepgram, Groq (Whisper-large-v3, fast + free tier), or local Whisper can reduce downtime for STT",
        switchingCost: "low",
        note: "Local = high setup cost",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Whisper is open-weight — self-hosted via whisper.cpp or faster-whisper is a production-grade fallback. Groq hosts Whisper with very low latency and a free tier.",
    ],
  },
  descript: {
    slug: "descript",
    providerSummary:
      "AI video and audio editor. Text-based editing (edit video by editing transcript), screen recording, podcast editing.",
    officialStatusUrl: "https://status.descript.com",
    docsUrl: "https://help.descript.com",
    pricingUrl: "https://www.descript.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "descript.com", description: "Web editor", criticality: "critical" },
      { name: "Desktop App", description: "Mac and Windows desktop client", criticality: "critical" },
      { name: "Transcription Backend", description: "AI speech-to-text pipeline", criticality: "high" },
      { name: "Rendering Pipeline", description: "Video export and rendering", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Transcription backend delays",
        scope: "global",
        signal: "Transcription stuck in processing",
        quickCheck: "Check status.descript.com for transcription service health",
      },
      {
        pattern: "Desktop app sync issues",
        scope: "local",
        signal: "Changes not syncing between devices",
        quickCheck: "Force sync from app menu; check network connectivity",
      },
      {
        pattern: "Rendering failures on long projects",
        scope: "global",
        signal: "Export fails or produces corrupted output on large files",
        quickCheck: "Try exporting a shorter clip to isolate; check render pipeline status",
      },
      {
        pattern: "Collaboration session drops",
        scope: "partial",
        signal: "Co-editors disconnected mid-session",
        quickCheck: "Reload the project; check real-time collaboration backend status",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Descript is degraded",
        alternative:
          "Riverside (recording), Kapwing (editing), or Otter.ai (transcription) can reduce downtime for specific workflows",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "cartesia-ai": {
    slug: "cartesia-ai",
    providerSummary:
      "Ultra-low latency voice AI. Sub-100ms streaming TTS. Strong for real-time conversational AI applications.",
    docsUrl: "https://docs.cartesia.ai",
    pricingUrl: "https://cartesia.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.cartesia.ai", description: "Streaming TTS API endpoint", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Latency spikes",
        scope: "global",
        signal: "p95 latency exceeds 200ms (defeats the core value prop)",
        quickCheck: "Monitor p50/p95 latency via API metrics; check status page",
      },
      {
        pattern: "Capacity issues during peak",
        scope: "global",
        signal: "Increased queuing or errors under load",
        quickCheck: "Check Cartesia status; implement retry with backoff",
      },
      {
        pattern: "Voice model availability",
        scope: "partial",
        signal: "Specific voice model unavailable",
        quickCheck: "Switch to alternate voice model; check model list via API",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Cartesia AI is degraded",
        alternative:
          "ElevenLabs (slightly higher latency), Play.ht, or OpenAI TTS can reduce downtime",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "Cartesia's value prop is sub-100ms latency — if p95 exceeds 200ms, it's a meaningful degradation even without hard errors.",
    ],
  },
};
