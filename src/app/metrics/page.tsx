"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";
import Button from "@/components/ui/Button";

interface Overview {
  total: number;
  inProgress: number;
  finished: number;
  thisWeek: number;
}

interface WorkflowStats {
  byStatus: { status: string; count: number }[];
  byBusinessLine: { businessLine: string; count: number }[];
  byApplication: { application: string; count: number }[];
}

export default function MetricsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    Promise.all([
      fetch("/api/metrics/overview"),
      fetch("/api/metrics/workflow"),
    ])
      .then(async ([oRes, sRes]) => {
        const [oJson, sJson] = await Promise.all([
          oRes.json().catch(() => null),
          sRes.json().catch(() => null),
        ]);
        if (!oRes.ok) throw new Error(oJson?.message || "获取总览数据失败");
        if (!sRes.ok) throw new Error(sJson?.message || "获取分布数据失败");
        setOverview(oJson.data);
        setStats(sJson.data);
      })
      .catch((e) => {
        setOverview(null);
        setStats(null);
        setError(e instanceof Error ? e.message : "获取数据失败");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AppShell title="效能度量" description="从总览到分布，快速定位瓶颈。">
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-600">加载中...</div>
      ) : error ? (
        <div className="py-10 text-center">
          <div className="text-sm font-medium text-gray-900">加载失败</div>
          <div className="mt-1 text-sm text-gray-600">{error}</div>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" onClick={() => window.location.reload()}>
              刷新重试
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="工单总数" value={overview?.total ?? "-"} tone="blue" />
            <Stat label="进行中" value={overview?.inProgress ?? "-"} tone="yellow" />
            <Stat label="已完成" value={overview?.finished ?? "-"} tone="green" />
            <Stat label="本周新建" value={overview?.thisWeek ?? "-"} tone="purple" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader title="按状态分布" />
              <CardBody className="space-y-2">
                {stats?.byStatus?.length ? stats.byStatus.map((s) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className="text-gray-700">{s.status}</span>
                    <span className="font-semibold text-gray-900">{s.count}</span>
                  </div>
                )) : (
                  <div className="text-sm text-gray-600">暂无数据</div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="按业务线分布" />
              <CardBody className="space-y-2">
                {stats?.byBusinessLine?.length ? stats.byBusinessLine.map((b) => (
                  <div key={b.businessLine} className="flex items-center justify-between">
                    <span className="text-gray-700">{b.businessLine}</span>
                    <span className="font-semibold text-gray-900">{b.count}</span>
                  </div>
                )) : (
                  <div className="text-sm text-gray-600">暂无数据</div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="按应用分布" />
              <CardBody className="space-y-2">
                {stats?.byApplication?.length ? stats.byApplication.map((a) => (
                  <div key={a.application} className="flex items-center justify-between">
                    <span className="text-gray-700">{a.application}</span>
                    <span className="font-semibold text-gray-900">{a.count}</span>
                  </div>
                )) : (
                  <div className="text-sm text-gray-600">暂无数据</div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
