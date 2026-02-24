import { z } from 'zod';

export const flowItemDateSchema = z.object({
  planDevStartTime: z.coerce.date().optional(),
  actualDevStartTime: z.coerce.date().optional(),
  planTestStartTime: z.coerce.date().optional(),
  actualTestStartTime: z.coerce.date().optional(),
  planReleaseTime: z.coerce.date().optional(),
  actualReleaseTime: z.coerce.date().optional(),
});

export const createFlowItemSchema = z.object({
  name: z.string().min(1).max(200),
  businessLine: z.string().min(1),
  application: z.string().min(1),
  pipelineId: z.string().min(1),
  codeRepository: z.string().optional(),
  branch: z.string().optional(),
  creator: z.string().min(1),
  devOwner: z.string().optional(),
  testOwner: z.string().optional(),
  jiraCardId: z.string().optional(),
  spaceId: z.string().optional(),
  sprintId: z.string().optional(),
  dates: flowItemDateSchema.optional(),
});

export const listFlowItemSchema = z.object({
  businessLine: z.string().optional(),
  application: z.string().optional(),
  status: z.coerce.number().int().min(0).max(5).optional(),
  creator: z.string().optional(),
  devOwner: z.string().optional(),
  name: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const cancelFlowItemSchema = z.object({
  id: z.string().min(1),
});
