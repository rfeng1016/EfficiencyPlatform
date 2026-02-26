"use client";

import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-lg border border-red-200 bg-white px-5 py-6 shadow-sm">
        <div className="text-sm font-semibold text-gray-900">工单详情出错了</div>
        <div className="mt-2 text-sm text-gray-600">{error.message || "发生未知错误"}</div>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" onClick={() => reset()}>
            重试
          </Button>
          <Button onClick={() => (window.location.href = "/workflow")}>
            返回列表
          </Button>
        </div>
      </div>
    </div>
  );
}
