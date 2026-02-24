import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const [byStatus, byBusinessLine, byApplication] = await Promise.all([
    prisma.flowItem.groupBy({ by: ['status'], _count: true }),
    prisma.flowItem.groupBy({ by: ['businessLine'], _count: true }),
    prisma.flowItem.groupBy({ by: ['application'], _count: true }),
  ]);

  const statusMap: Record<number, string> = {
    0: '等待中', 1: '进行中', 2: '成功', 3: '失败', 4: '已取消', 5: '已完成',
  };

  return NextResponse.json({
    code: 200,
    data: {
      byStatus: byStatus.map((s) => ({ status: statusMap[s.status] || s.status, count: s._count })),
      byBusinessLine: byBusinessLine.map((b) => ({ businessLine: b.businessLine, count: b._count })),
      byApplication: byApplication.map((a) => ({ application: a.application, count: a._count })),
    },
  });
}
