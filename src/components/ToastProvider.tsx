"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastTone = "default" | "success" | "error";

type ToastItem = {
  id: string;
  title?: string;
  message: string;
  tone: ToastTone;
  count: number;
};

type ToastApi = {
  push: (input: { title?: string; message: string; tone?: ToastTone }) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const MAX_STACK = 5;
  const TTL_MS = 3500;

  const clearTimer = useCallback((id: string) => {
    const handle = timersRef.current.get(id);
    if (handle) window.clearTimeout(handle);
    timersRef.current.delete(id);
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    },
    [clearTimer],
  );

  const schedule = useCallback(
    (id: string) => {
      clearTimer(id);
      const handle = window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
        timersRef.current.delete(id);
      }, TTL_MS);
      timersRef.current.set(id, handle);
    },
    [clearTimer],
  );

  const push = useCallback(
    ({ title, message, tone = "default" }: { title?: string; message: string; tone?: ToastTone }) => {
      const key = `${tone}::${title ?? ""}::${message}`;

      setItems((prev) => {
        const idx = prev.findIndex(
          (t) => `${t.tone}::${t.title ?? ""}::${t.message}` === key,
        );
        if (idx >= 0) {
          const merged = [...prev];
          const current = merged[idx];
          merged[idx] = { ...current, count: current.count + 1 };
          return merged;
        }

        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const next: ToastItem = { id, title, message, tone, count: 1 };
        const appended = [...prev, next];
        if (appended.length <= MAX_STACK) return appended;
        const dropped = appended.slice(appended.length - MAX_STACK);
        const removed = appended.slice(0, appended.length - MAX_STACK);
        removed.forEach((t) => clearTimer(t.id));
        return dropped;
      });

      window.setTimeout(() => {
        setItems((prev) => {
          const idx = prev.findIndex(
            (t) => `${t.tone}::${t.title ?? ""}::${t.message}` === key,
          );
          if (idx < 0) return prev;
          schedule(prev[idx].id);
          return prev;
        });
      }, 0);
    },
    [clearTimer, schedule],
  );

  const value = useMemo<ToastApi>(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((t) => {
          const toneCls =
            t.tone === "success"
              ? "border-green-200 bg-green-50"
              : t.tone === "error"
                ? "border-red-200 bg-red-50"
                : "border-gray-200 bg-white";
          const titleCls = t.tone === "error" ? "text-red-900" : "text-gray-900";
          const msgCls = t.tone === "error" ? "text-red-700" : "text-gray-600";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-sm ${toneCls}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {t.title && (
                    <div className={`text-sm font-semibold ${titleCls}`}>
                      {t.title}
                      {t.count > 1 && <span className="ml-2 text-xs font-medium text-gray-600">×{t.count}</span>}
                    </div>
                  )}
                  <div className={`text-sm ${msgCls}`}>
                    {t.message}
                    {!t.title && t.count > 1 && <span className="ml-2 text-xs font-medium text-gray-600">×{t.count}</span>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="关闭提示"
                  className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-black/5 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
