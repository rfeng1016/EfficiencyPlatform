'use client';

import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export default function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  const base =
    'inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const sizeCls = size === 'sm' ? 'h-8 px-3 text-sm' : 'h-9 px-4 text-sm';

  const variantCls =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : variant === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : variant === 'ghost'
          ? 'bg-transparent hover:bg-gray-100 text-gray-900'
          : 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900';

  return <button className={`${base} ${sizeCls} ${variantCls} ${className}`} {...props} />;
}
