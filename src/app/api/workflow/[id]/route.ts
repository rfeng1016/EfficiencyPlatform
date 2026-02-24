import { workflowService } from '@/lib/services/workflow.service';
import { successResponse, errorResponse } from '@/lib/utils/response';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const result = await workflowService.getById(id);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
