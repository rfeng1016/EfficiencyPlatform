export const FlowItemStatus = {
  ActionWait: 0,
  ActionIng: 1,
  ActionSuccess: 2,
  ActionFail: 3,
  Canceled: 4,
  Finished: 5,
} as const;

export type FlowItemStatus = (typeof FlowItemStatus)[keyof typeof FlowItemStatus];

export interface FlowItemDateInput {
  planDevStartTime?: Date | string;
  actualDevStartTime?: Date | string;
  planTestStartTime?: Date | string;
  actualTestStartTime?: Date | string;
  planReleaseTime?: Date | string;
  actualReleaseTime?: Date | string;
}

export interface CreateFlowItemInput {
  name: string;
  businessLine: string;
  application: string;
  pipelineId: string;
  codeRepository?: string;
  branch?: string;
  creator: string;
  devOwner?: string;
  testOwner?: string;
  jiraCardId?: string;
  spaceId?: string;
  sprintId?: string;
  dates?: FlowItemDateInput;
}

export interface ListFlowItemInput {
  businessLine?: string;
  application?: string;
  status?: number;
  creator?: string;
  devOwner?: string;
  name?: string;
  page?: number;
  pageSize?: number;
}

export interface CancelFlowItemInput {
  id: string;
}
