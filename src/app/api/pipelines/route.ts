import { pipelineService } from '@/lib/services/pipeline.service';
import { createPipelineSchema } from '@/lib/validators/pipeline.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { CreatePipelineInput } from '@/lib/types/pipeline.types';

export async function GET() {
  try {
    const pipelines = await pipelineService.list();
    return successResponse(pipelines);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createPipelineSchema.parse(body) as CreatePipelineInput;
    const pipeline = await pipelineService.create(data);
    return successResponse(pipeline, 'Pipeline created');
  } catch (error) {
    return errorResponse(error);
  }
}
