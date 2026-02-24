'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

const gateStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待检查', color: 'text-gray-500' },
  running: { label: '检查中', color: 'text-blue-500' },
  passed: { label: '通过', color: 'text-green-500' },
  failed: { label: '未通过', color: 'text-red-500' },
};

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<FlowItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [flowing, setFlowing] = useState(false);
  const [error, setError] = useState('');

  const fetchDetail = async () => {
    const res = await fetch(`/api/workflow/${params.id}`);
    const data = await res.json();
    setItem(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchDetail(); }, [params.id]);

  const handleFlow = async () => {
    setFlowing(true);
    setError('');
    const res = await fetch('/api/workflow/flow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: params.id, action: 'next' }),
    });
    const data = await res.json();
    if (res.ok) {
      fetchDetail();
    } else {
      setError(data.message);
    }
    setFlowing(false);
  };

  const handleCheckGate = async (gateId: string) => {
    await fetch('/api/workflow/gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: params.id, gateId }),
    });
    fetchDetail();
  };

  if (loading) return <div className="p-6 text-center">加载中...</div>;
  if (!item) return <div className="p-6 text-center">工单不存在</div>;

  const currentWorker = item.workers.find((w) => w.status !== 2);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/workflow" className="text-blue-600 hover:underline">← 返回列表</Link>
      </div>

      <div className="bg-white rounded shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">业务线:</span> {item.businessLine}</div>
          <div><span className="text-gray-500">应用:</span> {item.application}</div>
          <div><span className="text-gray-500">创建人:</span> {item.creator}</div>
          <div><span className="text-gray-500">创建时间:</span> {new Date(item.createdAt).toLocaleString('zh-CN')}</div>
          <div><span className="text-gray-500">进度:</span> {item.progress}%</div>
          <div><span className="text-gray-500">状态:</span> {item.status === 5 ? '已完成' : '进行中'}</div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">流程节点</h2>
        <div className="flex items-center overflow-x-auto pb-4">
          {item.workers.map((worker, idx) => (
            <div key={worker.id} className="flex items-center">
              <div className="flex flex-col items-center min-w-[100px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${statusMap[worker.status]?.color}`}>
                  {worker.status === 2 ? '✓' : idx + 1}
                </div>
                <span className="text-xs mt-1 text-center">{worker.nodeName}</span>
              </div>
              {idx < item.workers.length - 1 && (
                <div className={`w-12 h-0.5 ${worker.status === 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentWorker && currentWorker.items.length > 0 && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">当前节点卡点 - {currentWorker.nodeName}</h2>
          <div className="space-y-2">
            {currentWorker.items.map((gate) => (
              <div key={gate.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="font-medium">{gate.gateName}</span>
                  <span className={`ml-2 text-sm ${gateStatusMap[gate.status]?.color}`}>
                    ({gateStatusMap[gate.status]?.label})
                  </span>
                </div>
                {gate.status === 'pending' && (
                  <button
                    onClick={() => handleCheckGate(gate.gateId)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    执行检查
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {item.status !== 5 && (
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-bold mb-4">操作</h2>
          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
          <button
            onClick={handleFlow}
            disabled={flowing}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {flowing ? '流转中...' : '流转到下一节点'}
          </button>
        </div>
      )}
    </div>
  );
}
