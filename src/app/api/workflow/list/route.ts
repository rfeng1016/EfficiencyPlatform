import { workflowService } from '@/lib/services/workflow.service';
import { listFlowItemSchema } from '@/lib/validators/workflow.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const filters = listFlowItemSchema.parse(params);
    const result = await workflowService.list(filters);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
