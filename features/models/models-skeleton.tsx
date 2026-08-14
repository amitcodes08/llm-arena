export function ModelsSkeleton() {
  return (
    <div className="animate-enter mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-44 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded-md sm:w-96" />
        </div>
        <div className="skeleton h-8 w-28 self-start rounded-lg sm:self-auto" />
      </div>

      {/* Grid of Model Card Skeletons */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="surface space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="skeleton h-9 w-9 shrink-0 rounded-xl" />
                <div className="min-w-0 space-y-1.5">
                  <div className="skeleton h-4 w-36 rounded-md" />
                  <div className="skeleton h-3 w-48 rounded-md opacity-60" />
                </div>
              </div>
              <div className="skeleton h-5 w-20 shrink-0 rounded-full" />
            </div>

            {/* Context Window Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
              <div className="skeleton h-1 w-full rounded-full" />
            </div>

            {/* Pricing footer */}
            <div className="border-border flex justify-between border-t pt-2">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
