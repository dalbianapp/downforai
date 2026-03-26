import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { serviceName, page } = await request.json();
    await prisma.affiliateClick.create({
      data: {
        partner: 'NORDVPN',
        serviceName: serviceName || 'unknown',
        page: page || '/',
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
