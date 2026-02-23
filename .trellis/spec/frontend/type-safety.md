# Type Safety

> Type safety patterns in this project.

---

## Overview

- **Language**: TypeScript (strict mode)
- **Validation**: Zod for runtime validation
- **Types**: Shared between frontend and backend

---

## Type Organization

```
lib/types/
├── workflow.types.ts     # Workflow/task types
├── gate.types.ts         # Gate types
├── queue.types.ts        # Queue types
├── report.types.ts       # Report/metrics types
├── api.types.ts          # API response types
└── enums.ts              # Shared enums
```

### Shared Types (Frontend + Backend)

```typescript
// lib/types/workflow.types.ts
export interface FlowItem {
  id: string;
  name: string;
  businessLine: string;
  application: string;
  pipelineId: string;
  status: FlowItemStatus;
  progress: number;
  codeRepository?: string;
  branch?: string;
  creator: string;
  devOwner?: string;
  testOwner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowInput {
  name: string;
  businessLine: string;
  application: string;
  pipelineId: string;
  codeRepository: string;
  branch: string;
  devOwner: string;
  testOwner: string;
  planDevStartTime: string;
  planTestStartTime: string;
  planReleaseTime: string;
  jiraCardId?: string;
  spaceId?: string;
  sprintId?: string;
}

export interface WorkflowFilters {
  page?: number;
  pageSize?: number;
  status?: FlowItemStatus;
  businessLine?: string;
  application?: string;
  name?: string;
}
```

### Enums

```typescript
// lib/types/enums.ts
export enum FlowItemStatus {
  ActionWait = 0,      // 等待操作
  ActionIng = 1,       // 操作中
  ActionSuccess = 2,   // 操作成功
  ActionFail = 3,      // 操作失败
  Canceled = 4,        // 已取消
  Finished = 5,        // 已完成
}

export enum GateType {
  UnitTest = 'unit_test',
  SecurityScan = 'security_scan',
  PerformanceTest = 'performance_test',
  ArchReview = 'arch_review',
  CodeReview = 'code_review',
  Checklist = 'checklist',
}

export enum GateStatus {
  Pending = 0,
  Running = 1,
  Passed = 2,
  Failed = 3,
  Skipped = 4,
}
```

---

## Validation with Zod

### API Response Validation

```typescript
// lib/validators/api.schema.ts
import { z } from 'zod';

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema,
  });

export const paginatedSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    list: z.array(itemSchema),
  });
```

### Form Validation

```typescript
// lib/validators/workflow.schema.ts
import { z } from 'zod';

export const createWorkflowSchema = z.object({
  name: z.string().min(1, '请输入任务名称').max(255, '任务名称不能超过255字符'),
  businessLine: z.string().min(1, '请选择业务线'),
  application: z.string().min(1, '请选择应用'),
  pipelineId: z.string().min(1, '请选择流水线'),
  codeRepository: z.string().url('请输入有效的仓库地址'),
  branch: z.string().min(1, '请输入分支名'),
  devOwner: z.string().min(1, '请选择研发负责人'),
  testOwner: z.string().min(1, '请选择测试负责人'),
  planDevStartTime: z.string().datetime('请选择计划研发开始时间'),
  planTestStartTime: z.string().datetime('请选择计划测试开始时间'),
  planReleaseTime: z.string().datetime('请选择计划发布时间'),
  jiraCardId: z.string().optional(),
  spaceId: z.string().optional(),
  sprintId: z.string().optional(),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
```

---

## Common Patterns

### Type Inference from Zod

```typescript
// ✅ Good: Infer types from schema
const schema = z.object({ name: z.string() });
type FormData = z.infer<typeof schema>;

// ❌ Bad: Duplicate type definition
interface FormData { name: string; }
const schema = z.object({ name: z.string() });
```

### Generic API Response

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

// Usage
type TaskListResponse = ApiResponse<PaginatedResponse<FlowItem>>;
```

### Type Guards

```typescript
// lib/utils/type-guards.ts
import { FlowItemStatus } from '@/lib/types/enums';

export function isCompletedStatus(status: FlowItemStatus): boolean {
  return status === FlowItemStatus.Finished || status === FlowItemStatus.Canceled;
}

export function isActionableStatus(status: FlowItemStatus): boolean {
  return status === FlowItemStatus.ActionWait || status === FlowItemStatus.ActionFail;
}
```

### Discriminated Unions

```typescript
// For different gate result types
type GateResult =
  | { type: 'unit_test'; coverage: number; passed: boolean }
  | { type: 'security_scan'; vulnerabilities: number; passed: boolean }
  | { type: 'performance_test'; p99: number; passed: boolean };

function renderGateResult(result: GateResult) {
  switch (result.type) {
    case 'unit_test':
      return `覆盖率: ${result.coverage}%`;
    case 'security_scan':
      return `漏洞数: ${result.vulnerabilities}`;
    case 'performance_test':
      return `P99: ${result.p99}ms`;
  }
}
```

---

## Forbidden Patterns

### 1. `any` Type

```typescript
// ❌ Forbidden
function process(data: any) { ... }
const result = response as any;

// ✅ Required
function process(data: FlowItem) { ... }
const result = response as ApiResponse<FlowItem>;
```

### 2. Non-Null Assertion

```typescript
// ❌ Forbidden
const task = tasks.find(t => t.id === id)!;
const name = user!.name;

// ✅ Required
const task = tasks.find(t => t.id === id);
if (!task) throw new Error('Task not found');

const name = user?.name ?? 'Unknown';
```

### 3. Type Assertions Without Validation

```typescript
// ❌ Forbidden
const data = (await res.json()) as FlowItem;

// ✅ Required: Validate at runtime
const json = await res.json();
const data = flowItemSchema.parse(json);
```

### 4. Implicit `any` in Callbacks

```typescript
// ❌ Forbidden
tasks.map(task => task.name);  // task is implicitly any

// ✅ Required
tasks.map((task: FlowItem) => task.name);
// Or ensure tasks is typed: tasks: FlowItem[]
```

### 5. String Enums as Magic Strings

```typescript
// ❌ Forbidden
if (gate.type === 'unit_test') { ... }

// ✅ Required
import { GateType } from '@/lib/types/enums';
if (gate.type === GateType.UnitTest) { ... }
```

---

## TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## Common Mistakes

1. **Not using strict mode** - Always enable strict TypeScript
2. **Duplicating types** - Infer from Zod schemas
3. **Missing null checks** - Use optional chaining and nullish coalescing
4. **Untyped API responses** - Always validate with Zod
5. **Magic strings** - Use enums for fixed values
