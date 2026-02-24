import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultPipeline = await prisma.pipeline.upsert({
    where: { name: 'Default Pipeline' },
    update: {},
    create: {
      name: 'Default Pipeline',
      description: 'Standard development workflow',
      isDefault: true,
      isActive: true,
      nodes: {
        create: [
          { nodeName: 'Development', nodeType: 'dev', order: 1, isRequired: true },
          { nodeName: 'Code Review', nodeType: 'code_review', order: 2, isRequired: true },
          { nodeName: 'Architecture Review', nodeType: 'arch_review', order: 3, isRequired: false },
          { nodeName: 'Admission', nodeType: 'admission', order: 4, isRequired: true },
          { nodeName: 'Testing', nodeType: 'test', order: 5, isRequired: true },
          { nodeName: 'Product Acceptance', nodeType: 'product_accept', order: 6, isRequired: true },
          { nodeName: 'Business Acceptance', nodeType: 'business_accept', order: 7, isRequired: false },
          { nodeName: 'Integration', nodeType: 'integration', order: 8, isRequired: true },
          { nodeName: 'Release', nodeType: 'release', order: 9, isRequired: true },
          { nodeName: 'Finish', nodeType: 'finish', order: 10, isRequired: true },
        ],
      },
    },
    include: { nodes: true },
  });

  // Add gates to Admission node
  const admissionNode = defaultPipeline.nodes.find(n => n.nodeType === 'admission');
  if (admissionNode) {
    await prisma.gate.createMany({
      data: [
        { pipelineNodeId: admissionNode.id, name: '单元测试覆盖率', gateType: 'unit_test', isRequired: true, order: 1 },
        { pipelineNodeId: admissionNode.id, name: '代码安全扫描', gateType: 'security_scan', isRequired: true, order: 2 },
      ],
    });
  }

  // Add queues
  await prisma.queue.createMany({
    data: [
      { name: 'Code Review Queue', queueType: 'code_review', description: '代码评审队列' },
      { name: 'Arch Review Queue', queueType: 'arch_review', description: '架构评审队列' },
      { name: 'Product Accept Queue', queueType: 'product_accept', description: '产品验收队列' },
      { name: 'Business Accept Queue', queueType: 'business_accept', description: '业务验收队列' },
      { name: 'Release Queue', queueType: 'release', description: '发布队列' },
    ],
  });

  console.log('Seeded default pipeline:', defaultPipeline.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
