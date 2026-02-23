export const NodeType = {
  DEV: 'dev',
  CODE_REVIEW: 'code_review',
  ARCH_REVIEW: 'arch_review',
  ADMISSION: 'admission',
  TEST: 'test',
  PRODUCT_ACCEPT: 'product_accept',
  BUSINESS_ACCEPT: 'business_accept',
  INTEGRATION: 'integration',
  RELEASE: 'release',
  FINISH: 'finish',
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export interface PipelineNodeInput {
  nodeName: string;
  nodeType: NodeType;
  order: number;
  isRequired?: boolean;
}

export interface CreatePipelineInput {
  name: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  nodes?: PipelineNodeInput[];
}

export interface UpdatePipelineInput {
  name?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  nodes?: PipelineNodeInput[];
}
