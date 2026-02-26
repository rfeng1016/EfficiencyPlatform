'use client';

import type { ReactNode } from 'react';

export default function Stat({
  label,
  value,
  tone = 'gray',
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: 'gray' | 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const valueCls =
    tone === 'blue'
      ? 'text-blue-600'
      : tone === 'green'
        ? 'text-green-600'
        : tone === 'yellow'
          ? 'text-yellow-600'
          : tone === 'purple'
            ? 'text-purple-600'
            : 'text-gray-900';

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className={`text-3xl font-semibold ${valueCls}`}>{value}</div>
      <div className="mt-1 text-sm text-gray-600">{label}</div>
    </div>
  );
}
