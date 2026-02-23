# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest + React Testing Library

---

## Required Patterns

### 1. Loading States

Always show loading indicators:

```typescript
// ✅ Good
function TaskList() {
  const { data, isLoading, error } = useWorkflowList(filters);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <Table data={data.list} />;
}

// ❌ Bad: No loading state
function TaskList() {
  const { data } = useWorkflowList(filters);
  return <Table data={data?.list ?? []} />;
}
```

### 2. Error Handling

Display errors to users:

```typescript
// ✅ Good
function TaskForm() {
  const mutation = useCreateWorkflow();

  return (
    <form onSubmit={...}>
      {mutation.error && (
        <Alert variant="error">{mutation.error.message}</Alert>
      )}
      ...
    </form>
  );
}
```

### 3. Optimistic Updates

For better UX on mutations:

```typescript
// ✅ Good: Optimistic update
const mutation = useMutation({
  mutationFn: updateTask,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['task', id] });
    const previous = queryClient.getQueryData(['task', id]);
    queryClient.setQueryData(['task', id], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['task', id], context?.previous);
  },
});
```

### 4. Accessible Forms

```typescript
// ✅ Good
<div className="space-y-2">
  <Label htmlFor="task-name">任务名称</Label>
  <Input
    id="task-name"
    aria-describedby="task-name-error"
    aria-invalid={!!errors.name}
    {...register('name')}
  />
  {errors.name && (
    <p id="task-name-error" className="text-sm text-red-500">
      {errors.name.message}
    </p>
  )}
</div>
```

### 5. Memoization (When Needed)

```typescript
// ✅ Good: Expensive computation
const sortedTasks = useMemo(
  () => tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [tasks]
);

// ✅ Good: Callback passed to child
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);

// ❌ Bad: Unnecessary memoization
const name = useMemo(() => task.name, [task.name]);
```

---

## Forbidden Patterns

### 1. Console Logs in Production

```typescript
// ❌ Forbidden
console.log('data:', data);

// ✅ Use proper logging or remove
if (process.env.NODE_ENV === 'development') {
  console.log('data:', data);
}
```

### 2. Inline Functions in JSX (for expensive renders)

```typescript
// ❌ Bad: Creates new function every render
<Button onClick={() => handleClick(item.id)}>

// ✅ Good: Use callback or data attribute
<Button onClick={handleClick} data-id={item.id}>

// Or memoize if needed
const handleItemClick = useCallback((id: string) => {
  // ...
}, []);
```

### 3. Index as Key

```typescript
// ❌ Forbidden
{tasks.map((task, index) => (
  <TaskRow key={index} task={task} />
))}

// ✅ Required: Use unique ID
{tasks.map((task) => (
  <TaskRow key={task.id} task={task} />
))}
```

### 4. Direct State Mutation

```typescript
// ❌ Forbidden
const [items, setItems] = useState([]);
items.push(newItem);  // Direct mutation
setItems(items);

// ✅ Required
setItems([...items, newItem]);
// Or
setItems(prev => [...prev, newItem]);
```

### 5. Uncontrolled to Controlled

```typescript
// ❌ Bad: Switching between controlled/uncontrolled
<Input value={value || undefined} />

// ✅ Good: Always controlled
<Input value={value ?? ''} />
```

### 6. Missing Dependency Array

```typescript
// ❌ Forbidden
useEffect(() => {
  fetchData(id);
});  // Missing dependency array

// ✅ Required
useEffect(() => {
  fetchData(id);
}, [id]);
```

---

## Testing Requirements

### Component Tests

Test user interactions, not implementation:

```typescript
// components/features/workflow/__tests__/task-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../task-form';

describe('TaskForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('任务名称'), {
      target: { value: 'Test Task' },
    });
    fireEvent.click(screen.getByRole('button', { name: '创建任务' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Task' })
      );
    });
  });

  it('should show validation error for empty name', async () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '创建任务' }));

    await waitFor(() => {
      expect(screen.getByText('请输入任务名称')).toBeInTheDocument();
    });
  });
});
```

### Hook Tests

```typescript
// hooks/__tests__/use-workflow.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkflowList } from '../use-workflow';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useWorkflowList', () => {
  it('should fetch workflow list', async () => {
    const { result } = renderHook(
      () => useWorkflowList({ page: 1 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.list).toHaveLength(10);
  });
});
```

---

## Code Review Checklist

- [ ] Loading states for async operations
- [ ] Error handling with user feedback
- [ ] No `any` types
- [ ] No console.log in production code
- [ ] Unique keys for list items
- [ ] Proper dependency arrays in hooks
- [ ] Accessible form labels and ARIA
- [ ] No direct state mutations
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
