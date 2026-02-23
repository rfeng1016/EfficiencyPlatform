import { pipelineService } from '@/lib/services/pipeline.service';
import { updatePipelineSchema } from '@/lib/validators/pipeline.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { UpdatePipelineInput } from '@/lib/types/pipeline.types';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const pipeline = await pipelineService.getById(id);
    return successResponse(pipeline);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updatePipelineSchema.parse(body) as UpdatePipelineInput;
    const pipeline = await pipelineService.update(id, data);
    return successResponse(pipeline, 'Pipeline updated');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await pipelineService.delete(id);
    return successResponse(null, 'Pipeline deleted');
  } catch (error) {
    return errorResponse(error);
  }
}
