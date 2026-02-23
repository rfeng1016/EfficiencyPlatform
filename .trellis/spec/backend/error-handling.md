# Error Handling

> How errors are handled in this project.

---

## Overview

- Use custom error classes for business errors
- Zod for input validation
- Consistent API error response format per PRD

---

## Error Types

```typescript
// lib/utils/errors.ts

export class AppError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Business errors (1xxx)
export class ApplicationNotFoundError extends AppError {
  constructor(crn: string) {
    super(1001, `应用不存在: ${crn}`);
  }
}

export class RepositoryNotFoundError extends AppError {
  constructor(repo: string) {
    super(1002, `代码仓库不存在: ${repo}`);
  }
}

export class TaskNotFoundError extends AppError {
  constructor(taskId: string) {
    super(1003, `任务不存在: ${taskId}`);
  }
}

export class FlowTransitionError extends AppError {
  constructor(reason: string) {
    super(1004, `节点流转失败: ${reason}`);
  }
}

export class GateValidationError extends AppError {
  constructor(gateType: string, reason: string, details?: unknown) {
    super(1005, `卡点验证失败: ${reason}`, details);
  }
}

// Integration errors (2xxx)
export class IntegrationError extends AppError {
  constructor(system: string, message: string) {
    super(2001, `${system}接口调用失败: ${message}`);
  }
}

export class IntegrationTimeoutError extends AppError {
  constructor(system: string) {
    super(2002, `${system}接口超时`);
  }
}
```

---

## Error Handling Patterns

### In Services

Throw specific errors, let route handlers catch:

```typescript
// lib/services/workflow.service.ts
export async function createWorkflow(data: CreateWorkflowInput) {
  // Validate application exists
  const app = await siopClient.getApplication(data.application);
  if (!app) {
    throw new ApplicationNotFoundError(data.application);
  }

  // Validate repository exists
  const repo = await codingClient.getRepository(data.codeRepository);
  if (!repo) {
    throw new RepositoryNotFoundError(data.codeRepository);
  }

  // Create task...
}
```

### In Route Handlers

Use a wrapper for consistent error handling:

```typescript
// lib/utils/response.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

export function successResponse<T>(data: T, message = '成功') {
  return NextResponse.json({ code: 200, message, data });
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { code: 400, message: '请求参数错误', data: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    const status = error.code >= 2000 ? 502 : 400;
    return NextResponse.json(
      { code: error.code, message: error.message, data: error.details },
      { status }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { code: 500, message: '服务器内部错误' },
    { status: 500 }
  );
}

// Wrapper for route handlers
export function withErrorHandler<T>(
  handler: (request: Request) => Promise<T>
) {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
```

### Route Handler Usage

```typescript
// app/api/platform/workflow/create/route.ts
import { withErrorHandler, successResponse } from '@/lib/utils/response';
import { workflowService } from '@/lib/services/workflow.service';
import { createWorkflowSchema } from '@/lib/validators/workflow.schema';

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const data = createWorkflowSchema.parse(body);
  const result = await workflowService.create(data);
  return successResponse(result, '创建成功');
});
```

---

## API Error Responses

Per PRD specification:

```typescript
// Success
{ "code": 200, "message": "成功", "data": { ... } }

// Validation error
{ "code": 400, "message": "请求参数错误", "data": [...] }

// Business error
{ "code": 1001, "message": "应用不存在", "data": null }

// Gate validation failed
{
  "code": 1005,
  "message": "准入验证失败",
  "data": {
    "failedGates": [
      { "gateType": "unit_test", "passed": false, "reason": "行覆盖率不足: 实际 75%, 要求 80%" }
    ]
  }
}

// Integration error
{ "code": 2001, "message": "Jenkins接口调用失败: Connection refused", "data": null }
```

---

## Forbidden Patterns

- ❌ Catching errors without re-throwing or logging
- ❌ Generic error messages (be specific)
- ❌ Exposing stack traces to clients
- ❌ Swallowing errors silently

---

## Common Mistakes

1. **Not using transactions** - Partial failures leave inconsistent state
2. **Missing error codes** - Always use PRD-defined error codes
3. **Logging sensitive data** - Don't log passwords, tokens
4. **Not retrying integrations** - Third-party calls should retry 3 times
