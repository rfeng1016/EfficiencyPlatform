import { NextRequest, NextResponse } from 'next/server';
import { workflowService } from '@/lib/services/workflow.service';
import { z } from 'zod';
import { AppError } from '@/lib/utils/errors';

const checkGateSchema = z.object({
  taskId: z.string().min(1),
  gateId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkGateSchema.parse(body);
    const result = await workflowService.checkGate(data.taskId, data.gateId);
    return NextResponse.json({ code: 200, message: 'Gate checked', data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 400, message: 'Validation error', data: error.errors }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ code: 500, message: 'Internal server error' }, { status: 500 });
  }
}
