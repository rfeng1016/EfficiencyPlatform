'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  useEffect(() => {
    Promise.all([
      fetch('/api/metrics/overview').then((r) => r.json()),
      fetch('/api/metrics/workflow').then((r) => r.json()),
    ]).then(([o, s]) => {
      setOverview(o.data);
      setStats(s.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-center">加载中...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:underline">← 返回首页</Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">效能度量</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-3xl font-bold text-blue-600">{overview?.total}</div>
          <div className="text-gray-500">工单总数</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-3xl font-bold text-yellow-600">{overview?.inProgress}</div>
          <div className="text-gray-500">进行中</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-3xl font-bold text-green-600">{overview?.finished}</div>
          <div className="text-gray-500">已完成</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-3xl font-bold text-purple-600">{overview?.thisWeek}</div>
          <div className="text-gray-500">本周新建</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold mb-4">按状态分布</h2>
          {stats?.byStatus.map((s) => (
            <div key={s.status} className="flex justify-between py-2 border-b">
              <span>{s.status}</span>
              <span className="font-bold">{s.count}</span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold mb-4">按业务线分布</h2>
          {stats?.byBusinessLine.map((b) => (
            <div key={b.businessLine} className="flex justify-between py-2 border-b">
              <span>{b.businessLine}</span>
              <span className="font-bold">{b.count}</span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold mb-4">按应用分布</h2>
          {stats?.byApplication.map((a) => (
            <div key={a.application} className="flex justify-between py-2 border-b">
              <span>{a.application}</span>
              <span className="font-bold">{a.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
