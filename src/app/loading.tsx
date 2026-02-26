export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-6 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 space-y-3">
          <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
