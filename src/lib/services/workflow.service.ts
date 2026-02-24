import { prisma } from '@/lib/db/prisma';
import { CreateFlowItemInput, ListFlowItemInput, FlowItemStatus } from '@/lib/types/workflow.types';
import {
  PipelineNotFoundError,
  FlowItemNotFoundError,
  FlowItemNameExistsError,
  FlowItemCancelNotAllowedError,
  FlowItemAlreadyFinishedError,
} from '@/lib/utils/errors';

export const workflowService = {
  async create(data: CreateFlowItemInput) {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: data.pipelineId },
      include: { nodes: { orderBy: { order: 'asc' } } },
    });
    if (!pipeline) throw new PipelineNotFoundError(data.pipelineId);

    const existing = await prisma.flowItem.findUnique({
      where: { application_name: { application: data.application, name: data.name } },
    });
    if (existing) throw new FlowItemNameExistsError(data.application, data.name);

    return prisma.$transaction(async (tx) => {
      const flowItem = await tx.flowItem.create({
        data: {
          name: data.name,
          businessLine: data.businessLine,
          application: data.application,
          pipelineId: data.pipelineId,
          codeRepository: data.codeRepository,
          branch: data.branch,
          creator: data.creator,
          devOwner: data.devOwner,
          testOwner: data.testOwner,
          jiraCardId: data.jiraCardId,
          spaceId: data.spaceId,
          sprintId: data.sprintId,
          dates: data.dates ? { create: data.dates } : undefined,
        },
      });

      if (pipeline.nodes.length > 0) {
        await tx.flowWorker.createMany({
          data: pipeline.nodes.map((node, index) => ({
            flowItemId: flowItem.id,
            pipelineNodeId: node.id,
            nodeName: node.nodeName,
            nodeType: node.nodeType,
            order: node.order,
            isRequired: node.isRequired,
            status: index === 0 ? FlowItemStatus.ActionWait : 0,
            startTime: index === 0 ? new Date() : null,
          })),
        });
      }

      return tx.flowItem.findUnique({
        where: { id: flowItem.id },
        include: { dates: true, pipeline: true, workers: { orderBy: { order: 'asc' } } },
      });
    });
  },

  async flow(flowItemId: string) {
    const flowItem = await prisma.flowItem.findUnique({
      where: { id: flowItemId },
      include: { workers: { orderBy: { order: 'asc' } } },
    });
    if (!flowItem) throw new FlowItemNotFoundError(flowItemId);
    if (flowItem.status === FlowItemStatus.Finished) throw new FlowItemAlreadyFinishedError(flowItemId);

    const workers = flowItem.workers;
    const currentIndex = workers.findIndex((w) => w.status !== FlowItemStatus.ActionSuccess);
    if (currentIndex === -1) throw new FlowItemAlreadyFinishedError(flowItemId);

    const currentWorker = workers[currentIndex];
    const isLastNode = currentIndex === workers.length - 1;
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      await tx.flowWorker.update({
        where: { id: currentWorker.id },
        data: { status: FlowItemStatus.ActionSuccess, endTime: now },
      });

      const completedCount = currentIndex + 1;
      const progress = Math.round((completedCount / workers.length) * 100);

      if (isLastNode) {
        await tx.flowItem.update({
          where: { id: flowItemId },
          data: { status: FlowItemStatus.Finished, progress: 100 },
        });
      } else {
        const nextWorker = workers[currentIndex + 1];
        await tx.flowWorker.update({
          where: { id: nextWorker.id },
          data: { status: FlowItemStatus.ActionWait, startTime: now },
        });
        await tx.flowItem.update({
          where: { id: flowItemId },
          data: { progress },
        });
      }

      return tx.flowItem.findUnique({
        where: { id: flowItemId },
        include: { dates: true, pipeline: true, workers: { orderBy: { order: 'asc' } } },
      });
    });
  },

  async list(filters: ListFlowItemInput) {
    const { page = 1, pageSize = 20, name, ...rest } = filters;
    const where: Record<string, unknown> = {};

    if (rest.businessLine) where.businessLine = rest.businessLine;
    if (rest.application) where.application = rest.application;
    if (rest.status !== undefined) where.status = rest.status;
    if (rest.creator) where.creator = rest.creator;
    if (rest.devOwner) where.devOwner = rest.devOwner;
    if (name) where.name = { contains: name };

    const [total, list] = await Promise.all([
      prisma.flowItem.count({ where }),
      prisma.flowItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { dates: true, pipeline: true },
      }),
    ]);

    return { total, page, pageSize, list };
  },

  async getById(id: string) {
    const flowItem = await prisma.flowItem.findUnique({
      where: { id },
      include: { dates: true, pipeline: true },
    });
    if (!flowItem) throw new FlowItemNotFoundError(id);
    return flowItem;
  },

  async cancel(id: string) {
    const flowItem = await prisma.flowItem.findUnique({ where: { id } });
    if (!flowItem) throw new FlowItemNotFoundError(id);

    if (flowItem.status !== FlowItemStatus.ActionWait && flowItem.status !== FlowItemStatus.ActionFail) {
      throw new FlowItemCancelNotAllowedError(id, flowItem.status);
    }

    return prisma.flowItem.update({
      where: { id },
      data: { status: FlowItemStatus.Canceled },
      include: { dates: true, pipeline: true },
    });
  },
};
