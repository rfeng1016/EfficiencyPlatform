# State Management

> How state is managed in this project.

---

## Overview

- **Server State**: TanStack Query (React Query)
- **Client State**: React useState/useReducer
- **Global Client State**: Zustand (when needed)
- **URL State**: Next.js searchParams

---

## State Categories

| Category | Solution | Example |
|----------|----------|---------|
| Server State | TanStack Query | Task list, task detail, metrics |
| Form State | React Hook Form | Create task form, filter form |
| UI State | useState | Modal open, tab active |
| Global UI State | Zustand | Sidebar collapsed, theme |
| URL State | searchParams | Filters, pagination, selected tab |

---

## Server State (TanStack Query)

Most state in this app is server state. Use TanStack Query:

```typescript
// ✅ Good: Server state with Query
const { data: tasks, isLoading } = useWorkflowList(filters);
const { data: task } = useWorkflow(taskId);
const { data: metrics } = useProjectMetrics(dateRange);
```

### When to Use

- Data from API
- Data that needs caching
- Data shared across components
- Data that needs background refresh

---

## Local UI State (useState)

For component-specific UI state:

```typescript
// ✅ Good: Local UI state
function TaskDetail() {
  const [activeTab, setActiveTab] = useState<'info' | 'gates' | 'history'>('info');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      ...
    </Tabs>
  );
}
```

### When to Use

- Modal open/close
- Dropdown expanded
- Tab selection (if not in URL)
- Form input values (before submit)

---

## URL State (searchParams)

For state that should persist in URL:

```typescript
// app/(dashboard)/workbench/page.tsx
import { useSearchParams, useRouter } from 'next/navigation';

export default function WorkbenchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    status: searchParams.get('status') || undefined,
    businessLine: searchParams.get('businessLine') || undefined,
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`?${params.toString()}`);
  };

  return <TaskList filters={filters} onFilterChange={updateFilters} />;
}
```

### When to Use

- Pagination (page, pageSize)
- Filters (status, businessLine, dateRange)
- Selected item ID
- Active tab (if shareable)

---

## Global Client State (Zustand)

Only for truly global UI state:

```typescript
// lib/stores/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'ui-storage' }
  )
);
```

### When to Use (Rare)

- Sidebar collapsed state
- Theme preference
- User preferences not from server

### When NOT to Use

- ❌ Server data (use Query)
- ❌ Form state (use React Hook Form)
- ❌ Component-local state (use useState)
- ❌ URL-shareable state (use searchParams)

---

## Decision Tree

```
Is it from the server?
  → Yes: TanStack Query

Is it form input?
  → Yes: React Hook Form

Should it persist in URL?
  → Yes: searchParams

Is it shared across distant components?
  → Yes: Zustand (rare)
  → No: useState
```

---

## Forbidden Patterns

- ❌ Redux (overkill for this app)
- ❌ Context for frequently changing state
- ❌ Global state for server data
- ❌ Prop drilling more than 2 levels (use composition)
- ❌ Storing derived state (compute it)

---

## Common Mistakes

1. **Using global state for server data** - Use TanStack Query
2. **Not using URL for filters** - Filters should be shareable
3. **Storing derived state** - Compute from source
4. **Over-using Zustand** - Most state is local or server
5. **Prop drilling** - Use composition or context for deep trees

---

## Examples

### Task List with Filters (URL State + Server State)

```typescript
// app/(dashboard)/workbench/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useWorkflowList } from '@/hooks/use-workflow';
import { TaskFilters } from '@/components/features/workflow/task-filters';
import { TaskTable } from '@/components/features/workflow/task-table';

export default function WorkbenchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL state → filters
  const filters = {
    page: Number(searchParams.get('page')) || 1,
    pageSize: 20,
    status: searchParams.get('status') || undefined,
    businessLine: searchParams.get('businessLine') || undefined,
  };

  // Server state
  const { data, isLoading, error } = useWorkflowList(filters);

  // Update URL
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <TaskFilters filters={filters} onChange={handleFilterChange} />
      <TaskTable
        data={data?.list ?? []}
        isLoading={isLoading}
        pagination={{
          total: data?.total ?? 0,
          page: filters.page,
          pageSize: filters.pageSize,
          onChange: (page) => handleFilterChange({ page }),
        }}
      />
    </div>
  );
}
```
