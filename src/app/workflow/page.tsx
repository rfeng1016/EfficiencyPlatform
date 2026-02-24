'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function WorkflowListPage() {
  const [items, setItems] = useState<FlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    const res = await fetch(`/api/workflow/list?page=${page}&pageSize=10`);
    const data = await res.json();
    setItems(data.data.list);
    setTotal(data.data.total);
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, [page]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">工单列表</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          创建工单
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">加载中...</div>
      ) : (
        <>
          <table className="w-full bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">名称</th>
                <th className="px-4 py-3 text-left">业务线</th>
                <th className="px-4 py-3 text-left">应用</th>
                <th className="px-4 py-3 text-left">状态</th>
                <th className="px-4 py-3 text-left">进度</th>
                <th className="px-4 py-3 text-left">创建人</th>
                <th className="px-4 py-3 text-left">创建时间</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/workflow/${item.id}`} className="text-blue-600 hover:underline">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.businessLine}</td>
                  <td className="px-4 py-3">{item.application}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${statusMap[item.status]?.color}`}>
                      {statusMap[item.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{item.progress}%</span>
                  </td>
                  <td className="px-4 py-3">{item.creator}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">共 {total} 条</span>
            <div className="space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-3 py-1">第 {page} 页</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < 10}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchList(); }} />}
    </div>
  );
}

function CreateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ name: '', businessLine: '', application: '', pipelineId: '', creator: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/pipelines').then((r) => r.json()).then((d) => {
      setPipelines(d.data);
      if (d.data.length > 0) setForm((f) => ({ ...f, pipelineId: d.data[0].id }));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/workflow/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) onSuccess();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">创建工单</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="工单名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            placeholder="业务线"
            value={form.businessLine}
            onChange={(e) => setForm({ ...form, businessLine: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            placeholder="应用"
            value={form.application}
            onChange={(e) => setForm({ ...form, application: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <select
            value={form.pipelineId}
            onChange={(e) => setForm({ ...form, pipelineId: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            placeholder="创建人"
            value={form.creator}
            onChange={(e) => setForm({ ...form, creator: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">取消</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
              {loading ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
