import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const startOfDay = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  startOfDay.setHours(0, 0, 0, 0);
  const start7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const start30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [today, last7d, last30d, total, topServices, recentClicks] = await Promise.all([
    prisma.affiliateClick.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.affiliateClick.count({ where: { createdAt: { gte: start7d } } }),
    prisma.affiliateClick.count({ where: { createdAt: { gte: start30d } } }),
    prisma.affiliateClick.count(),
    prisma.affiliateClick.groupBy({
      by: ['serviceName'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    }),
    prisma.affiliateClick.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  return NextResponse.json({
    stats: { today, last7d, last30d, total },
    topServices: topServices.map((s) => ({ serviceName: s.serviceName, count: s._count.id })),
    recentClicks,
  });
}
