import { workflowService } from '@/lib/services/workflow.service';
import { cancelFlowItemSchema } from '@/lib/validators/workflow.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = cancelFlowItemSchema.parse(body);
    const result = await workflowService.cancel(id);
    return successResponse(result, 'FlowItem canceled');
  } catch (error) {
    return errorResponse(error);
  }
}
