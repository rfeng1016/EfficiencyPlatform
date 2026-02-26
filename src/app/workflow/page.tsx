"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { useToast } from "@/components/ToastProvider";

interface FlowItem {
  id: string;
  name: string;
  businessLine: string;
  application: string;
  status: number;
  progress: number;
  creator: string;
  createdAt: string;
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '等待中', color: 'bg-gray-100 text-gray-800' },
  1: { label: '进行中', color: 'bg-blue-100 text-blue-800' },
  2: { label: '成功', color: 'bg-green-100 text-green-800' },
  3: { label: '失败', color: 'bg-red-100 text-red-800' },
  4: { label: '已取消', color: 'bg-yellow-100 text-yellow-800' },
  5: { label: '已完成', color: 'bg-green-100 text-green-800' },
};

const statusVariantMap: Record<number, "gray" | "blue" | "green" | "red" | "yellow"> = {
  0: "gray",
  1: "blue",
  2: "green",
  3: "red",
  4: "yellow",
  5: "green",
};

export default function WorkflowListPage() {
  const [items, setItems] = useState<FlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/workflow/list?page=${page}&pageSize=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "获取工单列表失败");
      setItems(data.data.list);
      setTotal(data.data.total);
    } catch (e) {
      setItems([]);
      setTotal(0);
      setError(e instanceof Error ? e.message : "获取工单列表失败");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <AppShell
      title="工单"
      description="创建工单、查看流程节点与卡点检查。"
      actions={
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          创建工单
        </Button>
      }
    >
      <Card>
        <CardHeader
          title="工单列表"
          description={`共 ${total} 条`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <div className="px-2 text-sm text-gray-600">第 {page} 页</div>
              <Button
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < 10}
              >
                下一页
              </Button>
            </div>
          }
        />
        <CardBody className="p-0">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-600">加载中...</div>
          ) : error ? (
            <div className="py-10 text-center">
              <div className="text-sm font-medium text-gray-900">加载失败</div>
              <div className="mt-1 text-sm text-gray-600">{error}</div>
              <div className="mt-4 flex justify-center">
                <Button variant="primary" onClick={fetchList}>
                  重试
                </Button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-sm font-medium text-gray-900">暂无工单</div>
              <div className="mt-1 text-sm text-gray-600">你可以先创建一个工单开始流转。</div>
              <div className="mt-4 flex justify-center">
                <Button variant="primary" onClick={() => setShowCreate(true)}>
                  创建工单
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <tr>
                    <TH>名称</TH>
                    <TH>业务线</TH>
                    <TH>应用</TH>
                    <TH>状态</TH>
                    <TH>进度</TH>
                    <TH>创建人</TH>
                    <TH>创建时间</TH>
                  </tr>
                </THead>
                <TBody>
                  {items.map((item) => (
                    <TR key={item.id}>
                      <TD>
                        <Link href={`/workflow/${item.id}`} className="text-blue-600 hover:underline">
                          {item.name}
                        </Link>
                      </TD>
                      <TD className="text-gray-700">{item.businessLine}</TD>
                      <TD className="text-gray-700">{item.application}</TD>
                      <TD>
                        <Badge variant={statusVariantMap[item.status] ?? "gray"}>
                          {statusMap[item.status]?.label ?? "未知"}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 rounded-full bg-gray-100">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{item.progress}%</span>
                        </div>
                      </TD>
                      <TD className="text-gray-700">{item.creator}</TD>
                      <TD className="text-xs text-gray-600">
                        {new Date(item.createdAt).toLocaleString("zh-CN")}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            fetchList();
          }}
        />
      )}
    </AppShell>
  );
}

function CreateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const toast = useToast();
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ name: '', businessLine: '', application: '', pipelineId: '', creator: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/pipelines")
      .then((r) => r.json())
      .then((d) => {
        setPipelines(d.data);
        if (d.data.length > 0) setForm((f) => ({ ...f, pipelineId: d.data[0].id }));
      });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const nextFieldErrors: { [k: string]: string } = {};
    if (!form.name.trim()) nextFieldErrors.name = "请输入工单名称";
    if (!form.businessLine.trim()) nextFieldErrors.businessLine = "请输入业务线";
    if (!form.application.trim()) nextFieldErrors.application = "请输入应用";
    if (!form.creator.trim()) nextFieldErrors.creator = "请输入创建人";
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/workflow/create", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "创建工单失败");
      toast.push({ title: "创建成功", message: "工单已创建", tone: "success" });
      onSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "创建工单失败";
      setError(msg);
      toast.push({ title: "创建失败", message: msg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="创建工单"
        className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg focus:outline-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b px-5 py-4">
          <div className="text-sm font-semibold text-gray-900">创建工单</div>
          <div className="mt-1 text-sm text-gray-600">填写基础信息并选择 Pipeline。</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 px-5 py-4">
          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <input
            placeholder="工单名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {fieldErrors.name && <div className="text-xs text-red-600">{fieldErrors.name}</div>}
          <input
            placeholder="业务线"
            value={form.businessLine}
            onChange={(e) => setForm({ ...form, businessLine: e.target.value })}
            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {fieldErrors.businessLine && <div className="text-xs text-red-600">{fieldErrors.businessLine}</div>}
          <input
            placeholder="应用"
            value={form.application}
            onChange={(e) => setForm({ ...form, application: e.target.value })}
            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {fieldErrors.application && <div className="text-xs text-red-600">{fieldErrors.application}</div>}
          <select
            value={form.pipelineId}
            onChange={(e) => setForm({ ...form, pipelineId: e.target.value })}
            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            placeholder="创建人"
            value={form.creator}
            onChange={(e) => setForm({ ...form, creator: e.target.value })}
            className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {fieldErrors.creator && <div className="text-xs text-red-600">{fieldErrors.creator}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "创建中..." : "创建"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
