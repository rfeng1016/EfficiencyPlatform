import { workflowService } from '@/lib/services/workflow.service';
import { createFlowItemSchema } from '@/lib/validators/workflow.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createFlowItemSchema.parse(body);
    const result = await workflowService.create(data);
    return successResponse(result, 'FlowItem created');
  } catch (error) {
    return errorResponse(error);
  }
}
