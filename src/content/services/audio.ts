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
  "adobe-enhance-speech": {
    slug: "adobe-enhance-speech",
    providerSummary:
      "Enhance Speech is the free Adobe Podcast web tool that removes noise and echo from voice recordings, processed on Adobe's servers with a daily upload allowance. It shares Adobe Podcast's infrastructure and Adobe ID sign-in.",
    docsUrl: "https://podcast.adobe.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "podcast.adobe.com/enhance", description: "Upload and processing UI", criticality: "critical" },
      { name: "Processing backend", description: "Speech enhancement jobs", criticality: "critical" },
      { name: "Adobe ID", description: "Sign-in", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Uploads stuck enhancing",
        scope: "partial",
        signal: "Files never finish processing, even short ones",
        quickCheck: "Try a 10-second clip; a universal stall is the backend",
      },
      {
        pattern: "Daily limit reached",
        scope: "local",
        signal: "Uploads refused with a limit message for your account",
        quickCheck: "Free accounts have a daily and per-file cap; wait or upgrade",
      },
      {
        pattern: "Adobe ID sign-in loop",
        scope: "local",
        signal: "Login redirects back without signing in",
        quickCheck: "Clear cookies for adobe.com and retry; check Adobe's status page",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Enhance Speech is down",
        alternative: "Cleanvoice, Krisp or Descript (monitored on DownForAI) clean up voice recordings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Adobe ID / Adobe Podcast platform"],
    operatorNotes: [],
  },
  "adobe-podcast-ai": {
    slug: "adobe-podcast-ai",
    providerSummary:
      "Adobe Podcast is a web studio for recording, editing and enhancing podcasts (Enhance Speech, Mic Check, Studio editor), running in the browser with Adobe's cloud processing and Adobe ID accounts. Recording and processing are separate services.",
    docsUrl: "https://podcast.adobe.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "podcast.adobe.com", description: "Studio web app", criticality: "critical" },
      { name: "Recording / storage", description: "Browser recording and project storage", criticality: "critical" },
      { name: "Enhancement backend", description: "Speech processing", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Recording session fails to start or drops",
        scope: "partial",
        signal: "Participants cannot join or the recording stops, across projects",
        quickCheck: "Check microphone permissions first; if every session fails, the recording service is degraded",
      },
      {
        pattern: "Enhancement stuck while editing works",
        scope: "partial",
        signal: "Projects open but Enhance never completes",
        quickCheck: "Retry later; enhancement runs on a separate backend",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Adobe Podcast is down",
        alternative: "Riverside AI, Podcastle or Descript (monitored on DownForAI) record and edit podcasts online",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Adobe ID"],
    operatorNotes: [],
  },
  aiva: {
    slug: "aiva",
    providerSummary:
      "AIVA is an AI music composer for soundtracks and background music, used through a web app (and desktop app) with plans that set download quotas and licensing. Composition runs on AIVA's servers; downloads and rendering are the pinch points.",
    docsUrl: "https://www.aiva.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "creators.aiva.ai", description: "Composer web app", criticality: "critical" },
      { name: "Composition / rendering backend", description: "Track generation and exports", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Compositions never finish generating",
        scope: "partial",
        signal: "New tracks stay pending for everyone",
        quickCheck: "Try a short track; a universal stall is the backend",
      },
      {
        pattern: "Monthly download quota reached",
        scope: "local",
        signal: "Exports refused with a quota message for your account",
        quickCheck: "Check plan usage; downloads reset monthly",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AIVA is down",
        alternative: "Soundraw, Mubert or Beatoven.ai (monitored on DownForAI) generate royalty-free music",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "altered-ai": {
    slug: "altered-ai",
    providerSummary:
      "Altered provides voice changing and cloning for media production, via a Studio web/desktop app and an API, with real-time and batch modes on credit-based plans. Batch conversion and real-time voice are separate pipelines.",
    docsUrl: "https://www.altered.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Altered Studio", description: "Web and desktop app", criticality: "critical" },
      { name: "Voice conversion backend", description: "Batch and real-time", criticality: "critical" },
      { name: "Altered API", description: "Developer access", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Batch conversions stuck",
        scope: "partial",
        signal: "Files stay processing across projects",
        quickCheck: "Try a short file; a universal stall is the backend",
      },
      {
        pattern: "Real-time voice lagging or dropping",
        scope: "partial",
        signal: "Live conversion stutters while batch works",
        quickCheck: "Check the local network and CPU first; if all users lag, the real-time service is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Altered is down",
        alternative: "Respeecher, Resemble AI or Kits AI (monitored on DownForAI) offer voice conversion and cloning",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "docs.altered.ai was unreachable when this entry was written; the docs link points to the main site.",
    ],
  },
  "assembly-ai": {
    slug: "assembly-ai",
    providerSummary:
      "AssemblyAI is a speech-to-text and audio-intelligence API (async transcription, streaming, LeMUR) used by developers; incidents are API errors, transcripts stuck in processing or streaming disconnects, published on its status page.",
    officialStatusUrl: "https://status.assemblyai.com/",
    docsUrl: "https://www.assemblyai.com/docs",
    pricingUrl: "https://www.assemblyai.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.assemblyai.com", description: "Async transcription and LeMUR", criticality: "critical" },
      { name: "Streaming API", description: "Real-time transcription", criticality: "critical" },
      { name: "Dashboard", description: "Keys and usage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Transcripts stuck in 'queued' or 'processing'",
        scope: "partial",
        signal: "Jobs take far longer than the usual fraction of audio length",
        quickCheck: "Check status.assemblyai.com; poll with backoff rather than resubmitting",
      },
      {
        pattern: "Streaming sessions disconnecting",
        scope: "partial",
        signal: "WebSocket sessions drop or return errors while async jobs complete",
        quickCheck: "Reconnect with backoff; the streaming service is separate from async",
      },
      {
        pattern: "429 or concurrency limit",
        scope: "local",
        signal: "Requests rejected for your account only",
        quickCheck: "Check the account's concurrency and rate limits",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AssemblyAI is degraded",
        alternative: "Deepgram, Rev AI or OpenAI Whisper (monitored on DownForAI) provide transcription APIs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  audiocraft: {
    slug: "audiocraft",
    providerSummary:
      "AudioCraft is Meta's open-source framework for music and sound generation (MusicGen, AudioGen, EnCodec), published on GitHub with a demo site. It is code and weights to run yourself; the demo has no capacity guarantees.",
    docsUrl: "https://github.com/facebookresearch/audiocraft",
    communityLinks: [
      { type: "github", url: "https://github.com/facebookresearch/audiocraft", label: "facebookresearch/audiocraft", verified: true },
    ],
    monitoredSurfaces: [
      { name: "audiocraft.metademolab.com", description: "Demo site", criticality: "low" },
      { name: "Local / hosted runs", description: "Where generation actually happens", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Demo unavailable or slow",
        scope: "partial",
        signal: "The demo page errors or queues",
        quickCheck: "It is a research demo; run MusicGen locally or on a provider",
      },
      {
        pattern: "Local generation out of memory",
        scope: "local",
        signal: "Larger MusicGen models fail to load",
        quickCheck: "Use the small or medium model",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need hosted music generation",
        alternative: "Suno, Udio or Stable Audio (monitored on DownForAI) generate music as a service",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face for weights"],
    operatorNotes: [],
  },
  audiopen: {
    slug: "audiopen",
    providerSummary:
      "AudioPen records voice notes and turns them into cleaned-up text with AI, as a web app and mobile apps on freemium plans. Transcription and rewriting run on AudioPen's backend through third-party models.",
    docsUrl: "https://audiopen.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "audiopen.ai web app", description: "Recorder and notes", criticality: "critical" },
      { name: "Transcription / rewrite backend", description: "Model relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Notes stuck processing",
        scope: "partial",
        signal: "Recordings never turn into text",
        quickCheck: "Try a 10-second note; a universal stall is the backend or its model provider",
      },
      {
        pattern: "Recording length limit on the free plan",
        scope: "local",
        signal: "Recording stops early for your account",
        quickCheck: "Free notes are capped in length; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AudioPen is down",
        alternative: "Notta AI or Fireflies.ai (monitored on DownForAI) transcribe voice notes",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party speech and language-model providers"],
    operatorNotes: [],
  },
  "beatoven-ai": {
    slug: "beatoven-ai",
    providerSummary:
      "Beatoven.ai composes royalty-free background music from text or mood settings for videos and podcasts, on credit-based plans with an API. Generation is queued on Beatoven's servers.",
    docsUrl: "https://www.beatoven.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "beatoven.ai web app", description: "Composer", criticality: "critical" },
      { name: "Generation backend", description: "Track rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tracks never finish composing",
        scope: "partial",
        signal: "Generations stay pending for everyone",
        quickCheck: "Try a short track; a universal stall is the backend",
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
        scenario: "Beatoven.ai is down",
        alternative: "Soundraw, Mubert or AIVA (monitored on DownForAI) generate background music",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  blakify: {
    slug: "blakify",
    providerSummary:
      "Blakify is a web text-to-speech tool for creator voiceovers with many voices and languages on credit-based plans, relaying to cloud speech engines. Voice generation and downloads are the only surfaces.",
    docsUrl: "https://blakify.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "blakify.com web app", description: "TTS editor", criticality: "critical" },
      { name: "Speech backend", description: "Voice synthesis relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One voice or language fails while others work",
        scope: "partial",
        signal: "Switching voice restores generation",
        quickCheck: "Change voice; the failure is the underlying speech provider",
      },
      {
        pattern: "Character quota exhausted",
        scope: "local",
        signal: "Generation refused with a quota message for your account",
        quickCheck: "Check usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Blakify is down",
        alternative: "Murf AI, Speechelo or Listnr (monitored on DownForAI) provide creator text-to-speech",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Cloud speech providers"],
    operatorNotes: [],
  },
  boomy: {
    slug: "boomy",
    providerSummary:
      "Boomy generates songs in seconds from style presets and lets users release them to streaming platforms, on freemium plans. Song generation and the distribution pipeline are separate services.",
    docsUrl: "https://boomy.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "boomy.com web app", description: "Song creation", criticality: "critical" },
      { name: "Generation backend", description: "Song rendering", criticality: "critical" },
      { name: "Distribution", description: "Release submissions", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Songs never finish generating",
        scope: "partial",
        signal: "Creation stays pending for everyone",
        quickCheck: "Retry a preset; a universal stall is the backend",
      },
      {
        pattern: "Release stuck in review",
        scope: "local",
        signal: "A submitted song stays pending distribution for days",
        quickCheck: "Distribution review is manual and slow; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Boomy is down",
        alternative: "Suno, Udio or Soundraw (monitored on DownForAI) generate full songs or tracks",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Streaming platform distribution partners"],
    operatorNotes: [],
  },
  cleanvoice: {
    slug: "cleanvoice",
    providerSummary:
      "Cleanvoice removes filler words, silences and background noise from podcast audio, with a web app and an API on credit-based plans. Processing is a queued job per file.",
    docsUrl: "https://cleanvoice.ai",
    pricingUrl: "https://cleanvoice.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "cleanvoice.ai web app", description: "Upload and results", criticality: "critical" },
      { name: "Processing backend", description: "Audio cleaning jobs", criticality: "critical" },
      { name: "Cleanvoice API", description: "Developer access", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Files stuck processing",
        scope: "partial",
        signal: "Jobs never complete, even for short files",
        quickCheck: "Try a short clip; a universal stall is the backend",
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
        scenario: "Cleanvoice is down",
        alternative: "Adobe Enhance Speech, Descript or Krisp (monitored on DownForAI) clean up recordings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "clova-note": {
    slug: "clova-note",
    providerSummary:
      "CLOVA Note is NAVER's meeting recorder and transcription service (web and mobile) with monthly transcription minutes, strongest in Korean. It relies on NAVER accounts and CLOVA speech models.",
    docsUrl: "https://clovanote.naver.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "clovanote.naver.com", description: "Web app", criticality: "critical" },
      { name: "Mobile app", description: "Recording client", criticality: "high" },
      { name: "Transcription backend", description: "CLOVA speech", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Transcriptions stuck",
        scope: "partial",
        signal: "Recordings never produce text for anyone",
        quickCheck: "Try a short recording; a universal stall is the speech backend",
      },
      {
        pattern: "Monthly minutes exhausted",
        scope: "local",
        signal: "New transcriptions refused for your account",
        quickCheck: "Check the remaining minutes; they reset monthly",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "CLOVA Note is down",
        alternative: "Notta AI or Fireflies.ai (monitored on DownForAI) transcribe meetings, including Korean",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["NAVER accounts"],
    operatorNotes: [],
  },
  "coqui-tts": {
    slug: "coqui-tts",
    providerSummary:
      "Coqui TTS is an open-source text-to-speech toolkit (XTTS and others). The company shut down in early 2024 and coqui.ai now returns 404; the code lives on as a community-maintained GitHub project that you run yourself.",
    docsUrl: "https://github.com/coqui-ai/TTS",
    communityLinks: [
      { type: "github", url: "https://github.com/coqui-ai/TTS", label: "coqui-ai/TTS", verified: true },
    ],
    monitoredSurfaces: [
      { name: "coqui.ai", description: "Former website (404)", criticality: "low" },
      { name: "Local installs", description: "Self-run TTS", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Website returns 404",
        scope: "global",
        signal: "coqui.ai is gone",
        quickCheck: "Expected; use the GitHub repository and community forks",
      },
      {
        pattern: "Model download links broken",
        scope: "local",
        signal: "Older model URLs fail to download",
        quickCheck: "Use the Hugging Face mirrors referenced in the community fork",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "You need a maintained TTS",
        alternative: "ElevenLabs, Cartesia or LMNT (monitored on DownForAI) offer hosted speech synthesis",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Hugging Face for models"],
    operatorNotes: [
      "The DB website URL answers 404; the company is defunct and the technical signal is meaningless for this entry.",
    ],
  },
  "d-id": {
    slug: "d-id",
    providerSummary:
      "D-ID generates talking-avatar videos and real-time conversational agents from photos and text, via a Studio web app and an API on credit-based plans. Video rendering and live agents are separate services.",
    docsUrl: "https://docs.d-id.com",
    pricingUrl: "https://www.d-id.com/pricing/studio/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "D-ID Studio", description: "Web app", criticality: "critical" },
      { name: "D-ID API", description: "Talks, clips, agents", criticality: "critical" },
      { name: "Real-time agents", description: "Streaming avatars", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Videos stuck rendering",
        scope: "partial",
        signal: "Talks stay in progress across projects",
        quickCheck: "Try a short script; a universal stall is the render backend — D-ID publishes incidents on its own status page",
      },
      {
        pattern: "Agent sessions failing to connect",
        scope: "partial",
        signal: "Live agents error while video generation works",
        quickCheck: "Test from the Studio; real-time runs on a separate service",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "Requests refused with a credit message for your account",
        quickCheck: "Check the balance before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "D-ID is down",
        alternative: "HeyGen, Hedra or Tavus (monitored on DownForAI) generate talking avatars",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Third-party speech providers"],
    operatorNotes: [
      "D-ID has its own status page; DownForAI currently probes d-id.com only.",
    ],
  },
  deepgram: {
    slug: "deepgram",
    providerSummary:
      "Deepgram provides speech-to-text (batch and streaming), text-to-speech and voice-agent APIs for developers, with a console for keys and usage. Incidents are API errors or streaming disconnects, published on an Atlassian status page.",
    officialStatusUrl: "https://status.deepgram.com",
    docsUrl: "https://developers.deepgram.com",
    pricingUrl: "https://deepgram.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "api.deepgram.com", description: "STT, TTS and agent APIs", criticality: "critical" },
      { name: "Streaming WebSocket", description: "Real-time transcription", criticality: "critical" },
      { name: "Console", description: "Keys and usage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Streaming connections dropping",
        scope: "partial",
        signal: "WebSocket sessions close or error while batch requests succeed",
        quickCheck: "Reconnect with backoff; check status.deepgram.com for the streaming component",
      },
      {
        pattern: "5xx or elevated latency on batch requests",
        scope: "partial",
        signal: "Requests fail or slow down across models",
        quickCheck: "Retry with backoff; confirm on the status page",
      },
      {
        pattern: "429 or credit exhaustion",
        scope: "local",
        signal: "Requests rejected for your project only",
        quickCheck: "Check the project's rate limits and balance in the console",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Deepgram is degraded",
        alternative: "AssemblyAI, Rev AI or OpenAI Whisper (monitored on DownForAI) provide transcription APIs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  dubverse: {
    slug: "dubverse",
    providerSummary:
      "Dubverse dubs videos into other languages with AI voices and subtitles, via a web app and API on credit-based plans. Dubbing chains transcription, translation and speech synthesis, so a job can fail at any stage.",
    docsUrl: "https://dubverse.ai",
    pricingUrl: "https://dubverse.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "dubverse.ai web app", description: "Projects", criticality: "critical" },
      { name: "Dubbing pipeline", description: "Transcribe, translate, synthesise", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Dubs stuck at one stage",
        scope: "partial",
        signal: "Projects stop at transcription or voice generation for everyone",
        quickCheck: "Try a short clip; a universal stall at the same stage is that pipeline component",
      },
      {
        pattern: "Credits exhausted",
        scope: "local",
        signal: "New dubs refused with a credit message for your account",
        quickCheck: "Check the balance before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dubverse is down",
        alternative: "ElevenLabs, HeyGen or Captions.ai (monitored on DownForAI) offer AI dubbing",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party speech and translation providers"],
    operatorNotes: [],
  },
  fathom: {
    slug: "fathom",
    providerSummary:
      "Fathom is an AI meeting notetaker that joins Zoom, Google Meet and Teams calls, records, transcribes and summarises them, and syncs to CRMs; fathom.video now redirects to fathom.ai. Incidents are bots that do not join or summaries that never arrive.",
    docsUrl: "https://help.fathom.video",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Fathom notetaker bot", description: "Joins and records calls", criticality: "critical" },
      { name: "Transcription / summary backend", description: "Post-call processing", criticality: "critical" },
      { name: "Web app and integrations", description: "Library, CRM sync", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bot does not join the meeting",
        scope: "partial",
        signal: "Fathom is absent from calls it was scheduled for, across users",
        quickCheck: "Check the calendar connection and meeting link; if all bots fail to join, the recording service is degraded",
      },
      {
        pattern: "Summaries delayed or missing",
        scope: "partial",
        signal: "Recordings exist but summaries never appear",
        quickCheck: "Wait; summarisation queues behind transcription and clears on its own",
      },
      {
        pattern: "CRM sync failing",
        scope: "local",
        signal: "Notes do not reach HubSpot or Salesforce",
        quickCheck: "Re-authorise the integration",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fathom is down",
        alternative: "Fireflies.ai, Notta AI or Read.ai (monitored on DownForAI) record and summarise meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams", "CRM integrations"],
    operatorNotes: [
      "fathom.video redirects to fathom.ai; DownForAI's probe follows the redirect.",
    ],
  },
  "fireflies-ai": {
    slug: "fireflies-ai",
    providerSummary:
      "Fireflies.ai is an AI meeting recorder (Fred bot) that joins video calls, transcribes, summarises and pushes notes to CRMs and Slack, on freemium plans. Its failures are bots not joining and transcripts stuck processing.",
    docsUrl: "https://guide.fireflies.ai",
    pricingUrl: "https://fireflies.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Fred notetaker bot", description: "Joins and records calls", criticality: "critical" },
      { name: "Transcription backend", description: "Post-call processing", criticality: "critical" },
      { name: "app.fireflies.ai", description: "Library and integrations", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Fred does not join meetings",
        scope: "partial",
        signal: "The bot misses scheduled calls across users",
        quickCheck: "Check calendar sync and the meeting platform; a widespread no-show is the bot service",
      },
      {
        pattern: "Transcripts stuck processing",
        scope: "partial",
        signal: "Recordings never produce transcripts",
        quickCheck: "Wait; processing backlogs clear — do not re-upload",
      },
      {
        pattern: "Integration not delivering notes",
        scope: "local",
        signal: "Slack or CRM never receives summaries",
        quickCheck: "Re-authorise the integration in settings",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fireflies is down",
        alternative: "Fathom, Notta AI or Read.ai (monitored on DownForAI) record and summarise meetings",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams", "Slack and CRM integrations"],
    operatorNotes: [],
  },
  "kits-ai": {
    slug: "kits-ai",
    providerSummary:
      "Kits AI offers voice conversion, cloning and stem separation for musicians, via a web app and API on credit-based plans. Voice training is a long queued job; conversion and stems are shorter jobs on shared GPUs.",
    docsUrl: "https://www.kits.ai",
    pricingUrl: "https://www.kits.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "kits.ai web app", description: "Studio", criticality: "critical" },
      { name: "GPU queue", description: "Conversion, training, stems", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Voice model training stuck",
        scope: "partial",
        signal: "Training jobs stay queued far beyond the estimate",
        quickCheck: "Wait; training runs on a separate queue from conversion",
      },
      {
        pattern: "Conversions failing across voices",
        scope: "partial",
        signal: "Every conversion errors",
        quickCheck: "Try a short clip; a universal failure is the backend",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kits AI is down",
        alternative: "Moises or LALAL.AI (monitored on DownForAI) cover stems; Respeecher or Altered.ai cover voice conversion",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  krisp: {
    slug: "krisp",
    providerSummary:
      "Krisp is a desktop app for AI noise cancellation, plus meeting transcription and notes, sitting between your microphone and any call app; noise cancellation runs on device while transcription and summaries use Krisp's cloud. Its failures split along that line.",
    docsUrl: "https://help.krisp.ai",
    pricingUrl: "https://krisp.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Krisp desktop app", description: "On-device noise cancellation", criticality: "high" },
      { name: "Krisp cloud", description: "Transcription, notes, account", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Meeting notes or transcripts missing",
        scope: "partial",
        signal: "Calls were processed but no notes appear, across users",
        quickCheck: "Check the Krisp web dashboard; noise cancellation keeps working during a cloud incident",
      },
      {
        pattern: "Krisp microphone not detected by the call app",
        scope: "local",
        signal: "Zoom or Meet no longer lists the Krisp device",
        quickCheck: "Restart Krisp and reselect the Krisp microphone in the call app",
      },
      {
        pattern: "Free minutes exhausted",
        scope: "local",
        signal: "Noise cancellation stops after the daily allowance",
        quickCheck: "Free plans cap minutes; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Krisp cloud features are down",
        alternative: "Fireflies.ai or Fathom (monitored on DownForAI) can take meeting notes meanwhile",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "lalal-ai": {
    slug: "lalal-ai",
    providerSummary:
      "LALAL.AI separates vocals, drums, bass and other stems from audio and video, via a web app, desktop apps and an API, on minute-based packs. Separation is a queued processing job per file.",
    docsUrl: "https://www.lalal.ai/api/",
    pricingUrl: "https://www.lalal.ai/pricing/",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lalal.ai web app", description: "Upload and split", criticality: "critical" },
      { name: "Processing backend", description: "Stem separation", criticality: "critical" },
      { name: "LALAL.AI API", description: "Developer access", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Files stuck processing",
        scope: "partial",
        signal: "Splits never finish, even short previews",
        quickCheck: "Try a short file; a universal stall is the backend",
      },
      {
        pattern: "Minutes exhausted",
        scope: "local",
        signal: "Processing refused with a balance message for your account",
        quickCheck: "Check the remaining minutes before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LALAL.AI is down",
        alternative: "Moises, Vocal Remover or Kits AI (monitored on DownForAI) separate stems",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  listnr: {
    slug: "listnr",
    providerSummary:
      "Listnr is a text-to-speech and podcast platform (voiceovers, voice cloning, hosting) on credit-based plans; listnr.tech now redirects to listnr.ai. Speech synthesis relays to cloud voice engines.",
    docsUrl: "https://listnr.tech",
    pricingUrl: "https://listnr.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "listnr.ai web app", description: "TTS editor", criticality: "critical" },
      { name: "Speech backend", description: "Voice synthesis relay", criticality: "critical" },
      { name: "Podcast hosting", description: "RSS and episodes", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "One voice fails while others generate",
        scope: "partial",
        signal: "Switching voice restores output",
        quickCheck: "Change voice; the failure is the underlying provider",
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
        scenario: "Listnr is down",
        alternative: "Murf AI, Blakify or Speechelo (monitored on DownForAI) provide text-to-speech",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Cloud speech providers"],
    operatorNotes: [
      "listnr.tech redirects to listnr.ai; DownForAI's probe follows the redirect.",
    ],
  },
  lmnt: {
    slug: "lmnt",
    providerSummary:
      "LMNT is a low-latency speech-synthesis API (streaming TTS and voice cloning) for developers building voice agents. Its users see incidents as API errors or rising latency; there is no consumer app.",
    docsUrl: "https://docs.lmnt.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "LMNT API", description: "Streaming TTS", criticality: "critical" },
      { name: "Console", description: "Keys and usage", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Latency rising on streaming synthesis",
        scope: "partial",
        signal: "Time-to-first-audio climbs across voices",
        quickCheck: "Measure from a second region; if all clients see it, the service is degraded",
      },
      {
        pattern: "429 or quota errors",
        scope: "local",
        signal: "Requests rejected for your account only",
        quickCheck: "Check the plan's limits in the console",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "LMNT is down",
        alternative: "ElevenLabs or Cartesia (monitored on DownForAI) offer streaming TTS APIs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  loudly: {
    slug: "loudly",
    providerSummary:
      "Loudly generates royalty-free music from genre and mood settings or text, with a web app and an API on subscription plans. Track generation is a queued job on Loudly's servers.",
    docsUrl: "https://www.loudly.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "loudly.com web app", description: "Music generator", criticality: "critical" },
      { name: "Generation backend", description: "Track rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tracks never finish generating",
        scope: "partial",
        signal: "Generations stay pending for everyone",
        quickCheck: "Try a short track; a universal stall is the backend",
      },
      {
        pattern: "Download quota reached",
        scope: "local",
        signal: "Exports refused with a plan message for your account",
        quickCheck: "Check plan usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Loudly is down",
        alternative: "Soundraw, Mubert or Beatoven.ai (monitored on DownForAI) generate royalty-free music",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "lovo-ai": {
    slug: "lovo-ai",
    providerSummary:
      "LOVO (Genny) is a text-to-speech and voice-cloning platform for voiceovers with a web studio and API on credit-based plans. lovo.ai answered HTTP 402 when this entry was written, so its hosting state should be read with care.",
    docsUrl: "https://lovo.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "lovo.ai / Genny", description: "Web studio", criticality: "critical" },
      { name: "Speech backend", description: "Voice synthesis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Site returning an error page",
        scope: "global",
        signal: "lovo.ai answers 402 or a hosting error for everyone",
        quickCheck: "Check DownForAI's probe and community reports; nothing to fix locally",
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
        scenario: "LOVO is down",
        alternative: "Murf AI, ElevenLabs or WellSaid Labs (monitored on DownForAI) provide voiceover TTS",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The DB website URL answered 402 when this entry was written; the service may be paused.",
    ],
  },
  moises: {
    slug: "moises",
    providerSummary:
      "Moises is a music-practice app (web, mobile, desktop) with AI stem separation, chord detection, pitch and speed tools, on freemium plans; separation runs on Moises' servers per song. Processing queues are the main complaint.",
    docsUrl: "https://help.moises.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Moises apps and web", description: "Clients", criticality: "critical" },
      { name: "Separation backend", description: "Stem and chord processing", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Songs stuck processing",
        scope: "partial",
        signal: "Uploads never finish separating for anyone",
        quickCheck: "Try a short song; a universal stall is the backend",
      },
      {
        pattern: "Free monthly uploads used up",
        scope: "local",
        signal: "New uploads refused for your account",
        quickCheck: "Free plans cap uploads; not an outage",
      },
      {
        pattern: "Premium not recognised in the app",
        scope: "local",
        signal: "Features locked after purchase",
        quickCheck: "Use 'restore purchases' with the same store account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Moises is down",
        alternative: "LALAL.AI, Vocal Remover or Kits AI (monitored on DownForAI) separate stems",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [],
  },
  mubert: {
    slug: "mubert",
    providerSummary:
      "Mubert generates royalty-free music from prompts (Mubert Render) and streams generative music, with an API used by apps and video tools, on subscription plans. Generation runs on Mubert's servers.",
    docsUrl: "https://mubert.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "mubert.com / Render", description: "Web app", criticality: "critical" },
      { name: "Mubert API", description: "Used by third-party apps", criticality: "high" },
      { name: "Generation backend", description: "Track rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tracks fail to generate",
        scope: "partial",
        signal: "Every prompt errors or stays pending",
        quickCheck: "Retry a short track; a universal failure is the backend",
      },
      {
        pattern: "API errors inside a third-party app",
        scope: "local",
        signal: "An app using Mubert reports music unavailable",
        quickCheck: "Check mubert.com directly; if it works, the app's integration or key is the problem",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Mubert is down",
        alternative: "Soundraw, Loudly or AIVA (monitored on DownForAI) generate background music",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  murf: {
    slug: "murf",
    providerSummary:
      "Murf AI is a text-to-speech studio for voiceovers with voice cloning, dubbing and an API, on plans with generation minutes. Synthesis runs on Murf's servers; the studio editor is a browser app.",
    docsUrl: "https://help.murf.ai",
    pricingUrl: "https://murf.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "murf.ai studio", description: "Web editor", criticality: "critical" },
      { name: "Speech backend", description: "Voice synthesis", criticality: "critical" },
      { name: "Murf API", description: "Developer access", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Voice generation failing across voices",
        scope: "partial",
        signal: "Every block errors while the editor loads",
        quickCheck: "Try one short block; a universal failure is the synthesis backend",
      },
      {
        pattern: "Exports stuck rendering",
        scope: "partial",
        signal: "Project exports never complete",
        quickCheck: "Export a single block; the render step is separate from synthesis",
      },
      {
        pattern: "Minutes exhausted",
        scope: "local",
        signal: "Generation refused with a usage message for your account",
        quickCheck: "Check plan usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Murf is down",
        alternative: "ElevenLabs, WellSaid Labs or Typecast (monitored on DownForAI) provide voiceover TTS",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  musicfx: {
    slug: "musicfx",
    providerSummary:
      "MusicFX is Google's experimental music generator (MusicLM/Lyria-based) in the AI Test Kitchen / Google Labs, free, with regional availability limits and per-account quotas. As an experiment it can be paused or moved without notice.",
    docsUrl: "https://aitestkitchen.withgoogle.com/tools/music-fx",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "AI Test Kitchen / Google Labs", description: "Experiment page", criticality: "critical" },
      { name: "Generation backend", description: "Music rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Not available in your country",
        scope: "local",
        signal: "The tool refuses access after Google sign-in",
        quickCheck: "Labs experiments roll out by region; this is availability, not an outage",
      },
      {
        pattern: "Daily generation quota reached",
        scope: "local",
        signal: "New generations refused for your account",
        quickCheck: "Wait for the reset",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "MusicFX is unavailable",
        alternative: "Suno, Udio or Stable Audio (monitored on DownForAI) generate music",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Google account"],
    operatorNotes: [
      "The DB website URL (aitestkitchen.withgoogle.com) refused non-browser requests when this entry was written; Google Labs tools move between domains.",
    ],
  },
  "notta-ai": {
    slug: "notta-ai",
    providerSummary:
      "Notta transcribes meetings, recordings and files with AI summaries, as a web app, mobile apps and a meeting bot, on plans with monthly minutes. Transcription is a queued job on Notta's servers.",
    docsUrl: "https://help.notta.ai",
    pricingUrl: "https://www.notta.ai/en/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.notta.ai", description: "Web app", criticality: "critical" },
      { name: "Transcription backend", description: "Processing jobs", criticality: "critical" },
      { name: "Meeting bot", description: "Joins Zoom / Meet / Teams", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Transcripts stuck processing",
        scope: "partial",
        signal: "Uploads never produce text, even short ones",
        quickCheck: "Try a short file; a universal stall is the backend",
      },
      {
        pattern: "Meeting bot not joining",
        scope: "partial",
        signal: "The bot misses scheduled calls",
        quickCheck: "Check the calendar connection; a widespread no-show is the bot service",
      },
      {
        pattern: "Minutes exhausted",
        scope: "local",
        signal: "Transcription refused with a usage message for your account",
        quickCheck: "Check plan usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Notta is down",
        alternative: "Fireflies.ai, Fathom or Sonix AI (monitored on DownForAI) transcribe meetings and files",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Zoom / Google Meet / Teams for the bot"],
    operatorNotes: [],
  },
  podcastle: {
    slug: "podcastle",
    providerSummary:
      "Podcastle, rebranded Async in 2025 (podcastle.ai redirects to async.com), is a browser studio for recording, editing and enhancing podcasts and videos with AI voices, on freemium plans. Recording, processing and export are separate services.",
    docsUrl: "https://help.podcastle.ai",
    pricingUrl: "https://podcastle.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "async.com studio", description: "Web app", criticality: "critical" },
      { name: "Recording service", description: "Remote sessions", criticality: "critical" },
      { name: "Processing / export", description: "Enhancement and rendering", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Remote recording fails to start or drops",
        scope: "partial",
        signal: "Guests cannot join or sessions end early, across users",
        quickCheck: "Check permissions first; if every session fails, the recording service is degraded",
      },
      {
        pattern: "Exports stuck",
        scope: "partial",
        signal: "Renders never complete across projects",
        quickCheck: "Try a short export; a universal stall is the render backend",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Async (Podcastle) is down",
        alternative: "Riverside AI, Adobe Podcast AI or Descript (monitored on DownForAI) record and edit podcasts online",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "podcastle.ai redirects to async.com; DownForAI's probe follows the redirect.",
    ],
  },
  "resemble-ai": {
    slug: "resemble-ai",
    providerSummary:
      "Resemble AI provides voice cloning, text-to-speech, speech-to-speech and deepfake detection through a web app and API, with a status page. Developers see incidents as API errors and clip-generation delays.",
    officialStatusUrl: "https://status.resemble.ai/",
    docsUrl: "https://docs.resemble.ai",
    pricingUrl: "https://www.resemble.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.resemble.ai", description: "Web app", criticality: "high" },
      { name: "Resemble API", description: "Clips, streaming, voices", criticality: "critical" },
      { name: "Voice training", description: "Cloning jobs", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Clip generation delayed or failing",
        scope: "partial",
        signal: "Async clips stay pending or API calls return 5xx",
        quickCheck: "Check status.resemble.ai; poll with backoff",
      },
      {
        pattern: "Voice training stuck",
        scope: "partial",
        signal: "New voices stay in training far beyond the estimate",
        quickCheck: "Wait; training is queued separately from synthesis",
      },
      {
        pattern: "429 or plan limits",
        scope: "local",
        signal: "Requests rejected for your account only",
        quickCheck: "Check the plan's limits in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Resemble is degraded",
        alternative: "ElevenLabs, Cartesia or Respeecher (monitored on DownForAI) offer cloning and TTS APIs",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  respeecher: {
    slug: "respeecher",
    providerSummary:
      "Respeecher provides high-fidelity speech-to-speech voice conversion for film, games and accessibility, through a web marketplace and enterprise projects. Conversions are processing jobs; enterprise work runs on dedicated setups.",
    docsUrl: "https://www.respeecher.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Respeecher marketplace", description: "Web app", criticality: "critical" },
      { name: "Conversion backend", description: "Speech-to-speech jobs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Conversions stuck processing",
        scope: "partial",
        signal: "Jobs never complete across voices",
        quickCheck: "Try a short clip; a universal stall is the backend",
      },
      {
        pattern: "Minutes exhausted",
        scope: "local",
        signal: "Conversion refused with a balance message for your account",
        quickCheck: "Check the remaining minutes before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Respeecher is down",
        alternative: "Altered.ai, Resemble AI or Kits AI (monitored on DownForAI) offer voice conversion",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "rev-ai": {
    slug: "rev-ai",
    providerSummary:
      "Rev offers human and AI transcription and captions through rev.com, plus the Rev.ai developer API for automatic speech recognition. The API and the ordering platform share Rev's status page; human orders add turnaround delays that are not outages.",
    officialStatusUrl: "https://status.rev.com/",
    docsUrl: "https://docs.rev.ai",
    pricingUrl: "https://www.rev.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "rev.com", description: "Ordering platform", criticality: "high" },
      { name: "Rev.ai API", description: "Async and streaming ASR", criticality: "critical" },
      { name: "Human transcription", description: "Turnaround-based orders", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API jobs stuck in progress",
        scope: "partial",
        signal: "Async jobs take far longer than usual across accounts",
        quickCheck: "Check status.rev.com; poll with backoff",
      },
      {
        pattern: "Human order past its turnaround",
        scope: "local",
        signal: "An order is late but AI transcripts work",
        quickCheck: "Late human orders are a fulfilment delay, not a platform outage — contact support",
      },
      {
        pattern: "Streaming sessions dropping",
        scope: "partial",
        signal: "Real-time connections close while async works",
        quickCheck: "Reconnect with backoff; the streaming component is separate",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Rev.ai is degraded",
        alternative: "AssemblyAI, Deepgram or Sonix AI (monitored on DownForAI) provide transcription",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  riffusion: {
    slug: "riffusion",
    providerSummary:
      "Riffusion began as a spectrogram-diffusion music experiment and became a full music-generation app; riffusion.com now redirects to a new brand (Flow, flowmusic.app). Generation runs on hosted GPUs with free and paid tiers.",
    docsUrl: "https://www.riffusion.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "riffusion.com → flowmusic.app", description: "Web app", criticality: "critical" },
      { name: "Generation backend", description: "Song rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Songs queued for a long time",
        scope: "partial",
        signal: "Generations wait far beyond the estimate for everyone",
        quickCheck: "Retry off-peak; a universal wait is capacity",
      },
      {
        pattern: "Old links or logins broken after the rebrand",
        scope: "local",
        signal: "Bookmarks fail or the account is not found on the new domain",
        quickCheck: "Sign in on the redirected site; migration is expected after a rebrand",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Riffusion / Flow is down",
        alternative: "Suno, Udio or Stable Audio (monitored on DownForAI) generate music",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "riffusion.com redirects to flowmusic.app; DownForAI's probe follows the redirect.",
    ],
  },
  "riverside-ai": {
    slug: "riverside-ai",
    providerSummary:
      "Riverside is a remote recording studio for podcasts and video with local high-quality capture, AI transcription, editing and clips, on subscription plans; riverside.fm now redirects to riverside.com. Recording sessions and post-processing are separate services.",
    docsUrl: "https://support.riverside.fm",
    pricingUrl: "https://riverside.fm/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "riverside.com studio", description: "Recording sessions", criticality: "critical" },
      { name: "Upload / processing", description: "Local recordings sync and AI tools", criticality: "critical" },
      { name: "Editor and exports", description: "Post-production", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Guests cannot join the studio",
        scope: "partial",
        signal: "Invite links fail or sessions do not start across users",
        quickCheck: "Check browser permissions first; if every session fails, the studio service is degraded",
      },
      {
        pattern: "Recordings stuck uploading",
        scope: "partial",
        signal: "Local files never finish syncing after the session",
        quickCheck: "Keep the browser tab open; uploads resume — the local copy is safe",
      },
      {
        pattern: "AI transcripts or exports delayed",
        scope: "partial",
        signal: "Processing takes far longer than usual",
        quickCheck: "Wait; post-processing queues clear on their own",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Riverside is down",
        alternative: "Podcastle, Adobe Podcast AI or Descript (monitored on DownForAI) record and edit remotely",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "riverside.fm redirects to riverside.com; DownForAI's probe follows the redirect.",
    ],
  },
  "sonix-ai": {
    slug: "sonix-ai",
    providerSummary:
      "Sonix transcribes, translates and subtitles audio and video with AI, via a web app and API, billed per hour of media. Transcription is a queued job on Sonix's servers.",
    docsUrl: "https://help.sonix.ai",
    pricingUrl: "https://sonix.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sonix.ai web app", description: "Upload and editor", criticality: "critical" },
      { name: "Transcription backend", description: "Processing jobs", criticality: "critical" },
      { name: "Sonix API", description: "Developer access", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Transcripts stuck processing",
        scope: "partial",
        signal: "Files never complete, even short ones",
        quickCheck: "Try a short file; a universal stall is the backend",
      },
      {
        pattern: "Balance exhausted",
        scope: "local",
        signal: "Uploads refused with a payment message for your account",
        quickCheck: "Check the balance before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sonix is down",
        alternative: "Trint, Rev AI or Notta AI (monitored on DownForAI) transcribe media",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  soundraw: {
    slug: "soundraw",
    providerSummary:
      "Soundraw generates royalty-free music by mood, genre and length with in-browser editing, on subscription plans and an API. Generation runs on Soundraw's servers; downloads are gated by plan.",
    docsUrl: "https://soundraw.io",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "soundraw.io web app", description: "Generator", criticality: "critical" },
      { name: "Generation backend", description: "Track rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Tracks fail to generate",
        scope: "partial",
        signal: "Every combination errors or stays pending",
        quickCheck: "Retry a short track; a universal failure is the backend",
      },
      {
        pattern: "Downloads refused without a plan",
        scope: "local",
        signal: "Preview works but export is gated",
        quickCheck: "Expected on the free tier; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Soundraw is down",
        alternative: "Mubert, Loudly or AIVA (monitored on DownForAI) generate background music",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  speechelo: {
    slug: "speechelo",
    providerSummary:
      "Speechelo is a web text-to-speech tool for video voiceovers sold as a one-time licence with optional upgrades, relaying to cloud speech engines. It is a small hosted app with one synthesis backend.",
    docsUrl: "https://speechelo.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "speechelo.com app", description: "TTS editor", criticality: "critical" },
      { name: "Speech backend", description: "Voice synthesis relay", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Voice generation failing",
        scope: "partial",
        signal: "Every voice errors while the editor loads",
        quickCheck: "Try one short line; a universal failure is the relay backend",
      },
      {
        pattern: "Licence or login not recognised",
        scope: "local",
        signal: "Access denied after purchase",
        quickCheck: "Check the purchase email and contact support; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Speechelo is down",
        alternative: "Murf AI, Blakify or Listnr (monitored on DownForAI) provide voiceover TTS",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Cloud speech providers"],
    operatorNotes: [],
  },
  "splash-music": {
    slug: "splash-music",
    providerSummary:
      "Splash Music generates songs and vocals from text (Splash Pro) with an API for developers and a consumer app, on freemium plans. Generation is queued on Splash's servers.",
    docsUrl: "https://www.splashmusic.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "splashmusic.com / Splash Pro", description: "Web app", criticality: "critical" },
      { name: "Generation backend", description: "Song rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Songs queued for a long time",
        scope: "partial",
        signal: "Generations wait far beyond the estimate for everyone",
        quickCheck: "Retry off-peak; a universal wait is capacity",
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
        scenario: "Splash Music is down",
        alternative: "Suno, Udio or Boomy (monitored on DownForAI) generate full songs",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "stable-audio": {
    slug: "stable-audio",
    providerSummary:
      "Stable Audio is Stability AI's music and sound-effects generator, as a web app (stableaudio.com), an API and open weights (Stable Audio Open), on credit-based plans. It follows Stability's status page.",
    officialStatusUrl: "https://status.stability.ai",
    docsUrl: "https://stableaudio.com",
    pricingUrl: "https://stableaudio.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "stableaudio.com web app", description: "Generator", criticality: "critical" },
      { name: "Stability API", description: "Audio endpoints", criticality: "high" },
      { name: "Generation backend", description: "Track rendering", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations stuck or failing",
        scope: "partial",
        signal: "Tracks never render for anyone",
        quickCheck: "Check status.stability.ai; retry later",
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
        scenario: "Stable Audio is down",
        alternative: "Suno, Udio or Soundraw (monitored on DownForAI) generate music; Stable Audio Open runs locally",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Stability AI platform"],
    operatorNotes: [],
  },
  trint: {
    slug: "trint",
    providerSummary:
      "Trint transcribes and translates audio and video for media and enterprise teams, with a collaborative editor, mobile capture and an API, on seat-based plans. Transcription is a queued job on Trint's servers.",
    docsUrl: "https://support.trint.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "app.trint.com", description: "Editor", criticality: "critical" },
      { name: "Transcription backend", description: "Processing jobs", criticality: "critical" },
      { name: "Mobile app", description: "Capture and upload", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Transcripts stuck processing",
        scope: "partial",
        signal: "Files never complete across workspaces",
        quickCheck: "Try a short file; a universal stall is the backend",
      },
      {
        pattern: "Uploads from the mobile app failing",
        scope: "local",
        signal: "Recordings stay unsynced on the phone",
        quickCheck: "Retry on Wi-Fi; the recording is kept locally until it uploads",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Trint is down",
        alternative: "Sonix AI, Rev AI or Descript (monitored on DownForAI) transcribe media",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  typecast: {
    slug: "typecast",
    providerSummary:
      "Typecast is a text-to-speech platform with expressive AI voice actors and video avatars, on credit-based plans with an API. Synthesis runs on Typecast's servers, strongest in Korean and English.",
    docsUrl: "https://typecast.ai",
    pricingUrl: "https://typecast.ai/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "typecast.ai web app", description: "Editor", criticality: "critical" },
      { name: "Speech backend", description: "Voice synthesis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Voice generation failing across actors",
        scope: "partial",
        signal: "Every line errors while the editor loads",
        quickCheck: "Try one short line; a universal failure is the synthesis backend",
      },
      {
        pattern: "Characters quota exhausted",
        scope: "local",
        signal: "Generation refused with a quota message for your account",
        quickCheck: "Check plan usage before reporting",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Typecast is down",
        alternative: "ElevenLabs, Murf AI or Lovo.ai (monitored on DownForAI) provide expressive TTS",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "vocal-remover": {
    slug: "vocal-remover",
    providerSummary:
      "Vocal Remover (vocalremover.org) is a free web tool that separates vocals and instrumentals and offers pitch, tempo and cutting tools, processing files on its servers. It sits behind bot protection and has no accounts.",
    docsUrl: "https://vocalremover.org",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "vocalremover.org", description: "Web tool", criticality: "critical" },
      { name: "Processing backend", description: "Separation jobs", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Separation stuck or failing",
        scope: "partial",
        signal: "Uploads never produce stems for anyone",
        quickCheck: "Try a short file; a universal stall is the backend",
      },
      {
        pattern: "Edge challenge instead of the site",
        scope: "local",
        signal: "A verification page or 403, often from VPNs",
        quickCheck: "Disable the VPN and complete the check",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Vocal Remover is down",
        alternative: "LALAL.AI, Moises or Kits AI (monitored on DownForAI) separate stems",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "vocalremover.org refuses automated requests, so DownForAI checks robots.txt reachability only.",
    ],
  },
  "wellsaid-labs": {
    slug: "wellsaid-labs",
    providerSummary:
      "WellSaid (formerly WellSaid Labs, wellsaidlabs.com redirects to wellsaid.io) is an enterprise text-to-speech studio and API with licensed synthetic voices, on seat-based plans. Synthesis runs on WellSaid's servers.",
    docsUrl: "https://docs.wellsaidlabs.com",
    pricingUrl: "https://wellsaidlabs.com/pricing",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "WellSaid Studio", description: "Web app", criticality: "critical" },
      { name: "WellSaid API", description: "Developer access", criticality: "high" },
      { name: "Speech backend", description: "Voice synthesis", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Renders failing across avatars",
        scope: "partial",
        signal: "Every clip errors while the studio loads",
        quickCheck: "Try one short clip; a universal failure is the synthesis backend",
      },
      {
        pattern: "API 429 or plan limits",
        scope: "local",
        signal: "Requests rejected for your account only",
        quickCheck: "Check the plan's limits in the dashboard",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "WellSaid is down",
        alternative: "Murf AI, ElevenLabs or Resemble AI (monitored on DownForAI) provide enterprise TTS",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "wellsaidlabs.com redirects to wellsaid.io; DownForAI's probe follows the redirect.",
    ],
  },
};
