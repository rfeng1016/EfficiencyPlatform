# Directory Structure

> How backend code is organized in this project (Next.js App Router).

---

## Overview

This project uses **Next.js 14+ App Router** for both frontend and backend. Backend logic lives in:
- `app/api/` - API Route Handlers
- `lib/` - Shared business logic, services, utilities
- `prisma/` - Database schema and migrations

---

## Directory Layout

```
src/
├── app/
│   ├── api/                      # API Route Handlers
│   │   ├── platform/
│   │   │   ├── workflow/
│   │   │   │   ├── route.ts      # GET /api/platform/workflow
│   │   │   │   ├── create/
│   │   │   │   │   └── route.ts  # POST /api/platform/workflow/create
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts  # GET/PUT/DELETE /api/platform/workflow/[id]
│   │   │   ├── flowqueue/
│   │   │   └── report/
│   │   └── performance/
│   └── (pages)/                  # Frontend pages
├── lib/
│   ├── services/                 # Business logic services
│   │   ├── workflow.service.ts
│   │   ├── gate.service.ts
│   │   └── metrics.service.ts
│   ├── integrations/             # Third-party API clients
│   │   ├── jenkins.ts
│   │   ├── coding.ts
│   │   ├── jira.ts
│   │   ├── siop.ts
│   │   ├── forcebot.ts
│   │   └── wonderbene.ts
│   ├── db/                       # Database utilities
│   │   └── prisma.ts             # Prisma client singleton
│   ├── validators/               # Zod schemas for validation
│   │   ├── workflow.schema.ts
│   │   └── gate.schema.ts
│   ├── types/                    # TypeScript types
│   │   ├── workflow.types.ts
│   │   ├── gate.types.ts
│   │   └── api.types.ts
│   └── utils/                    # Utility functions
│       ├── response.ts           # API response helpers
│       └── errors.ts             # Error classes
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
└── jobs/                         # Scheduled tasks (cron)
    ├── flow-engine.ts
    └── data-sync.ts
```

---

## Module Organization

### API Routes

Follow RESTful conventions matching PRD API paths:

| PRD Path | File Location |
|----------|---------------|
| `POST /platform/workflow/create` | `app/api/platform/workflow/create/route.ts` |
| `GET /platform/workflow/list` | `app/api/platform/workflow/route.ts` |
| `POST /platform/workflow/flow` | `app/api/platform/workflow/flow/route.ts` |
| `GET /platform/report/project` | `app/api/platform/report/project/route.ts` |

### Services

One service per domain entity:

```typescript
// lib/services/workflow.service.ts
export const workflowService = {
  create: async (data: CreateWorkflowInput) => { ... },
  list: async (filters: WorkflowFilters) => { ... },
  flow: async (taskId: string, action: FlowAction) => { ... },
};
```

### Integrations

One file per third-party system:

```typescript
// lib/integrations/jenkins.ts
export const jenkinsClient = {
  triggerJob: async (jobName: string) => { ... },
  getCoverage: async (jobName: string, buildNumber: number) => { ... },
};
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| API route files | `route.ts` | `app/api/platform/workflow/route.ts` |
| Service files | `*.service.ts` | `workflow.service.ts` |
| Integration files | `*.ts` (noun) | `jenkins.ts` |
| Schema files | `*.schema.ts` | `workflow.schema.ts` |
| Type files | `*.types.ts` | `workflow.types.ts` |

---

## Forbidden Patterns

- ❌ Business logic in route handlers (use services)
- ❌ Direct Prisma calls in route handlers (use services)
- ❌ Hardcoded third-party URLs (use env variables)
- ❌ Multiple Prisma client instances (use singleton)

---

## Examples

```typescript
// ✅ Good: Route handler delegates to service
// app/api/platform/workflow/create/route.ts
import { workflowService } from '@/lib/services/workflow.service';
import { createWorkflowSchema } from '@/lib/validators/workflow.schema';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request: Request) {
  const body = await request.json();
  const validated = createWorkflowSchema.parse(body);
  const result = await workflowService.create(validated);
  return successResponse(result);
}
```
