/**
 * Inserts 20 Sports Betting AI services into the DB.
 * Safe to re-run: skips slugs that already exist.
 *
 * Usage:
 *   npx tsx scripts/add-sports-betting.ts          (dry-run)
 *   npx tsx scripts/add-sports-betting.ts --apply  (real run)
 */

import { prisma } from "../src/lib/db";

const DRY_RUN = !process.argv.includes("--apply");

if (DRY_RUN) {
  console.log("🔍 DRY-RUN mode — pass --apply to execute.\n");
} else {
  console.log("🚀 APPLY mode — inserting into DB.\n");
}

const SPORTS_BETTING_SERVICES = [
  {
    name: "OddsJam",
    slug: "oddsjam",
    websiteUrl: "https://oddsjam.com",
    description: "AI-powered arbitrage and +EV betting tool that scans odds across 50+ sportsbooks to find profitable opportunities.",
    surfaces: [{ slug: "oddsjam-web", displayName: "OddsJam Web", checkUrl: "https://oddsjam.com" }],
  },
  {
    name: "Forebet",
    slug: "forebet",
    websiteUrl: "https://forebet.com",
    description: "Mathematical football prediction platform covering 850+ leagues with algorithmic analysis. 1M+ app downloads.",
    surfaces: [{ slug: "forebet-web", displayName: "Forebet Web", checkUrl: "https://forebet.com" }],
  },
  {
    name: "Rithmm",
    slug: "rithmm",
    websiteUrl: "https://rithmm.com",
    description: "AI betting intelligence app with predictive models, Smart Signals and custom model builder for NFL, NBA, MLB.",
    surfaces: [{ slug: "rithmm-web", displayName: "Rithmm Web", checkUrl: "https://rithmm.com" }],
  },
  {
    name: "Leans.AI",
    slug: "leans-ai",
    websiteUrl: "https://leans.ai",
    description: "AI prediction platform using the 'Remi' algorithm with 53-58% ATS win rate. 70k+ users, transparent track record.",
    surfaces: [{ slug: "leans-ai-web", displayName: "Leans.AI Web", checkUrl: "https://leans.ai" }],
  },
  {
    name: "ZCode System",
    slug: "zcode-system",
    websiteUrl: "https://zcodesystem.co",
    description: "Legacy AI prediction system since 1999 combining machine learning with expert handicappers. 50k+ VIP members.",
    surfaces: [{ slug: "zcode-web", displayName: "ZCode Web", checkUrl: "https://zcodesystem.co" }],
  },
  {
    name: "BettingPros Sharp AI",
    slug: "bettingpros-sharp-ai",
    websiteUrl: "https://bettingpros.com",
    description: "AI betting assistant integrated with BettingPros for odds analysis, projections and sharp picks on US sports.",
    surfaces: [{ slug: "bettingpros-web", displayName: "BettingPros Web", checkUrl: "https://bettingpros.com" }],
  },
  {
    name: "BetIdeas",
    slug: "betideas",
    websiteUrl: "https://betideas.com",
    description: "Free AI betting predictions and value betting platform with automated data analysis across football and US sports.",
    surfaces: [{ slug: "betideas-web", displayName: "BetIdeas Web", checkUrl: "https://betideas.com" }],
  },
  {
    name: "Sports-AI",
    slug: "sports-ai",
    websiteUrl: "https://sports-ai.dev",
    description: "AI prediction platform calculating true odds and comparing 40+ bookmakers to detect value bets across 11 sports.",
    surfaces: [{ slug: "sports-ai-web", displayName: "Sports-AI Web", checkUrl: "https://sports-ai.dev" }],
  },
  {
    name: "DeepBetting",
    slug: "deepbetting",
    websiteUrl: "https://deepbetting.io",
    description: "ML-powered predictions analyzing 10+ years of historical data to detect value bets in football and major sports.",
    surfaces: [{ slug: "deepbetting-web", displayName: "DeepBetting Web", checkUrl: "https://deepbetting.io" }],
  },
  {
    name: "SportsLine",
    slug: "sportsline",
    websiteUrl: "https://sportsline.com",
    description: "CBS Sports prediction platform with proprietary AI simulations and SportsLine AI for matchups and player props.",
    surfaces: [{ slug: "sportsline-web", displayName: "SportsLine Web", checkUrl: "https://sportsline.com" }],
  },
  {
    name: "BetQL",
    slug: "betql",
    websiteUrl: "https://betql.co",
    description: "Analytics platform using computer models to identify value bets, trends and opportunities across major US sports.",
    surfaces: [{ slug: "betql-web", displayName: "BetQL Web", checkUrl: "https://betql.co" }],
  },
  {
    name: "Dimers",
    slug: "dimers",
    websiteUrl: "https://dimers.com",
    description: "Data-driven prediction platform by Cipher Sports with proprietary models, best bets and 10,000+ simulations per game.",
    surfaces: [{ slug: "dimers-web", displayName: "Dimers Web", checkUrl: "https://dimers.com" }],
  },
  {
    name: "Action Network",
    slug: "action-network",
    websiteUrl: "https://actionnetwork.com",
    description: "Sports betting media platform with Playbook AI for real-time market insights, public betting data and analytics.",
    surfaces: [{ slug: "action-network-web", displayName: "Action Network Web", checkUrl: "https://actionnetwork.com" }],
  },
  {
    name: "Sharp App",
    slug: "sharp-app",
    websiteUrl: "https://sharp.app",
    description: "AI-powered +EV and props tool with simulations, liability data and Proptimizer for NFL, NBA, MLB, NHL.",
    surfaces: [{ slug: "sharp-app-web", displayName: "Sharp App Web", checkUrl: "https://sharp.app" }],
  },
  {
    name: "Juice Reel",
    slug: "juice-reel",
    websiteUrl: "https://juicereel.com",
    description: "Bet tracker and AI prediction marketplace with sportsbook sync and analytics. 250k+ bettors, 60M+ bets tracked.",
    surfaces: [{ slug: "juice-reel-web", displayName: "Juice Reel Web", checkUrl: "https://juicereel.com" }],
  },
  {
    name: "AccuScore",
    slug: "accuscore",
    websiteUrl: "https://accuscore.com",
    description: "Sports simulation engine with pre-match projections and archives. B2B and B2C offering across major leagues.",
    surfaces: [{ slug: "accuscore-web", displayName: "AccuScore Web", checkUrl: "https://accuscore.com" }],
  },
  {
    name: "RebelBetting",
    slug: "rebelbetting",
    websiteUrl: "https://rebelbetting.com",
    description: "ML-powered value betting and sure betting scanner across global sportsbooks with proven long-term ROI.",
    surfaces: [{ slug: "rebelbetting-web", displayName: "RebelBetting Web", checkUrl: "https://rebelbetting.com" }],
  },
  {
    name: "Parlay Savant",
    slug: "parlay-savant",
    websiteUrl: "https://parlaysavant.com",
    description: "AI research assistant that writes and executes predictive analyses on NFL, NBA, MLB odds, props and matchups.",
    surfaces: [{ slug: "parlay-savant-web", displayName: "Parlay Savant Web", checkUrl: "https://parlaysavant.com" }],
  },
  {
    name: "SportBot AI",
    slug: "sportbot-ai",
    websiteUrl: "https://sportbotai.com",
    description: "AI betting bot with free picks, public ROI tracking and value bet detection across soccer, NBA, NFL, NHL.",
    surfaces: [{ slug: "sportbot-ai-web", displayName: "SportBot AI Web", checkUrl: "https://sportbotai.com" }],
  },
  {
    name: "PandaScore",
    slug: "pandascore",
    websiteUrl: "https://pandascore.co",
    description: "B2B AI-powered eSports statistics and odds infrastructure for bookmakers and betting platforms.",
    surfaces: [{ slug: "pandascore-web", displayName: "PandaScore Web", checkUrl: "https://pandascore.co" }],
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  console.log(`Processing ${SPORTS_BETTING_SERVICES.length} services...\n`);

  for (const svc of SPORTS_BETTING_SERVICES) {
    const existing = await prisma.service.findUnique({ where: { slug: svc.slug } });
    if (existing) {
      console.log(`  [SKIP]    ${svc.slug}`);
      skipped++;
      continue;
    }

    if (!DRY_RUN) {
      await prisma.service.create({
        data: {
          name: svc.name,
          slug: svc.slug,
          category: "SPORTS_BETTING",
          websiteUrl: svc.websiteUrl,
          description: svc.description,
          tier: 1,
          defaultBadge: "LIVE_MONITORING",
          limitPhraseKey: "LIVE_MONITORING_EU",
          surfaces: {
            create: svc.surfaces.map((s) => ({
              slug: s.slug,
              displayName: s.displayName,
              checkUrl: s.checkUrl,
              isEnabled: true,
            })),
          },
        },
      });
      console.log(`  [CREATED] ${svc.slug}`);
    } else {
      console.log(`  [DRY-RUN] ${svc.slug} → would create`);
    }
    created++;
  }

  console.log(`\n═══ Summary ══════════════════════`);
  console.log(`  ${DRY_RUN ? "Would create" : "Created"}:  ${created}`);
  console.log(`  Skipped:        ${skipped}`);
  if (DRY_RUN) console.log(`\n  Run with --apply to execute.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
