import { z } from 'zod';
import { NodeType, CreatePipelineInput, UpdatePipelineInput } from '@/lib/types/pipeline.types';

const nodeTypeValues = Object.values(NodeType) as [NodeType, ...NodeType[]];

export const pipelineNodeSchema = z.object({
  nodeName: z.string().min(1),
  nodeType: z.enum(nodeTypeValues),
  order: z.number().int().min(0),
  isRequired: z.boolean().optional().default(true),
});

export const createPipelineSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  nodes: z.array(pipelineNodeSchema).optional(),
}) satisfies z.ZodType<CreatePipelineInput>;

export const updatePipelineSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  nodes: z.array(pipelineNodeSchema).optional(),
}) satisfies z.ZodType<UpdatePipelineInput>;
