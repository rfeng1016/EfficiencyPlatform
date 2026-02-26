"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ToastProvider";

interface FlowWorker {
  id: string;
  nodeName: string;
  nodeType: string;
  order: number;
  status: number;
  items: { id: string; gateId: string; gateName: string; gateType: string; status: string }[];
}

interface FlowItem {
  id: string;
  name: string;
  businessLine: string;
  application: string;
  status: number;
  progress: number;
  creator: string;
  createdAt: string;
  workers: FlowWorker[];
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '等待中', color: 'bg-gray-400' },
  1: { label: '进行中', color: 'bg-blue-500' },
  2: { label: '已完成', color: 'bg-green-500' },
  3: { label: '失败', color: 'bg-red-500' },
};

const statusVariantMap: Record<number, "gray" | "blue" | "green" | "red"> = {
  0: "gray",
  1: "blue",
  2: "green",
  3: "red",
};

const gateStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待检查', color: 'text-gray-500' },
  running: { label: '检查中', color: 'text-blue-500' },
  passed: { label: '通过', color: 'text-green-500' },
  failed: { label: '未通过', color: 'text-red-500' },
};

const nodeNameMap: Record<string, string> = {
  Development: "开发",
  "Code Review": "代码评审",
  "Architecture Review": "架构评审",
  Admission: "准入",
  Testing: "测试",
  "Product Acceptance": "产品验收",
  "Business Acceptance": "业务验收",
  Integration: "集成",
  Release: "发布",
  Finish: "结束",
};

const displayNodeName = (name: string) => nodeNameMap[name] ?? name;

type NodeRenderItem = FlowWorker | { type: "ellipsis"; key: string };
const isEllipsis = (n: NodeRenderItem): n is { type: "ellipsis"; key: string } =>
  (n as { type?: string }).type === "ellipsis";

