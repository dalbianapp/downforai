import { getServiceSnapshot } from "@/lib/snapshot/read";
import type { ServiceDashboardData } from "./types";

// getServiceDashboard() used to run 6 Prisma queries per call (see git
// history). It now just reads the hourly blob snapshot built by
// src/lib/snapshot/build.ts — no Prisma at render/regeneration time, which
// was the actual source of downforai's Neon compute never sleeping (every
// ISR regeneration of one of the 817 service pages queried the DB directly).
// Name and shape kept identical so the service page and opengraph-image
// don't need to change how they call this.
export async function getServiceDashboard(slug: string): Promise<ServiceDashboardData | null> {
  return getServiceSnapshot(slug);
}
