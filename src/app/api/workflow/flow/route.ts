import { workflowService } from '@/lib/services/workflow.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { z } from 'zod';

const flowSchema = z.object({
  taskId: z.string().min(1),
  action: z.literal('next'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId } = flowSchema.parse(body);
    const result = await workflowService.flow(taskId);
    return successResponse(result, 'FlowItem transitioned');
  } catch (error) {
    return errorResponse(error);
  }
}
