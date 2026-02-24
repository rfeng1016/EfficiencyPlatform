import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const claimSchema = z.object({
  itemId: z.string().min(1),
  assignee: z.string().min(1),
});

const completeSchema = z.object({
  itemId: z.string().min(1),
  result: z.string().optional(),
  approved: z.boolean(),
});

export async function POST(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action');

  try {
    const body = await request.json();

    if (action === 'claim') {
      const data = claimSchema.parse(body);
      const item = await prisma.queueItem.update({
        where: { id: data.itemId },
        data: { assignee: data.assignee, status: 'processing' },
      });
      return NextResponse.json({ code: 200, message: 'Item claimed', data: item });
    }

    if (action === 'complete') {
      const data = completeSchema.parse(body);
      const item = await prisma.queueItem.update({
        where: { id: data.itemId },
        data: {
          status: data.approved ? 'completed' : 'rejected',
          result: data.result,
          completedAt: new Date(),
        },
      });
      return NextResponse.json({ code: 200, message: 'Item completed', data: item });
    }

    return NextResponse.json({ code: 400, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 400, message: 'Validation error', data: error.errors }, { status: 400 });
    }
    return NextResponse.json({ code: 500, message: 'Internal server error' }, { status: 500 });
  }
}
