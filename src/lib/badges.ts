import { BadgeType } from "@prisma/client";
import { prisma } from "./db";

export async function getBadgePhrase(
  key: string,
  lang: string = "en"
): Promise<string | null> {
  try {
    const phrase = await prisma.badgePhrase.findUnique({
      where: {
        key_lang: {
          key,
          lang,
        },
      },
    });
    return phrase?.text || null;
  } catch (error) {
    console.error("Error fetching badge phrase:", error);
    return null;
  }
}

export function getBadgeIcon(
  badge: BadgeType,
  status?: "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "UNKNOWN"
): string {
  if (badge === "LIVE_MONITORING") {
    return status === "UNKNOWN" ? "⏳" : "✅";
  }
  if (badge === "STATUS_PAGE_SYNC") {
    return "📡";
  }
  if (badge === "COMMUNITY_REPORTS") {
    return "👥";
  }
  return "•";
}

export function getBadgeLabel(badge: BadgeType): string {
  if (badge === "LIVE_MONITORING") {
    return "Live Monitoring";
  }
  if (badge === "STATUS_PAGE_SYNC") {
    return "Status Page";
  }
  if (badge === "COMMUNITY_REPORTS") {
    return "Community";
  }
  return "Unknown";
}
