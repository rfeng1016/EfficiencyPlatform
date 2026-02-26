'use client';

import type { HTMLAttributes } from 'react';

type Variant = 'gray' | 'blue' | 'green' | 'red' | 'yellow';

export default function Badge({
  variant = 'gray',
  className = '',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
  const variantCls =
    variant === 'blue'
      ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100'
      : variant === 'green'
        ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-100'
        : variant === 'red'
          ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-100'
          : variant === 'yellow'
            ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-100'
            : 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200';

  return <span className={`${base} ${variantCls} ${className}`} {...props} />;
}
