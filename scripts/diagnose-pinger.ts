import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function diagnose() {
  // 1. Combien de services et surfaces au total ?
  const totalServices = await prisma.service.count();
  const totalSurfaces = await prisma.serviceSurface.count();
  const enabledSurfaces = await prisma.serviceSurface.count({ where: { isEnabled: true } });
  console.log(`Services: ${totalServices}, Surfaces: ${totalSurfaces} (${enabledSurfaces} enabled)`);

  // 2. Surfaces sans checkUrl ET sans websiteUrl sur le service (= jamais pingées)
  const surfacesNoUrl = await prisma.serviceSurface.findMany({
    where: {
      isEnabled: true,
      checkUrl: null,
      service: { websiteUrl: null },
    },
    include: { service: { select: { name: true, slug: true, websiteUrl: true, createdAt: true } } },
  });
  console.log(`\nSurfaces enabled sans URL (checkUrl=null ET service.websiteUrl=null): ${surfacesNoUrl.length}`);
  surfacesNoUrl.slice(0, 10).forEach(s => console.log(`  - ${s.service.name} (${s.service.slug}) créé ${s.service.createdAt}`));

  // 3. Services sans aucune surface
  const servicesNoSurface = await prisma.service.findMany({
    where: { surfaces: { none: {} } },
    select: { name: true, slug: true, createdAt: true },
    take: 20,
  });
  console.log(`\nServices sans surface du tout: ${servicesNoSurface.length}`);
  servicesNoSurface.slice(0, 10).forEach(s => console.log(`  - ${s.name} (${s.slug}) créé ${s.createdAt}`));

  // 4. Dernière observation par surface — trouver celles figées à hier ~19h
  const stuckSurfaces = await prisma.serviceSurface.findMany({
    where: {
      isEnabled: true,
      observations: {
        none: {
          observedAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // aucune obs dans les 2 dernières heures
        },
      },
    },
    include: {
      service: { select: { name: true, slug: true, websiteUrl: true, createdAt: true } },
      observations: { orderBy: { observedAt: 'desc' }, take: 1, select: { observedAt: true, status: true } },
    },
  });
  console.log(`\nSurfaces sans observation depuis 2h: ${stuckSurfaces.length}`);
  stuckSurfaces.slice(0, 15).forEach(s => {
    const lastObs = s.observations[0];
    console.log(`  - ${s.service.name} | checkUrl=${s.checkUrl || 'null'} | websiteUrl=${s.service.websiteUrl || 'null'} | lastObs=${lastObs?.observedAt || 'jamais'} (${lastObs?.status || 'N/A'}) | créé=${s.service.createdAt}`);
  });

  // 5. Comparer avec un service qui marche bien (dernière obs récente)
  const workingSurface = await prisma.serviceSurface.findFirst({
    where: {
      isEnabled: true,
      observations: {
        some: {
          observedAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }, // obs dans les 10 dernières min
        },
      },
    },
    include: {
      service: { select: { name: true, slug: true, websiteUrl: true, createdAt: true } },
      observations: { orderBy: { observedAt: 'desc' }, take: 1, select: { observedAt: true, status: true } },
    },
  });
  if (workingSurface) {
    console.log(`\nExemple service qui marche:`);
    console.log(`  - ${workingSurface.service.name} | checkUrl=${workingSurface.checkUrl || 'null'} | websiteUrl=${workingSurface.service.websiteUrl || 'null'} | lastObs=${workingSurface.observations[0]?.observedAt} | créé=${workingSurface.service.createdAt}`);
  }
}

diagnose().catch(console.error).finally(() => prisma.$disconnect());
