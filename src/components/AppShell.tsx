"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        跳到主要内容
      </a>
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-gray-900">
              北即星
            </Link>
            <nav className="flex items-center gap-4 text-sm text-gray-600">
              <Link
                href="/workflow"
                aria-current={isActive("/workflow") ? "page" : undefined}
                className={
                  isActive("/workflow")
                    ? "font-medium text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }
              >
                工单
              </Link>
              <Link
                href="/metrics"
                aria-current={isActive("/metrics") ? "page" : undefined}
                className={
                  isActive("/metrics")
                    ? "font-medium text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }
              >
                度量
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-6 py-8">
        {(title || description) && (
          <div className="mb-6">
            {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
