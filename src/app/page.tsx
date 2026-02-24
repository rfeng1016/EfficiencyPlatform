import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">北即星 - 研发效能平台</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/workflow" className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2">工单管理</h2>
          <p className="text-gray-500">创建、查看和流转工单</p>
        </Link>
        <div className="bg-white p-6 rounded shadow opacity-50">
          <h2 className="text-xl font-bold mb-2">效能度量</h2>
          <p className="text-gray-500">即将推出</p>
        </div>
      </div>
    </main>
  );
}
