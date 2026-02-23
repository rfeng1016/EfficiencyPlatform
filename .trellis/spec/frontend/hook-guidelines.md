# Hook Guidelines

> How hooks are used in this project.

---

## Overview

- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Custom Hooks**: For shared stateful logic

---

## Data Fetching with TanStack Query

### Query Hooks

```typescript
// hooks/use-workflow.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api/workflow';
import type { WorkflowFilters, CreateWorkflowInput } from '@/lib/types/workflow.types';

// Query keys factory
export const workflowKeys = {
  all: ['workflows'] as const,
  lists: () => [...workflowKeys.all, 'list'] as const,
  list: (filters: WorkflowFilters) => [...workflowKeys.lists(), filters] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
};

// List query
export function useWorkflowList(filters: WorkflowFilters) {
  return useQuery({
    queryKey: workflowKeys.list(filters),
    queryFn: () => workflowApi.list(filters),
  });
}

// Detail query
export function useWorkflow(taskId: string) {
  return useQuery({
    queryKey: workflowKeys.detail(taskId),
    queryFn: () => workflowApi.getById(taskId),
    enabled: !!taskId,
  });
}

// Create mutation
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkflowInput) => workflowApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
    },
  });
}

// Flow mutation
export function useFlowWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, action }: { taskId: string; action: 'next' | 'back' }) =>
      workflowApi.flow(taskId, action),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
    },
  });
}
```

### Usage in Components

```typescript
// components/features/workflow/task-list.tsx
'use client';

import { useWorkflowList } from '@/hooks/use-workflow';
import { useState } from 'react';

export function TaskList() {
  const [filters, setFilters] = useState({ page: 1, pageSize: 20 });
  const { data, isLoading, error } = useWorkflowList(filters);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error.message}</div>;

  return (
    <table>
      {data?.list.map((task) => (
        <tr key={task.id}>...</tr>
      ))}
    </table>
  );
}
```

---

## Form Handling

### React Hook Form + Zod

```typescript
// components/features/workflow/task-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateWorkflow } from '@/hooks/use-workflow';

const formSchema = z.object({
  name: z.string().min(1, '请输入任务名称').max(255),
  businessLine: z.string().min(1, '请选择业务线'),
  application: z.string().min(1, '请选择应用'),
  pipelineId: z.string().min(1, '请选择流水线'),
  codeRepository: z.string().url('请输入有效的仓库地址'),
  branch: z.string().min(1, '请输入分支名'),
  devOwner: z.string().min(1, '请选择研发负责人'),
  testOwner: z.string().min(1, '请选择测试负责人'),
  planDevStartTime: z.string().datetime(),
  planTestStartTime: z.string().datetime(),
  planReleaseTime: z.string().datetime(),
});

type FormData = z.infer<typeof formSchema>;

export function TaskForm({ onSuccess }: { onSuccess?: () => void }) {
  const createMutation = useCreateWorkflow();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      businessLine: '',
      // ...
    },
  });

  const onSubmit = async (data: FormData) => {
    await createMutation.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <span className="text-red-500">{form.formState.errors.name.message}</span>
      )}
      {/* ... */}
    </form>
  );
}
```

---

## Custom Hook Patterns

### Naming Convention

- Always prefix with `use`
- Name describes what it does: `useWorkflowList`, `useDebounce`

### Structure

```typescript
// hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### Composing Hooks

```typescript
// hooks/use-task-search.ts
import { useState } from 'react';
import { useDebounce } from './use-debounce';
import { useWorkflowList } from './use-workflow';

export function useTaskSearch() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ page: 1, pageSize: 20 });

  const debouncedSearch = useDebounce(search, 300);

  const query = useWorkflowList({
    ...filters,
    name: debouncedSearch || undefined,
  });

  return {
    search,
    setSearch,
    filters,
    setFilters,
    ...query,
  };
}
```

---

## API Client Functions

```typescript
// lib/api/workflow.ts
import type {
  WorkflowFilters,
  CreateWorkflowInput,
  FlowItem,
  PaginatedResponse,
} from '@/lib/types/workflow.types';

const BASE_URL = '/api/platform/workflow';

export const workflowApi = {
  list: async (filters: WorkflowFilters): Promise<PaginatedResponse<FlowItem>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value));
    });

    const res = await fetch(`${BASE_URL}/list?${params}`);
    const json = await res.json();
    if (json.code !== 200) throw new Error(json.message);
    return json.data;
  },

  getById: async (id: string): Promise<FlowItem> => {
    const res = await fetch(`${BASE_URL}/${id}`);
    const json = await res.json();
    if (json.code !== 200) throw new Error(json.message);
    return json.data;
  },

  create: async (data: CreateWorkflowInput): Promise<FlowItem> => {
    const res = await fetch(`${BASE_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.code !== 200) throw new Error(json.message);
    return json.data;
  },

  flow: async (taskId: string, action: 'next' | 'back') => {
    const res = await fetch(`${BASE_URL}/flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, action }),
    });
    const json = await res.json();
    if (json.code !== 200) throw new Error(json.message);
    return json.data;
  },
};
```

---

## Forbidden Patterns

- ❌ Fetching in useEffect (use TanStack Query)
- ❌ Manual cache management (let Query handle it)
- ❌ Hooks that don't start with `use`
- ❌ Conditional hook calls
- ❌ Hooks inside loops or conditions

---

## Common Mistakes

1. **Missing query keys** - Always use key factories
2. **Not invalidating on mutation** - Invalidate related queries
3. **Forgetting `enabled`** - Disable queries when params missing
4. **Over-fetching** - Use `select` to pick needed fields
5. **Missing error handling** - Always handle error state in UI
