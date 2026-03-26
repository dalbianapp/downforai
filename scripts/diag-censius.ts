import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Trouver le service Censius
  const service = await prisma.service.findFirst({
    where: { slug: { contains: 'censius' } },
    include: {
      surfaces: {
        include: {
          observations: {
            orderBy: { observedAt: 'desc' },
            take: 5,
          },
        },
      },
    },
  });

  if (!service) {
    console.log('Service Censius non trouvé');
    return;
  }

  console.log(`Service: ${service.name} (${service.slug})`);
  console.log(`websiteUrl: ${service.websiteUrl}`);
  console.log(`createdAt: ${service.createdAt}`);
  console.log(`Surfaces: ${service.surfaces.length}`);

  for (const s of service.surfaces) {
    console.log(`\n  Surface: ${s.displayName} (${s.slug})`);
    console.log(`  isEnabled: ${s.isEnabled}`);
    console.log(`  checkUrl: ${s.checkUrl}`);
    console.log(`  Observations (last 5):`);
    if (s.observations.length === 0) {
      console.log(`    AUCUNE`);
    }
    for (const o of s.observations) {
      console.log(`    ${o.observedAt.toISOString()} | status=${o.status} | latency=${o.latencyMs}ms | confidence=${o.confidence}`);
    }
  }

  // 2. Compter les observations des 24 dernières heures
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  for (const s of service.surfaces) {
    const count = await prisma.observation.count({
      where: { serviceSurfaceId: s.id, observedAt: { gte: since24h } },
    });
    console.log(`\n  Surface ${s.displayName}: ${count} observations dans les 24 dernières heures`);
  }

  // 3. Comparer avec un service qui marche (ex: OpenAI)
  const openai = await prisma.service.findFirst({
    where: { slug: { contains: 'openai' } },
    include: {
      surfaces: {
        include: {
          observations: { orderBy: { observedAt: 'desc' }, take: 1 },
        },
      },
    },
  });
  if (openai) {
    console.log(`\nComparaison OpenAI:`);
    for (const s of openai.surfaces) {
      const last = s.observations[0];
      console.log(`  ${s.displayName}: lastObs=${last?.observedAt.toISOString()} | latency=${last?.latencyMs}ms`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
