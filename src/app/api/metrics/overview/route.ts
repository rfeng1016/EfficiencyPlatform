import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, inProgress, finished, thisWeek] = await Promise.all([
    prisma.flowItem.count(),
    prisma.flowItem.count({ where: { status: { in: [0, 1, 2] } } }),
    prisma.flowItem.count({ where: { status: 5 } }),
    prisma.flowItem.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);

  return NextResponse.json({
    code: 200,
    data: { total, inProgress, finished, thisWeek },
  });
}
