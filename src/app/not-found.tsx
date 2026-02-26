import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-6 shadow-sm">
        <div className="text-sm font-semibold text-gray-900">页面不存在</div>
        <div className="mt-2 text-sm text-gray-600">你访问的地址不存在或已被移动。</div>
        <div className="mt-4">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
