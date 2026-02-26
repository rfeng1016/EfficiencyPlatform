export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-6 shadow-sm">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div className="h-8 w-16 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
