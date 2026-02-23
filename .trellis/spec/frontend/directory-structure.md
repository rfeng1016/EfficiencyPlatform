# Directory Structure

> How frontend code is organized in this project (Next.js App Router).

---

## Overview

This project uses **Next.js 14+ App Router** with a feature-based organization pattern.

---

## Directory Layout

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   │   └── login/
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── layout.tsx            # Shared dashboard layout
│   │   ├── workbench/            # 工作台
│   │   │   ├── page.tsx
│   │   │   └── [taskId]/
│   │   │       └── page.tsx
│   │   ├── queues/               # 工单队列
│   │   │   ├── arch-review/      # 架构评审队列
│   │   │   ├── release/          # 发布队列
│   │   │   ├── admission-fail/   # 准入失败队列
│   │   │   └── ...
│   │   ├── performance/          # 压测模块
│   │   │   ├── scenes/
│   │   │   └── routine/
│   │   ├── reports/              # 度量大盘
│   │   │   ├── project/
│   │   │   ├── quality/
│   │   │   ├── dev-quality/
│   │   │   └── engineering/
│   │   └── settings/             # 基础配置
│   │       ├── pipelines/
│   │       ├── gates/
│   │       └── checklists/
│   ├── api/                      # API Routes (see backend spec)
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/
│   ├── ui/                       # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── breadcrumb.tsx
│   └── features/                 # Feature-specific components
│       ├── workflow/
│       │   ├── task-form.tsx
│       │   ├── task-list.tsx
│       │   ├── task-detail.tsx
│       │   ├── flow-timeline.tsx
│       │   └── gate-config.tsx
│       ├── queues/
│       │   ├── queue-table.tsx
│       │   └── review-form.tsx
│       ├── reports/
│       │   ├── metrics-card.tsx
│       │   ├── heatmap-chart.tsx
│       │   └── trend-chart.tsx
│       └── performance/
│           ├── scene-form.tsx
│           └── result-table.tsx
├── hooks/                        # Custom hooks
│   ├── use-workflow.ts
│   ├── use-queues.ts
│   ├── use-reports.ts
│   └── use-debounce.ts
├── lib/                          # Shared utilities (see backend spec)
│   ├── api/                      # API client functions
│   │   ├── workflow.ts
│   │   ├── queues.ts
│   │   └── reports.ts
│   ├── types/                    # Shared types
│   └── utils/                    # Utility functions
└── styles/                       # Global styles
    └── variables.css
```

---

## Module Organization

### Pages (App Router)

Each page is a directory with `page.tsx`:

```
app/(dashboard)/workbench/
├── page.tsx              # Main page component
├── loading.tsx           # Loading UI (optional)
├── error.tsx             # Error UI (optional)
└── [taskId]/
    └── page.tsx          # Dynamic route
```

### Feature Components

Group by feature domain:

```
components/features/workflow/
├── task-form.tsx         # Create/edit task form
├── task-list.tsx         # Task list with filters
├── task-detail.tsx       # Task detail view
├── flow-timeline.tsx     # Flow progress timeline
└── gate-config.tsx       # Gate configuration panel
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Page files | `page.tsx` | `app/workbench/page.tsx` |
| Layout files | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| Components | kebab-case | `task-form.tsx`, `queue-table.tsx` |
| Hooks | `use-*.ts` | `use-workflow.ts` |
| API clients | `*.ts` (noun) | `workflow.ts`, `queues.ts` |
| Types | `*.types.ts` | `workflow.types.ts` |

### Component Naming

- PascalCase for component names: `TaskForm`, `QueueTable`
- File name matches export: `task-form.tsx` exports `TaskForm`

---

## Route Groups

Use route groups `(name)` for shared layouts without affecting URL:

| Group | Purpose | URL |
|-------|---------|-----|
| `(auth)` | Auth pages (login) | `/login` |
| `(dashboard)` | Main app with sidebar | `/workbench`, `/queues/*` |

---

## Forbidden Patterns

- ❌ Components in `app/` directory (use `components/`)
- ❌ Business logic in page components (use hooks/services)
- ❌ Mixing feature components in `ui/` (keep base components pure)
- ❌ Deep nesting (max 3 levels in components)

---

## Examples

```typescript
// ✅ Good: Page delegates to feature components
// app/(dashboard)/workbench/page.tsx
import { TaskList } from '@/components/features/workflow/task-list';
import { TaskFilters } from '@/components/features/workflow/task-filters';

export default function WorkbenchPage() {
  return (
    <div>
      <h1>工作台</h1>
      <TaskFilters />
      <TaskList />
    </div>
  );
}
```
