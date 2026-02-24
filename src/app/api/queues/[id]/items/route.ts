import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const status = request.nextUrl.searchParams.get('status');
  const where: Record<string, unknown> = { queueId: id };
  if (status) where.status = status;

  const items = await prisma.queueItem.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ code: 200, data: items });
}