export default function WorkflowDetailPage() {
  const params = useParams();
  const toast = useToast();
  const [item, setItem] = useState<FlowItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [flowing, setFlowing] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState("");
  const [showAllNodes, setShowAllNodes] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/workflow/${params.id}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "获取工单详情失败");
      setItem(data.data);
    } catch (e) {
      setItem(null);
      setLoadError(e instanceof Error ? e.message : "获取工单详情失败");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleFlow = async () => {
    setFlowing(true);
    setError('');
    try {
      const res = await fetch("/api/workflow/flow", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: params.id, action: 'next' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "流转失败");
      toast.push({ title: "流转成功", message: "已流转到下一节点", tone: "success" });
      fetchDetail();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "流转失败";
      setError(msg);
      toast.push({ title: "流转失败", message: msg, tone: "error" });
    } finally {
      setFlowing(false);
    }
  };

  const handleCheckGate = async (gateId: string) => {
    try {
      const res = await fetch("/api/workflow/gate", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: params.id, gateId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "执行检查失败");
      toast.push({ title: "已提交检查", message: "卡点检查已开始执行", tone: "success" });
      fetchDetail();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "执行检查失败";
      toast.push({ title: "执行检查失败", message: msg, tone: "error" });
    }
  };


  const currentWorker = item?.workers.find((w) => w.status !== 2);
  const currentNodeName = currentWorker ? displayNodeName(currentWorker.nodeName) : "-";
  const currentIndex = item?.workers.findIndex((w) => w.status !== 2) ?? -1;

  const nodesToRender: NodeRenderItem[] = (() => {
    if (!item) return [];
    if (showAllNodes || item.workers.length <= 6) return item.workers;

    const lastIndex = item.workers.length - 1;
    const center = currentIndex >= 0 ? currentIndex : 0;
    const keep = new Set<number>([
      0,
      lastIndex,
      Math.max(0, center - 1),
      center,
      Math.min(lastIndex, center + 1),
    ]);

    const out: NodeRenderItem[] = [];
    let prevKept = -10;
    for (let i = 0; i <= lastIndex; i += 1) {
      if (!keep.has(i)) continue;
      if (out.length > 0 && i - prevKept > 1) {
        out.push({ type: "ellipsis", key: `e-${prevKept}-${i}` });
      }
      out.push(item.workers[i]);
      prevKept = i;
    }
    return out;
  })();

  return (
    <AppShell
      title={item ? item.name : "工单详情"}
      description="查看节点流转、卡点检查与当前状态。"
      actions={
        <Link href="/workflow">
          <Button size="sm">返回列表</Button>
        </Link>
      }
    >
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-600">加载中...</div>
      ) : loadError ? (
        <div className="py-10 text-center">
          <div className="text-sm font-medium text-gray-900">加载失败</div>
          <div className="mt-1 text-sm text-gray-600">{loadError}</div>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" onClick={fetchDetail}>
              重试
            </Button>
          </div>
        </div>
      ) : !item ? (
        <div className="py-10 text-center text-sm text-gray-600">工单不存在</div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="工单摘要"
              description={
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={item.status === 5 ? "green" : "blue"}>
                    {item.status === 5 ? "已完成" : "进行中"}
                  </Badge>
                  <span className="text-xs text-gray-600">进度 {item.progress}%</span>
                  {item.status !== 5 && (
                    <span className="text-xs text-gray-600">当前节点 {currentNodeName}</span>
                  )}
                </div>
              }
            />
            <CardBody>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="text-gray-700">
                  <span className="text-gray-500">业务线:</span> {item.businessLine}
                </div>
                <div className="text-gray-700">
                  <span className="text-gray-500">应用:</span> {item.application}
                </div>
                <div className="text-gray-700">
                  <span className="text-gray-500">创建人:</span> {item.creator}
                </div>
                <div className="text-gray-700">
                  <span className="text-gray-500">创建时间:</span>{" "}
                  {new Date(item.createdAt).toLocaleString("zh-CN")}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="流程节点"
              description="默认仅展示关键节点；可展开查看完整链路。"
              actions={
                item && item.workers.length > 6 ? (
                  <Button size="sm" onClick={() => setShowAllNodes((v) => !v)}>
                    {showAllNodes ? "收起" : "展开全部"}
                  </Button>
                ) : null
              }
            />
            <CardBody>
              <div className="flex flex-wrap items-center gap-3">
                {nodesToRender.map((n) => {
                  if (isEllipsis(n)) {
                    return (
                      <div
                        key={n.key}
                        className="flex h-8 items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-600"
                      >
                        …
                      </div>
                    );
                  }

                  const worker = n;
                  const order = worker.order;
                  const highlight = worker.status === 1;

                  return (
                    <div
                      key={worker.id}
                      className={
                        highlight
                          ? "rounded-lg border border-blue-200 bg-blue-50 px-3 py-2"
                          : "rounded-lg border border-gray-200 bg-white px-3 py-2"
                      }
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                          {worker.status === 2 ? "✓" : order}
                        </div>
                        <Badge variant={statusVariantMap[worker.status] ?? "gray"}>
                          {statusMap[worker.status]?.label ?? "未知"}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-gray-700">{displayNodeName(worker.nodeName)}</div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {currentWorker && (
            <Card>
              <CardHeader title={`当前节点卡点 - ${displayNodeName(currentWorker.nodeName)}`} />
              <CardBody className="space-y-2">
                {currentWorker.items.length > 0 ? (
                  currentWorker.items.map((gate) => (
                    <div
                      key={gate.id}
                      className="flex items-center justify-between gap-4 rounded-md border border-gray-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-gray-900">{gate.gateName}</div>
                        <div className={`text-xs ${gateStatusMap[gate.status]?.color}`}>
                          {gateStatusMap[gate.status]?.label}
                        </div>
                      </div>
                      {gate.status === "pending" && (
                        <Button size="sm" onClick={() => handleCheckGate(gate.gateId)}>
                          执行检查
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between gap-4 rounded-md border border-gray-100 px-3 py-3">
                    <div className="text-sm text-gray-700">本节点无卡点，可直接流转。</div>
                    {item.status !== 5 && (
                      <Button variant="primary" size="sm" onClick={handleFlow} disabled={flowing}>
                        {flowing ? "流转中..." : "直接流转"}
                      </Button>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {item.status !== 5 && currentWorker?.items.length !== 0 && (
            <Card>
              <CardHeader title="操作" description="完成当前节点卡点后，可流转到下一节点。" />
              <CardBody>
                {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
                <Button variant="primary" onClick={handleFlow} disabled={flowing}>
                  {flowing ? "流转中..." : "流转到下一节点"}
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
