import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const createQueueSchema = z.object({
  name: z.string().min(1),
  queueType: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  const queues = await prisma.queue.findMany({ include: { _count: { select: { items: true } } } });
  return NextResponse.json({ code: 200, data: queues });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createQueueSchema.parse(body);
    const queue = await prisma.queue.create({ data });
    return NextResponse.json({ code: 200, message: 'Queue created', data: queue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 400, message: 'Validation error', data: error.errors }, { status: 400 });
    }
    return NextResponse.json({ code: 500, message: 'Internal server error' }, { status: 500 });
  }
}
