# Database Guidelines

> Database patterns and conventions for this project.

---

## Overview

- **ORM**: Prisma
- **Database**: SQLite
- **Migrations**: Prisma Migrate

---

## Schema Design

Follow PRD table definitions. Key tables:

| Table | Purpose |
|-------|---------|
| `flow_item` | Tasks (工单) |
| `flow_item_date` | Task time records |
| `flow_worker` | Task nodes |
| `flow_worker_item` | Node gates |
| `flow_queue` | Work queues |
| `sys_pipeline` | Pipeline configs |

### Prisma Schema Example

```prisma
// prisma/schema.prisma
model FlowItem {
  id            String   @id @default(cuid())
  name          String
  businessLine  String   @map("business_line")
  application   String
  pipelineId    String   @map("pipeline_id")
  status        Int      @default(0)
  progress      Int      @default(0)

  codeRepository String? @map("code_repository")
  branch         String?

  creator       String
  devOwner      String?  @map("dev_owner")
  testOwner     String?  @map("test_owner")

  createdAt     DateTime @default(now()) @map("create_time")
  updatedAt     DateTime @updatedAt @map("update_time")

  dates         FlowItemDate?
  workers       FlowWorker[]

  @@map("flow_item")
  @@index([businessLine])
  @@index([application])
  @@index([status])
}
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Table names | snake_case | `flow_item`, `flow_worker` |
| Column names | snake_case | `business_line`, `create_time` |
| Prisma models | PascalCase | `FlowItem`, `FlowWorker` |
| Prisma fields | camelCase | `businessLine`, `createdAt` |
| Index names | `idx_{table}_{columns}` | `idx_flow_item_status` |
| Foreign keys | `{table}_{column}_fkey` | `flow_worker_task_id_fkey` |

Use `@map()` to convert between Prisma camelCase and DB snake_case.

---

## Query Patterns

### Use Prisma Client Singleton

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Transactions

Use `prisma.$transaction` for multi-table operations:

```typescript
// Creating a task with nodes and gates
await prisma.$transaction(async (tx) => {
  const task = await tx.flowItem.create({ data: taskData });

  for (const node of nodes) {
    const worker = await tx.flowWorker.create({
      data: { ...node, taskId: task.id },
    });

    for (const gate of node.gates) {
      await tx.flowWorkerItem.create({
        data: { ...gate, workerId: worker.id, taskId: task.id },
      });
    }
  }

  return task;
});
```

### Pagination

```typescript
const { page = 1, pageSize = 20 } = filters;

const [total, list] = await Promise.all([
  prisma.flowItem.count({ where }),
  prisma.flowItem.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  }),
]);

return { total, page, pageSize, list };
```

---

## Migrations

### Create Migration

```bash
npx prisma migrate dev --name add_flow_item_table
```

### Apply to Production

```bash
npx prisma migrate deploy
```

### Migration Naming

Use descriptive names: `add_flow_item_table`, `add_gate_status_column`

---

## Forbidden Patterns

- ❌ Raw SQL queries (use Prisma)
- ❌ Multiple Prisma client instances
- ❌ N+1 queries (use `include` or batch)
- ❌ Missing indexes on frequently queried columns
- ❌ Storing JSON without validation

---

## Common Mistakes

1. **Forgetting transactions** - Multi-table creates/updates must use `$transaction`
2. **N+1 queries** - Use `include` to eager load relations
3. **Missing `@map`** - Always map to snake_case for DB columns
4. **No soft delete** - Consider `deletedAt` for important records
