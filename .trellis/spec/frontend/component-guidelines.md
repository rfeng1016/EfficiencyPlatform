# Component Guidelines

> How components are built in this project.

---

## Overview

- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

---

## Component Structure

```typescript
// components/features/workflow/task-form.tsx
'use client'; // Only if using client-side features

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateWorkflowInput } from '@/lib/types/workflow.types';

interface TaskFormProps {
  onSubmit: (data: CreateWorkflowInput) => Promise<void>;
  initialData?: Partial<CreateWorkflowInput>;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, initialData, isLoading }: TaskFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...initialData, name } as CreateWorkflowInput);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="任务名称"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '提交中...' : '创建任务'}
      </Button>
    </form>
  );
}
```

---

## Props Conventions

### Required Props First

```typescript
interface Props {
  // Required props first
  taskId: string;
  onSubmit: (data: FormData) => void;

  // Optional props after
  initialData?: TaskData;
  isLoading?: boolean;
  className?: string;
}
```

### Event Handler Naming

```typescript
// ✅ Good
onSubmit: () => void;
onChange: (value: string) => void;
onTaskSelect: (task: Task) => void;

// ❌ Bad
handleSubmit: () => void;  // Use 'on' prefix for props
submitHandler: () => void;
```

### Children and Composition

```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
}

export function Card({ children, title, footer }: CardProps) {
  return (
    <div className="rounded-lg border p-4">
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {children}
      {footer && <div className="mt-4 border-t pt-4">{footer}</div>}
    </div>
  );
}
```

---

## Styling Patterns

### Tailwind CSS Classes

```typescript
// ✅ Good: Use Tailwind utilities
<div className="flex items-center gap-4 p-4 rounded-lg border">

// ✅ Good: Conditional classes with clsx/cn
import { cn } from '@/lib/utils';

<button className={cn(
  'px-4 py-2 rounded',
  isActive && 'bg-primary text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
```

### Component Variants

Use `cva` (class-variance-authority) for variants:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return <span className={badgeVariants({ variant })}>{children}</span>;
}
```

---

## Status Display

Use consistent status badges per PRD:

```typescript
// components/features/workflow/status-badge.tsx
import { Badge } from '@/components/ui/badge';
import { FlowItemStatus } from '@/lib/types/enums';

const statusConfig = {
  [FlowItemStatus.ActionWait]: { label: '等待操作', variant: 'default' },
  [FlowItemStatus.ActionIng]: { label: '操作中', variant: 'warning' },
  [FlowItemStatus.ActionSuccess]: { label: '操作成功', variant: 'success' },
  [FlowItemStatus.ActionFail]: { label: '操作失败', variant: 'error' },
  [FlowItemStatus.Canceled]: { label: '已取消', variant: 'default' },
  [FlowItemStatus.Finished]: { label: '已完成', variant: 'success' },
} as const;

export function StatusBadge({ status }: { status: FlowItemStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

---

## Accessibility

### Required Practices

```typescript
// ✅ Labels for form inputs
<label htmlFor="task-name">任务名称</label>
<Input id="task-name" ... />

// ✅ ARIA labels for icon buttons
<Button aria-label="删除任务">
  <TrashIcon />
</Button>

// ✅ Role for interactive elements
<div role="button" tabIndex={0} onKeyDown={handleKeyDown}>

// ✅ Loading states
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? '加载中...' : '提交'}
</Button>
```

### Keyboard Navigation

- All interactive elements must be focusable
- Support Enter/Space for buttons
- Support Escape to close modals/dropdowns

---

## Forbidden Patterns

- ❌ Inline styles (`style={{}}`)
- ❌ CSS-in-JS (use Tailwind)
- ❌ Direct DOM manipulation
- ❌ Anonymous components in render
- ❌ Business logic in components (use hooks)

---

## Common Mistakes

1. **Missing loading states** - Always show loading indicator
2. **No error handling** - Display error messages to users
3. **Hardcoded text** - Use constants for repeated strings
4. **Missing keys in lists** - Always provide unique keys
5. **Over-fetching** - Only fetch data needed for the view
