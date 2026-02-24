import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const createGateSchema = z.object({
  pipelineNodeId: z.string().min(1),
  name: z.string().min(1),
  gateType: z.enum(['unit_test', 'security_scan', 'auto_test', 'performance_test', 'code_review']),
  config: z.string().optional(),
  isRequired: z.boolean().optional(),
  order: z.number().optional(),
});

export async function GET(request: NextRequest) {
  const nodeId = request.nextUrl.searchParams.get('nodeId');
  const where = nodeId ? { pipelineNodeId: nodeId } : {};
  const gates = await prisma.gate.findMany({ where, orderBy: { order: 'asc' } });
  return NextResponse.json({ code: 200, data: gates });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createGateSchema.parse(body);
    const gate = await prisma.gate.create({ data });
    return NextResponse.json({ code: 200, message: 'Gate created', data: gate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 400, message: 'Validation error', data: error.errors }, { status: 400 });
    }
    return NextResponse.json({ code: 500, message: 'Internal server error' }, { status: 500 });
  }
}
