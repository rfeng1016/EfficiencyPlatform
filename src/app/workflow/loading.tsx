export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="px-5 py-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
