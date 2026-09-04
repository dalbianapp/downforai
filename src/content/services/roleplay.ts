import type { TopServiceContent } from "@/content/top-services/types";

// ROLEPLAY — enriched service content. Feeds ErrorSignaturesPanel, ProviderSpecificPanel
// and FallbackAlternativesPanel on /[serviceSlug]. Keys are DB Service.slug values and
// MUST exist in the Service table (an orphan key is content for a 404). Keep this file
// under ~3000 lines: start roleplay-2.ts and register it in ./index.ts if it grows.
export const ROLEPLAY: Record<string, TopServiceContent> = {
  hiwaifu: {
    slug: "hiwaifu",
    providerSummary:
      "HiWaifu is an anime-style AI companion app (web and mobile) where users chat with preset or custom characters. Chat generation runs on HiWaifu's own backend; the free tier is capped and paid plans unlock faster replies and more messages.",
    docsUrl: "https://hiwaifu.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "hiwaifu.com web app", description: "Character browsing and chat", criticality: "critical" },
      { name: "iOS / Android apps", description: "Same backend as the web app", criticality: "high" },
      { name: "Chat generation backend", description: "Produces character replies", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Replies hang or come back empty while the site itself loads",
        scope: "partial",
        signal: "Characters and chat history display, but new messages spin or return blank",
        quickCheck: "Send a short message to a different character; if all stall, the generation backend is saturated — wait and retry",
      },
      {
        pattern: "Edge protection returns 403 instead of the app",
        scope: "local",
        signal: "Cloudflare challenge or 'Access denied' page, often from VPNs, shared IPs or automated clients",
        quickCheck: "Disable the VPN, retry from mobile data, and complete the browser check",
      },
      {
        pattern: "Message cap reached on the free tier looks like an outage",
        scope: "local",
        signal: "Sending stops working only for your account while other users report no issue",
        quickCheck: "Check the remaining daily/free message balance in the app before assuming HiWaifu is down",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "HiWaifu is degraded or replies stall",
        alternative: "SpicyChat AI, Talkie AI or Chai AI (all monitored on DownForAI) cover the same character-chat use case",
        switchingCost: "low",
        note: "Characters and chat history do not transfer between apps",
      },
    ],
    ecosystemDependencies: ["Cloudflare (edge protection in front of hiwaifu.com)"],
    operatorNotes: [
      "hiwaifu.com blocks automated requests (403), so DownForAI only verifies that its robots.txt is reachable — an app-level or generation outage may not register as OUTAGE. Community reports are the more reliable signal for this service.",
    ],
  },
  kajiwoto: {
    slug: "kajiwoto",
    providerSummary:
      "Kajiwoto lets users create AI companions ('Kajis') with custom personalities, train them on their own datasets and chat in rooms, on the web and in the mobile app. The web client is a single-page app talking to Kajiwoto's chat backend.",
    docsUrl: "https://kajiwoto.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "kajiwoto.ai web app", description: "Single-page app shell served for every path", criticality: "critical" },
      { name: "Chat / room backend", description: "Delivers Kaji replies in rooms", criticality: "high" },
      { name: "Mobile app", description: "Shares the web backend", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Kaji stops answering mid-conversation",
        scope: "partial",
        signal: "Messages show as sent but no reply arrives; other rooms behave the same way",
        quickCheck: "Reload the room and send one short message; if the Kaji stays silent in a new room too, the chat backend is degraded",
      },
      {
        pattern: "Blank or white screen after an app update",
        scope: "local",
        signal: "kajiwoto.ai opens but the interface never renders; a hard refresh fixes it",
        quickCheck: "Hard-refresh (Ctrl/Cmd+Shift+R) or clear the site data so the new front-end bundle loads",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kajiwoto chat is down and you need a companion chat right now",
        alternative: "Character.AI, Chai AI or Nomi.ai (monitored on DownForAI) offer comparable custom-character chat",
        switchingCost: "medium",
        note: "Custom Kaji personalities and trained datasets cannot be exported to another platform",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "kajiwoto.ai answers 200 with the same app shell for any path (including non-existent pages), so a healthy homepage probe does not prove the chat backend works — DownForAI's technical signal is weaker here than the community signal.",
    ],
  },
  janitorai: {
    slug: "janitorai",
    providerSummary:
      "JanitorAI is a large character-chat platform for user-created bots. Replies come either from JanitorAI's own model (JLLM) or from an API/proxy the user configures (OpenAI, OpenRouter and others), which changes what an 'outage' looks like.",
    officialStatusUrl: "https://status.janitorai.com/",
    docsUrl: "https://help.janitorai.com",
    communityLinks: [
      { type: "reddit", url: "https://www.reddit.com/r/JanitorAI_Official/", label: "r/JanitorAI_Official", verified: true },
    ],
    monitoredSurfaces: [
      { name: "janitorai.com web app", description: "Character discovery and chat UI", criticality: "critical" },
      { name: "JLLM generation", description: "JanitorAI's hosted model", criticality: "critical" },
      { name: "User-configured API / proxy path", description: "External models via the user's own key", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "JLLM saturated at peak hours",
        scope: "partial",
        signal: "The site loads and characters open, but generation returns 'something went wrong' or times out; users on their own API keys are unaffected",
        quickCheck: "Check status.janitorai.com, then retry with a shorter reply length or off-peak — this is the most common cause of 'JanitorAI down' reports",
      },
      {
        pattern: "Errors from a user-configured API or proxy",
        scope: "local",
        signal: "401 / 429 / 'proxy error' messages only when a custom API is selected in the chat settings",
        quickCheck: "Switch the character back to JLLM; if it answers, the problem is the external provider or the key, not JanitorAI",
      },
      {
        pattern: "Edge errors under load (5xx / 522 / rate-limit page)",
        scope: "global",
        signal: "Cloudflare error pages instead of the app, typically during traffic spikes or incidents",
        quickCheck: "Confirm on status.janitorai.com and the subreddit; nothing to fix on your side",
      },
      {
        pattern: "Character search or discovery comes back empty",
        scope: "partial",
        signal: "Existing chats work but browsing/search returns no results or spins",
        quickCheck: "Open a bot from your chat history directly; if that works, only the discovery backend is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "JLLM is saturated but the site is up",
        alternative: "Use a personal API key (OpenAI or OpenRouter) in the chat settings — the same character keeps working on an external model",
        switchingCost: "low",
        note: "Requires a paid key on the external provider",
      },
      {
        scenario: "janitorai.com is fully down",
        alternative: "SpicyChat AI, Chub AI or Character.AI (monitored on DownForAI) support importing or re-creating character cards",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [
      "Cloudflare (edge and error pages)",
      "OpenAI / OpenRouter and other providers when users bring their own API",
    ],
    operatorNotes: [
      "Two very different failure modes: JLLM saturation (site up, generation failing) versus a full outage (edge errors). DownForAI's official-status signal comes from status.janitorai.com; community reports usually spike first on JLLM saturation.",
    ],
  },
  agnai: {
    slug: "agnai",
    providerSummary:
      "Agnai (Agnaistic) is an open-source, multi-user roleplay front-end. The hosted instance at agnai.chat lets you plug in your own OpenAI, Claude, NovelAI or Kobold/AI Horde backends, so most 'Agnai is broken' reports are really the selected backend failing.",
    docsUrl: "https://github.com/agnaistic/agnai",
    communityLinks: [
      { type: "github", url: "https://github.com/agnaistic/agnai", label: "agnaistic/agnai", verified: true },
    ],
    monitoredSurfaces: [
      { name: "agnai.chat", description: "Hosted web client and account sync", criticality: "critical" },
      { name: "Configured AI backend", description: "User-selected provider or AI Horde", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generation fails with a provider error in the chat",
        scope: "local",
        signal: "A red error mentioning the backend (401, 429, context length, 'no workers') while the site itself is responsive",
        quickCheck: "Open Settings and test another preset or backend; if a different provider answers, Agnai is fine and the original provider or key is the problem",
      },
      {
        pattern: "AI Horde queue crawling",
        scope: "partial",
        signal: "Free Horde generations wait minutes or time out at peak, especially with large models selected",
        quickCheck: "Pick a smaller Horde model or add your own API key; Horde wait time is outside Agnai's control",
      },
      {
        pattern: "Character or chat data not syncing on agnai.chat",
        scope: "partial",
        signal: "Chats saved locally do not appear after login or edits revert",
        quickCheck: "Check whether you are in guest (local) mode versus logged in; export important chats from the menu before retrying",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "agnai.chat is unreachable",
        alternative: "RisuAI or SillyTavern (monitored on DownForAI) accept the same API keys and character cards",
        switchingCost: "low",
        note: "Agnai can also be self-hosted from the GitHub repository",
      },
    ],
    ecosystemDependencies: ["OpenAI, Anthropic, NovelAI or AI Horde depending on the selected backend"],
    operatorNotes: [
      "As a bring-your-own-backend client, a provider outage (OpenAI, Claude) shows up as an Agnai failure for many users at once without agnai.chat itself being down.",
    ],
  },
  "ai-dungeon": {
    slug: "ai-dungeon",
    providerSummary:
      "AI Dungeon (Latitude) is a text-adventure game driven by AI models, playable on the web at play.aidungeon.com and in iOS/Android apps. Actions consume an energy or credit balance depending on the plan, and generation runs on Latitude's model backend.",
    docsUrl: "https://help.aidungeon.com",
    pricingUrl: "https://play.aidungeon.com/pricing",
    communityLinks: [
      { type: "reddit", url: "https://www.reddit.com/r/AIDungeon/", label: "r/AIDungeon", verified: true },
    ],
    monitoredSurfaces: [
      { name: "play.aidungeon.com", description: "Web game client", criticality: "critical" },
      { name: "Mobile apps", description: "iOS and Android clients", criticality: "high" },
      { name: "Story generation backend", description: "Model inference for actions", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Actions spin without a response",
        scope: "partial",
        signal: "The adventure loads and previous text shows, but new actions hang or return 'something went wrong'",
        quickCheck: "Retry the action once, then try a different model in the settings; if every model hangs, the generation backend is degraded",
      },
      {
        pattern: "Out of energy or credits mistaken for an outage",
        scope: "local",
        signal: "Actions are refused for your account only, with an energy or credit prompt",
        quickCheck: "Check the energy/credit balance in the account menu; other players will not report problems",
      },
      {
        pattern: "Sign-in with Google or Apple fails on the app",
        scope: "local",
        signal: "The login pop-up closes without signing you in or loops back to the login screen",
        quickCheck: "Sign in on play.aidungeon.com in a browser; if that works, reinstall or update the mobile app",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "AI Dungeon generation is down mid-session",
        alternative: "NovelAI or DreamGen (monitored on DownForAI) offer AI-driven interactive storytelling with their own models",
        switchingCost: "medium",
        note: "Adventures and memory settings are not portable between platforms",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "anima-ai": {
    slug: "anima-ai",
    providerSummary:
      "Anima is a mobile-first AI companion app (iOS and Android, with a web entry at myanima.ai) focused on friendship and roleplay with a single persistent companion. Almost all usage is in the app, so store updates and the chat backend are the surfaces that matter.",
    docsUrl: "https://anima.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Anima mobile app", description: "Primary client", criticality: "critical" },
      { name: "Chat backend", description: "Companion replies and memory", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Companion stops replying inside the app",
        scope: "partial",
        signal: "Messages send but the typing indicator never resolves; restarting the app does not help",
        quickCheck: "Check the app store for a pending update, then retry after a few minutes — backend saturation is the usual cause",
      },
      {
        pattern: "Subscription not recognised after purchase",
        scope: "local",
        signal: "Premium features stay locked although the store shows an active subscription",
        quickCheck: "Use the app's 'restore purchases' option and confirm you are signed in with the account that bought the plan",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Anima is unresponsive",
        alternative: "Replika, Nomi.ai or Paradot (monitored on DownForAI) are comparable single-companion apps",
        switchingCost: "medium",
        note: "The companion's memory and personality do not transfer",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [
      "DownForAI probes the marketing site only; app-side incidents surface through community reports.",
    ],
  },
  "botify-ai-rp": {
    slug: "botify-ai-rp",
    providerSummary:
      "Botify AI (Ex-human) is a character-chat app where users talk to celebrity-style and custom personas, on mobile first and on the web at botify.ai. Conversations run on Ex-human's own models, with free daily messages and a subscription for more.",
    docsUrl: "https://botify.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "botify.ai web app", description: "Web client", criticality: "high" },
      { name: "Mobile apps", description: "Primary client for most users", criticality: "critical" },
      { name: "Chat backend", description: "Persona replies and voice", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bots answer with delays or generic filler at peak",
        scope: "partial",
        signal: "Replies take much longer than usual or ignore the last message; affects every persona at once",
        quickCheck: "Try a different persona; if all are slow, wait — this is backend load rather than an account issue",
      },
      {
        pattern: "Daily free message limit reached",
        scope: "local",
        signal: "Sending is blocked with an upgrade prompt while other users are unaffected",
        quickCheck: "Confirm the remaining free messages in the app before reporting an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Botify AI is down",
        alternative: "Character.AI, Talkie AI or Chai AI (monitored on DownForAI) cover celebrity-style and custom character chat",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "candy-ai": {
    slug: "candy-ai",
    providerSummary:
      "Candy AI is an adult-oriented AI companion platform (web and mobile) combining character chat, voice messages and image generation. The heavier features run through generation queues, so slowness on one feature does not mean the whole site is down.",
    docsUrl: "https://candy.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "candy.ai web app", description: "Chat and character creation", criticality: "critical" },
      { name: "Image generation queue", description: "Requested and 'selfie' images", criticality: "high" },
      { name: "Payments", description: "Token and subscription checkout", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Image requests stuck in the queue",
        scope: "partial",
        signal: "Chat replies arrive normally but requested images stay pending or fail with a retry prompt",
        quickCheck: "Ask for one image with a simpler prompt; if it still stalls, the image pipeline is backed up while chat is fine",
      },
      {
        pattern: "Checkout or token purchase failing",
        scope: "local",
        signal: "Card payment declined or the page returns to the pricing screen without adding tokens",
        quickCheck: "Try another payment method or card; adult-content billing is frequently rejected by issuers, which is not a Candy AI outage",
      },
      {
        pattern: "Slow or missing chat replies during evening peaks",
        scope: "partial",
        signal: "Messages send but the reply indicator stays on for a long time across characters",
        quickCheck: "Retry later; if the site itself loads, this is backend saturation rather than downtime",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Candy AI is degraded",
        alternative: "DreamGF, Muah AI or GirlfriendGPT (monitored on DownForAI) offer the same companion-plus-images format",
        switchingCost: "medium",
        note: "Characters, chat history and purchased tokens stay with Candy AI",
      },
    ],
    ecosystemDependencies: ["Payment processors (card acquirers for adult content)"],
    operatorNotes: [],
  },
  "chai-ai": {
    slug: "chai-ai",
    providerSummary:
      "Chai (Chai Research) is a mobile-first character-chat app where users create and swipe through community bots. The app runs on Chai's own models, is free with ads and a daily message cap, and there is no full web client, so incidents are almost always reported from the iOS/Android apps.",
    docsUrl: "https://www.chai-research.com",
    communityLinks: [
      { type: "reddit", url: "https://www.reddit.com/r/ChaiApp/", label: "r/ChaiApp", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Chai mobile apps", description: "Primary and practically only client", criticality: "critical" },
      { name: "Chat backend", description: "Bot replies", criticality: "critical" },
      { name: "Bot discovery feed", description: "Swipe/search of community bots", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Bots not responding in the app",
        scope: "partial",
        signal: "Messages stay on 'sending' or the bot replies with nothing across several bots",
        quickCheck: "Force-close and reopen the app, then test one bot; if it stays silent, Chai's backend is degraded — check r/ChaiApp for confirmation",
      },
      {
        pattern: "Daily message limit hit on the free tier",
        scope: "local",
        signal: "A paywall or 'out of messages' prompt for your account only",
        quickCheck: "Wait for the daily reset or watch an ad if offered; this is not an outage",
      },
      {
        pattern: "Bot feed empty or search returning nothing",
        scope: "partial",
        signal: "Existing chats work but the discovery feed will not load new bots",
        quickCheck: "Open a bot from your chat list directly; the feed service can be down while chat is up",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Chai is down on mobile",
        alternative: "Character.AI, Talkie AI or Joyland AI (monitored on DownForAI) are the closest mobile character-chat apps",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "DownForAI can only probe the chai-research.com marketing site, not the app backend — community reports are the primary signal for Chai.",
    ],
  },
  charstar: {
    slug: "charstar",
    providerSummary:
      "Charstar is a web-based character-chat platform (charstar.ai) with user-created characters and a free tier limited by generation speed and daily messages. Replies come from Charstar's hosted models, so the site and the generation backend can fail independently.",
    docsUrl: "https://charstar.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "charstar.ai web app", description: "Character browsing and chat", criticality: "critical" },
      { name: "Generation backend", description: "Character replies", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Replies queue or time out for free users at peak",
        scope: "partial",
        signal: "Long waits before each answer, sometimes a timeout, while paid users report normal speed",
        quickCheck: "Retry off-peak or shorten the message; if paid users are also stuck, the backend is down for everyone",
      },
      {
        pattern: "Site loads but chats refuse to open",
        scope: "partial",
        signal: "Character pages render, clicking a chat shows a spinner or an error toast",
        quickCheck: "Open a chat from your history; if none opens, the chat service is degraded — nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Charstar is unavailable",
        alternative: "SpicyChat AI, Pephop AI or JanitorAI (monitored on DownForAI) host similar user-created characters",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  chatfai: {
    slug: "chatfai",
    providerSummary:
      "ChatFAI is a web app for chatting with fictional, historical and celebrity-style characters, with a free message allowance and paid plans. It is a small hosted service: when it fails, it usually fails entirely rather than feature by feature.",
    docsUrl: "https://chatfai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "chatfai.com web app", description: "Character list and chat", criticality: "critical" },
      { name: "Chat backend", description: "Character replies", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Character replies error out while the site loads",
        scope: "partial",
        signal: "Sending works but the answer is replaced by an error message or nothing arrives",
        quickCheck: "Refresh and retry once; if every character fails, the generation backend is unavailable",
      },
      {
        pattern: "Monthly message allowance exhausted",
        scope: "local",
        signal: "An upgrade prompt appears when sending, only for your account",
        quickCheck: "Check the plan usage on your account page before assuming ChatFAI is down",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "ChatFAI is down",
        alternative: "Character.AI or Talkie AI (monitored on DownForAI) offer fictional and celebrity-style characters",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "chatfai.com blocks direct homepage probes, so DownForAI checks robots.txt reachability only; a backend outage may not show as OUTAGE here.",
    ],
  },
  "chub-ai": {
    slug: "chub-ai",
    providerSummary:
      "Chub AI (chub.ai) is the largest community hub for character cards, with an integrated chat (Venus) that runs either on Chub's hosted models or on an API key the user supplies. Card hosting, search and chat are separate services and rarely fail together.",
    docsUrl: "https://docs.chub.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "chub.ai card hub", description: "Search, card pages and downloads", criticality: "critical" },
      { name: "Venus chat", description: "Integrated chat client", criticality: "high" },
      { name: "Chub hosted models", description: "Subscription model tiers", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Card search or browsing returns nothing",
        scope: "partial",
        signal: "The site loads but search results and the front page stay empty or error; direct card links may still work",
        quickCheck: "Open a card by its direct URL; if that works, only the search index is down",
      },
      {
        pattern: "Hosted-model chat overloaded at peak",
        scope: "partial",
        signal: "Venus replies time out or return an overload message on Chub's own models while users on personal API keys are fine",
        quickCheck: "Switch the chat to a personal OpenAI/OpenRouter key if you have one; otherwise retry off-peak",
      },
      {
        pattern: "Card download or import fails",
        scope: "partial",
        signal: "The 'download' or 'import to SillyTavern' actions fail or produce an empty file",
        quickCheck: "Retry from the card page after a refresh; storage-side incidents resolve without user action",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Chub's hub is down and you need cards or a chat",
        alternative: "SillyTavern or RisuAI (monitored on DownForAI) read the same character-card format you already exported",
        switchingCost: "low",
        note: "Cards not yet downloaded are unavailable until the hub returns",
      },
      {
        scenario: "Venus hosted chat is overloaded",
        alternative: "JanitorAI or SpicyChat AI (monitored on DownForAI) host comparable community characters",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["User-supplied APIs (OpenAI, OpenRouter) for bring-your-own-key chats"],
    operatorNotes: [
      "venus.chub.ai is monitored separately on DownForAI as 'Venus Chub AI'; a hub outage and a chat outage are distinct events.",
    ],
  },
  "crushon-ai": {
    slug: "crushon-ai",
    providerSummary:
      "Crushon AI is an unfiltered character-chat web platform with user-created characters, a free tier limited by daily messages and paid plans for faster models. It sits behind aggressive edge protection, which shapes both its failures and how it can be monitored.",
    docsUrl: "https://crushon.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "crushon.ai web app", description: "Character browsing and chat", criticality: "critical" },
      { name: "Chat generation backend", description: "Character replies per model tier", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Edge challenge or block instead of the site",
        scope: "local",
        signal: "A Cloudflare verification loop or an access-denied page, more common on VPNs and shared networks",
        quickCheck: "Turn off the VPN or switch network and complete the verification; this is protection, not an outage",
      },
      {
        pattern: "Replies delayed or failing at peak",
        scope: "partial",
        signal: "The character page loads, the message sends, but generation spins for a long time or errors for every character",
        quickCheck: "Retry with a shorter message; if all model tiers fail, the backend is saturated",
      },
      {
        pattern: "Daily message quota reached",
        scope: "local",
        signal: "Sending is blocked with a plan prompt while the site otherwise works",
        quickCheck: "Check the remaining quota in your profile; it resets daily",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Crushon AI is degraded",
        alternative: "SpicyChat AI, JanitorAI or Pephop AI (monitored on DownForAI) offer comparable unfiltered character chat",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Cloudflare (edge protection)"],
    operatorNotes: [
      "crushon.ai refuses automated homepage requests, so DownForAI verifies robots.txt only — expect community reports to lead the technical signal.",
    ],
  },
  "dopple-ai": {
    slug: "dopple-ai",
    providerSummary:
      "Dopple AI is a character-chat platform with celebrity-style and fictional 'Dopples', available on the web and as mobile apps, with voice replies and a free tier. Chat generation and voice synthesis are separate features that can degrade independently.",
    docsUrl: "https://dopple.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "dopple.ai web app", description: "Character browsing and chat", criticality: "critical" },
      { name: "Mobile apps", description: "iOS and Android clients", criticality: "high" },
      { name: "Voice replies", description: "Text-to-speech for characters", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Text replies fine but voice never plays",
        scope: "partial",
        signal: "The play button spins or stays silent on every message while text keeps arriving",
        quickCheck: "Test voice on a second character; if none plays, the speech service is down while chat is up",
      },
      {
        pattern: "Chat stalls across all Dopples",
        scope: "partial",
        signal: "Messages send but replies never arrive, on web and in the app at the same time",
        quickCheck: "Wait a few minutes and retry; simultaneous stalls on every character are backend saturation",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Dopple AI is down",
        alternative: "Character.AI, Talkie AI or Chai AI (monitored on DownForAI) provide the same celebrity-style character chat",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  dreamgen: {
    slug: "dreamgen",
    providerSummary:
      "DreamGen is a story-writing and roleplay platform running its own fine-tuned models (the DreamGen 'Opus' family) with a credit-based plan system, a web app and an API. Generation happens on DreamGen's inference fleet, so capacity is the main variable.",
    docsUrl: "https://dreamgen.com/docs",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "dreamgen.com web app", description: "Story and roleplay editor", criticality: "critical" },
      { name: "Model inference", description: "DreamGen hosted models", criticality: "critical" },
      { name: "DreamGen API", description: "Programmatic access for third-party clients", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Generations queue or fail on the larger models",
        scope: "partial",
        signal: "Small models still answer while the biggest model returns capacity errors or long waits",
        quickCheck: "Switch to a smaller model for the session; if that also fails, inference is down overall",
      },
      {
        pattern: "Credits exhausted mistaken for an outage",
        scope: "local",
        signal: "Generation refused with a credit or plan message for your account only",
        quickCheck: "Open the billing page and check the remaining credits before reporting",
      },
      {
        pattern: "API returns 5xx while the web app works",
        scope: "partial",
        signal: "Third-party clients (SillyTavern and similar) fail against the DreamGen API although dreamgen.com generates fine",
        quickCheck: "Run one generation in the web app; if it works, the API layer alone is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "DreamGen inference is down",
        alternative: "NovelAI or AI Dungeon (monitored on DownForAI) are the closest hosted story-generation services",
        switchingCost: "medium",
        note: "Story documents and lorebooks have to be exported manually",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  dreamgf: {
    slug: "dreamgf",
    providerSummary:
      "DreamGF is an adult AI-girlfriend platform combining character creation, chat, voice and image generation, on the web and in mobile apps, with a token-based economy. Image generation is the slowest and most incident-prone part of the stack.",
    docsUrl: "https://dreamgf.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "dreamgf.ai web app", description: "Chat and character builder", criticality: "critical" },
      { name: "Image generation", description: "Character and request images", criticality: "high" },
      { name: "Token checkout", description: "Purchases and subscriptions", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Image generation stuck or failing while chat works",
        scope: "partial",
        signal: "Requested images stay 'generating' or return an error; text chat continues",
        quickCheck: "Wait and retry a single simple image; the image queue backs up independently of chat",
      },
      {
        pattern: "Chat replies slow or empty at peak hours",
        scope: "partial",
        signal: "Messages send but replies take minutes or arrive blank across characters",
        quickCheck: "Retry later; if the site loads, this is backend saturation, not downtime",
      },
      {
        pattern: "Payment declined at checkout",
        scope: "local",
        signal: "Cards refused or checkout looping back, only for some users",
        quickCheck: "Try a different payment method; issuer blocks on adult content are common and unrelated to DreamGF's availability",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "DreamGF is degraded",
        alternative: "Candy AI, Muah AI or GirlfriendGPT (monitored on DownForAI) cover the same companion-plus-images use case",
        switchingCost: "medium",
        note: "Tokens and generated characters are not transferable",
      },
    ],
    ecosystemDependencies: ["Payment processors"],
    operatorNotes: [],
  },
  "fables-gg": {
    slug: "fables-gg",
    providerSummary:
      "Fables.gg is an AI game-master platform for tabletop-style adventures: a web app where an AI narrates and adjudicates a campaign, with dice, characters and optional image generation. Sessions depend on long, stateful generations rather than single replies.",
    docsUrl: "https://fables.gg",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "fables.gg web app", description: "Campaign creation and play", criticality: "critical" },
      { name: "Narration backend", description: "AI game-master generations", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "The game master stops narrating mid-session",
        scope: "partial",
        signal: "Player actions are accepted but the narration never continues; refreshing shows the same stalled turn",
        quickCheck: "Wait a minute and resubmit the last action once; if the campaign stays frozen, the narration backend is degraded",
      },
      {
        pattern: "Campaign fails to load after login",
        scope: "partial",
        signal: "The campaign list appears but opening one shows an endless loader or an error",
        quickCheck: "Open a different campaign; if none loads, the session service is down rather than your save",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Fables.gg is down",
        alternative: "AI Dungeon or Questie (monitored on DownForAI) run AI-driven adventures, without the tabletop rules layer",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "faraday-dev": {
    slug: "faraday-dev",
    providerSummary:
      "Faraday.dev is now Backyard AI: a desktop app (Windows, macOS, Linux) that runs character chat on local open-weight models, plus optional cloud models and a character hub. Most failures are local (model download, GPU memory) rather than a service outage.",
    docsUrl: "https://docs.backyard.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "backyard.ai", description: "Website, character hub and downloads", criticality: "high" },
      { name: "Cloud models", description: "Optional hosted inference for subscribers", criticality: "medium" },
      { name: "Local inference", description: "Runs on the user's machine", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Model download stalls or fails",
        scope: "partial",
        signal: "The in-app model manager shows a download stuck at a percentage or a checksum error",
        quickCheck: "Pause and resume the download; if it fails repeatedly for every model, the download CDN is the problem",
      },
      {
        pattern: "Local generation crashes or runs out of memory",
        scope: "local",
        signal: "Replies stop or the app restarts when a large model is loaded on limited RAM/VRAM",
        quickCheck: "Load a smaller quantised model; this is hardware-side and not related to Backyard's servers",
      },
      {
        pattern: "Cloud models unavailable while local chat works",
        scope: "partial",
        signal: "Cloud-tier characters error out but local models keep answering",
        quickCheck: "Switch the character to a local model; cloud inference is the only server-side dependency",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Backyard's cloud tier or hub is down",
        alternative: "SillyTavern, Ollama or LM Studio (monitored on DownForAI) give the same local, private character chat",
        switchingCost: "medium",
        note: "Local models keep working during any Backyard outage",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "faraday.dev redirects to backyard.ai; DownForAI probes the website, which says nothing about the local app's health.",
    ],
  },
  "figgs-ai": {
    slug: "figgs-ai",
    providerSummary:
      "Figgs AI is a web-based character-chat platform (figgs.life) where users build and chat with custom personas, popular as a lighter alternative to larger character apps. It is a small hosted service with a single chat backend.",
    docsUrl: "https://figgs.life",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "figgs.life web app", description: "Persona creation and chat", criticality: "critical" },
      { name: "Chat backend", description: "Persona replies", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Persona replies fail while pages load",
        scope: "partial",
        signal: "Messages send but the answer errors or never arrives, for every persona",
        quickCheck: "Refresh and try one short message; a site-wide stall is backend saturation",
      },
      {
        pattern: "Site unreachable or returning errors",
        scope: "global",
        signal: "figgs.life times out or shows a hosting error page",
        quickCheck: "Check DownForAI's probe result and community reports; nothing to fix locally",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Figgs AI is down",
        alternative: "Character.AI, JanitorAI or SpicyChat AI (monitored on DownForAI) host comparable custom personas",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  girlfriendgpt: {
    slug: "girlfriendgpt",
    providerSummary:
      "GirlfriendGPT is an adult AI-companion web platform with chat, voice notes and image generation for custom characters, billed by subscription and tokens. Chat and image generation run on separate pipelines with different failure behaviour.",
    docsUrl: "https://girlfriendgpt.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "girlfriendgpt.com web app", description: "Chat and character creation", criticality: "critical" },
      { name: "Image generation", description: "Character images on request", criticality: "high" },
      { name: "Billing", description: "Subscription and token purchases", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Images stuck generating while chat replies arrive",
        scope: "partial",
        signal: "Requested images stay pending or fail; text conversation continues normally",
        quickCheck: "Retry one image later; the image queue is the first thing to back up under load",
      },
      {
        pattern: "Login or session drops",
        scope: "local",
        signal: "Being logged out repeatedly or the login form failing with a generic error",
        quickCheck: "Clear cookies for the site and log in again; if the login form errors for everyone, the auth service is down",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "GirlfriendGPT is degraded",
        alternative: "Candy AI, DreamGF or Muah AI (monitored on DownForAI) offer equivalent companion chat with images",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Payment processors"],
    operatorNotes: [],
  },
  "harpy-chat": {
    slug: "harpy-chat",
    providerSummary:
      "Harpy Chat is a web-based anime-style character-chat platform (harpy.chat) with user-created characters and scenarios, known for a generous free tier. All generation runs on Harpy's hosted backend; there is no bring-your-own-key option.",
    docsUrl: "https://harpy.chat",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "harpy.chat web app", description: "Character discovery and chat", criticality: "critical" },
      { name: "Generation backend", description: "Character replies", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Replies queue or fail for everyone at peak",
        scope: "partial",
        signal: "Messages send but responses take minutes or come back as an error, on every character",
        quickCheck: "Retry a short message off-peak; a free-tier-heavy service saturates in the evening",
      },
      {
        pattern: "Chats or characters not loading after login",
        scope: "partial",
        signal: "The home page renders but your chat list or a character page spins indefinitely",
        quickCheck: "Hard-refresh and open a character from a direct link; if that fails too, the data service is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Harpy Chat is down",
        alternative: "Sakura FM, Pephop AI or JanitorAI (monitored on DownForAI) host similar anime-style characters",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "holoworld-ai": {
    slug: "holoworld-ai",
    providerSummary:
      "Holoworld is a platform for creating AI agents and 3D avatar characters that can chat, stream and launch on-chain, with a web app and documentation. Agent generation, chat and the blockchain-linked features are distinct systems.",
    docsUrl: "https://docs.holoworld.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "holoworld.app web app", description: "Agent studio and chat", criticality: "critical" },
      { name: "Agent chat backend", description: "Replies from created agents", criticality: "high" },
      { name: "On-chain features", description: "Wallet connection and launches", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Wallet connection or on-chain action fails",
        scope: "local",
        signal: "The wallet prompt never appears or a transaction is rejected while the rest of the app works",
        quickCheck: "Reconnect the wallet and check the network's own status; chain congestion is outside Holoworld",
      },
      {
        pattern: "Agent chat or generation stalls",
        scope: "partial",
        signal: "Creating or chatting with an agent hangs for every agent",
        quickCheck: "Retry after a few minutes; if the studio loads but nothing generates, the AI backend is saturated",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Holoworld chat is down",
        alternative: "Character.AI or Inworld AI (monitored on DownForAI) cover character chat and agent creation, without the on-chain layer",
        switchingCost: "high",
      },
    ],
    ecosystemDependencies: ["Solana network and wallet providers for on-chain features"],
    operatorNotes: [],
  },
  "inworld-ai": {
    slug: "inworld-ai",
    providerSummary:
      "Inworld AI provides a character engine for games and apps: a Studio to design characters and a runtime API/SDK that delivers dialogue, voice and emotions to Unity, Unreal and web integrations. Developers see failures as API errors or latency, not as a consumer app going down.",
    docsUrl: "https://docs.inworld.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Inworld Studio", description: "Character design web app", criticality: "high" },
      { name: "Runtime API / SDKs", description: "Dialogue, voice and emotion generation", criticality: "critical" },
      { name: "inworld.ai", description: "Website and docs", criticality: "low" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Runtime API returns 429 or 5xx",
        scope: "partial",
        signal: "In-game characters stop responding; SDK logs show rate-limit or server errors while Studio still loads",
        quickCheck: "Reproduce with a single session from the Studio playground; if it fails there too, the runtime is degraded",
      },
      {
        pattern: "Latency spikes on dialogue and voice",
        scope: "partial",
        signal: "Responses arrive several seconds late or voice audio lags behind text",
        quickCheck: "Disable voice for a test session; if text alone is fast, the speech pipeline is the bottleneck",
      },
      {
        pattern: "Studio changes not reflected in the runtime",
        scope: "local",
        signal: "Edited characters keep old behaviour in the integration",
        quickCheck: "Confirm the workspace and API key match the edited character and that the scene was redeployed",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Inworld runtime is down for a live game",
        alternative: "OpenAI API or Anthropic API (monitored on DownForAI) can serve plain dialogue behind a feature flag",
        switchingCost: "high",
        note: "Loses Inworld's character memory, goals and emotion features",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "joyland-ai": {
    slug: "joyland-ai",
    providerSummary:
      "Joyland AI is a character-chat platform on the web and mobile with user-created characters and story modes. Generation runs on Joyland's hosted models with a free tier, so incidents show up as slow or missing replies rather than a blank site.",
    docsUrl: "https://joyland.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "joyland.ai web app", description: "Character discovery and chat", criticality: "critical" },
      { name: "Mobile apps", description: "iOS and Android clients", criticality: "high" },
      { name: "Chat backend", description: "Character replies", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Replies never arrive across characters",
        scope: "partial",
        signal: "Messages are marked sent but no reply appears, on web and app alike",
        quickCheck: "Retry a short message after a few minutes; if every character is silent, the backend is saturated",
      },
      {
        pattern: "Sign-in with Google or Discord fails",
        scope: "local",
        signal: "The provider login completes but Joyland returns to the login screen",
        quickCheck: "Try the other sign-in provider or an incognito window; a provider callback issue is usually short-lived",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Joyland AI is down",
        alternative: "Talkie AI, Chai AI or Character.AI (monitored on DownForAI) offer comparable character chat on web and mobile",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  juicychat: {
    slug: "juicychat",
    providerSummary:
      "JuicyChat AI is an adult character-chat web platform with community-created characters, a free allowance and paid credits for premium models and images. It is a single hosted service: chat, images and billing share one backend team and one status.",
    docsUrl: "https://juicychat.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "juicychat.ai web app", description: "Character browsing and chat", criticality: "critical" },
      { name: "Chat and image backend", description: "Replies and generated images", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Replies failing on premium models while the basic model works",
        scope: "partial",
        signal: "Switching the character to the default model restores answers; premium tiers error or time out",
        quickCheck: "Change the model in the chat settings; a premium-only failure is an upstream capacity issue",
      },
      {
        pattern: "Credits not applied after purchase",
        scope: "local",
        signal: "The balance does not move after a successful payment",
        quickCheck: "Log out and back in; if the balance is still wrong after an hour, contact support with the receipt — it is not a site outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "JuicyChat AI is down",
        alternative: "SpicyChat AI, Crushon AI or Pephop AI (monitored on DownForAI) host comparable unfiltered characters",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Third-party model providers behind the premium tiers"],
    operatorNotes: [],
  },
  kindroid: {
    slug: "kindroid",
    providerSummary:
      "Kindroid is an AI companion app (web and mobile) with long-term memory, voice calls, selfies and group chats, running on Kindroid's own models. Its features sit on different pipelines, so voice or image problems commonly occur while text chat is healthy.",
    docsUrl: "https://kindroid.ai",
    communityLinks: [
      { type: "reddit", url: "https://www.reddit.com/r/Kindroid/", label: "r/Kindroid", verified: true },
    ],
    monitoredSurfaces: [
      { name: "kindroid.ai web app", description: "Chat, memory and settings", criticality: "critical" },
      { name: "Mobile apps", description: "iOS and Android clients", criticality: "high" },
      { name: "Voice calls", description: "Real-time speech", criticality: "medium" },
      { name: "Selfie / image generation", description: "Character images", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Text replies delayed for everyone at peak",
        scope: "partial",
        signal: "Messages send but the reply takes minutes; r/Kindroid fills with 'is it down' threads at the same time",
        quickCheck: "Wait and retry rather than resending; duplicate sends make the backlog worse",
      },
      {
        pattern: "Voice calls dropping or not connecting",
        scope: "partial",
        signal: "Calls end after a few seconds or never start while text chat works",
        quickCheck: "Try a call on Wi-Fi versus mobile data; if both fail, the voice service is degraded",
      },
      {
        pattern: "Selfies failing to generate",
        scope: "partial",
        signal: "Image requests return an error or stay pending; text is unaffected",
        quickCheck: "Retry one selfie later; the image pipeline recovers independently of chat",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Kindroid is degraded",
        alternative: "Nomi.ai or Replika (monitored on DownForAI) are the closest memory-focused companion apps",
        switchingCost: "high",
        note: "Kindroid's memory and backstory cannot be exported to another companion",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "mate-ai": {
    slug: "mate-ai",
    providerSummary:
      "Mate AI is a companion app for personalised conversations and relationship-style roleplay, offered on mobile with a web presence at mate.ai. It is a small hosted service whose failures are almost always the chat backend.",
    docsUrl: "https://mate.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Mate AI mobile app", description: "Primary client", criticality: "critical" },
      { name: "Chat backend", description: "Companion replies", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Companion replies stop arriving",
        scope: "partial",
        signal: "Messages send but no answer comes, even after restarting the app",
        quickCheck: "Check for an app update and retry after a few minutes; a fully silent companion is a backend incident",
      },
      {
        pattern: "Subscription features locked despite payment",
        scope: "local",
        signal: "Premium options remain gated for your account only",
        quickCheck: "Use 'restore purchases' in the app with the same store account",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Mate AI is unavailable",
        alternative: "Replika, Anima AI or Paradot (monitored on DownForAI) provide similar companion chat",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [
      "Only the mate.ai website is probed by DownForAI; app incidents surface via community reports.",
    ],
  },
  "muah-ai": {
    slug: "muah-ai",
    providerSummary:
      "Muah AI is an unfiltered AI-companion platform with chat, voice, photo generation and a mobile app, sold by subscription. Its generation features run on separate services, so users typically see one feature break while the rest keep working.",
    docsUrl: "https://muah.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "muah.ai web app", description: "Chat and companion settings", criticality: "critical" },
      { name: "Photo and voice generation", description: "Media features", criticality: "high" },
      { name: "Mobile app", description: "Shares the web backend", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Photo requests fail while chat continues",
        scope: "partial",
        signal: "Image generation returns an error or nothing; text replies keep arriving",
        quickCheck: "Retry a single photo later; the media pipeline is the first to saturate",
      },
      {
        pattern: "Chat replies slow or blank at peak",
        scope: "partial",
        signal: "Long waits then an empty message, across companions",
        quickCheck: "Retry with a shorter message off-peak; a site that loads but does not generate is backend saturation",
      },
      {
        pattern: "Login not working after a password reset",
        scope: "local",
        signal: "New credentials refused or the reset email never arrives",
        quickCheck: "Check spam for the reset email and wait a few minutes before retrying; if the login form errors for everyone, the auth service is down",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Muah AI is degraded",
        alternative: "Candy AI, DreamGF or JuicyChat AI (monitored on DownForAI) cover unfiltered companion chat with images",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "nectar-ai": {
    slug: "nectar-ai",
    providerSummary:
      "Nectar AI (trynectar.ai) combines adult image generation with AI companion chat: users design a character, generate images of it and chat with it, on a credit-based plan. Image generation carries most of the load and most of the incidents.",
    docsUrl: "https://trynectar.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "trynectar.ai web app", description: "Character studio, images and chat", criticality: "critical" },
      { name: "Image generation queue", description: "Character image renders", criticality: "critical" },
      { name: "Companion chat", description: "Text replies", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Image generations stuck in the queue",
        scope: "partial",
        signal: "Renders stay at 'in queue' far longer than usual or fail after a long wait",
        quickCheck: "Generate one image at a lower quality setting; if it also stalls, the GPU queue is saturated",
      },
      {
        pattern: "Credits deducted for failed generations",
        scope: "local",
        signal: "The balance drops although the image never appeared",
        quickCheck: "Refresh the gallery first — the image often exists; otherwise report the job id to support",
      },
      {
        pattern: "Chat replies fail while images generate",
        scope: "partial",
        signal: "Companion chat errors or stays silent although the image studio works",
        quickCheck: "Retry a short message; chat and image pipelines are independent",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Nectar AI's image queue is down",
        alternative: "Candy AI or DreamGF (monitored on DownForAI) also pair companion chat with image generation",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "nomi-ai": {
    slug: "nomi-ai",
    providerSummary:
      "Nomi.ai is an AI companion platform (web, iOS, Android) with persistent memory, group chats, voice and image 'selfies', running on Nomi's own models. Its user base is active and vocal, so r/NomiAI is usually the fastest confirmation of an incident.",
    docsUrl: "https://nomi.ai",
    communityLinks: [
      { type: "reddit", url: "https://www.reddit.com/r/NomiAI/", label: "r/NomiAI", verified: true },
    ],
    monitoredSurfaces: [
      { name: "nomi.ai web app", description: "Chat, memory and settings", criticality: "critical" },
      { name: "Mobile apps", description: "iOS and Android clients", criticality: "high" },
      { name: "Message generation", description: "Nomi replies and group chats", criticality: "critical" },
      { name: "Selfies / art", description: "Image generation", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Nomis stop replying or take minutes to answer",
        scope: "partial",
        signal: "Messages show as delivered but no reply, on web and mobile at once; several users report it within minutes on r/NomiAI",
        quickCheck: "Do not resend; wait a few minutes and check the subreddit — resending queues duplicates",
      },
      {
        pattern: "Selfies or art requests failing",
        scope: "partial",
        signal: "Image requests error or never complete while text conversation is normal",
        quickCheck: "Retry one image later; the image pipeline recovers separately",
      },
      {
        pattern: "Voice messages or calls not working",
        scope: "partial",
        signal: "Audio playback fails or calls do not connect on the app",
        quickCheck: "Test on a different network; if it fails everywhere, the voice service is degraded",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Nomi.ai is degraded",
        alternative: "Kindroid or Replika (monitored on DownForAI) are the closest memory-based companion apps",
        switchingCost: "high",
        note: "Nomi memory, shared notes and group chats cannot be transferred",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  novelai: {
    slug: "novelai",
    providerSummary:
      "NovelAI (Anlatan) is a subscription AI storytelling service with its own text models and a separate anime image generator, paid through tiers and Anlas credits for images. Text generation and image generation run on different GPU pools and fail independently.",
    docsUrl: "https://docs.novelai.net",
    communityLinks: [
      { type: "reddit", url: "https://www.reddit.com/r/NovelAi/", label: "r/NovelAi", verified: true },
    ],
    monitoredSurfaces: [
      { name: "novelai.net web app", description: "Story editor and image generator", criticality: "critical" },
      { name: "Text generation", description: "Story models", criticality: "critical" },
      { name: "Image generation", description: "Anime image models", criticality: "high" },
      { name: "NovelAI API", description: "Used by third-party clients", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Image generation queued or failing while text works",
        scope: "partial",
        signal: "Image requests hang or return errors; story generation keeps responding",
        quickCheck: "Generate one text continuation; if it works, only the image cluster is saturated",
      },
      {
        pattern: "502 / 'unable to reach' errors during incidents",
        scope: "global",
        signal: "The web app fails to load or every generation returns a gateway error",
        quickCheck: "Check r/NovelAi for a pinned incident thread; nothing to fix on your side",
      },
      {
        pattern: "Anlas balance exhausted",
        scope: "local",
        signal: "Image generation refused for your account with an Anlas prompt; text still works",
        quickCheck: "Check the Anlas balance in account settings; Opus subscribers get unlimited standard generations",
      },
      {
        pattern: "Third-party clients failing against the API",
        scope: "partial",
        signal: "SillyTavern or similar clients error while novelai.net itself generates",
        quickCheck: "Run one generation on the website; if it works, the API layer or your token is the issue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "NovelAI text generation is down",
        alternative: "DreamGen or AI Dungeon (monitored on DownForAI) offer hosted story generation",
        switchingCost: "medium",
        note: "Lorebooks and story files need manual export",
      },
      {
        scenario: "NovelAI image generation is down",
        alternative: "Yodayo or SeaArt AI (monitored on DownForAI) generate anime-style images",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  paradot: {
    slug: "paradot",
    providerSummary:
      "Paradot is an AI companion app centred on one persistent 'AI being' with memory and emotional conversation, available on iOS and Android with a web version. Most incidents are app-side: replies stalling or memory features failing.",
    docsUrl: "https://www.paradot.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Paradot mobile app", description: "Primary client", criticality: "critical" },
      { name: "Chat and memory backend", description: "Companion replies", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Companion replies stuck on 'thinking'",
        scope: "partial",
        signal: "Messages send but the reply never resolves, even after relaunching the app",
        quickCheck: "Wait a few minutes and retry once; if it persists across a reinstall, the backend is degraded",
      },
      {
        pattern: "Memory or diary features not saving",
        scope: "partial",
        signal: "Recent conversations are missing from memory recall while chat still works",
        quickCheck: "Check again after an hour; memory processing runs asynchronously and catches up",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Paradot is unavailable",
        alternative: "Replika, Nomi.ai or Anima AI (monitored on DownForAI) are comparable single-companion apps",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [],
  },
  "pephop-ai": {
    slug: "pephop-ai",
    providerSummary:
      "Pephop AI is a web-based, unfiltered character-chat platform with anime and fictional personas created by the community, on a free tier plus subscriptions for faster models. Everything runs on Pephop's hosted backend.",
    docsUrl: "https://pephop.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "pephop.ai web app", description: "Character discovery and chat", criticality: "critical" },
      { name: "Generation backend", description: "Character replies per model tier", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Free-tier replies waiting far longer than usual",
        scope: "partial",
        signal: "Free users see long delays or timeouts while subscribers report normal speed",
        quickCheck: "Retry off-peak; if subscribers are also stuck, the backend is down for all tiers",
      },
      {
        pattern: "Character page loads but the chat will not send",
        scope: "partial",
        signal: "The send button spins or an error toast appears on every character",
        quickCheck: "Hard-refresh once; a site-wide send failure is backend-side",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Pephop AI is down",
        alternative: "JanitorAI, SpicyChat AI or Harpy Chat (monitored on DownForAI) host similar community characters",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  "poly-ai": {
    slug: "poly-ai",
    providerSummary:
      "Poly.AI here refers to the character-chat app (voice and text personas) tracked in DownForAI's roleplay category. It is primarily a mobile app with story-style characters and voice replies; text and voice generation are separate pipelines.",
    docsUrl: "https://poly.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Poly.AI mobile app", description: "Primary client", criticality: "critical" },
      { name: "Chat and voice backend", description: "Character replies and speech", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Voice replies silent while text arrives",
        scope: "partial",
        signal: "Characters answer in text but audio does not play for any of them",
        quickCheck: "Check the device volume and try one other character; if all are mute, the speech service is down",
      },
      {
        pattern: "Replies stalling across characters",
        scope: "partial",
        signal: "Messages send, no answer for minutes, restart does not help",
        quickCheck: "Wait and retry; a total stall is backend saturation rather than an account issue",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Poly.AI is down",
        alternative: "Talkie AI, Character.AI or Dopple AI (monitored on DownForAI) offer voice-enabled character chat",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The poly.ai domain also serves PolyAI's enterprise voice-assistant product (tracked separately under Support); DownForAI's probe of that domain does not reflect the character app's health.",
    ],
  },
  questie: {
    slug: "questie",
    providerSummary:
      "Questie is an AI adventure platform (questie.ai) where an AI narrator runs quests and interactive stories, on the web and mobile. Sessions rely on stateful narration, so a backend stall freezes the quest rather than producing an error.",
    docsUrl: "https://www.questie.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "questie.ai web app", description: "Quest creation and play", criticality: "critical" },
      { name: "Narration backend", description: "AI narrator generations", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "The narrator stops responding mid-quest",
        scope: "partial",
        signal: "Actions are accepted but the story does not advance, on every quest",
        quickCheck: "Reload and resubmit the last action once; a frozen narrator on all quests is a backend incident",
      },
      {
        pattern: "Quests fail to load from the library",
        scope: "partial",
        signal: "The quest list shows but opening one spins indefinitely",
        quickCheck: "Try a different quest; if none opens, the session service is down rather than your save",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Questie is down",
        alternative: "AI Dungeon or Fables.gg (monitored on DownForAI) run AI-narrated adventures",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  replika: {
    slug: "replika",
    providerSummary:
      "Replika (Luka) is one of the oldest AI companion apps, on iOS, Android and the web, with text chat, voice calls, AR and a Pro subscription. Its failures are well known to its community: replies not arriving, calls failing and subscription state not syncing.",
    docsUrl: "https://help.replika.com",
    communityLinks: [
      { type: "reddit", url: "https://www.reddit.com/r/replika/", label: "r/replika", verified: true },
    ],
    monitoredSurfaces: [
      { name: "Replika mobile apps", description: "Primary clients", criticality: "critical" },
      { name: "Web app", description: "Browser client", criticality: "high" },
      { name: "Chat backend", description: "Replies and memory", criticality: "critical" },
      { name: "Voice calls / AR", description: "Real-time features", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Replika not responding or 'typing' forever",
        scope: "partial",
        signal: "Messages send but the reply never comes, on app and web at once; r/replika reports it within minutes",
        quickCheck: "Wait rather than resend; check the subreddit for a pinned outage post",
      },
      {
        pattern: "Voice calls failing to connect",
        scope: "partial",
        signal: "Calls end immediately or never ring while text chat works",
        quickCheck: "Retry on a different network; if calls fail everywhere, the voice service is degraded",
      },
      {
        pattern: "Pro subscription not recognised",
        scope: "local",
        signal: "Pro features locked after purchase or after switching devices",
        quickCheck: "Use 'restore purchases' with the same store account, then relaunch the app",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Replika is degraded",
        alternative: "Nomi.ai, Kindroid or Paradot (monitored on DownForAI) offer comparable companion chat with memory",
        switchingCost: "high",
        note: "Years of Replika memory and relationship level do not transfer",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [
      "replika.ai redirects to replika.com; DownForAI probes the website, while incidents are mostly app-side and reported by the community.",
    ],
  },
  risuai: {
    slug: "risuai",
    providerSummary:
      "RisuAI is an open-source roleplay client (web at risuai.xyz, desktop builds) that stores data locally and talks to the model provider you configure (OpenAI, Claude, OpenRouter, local backends). Practically every failure is the provider or the browser storage, not RisuAI's site.",
    docsUrl: "https://github.com/kwaroran/RisuAI",
    communityLinks: [
      { type: "github", url: "https://github.com/kwaroran/RisuAI", label: "kwaroran/RisuAI", verified: true },
    ],
    monitoredSurfaces: [
      { name: "risuai.xyz", description: "Hosted web client (static)", criticality: "high" },
      { name: "Configured model provider", description: "User-selected API", criticality: "critical" },
      { name: "Browser / local storage", description: "Chats and characters", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Provider errors shown in the chat",
        scope: "local",
        signal: "401, 429 or timeout messages naming the API; the client itself is responsive",
        quickCheck: "Test the same key in another client or switch provider; RisuAI cannot fix an upstream outage",
      },
      {
        pattern: "Characters or chats missing after a browser update",
        scope: "local",
        signal: "The web client opens empty because browser storage was cleared or blocked",
        quickCheck: "Restore from a RisuAI backup file; enable persistent storage or use the desktop build to avoid recurrence",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "risuai.xyz is unreachable",
        alternative: "SillyTavern or Agnai (monitored on DownForAI) read the same character cards and API keys",
        switchingCost: "low",
        note: "The desktop build of RisuAI keeps working when the website is down",
      },
    ],
    ecosystemDependencies: ["OpenAI, Anthropic, OpenRouter or local backends depending on configuration"],
    operatorNotes: [
      "A provider outage (OpenAI, Claude) appears as 'RisuAI is down' to many users at once even though the client is fine.",
    ],
  },
  roleplai: {
    slug: "roleplai",
    providerSummary:
      "RolePlai is a mobile-first character-chat app (iOS and Android, web at roleplai.app) for creating and chatting with custom AI characters, with a free tier and subscriptions. Incidents are app-side and usually mean the chat backend is saturated.",
    docsUrl: "https://www.roleplai.app",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "RolePlai mobile app", description: "Primary client", criticality: "critical" },
      { name: "Chat backend", description: "Character replies", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Characters not answering in the app",
        scope: "partial",
        signal: "Messages send but replies never arrive, for every character",
        quickCheck: "Update the app if a version is pending, then retry after a few minutes",
      },
      {
        pattern: "Free daily limit reached",
        scope: "local",
        signal: "Sending blocked with an upgrade prompt for your account only",
        quickCheck: "Wait for the reset or upgrade; not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "RolePlai is down",
        alternative: "Chai AI, Talkie AI or Character.AI (monitored on DownForAI) are comparable mobile character-chat apps",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play billing"],
    operatorNotes: [],
  },
  "sakura-fm": {
    slug: "sakura-fm",
    providerSummary:
      "Sakura FM is an anime-style character-chat web app with community characters and voice replies, free with limits and a subscription for faster, longer responses. Generation runs on Sakura's hosted models.",
    docsUrl: "https://www.sakura.fm",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "sakura.fm web app", description: "Character discovery and chat", criticality: "critical" },
      { name: "Generation backend", description: "Character replies and voice", criticality: "critical" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Replies slow or failing at peak for free users",
        scope: "partial",
        signal: "Long waits or errors on the free tier; subscribers less affected",
        quickCheck: "Retry a shorter message off-peak; if subscribers also fail, the backend is down",
      },
      {
        pattern: "Voice not playing on replies",
        scope: "partial",
        signal: "Text arrives but the audio button spins for every character",
        quickCheck: "Test another character; a universal silence is the speech service, not your device",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Sakura FM is down",
        alternative: "Harpy Chat, Yodayo or HiWaifu (monitored on DownForAI) host similar anime-style characters",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [],
  },
  sillytavern: {
    slug: "sillytavern",
    providerSummary:
      "SillyTavern is a self-hosted roleplay front-end: you run it on your own machine and connect it to a model API (OpenAI, Claude, OpenRouter, KoboldCpp, Ollama and many others). sillytavern.app only hosts the website and docs, so 'SillyTavern is down' almost always means your backend or your local install.",
    docsUrl: "https://docs.sillytavern.app",
    communityLinks: [
      { type: "github", url: "https://github.com/SillyTavern/SillyTavern", label: "SillyTavern/SillyTavern", verified: true },
      { type: "reddit", url: "https://www.reddit.com/r/SillyTavernAI/", label: "r/SillyTavernAI", verified: true },
      { type: "discord", url: "https://discord.gg/sillytavern", label: "SillyTavern Discord", verified: true },
    ],
    monitoredSurfaces: [
      { name: "sillytavern.app", description: "Website and documentation only", criticality: "low" },
      { name: "Your configured API backend", description: "Where generations actually run", criticality: "critical" },
      { name: "Local install", description: "Node server on the user's machine", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "API errors from the connected backend",
        scope: "local",
        signal: "Red error banners naming the provider (401, 429, 'context length', connection refused)",
        quickCheck: "Press 'Test message' in API Connections; if it fails, the provider, key or endpoint URL is the issue — not SillyTavern",
      },
      {
        pattern: "Broken install after an update",
        scope: "local",
        signal: "The server fails to start or the UI shows a blank page after git pull or a release update",
        quickCheck: "Run the install script again (npm install) and check the terminal; extensions are the usual culprit",
      },
      {
        pattern: "Extensions or Extras not loading",
        scope: "local",
        signal: "Image generation, TTS or vector storage extensions error while chat works",
        quickCheck: "Disable the extension and confirm chat works; check the extension's own backend (Stable Diffusion, TTS server)",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Your local install is broken",
        alternative: "RisuAI or Agnai (monitored on DownForAI) run in the browser with the same keys and character cards",
        switchingCost: "low",
      },
      {
        scenario: "Your model provider is down",
        alternative: "Ollama (monitored on DownForAI) for a local model, or another hosted provider such as OpenRouter in the API connection",
        switchingCost: "low",
        note: "Presets and prompts may need adjusting per model",
      },
    ],
    ecosystemDependencies: ["Whatever API backend the user configures"],
    operatorNotes: [
      "DownForAI monitors sillytavern.app (docs site) only. It cannot see local installs; community reports about SillyTavern usually reflect a provider outage.",
    ],
  },
  "spicychat-ai": {
    slug: "spicychat-ai",
    providerSummary:
      "SpicyChat AI is a large unfiltered character-chat platform with community characters, a free tier that goes through a waiting queue at busy times, and subscriptions that skip the queue and unlock bigger models. The queue is its signature behaviour and the source of most 'is it down' reports.",
    docsUrl: "https://docs.spicychat.ai",
    communityLinks: [
      { type: "reddit", url: "https://www.reddit.com/r/SpicyChatAI/", label: "r/SpicyChatAI", verified: true },
    ],
    monitoredSurfaces: [
      { name: "spicychat.ai web app", description: "Character discovery and chat", criticality: "critical" },
      { name: "Generation backend", description: "Per-tier model inference", criticality: "critical" },
      { name: "Free-tier queue", description: "Waiting line before generation", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Stuck in the free-tier queue",
        scope: "partial",
        signal: "A queue position or 'waiting for a slot' message before every reply at peak; paid users are unaffected",
        quickCheck: "This is by design under load; wait for the position to reach zero or retry off-peak",
      },
      {
        pattern: "Generation errors after leaving the queue",
        scope: "partial",
        signal: "The queue completes but the reply fails or is empty, on multiple characters",
        quickCheck: "Retry once with a shorter message; repeated failures on every tier mean inference is down",
      },
      {
        pattern: "Character page or search not loading",
        scope: "partial",
        signal: "Discovery is empty or spins while existing chats work",
        quickCheck: "Open a chat from your history; a discovery-only failure is the search service",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "SpicyChat AI's queue is unbearable or inference is down",
        alternative: "JanitorAI, Crushon AI or Chub AI (monitored on DownForAI) host comparable unfiltered characters",
        switchingCost: "low",
        note: "Character cards can often be re-imported on the other platforms",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "A long queue is congestion, not an outage; DownForAI's probe sees the site as up in that state, so community reports carry the signal.",
    ],
  },
  "talkie-ai": {
    slug: "talkie-ai",
    providerSummary:
      "Talkie AI is a character-chat app on iOS and Android (with a web version) featuring voice replies, collectible character cards and story-style personas. It is app-first, so store availability, sign-in and the chat backend are what actually fail.",
    docsUrl: "https://www.talkie-ai.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "Talkie mobile apps", description: "Primary clients", criticality: "critical" },
      { name: "Chat and voice backend", description: "Character replies and speech", criticality: "critical" },
      { name: "Web app", description: "Browser client", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Characters not replying in the app",
        scope: "partial",
        signal: "Messages send but no answer arrives, across characters, even after relaunching",
        quickCheck: "Check for an app update, then retry after a few minutes; a global silence is backend-side",
      },
      {
        pattern: "Voice replies missing while text works",
        scope: "partial",
        signal: "The audio player stays silent for every character",
        quickCheck: "Test one other character; if all are silent, the speech service is degraded",
      },
      {
        pattern: "App unavailable or restricted in your region",
        scope: "local",
        signal: "Store listing missing or sign-in refused from certain countries",
        quickCheck: "Confirm regional availability on the store; this is a distribution restriction, not an outage",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Talkie AI is down",
        alternative: "Character.AI, Chai AI or Joyland AI (monitored on DownForAI) offer comparable mobile character chat",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: ["Apple App Store / Google Play distribution"],
    operatorNotes: [
      "DownForAI probes the talkie-ai.com website; app incidents are visible mainly through community reports.",
    ],
  },
  "venus-chub-ai": {
    slug: "venus-chub-ai",
    providerSummary:
      "Venus (venus.chub.ai) is the chat front-end of Chub AI: it loads character cards from the hub and generates replies either on Chub's subscription models or on an API key you provide. Venus can be down while the card hub is up, and vice versa.",
    docsUrl: "https://docs.chub.ai",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "venus.chub.ai", description: "Chat client", criticality: "critical" },
      { name: "Chub hosted models", description: "Subscription inference tiers", criticality: "high" },
      { name: "User-supplied API", description: "Bring-your-own-key path", criticality: "medium" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Hosted-model replies time out at peak",
        scope: "partial",
        signal: "Generation hangs or returns an overload error on Chub's models while API-key users chat normally",
        quickCheck: "Switch the connection to a personal key if you have one; otherwise retry off-peak",
      },
      {
        pattern: "Chat client loads but cards will not import",
        scope: "partial",
        signal: "Opening a character from the hub inside Venus fails or shows an empty card",
        quickCheck: "Load the card from chub.ai directly; if the hub works, only the Venus import path is degraded",
      },
      {
        pattern: "Errors from a user-supplied API key",
        scope: "local",
        signal: "401 / 429 messages only when a personal provider is selected",
        quickCheck: "Switch back to a Chub model; if it answers, the external provider or key is at fault",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Venus is down but you have your cards",
        alternative: "SillyTavern or RisuAI (monitored on DownForAI) open the same cards with your own key",
        switchingCost: "low",
      },
      {
        scenario: "Chub's hosted models are overloaded",
        alternative: "JanitorAI or SpicyChat AI (monitored on DownForAI) run hosted characters without a key",
        switchingCost: "medium",
      },
    ],
    ecosystemDependencies: ["Chub AI card hub", "User-supplied providers (OpenAI, OpenRouter)"],
    operatorNotes: [
      "Chub AI's hub (chub.ai) is tracked separately on DownForAI; check both when Venus misbehaves.",
    ],
  },
  yodayo: {
    slug: "yodayo",
    providerSummary:
      "Yodayo, now operating as Moescape, is an anime-focused platform combining AI art generation with character chat ('Tavern'), on a free tier plus credits and subscriptions. Image generation and chat run on separate queues.",
    docsUrl: "https://yodayo.com",
    communityLinks: [],
    monitoredSurfaces: [
      { name: "yodayo.com / moescape.ai", description: "Web app: art and Tavern chat", criticality: "critical" },
      { name: "Image generation queue", description: "Anime image renders", criticality: "high" },
      { name: "Tavern chat backend", description: "Character replies", criticality: "high" },
    ],
    knownFailurePatterns: [
      {
        pattern: "Image generations queued for a long time",
        scope: "partial",
        signal: "Renders stay pending far longer than usual while chat replies still arrive",
        quickCheck: "Generate one image at a smaller size; a stalled queue for everyone is GPU saturation",
      },
      {
        pattern: "Tavern chat replies failing",
        scope: "partial",
        signal: "Character messages error or never arrive while the art side works",
        quickCheck: "Retry a short message; chat and image pipelines fail independently",
      },
      {
        pattern: "Credits deducted for a failed generation",
        scope: "local",
        signal: "The balance drops but no image appears in the gallery",
        quickCheck: "Refresh the gallery first; if the image is truly missing, report the job to support",
      },
    ],
    fallbackAlternatives: [
      {
        scenario: "Yodayo image generation is down",
        alternative: "SeaArt AI, Tensor.Art or NovelAI (monitored on DownForAI) generate anime-style images",
        switchingCost: "low",
      },
      {
        scenario: "Tavern chat is down",
        alternative: "Sakura FM or Harpy Chat (monitored on DownForAI) host anime-style character chat",
        switchingCost: "low",
      },
    ],
    ecosystemDependencies: [],
    operatorNotes: [
      "The service rebranded to Moescape (moescape.ai); the DB still lists yodayo.com, which DownForAI probes.",
    ],
  },
};
