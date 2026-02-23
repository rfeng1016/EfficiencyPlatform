# Quality Guidelines

> Code quality standards for backend development.

---

## Overview

- **Linting**: ESLint with strict TypeScript rules
- **Formatting**: Prettier
- **Type Safety**: Strict TypeScript, Zod validation
- **Testing**: Vitest for unit tests

---

## Required Patterns

### 1. Input Validation with Zod

All API inputs must be validated:

```typescript
// lib/validators/workflow.schema.ts
import { z } from 'zod';

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  businessLine: z.string().min(1),
  application: z.string().min(1),
  pipelineId: z.string().min(1),
  codeRepository: z.string().url(),
  branch: z.string().min(1),
  devOwner: z.string().min(1),
  testOwner: z.string().min(1),
  planDevStartTime: z.string().datetime(),
  planTestStartTime: z.string().datetime(),
  planReleaseTime: z.string().datetime(),
  jiraCardId: z.string().optional(),
  spaceId: z.string().optional(),
  sprintId: z.string().optional(),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
```

### 2. Type-Safe API Responses

```typescript
// lib/types/api.types.ts
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  list: T[];
}
```

### 3. Service Layer Separation

Route handlers only handle HTTP, services handle business logic:

```typescript
// ✅ Good
// route.ts
const data = schema.parse(body);
const result = await service.create(data);
return successResponse(result);

// ❌ Bad
// route.ts
const task = await prisma.flowItem.create({ data: body });
await prisma.flowWorker.createMany({ ... });
// Business logic in route handler
```

### 4. Environment Variables

Use typed env config:

```typescript
// lib/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JENKINS_URL: z.string().url(),
  JENKINS_TOKEN: z.string(),
  CODING_URL: z.string().url(),
  CODING_TOKEN: z.string(),
  // ...
});

export const env = envSchema.parse(process.env);
```

---

## Forbidden Patterns

### 1. Any Type

```typescript
// ❌ Forbidden
function process(data: any) { ... }
const result = response as any;

// ✅ Required
function process(data: WorkflowInput) { ... }
const result = response as JenkinsResponse;
```

### 2. Non-Null Assertion

```typescript
// ❌ Forbidden
const user = getUser()!;
const name = data.user!.name;

// ✅ Required
const user = getUser();
if (!user) throw new Error('User not found');

const name = data.user?.name ?? 'Unknown';
```

### 3. Untyped Fetch

```typescript
// ❌ Forbidden
const res = await fetch(url);
const data = await res.json();

// ✅ Required
const res = await fetch(url);
const data = (await res.json()) as JenkinsJobResponse;
// Or use zod to validate
const data = jenkinsResponseSchema.parse(await res.json());
```

### 4. Magic Numbers/Strings

```typescript
// ❌ Forbidden
if (status === 2) { ... }
if (type === 'unit_test') { ... }

// ✅ Required
import { FlowItemStatus, GateType } from '@/lib/types/enums';
if (status === FlowItemStatus.ActionSuccess) { ... }
if (type === GateType.UnitTest) { ... }
```

### 5. Nested Callbacks

```typescript
// ❌ Forbidden
getUser((user) => {
  getTasks(user.id, (tasks) => {
    processTask(tasks[0], (result) => { ... });
  });
});

// ✅ Required
const user = await getUser();
const tasks = await getTasks(user.id);
const result = await processTask(tasks[0]);
```

---

## Testing Requirements

### Unit Tests

- Services must have unit tests
- Test happy path and error cases
- Mock external dependencies

```typescript
// lib/services/__tests__/workflow.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { workflowService } from '../workflow.service';
import { prisma } from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma');

describe('workflowService', () => {
  describe('create', () => {
    it('should create task with nodes and gates', async () => {
      // Arrange
      vi.mocked(prisma.$transaction).mockResolvedValue({ id: 'task-1' });

      // Act
      const result = await workflowService.create(validInput);

      // Assert
      expect(result.id).toBe('task-1');
    });

    it('should throw when application not found', async () => {
      // ...
    });
  });
});
```

### Integration Tests

- Test API routes with real database (test DB)
- Test third-party integrations with mocks

---

## Code Review Checklist

- [ ] Input validated with Zod schema
- [ ] Proper error handling with custom errors
- [ ] No `any` types
- [ ] No magic numbers/strings (use enums)
- [ ] Business logic in services, not routes
- [ ] Transactions for multi-table operations
- [ ] Logging for important operations
- [ ] No sensitive data in logs
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with no warnings

---

## Commands

```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx

# Format
npx prettier --write .

# Test
npx vitest run

# All checks
npm run check
```
