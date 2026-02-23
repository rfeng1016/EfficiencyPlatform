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
