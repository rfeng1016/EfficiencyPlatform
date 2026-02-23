import { prisma } from '@/lib/db/prisma';
import { CreatePipelineInput, UpdatePipelineInput } from '@/lib/types/pipeline.types';
import {
  PipelineNotFoundError,
  PipelineNameExistsError,
  DefaultPipelineExistsError,
} from '@/lib/utils/errors';

export const pipelineService = {
  async list() {
    return prisma.pipeline.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: { nodes: { orderBy: { order: 'asc' } } },
    });
    if (!pipeline) throw new PipelineNotFoundError(id);
    return pipeline;
  },

  async create(data: CreatePipelineInput) {
    const existing = await prisma.pipeline.findUnique({ where: { name: data.name } });
    if (existing) throw new PipelineNameExistsError(data.name);

    if (data.isDefault) {
      const defaultExists = await prisma.pipeline.findFirst({ where: { isDefault: true } });
      if (defaultExists) throw new DefaultPipelineExistsError();
    }

    return prisma.pipeline.create({
      data: {
        name: data.name,
        description: data.description,
        isDefault: data.isDefault ?? false,
        isActive: data.isActive ?? true,
        nodes: data.nodes ? { create: data.nodes } : undefined,
      },
      include: { nodes: { orderBy: { order: 'asc' } } },
    });
  },

  async update(id: string, data: UpdatePipelineInput) {
    const pipeline = await prisma.pipeline.findUnique({ where: { id } });
    if (!pipeline) throw new PipelineNotFoundError(id);

    if (data.name && data.name !== pipeline.name) {
      const existing = await prisma.pipeline.findUnique({ where: { name: data.name } });
      if (existing) throw new PipelineNameExistsError(data.name);
    }

    if (data.isDefault && !pipeline.isDefault) {
      const defaultExists = await prisma.pipeline.findFirst({
        where: { isDefault: true, id: { not: id } },
      });
      if (defaultExists) throw new DefaultPipelineExistsError();
    }

    return prisma.$transaction(async (tx) => {
      if (data.nodes) {
        await tx.pipelineNode.deleteMany({ where: { pipelineId: id } });
        await tx.pipelineNode.createMany({
          data: data.nodes.map((node) => ({ ...node, pipelineId: id })),
        });
      }

      return tx.pipeline.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          isDefault: data.isDefault,
          isActive: data.isActive,
        },
        include: { nodes: { orderBy: { order: 'asc' } } },
      });
    });
  },

  async delete(id: string) {
    const pipeline = await prisma.pipeline.findUnique({ where: { id } });
    if (!pipeline) throw new PipelineNotFoundError(id);
    await prisma.pipeline.delete({ where: { id } });
  },
};
