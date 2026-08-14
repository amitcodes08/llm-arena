export function ArenaSkeleton() {
  return (
    <div className="animate-enter flex h-full flex-1 flex-col overflow-hidden">
      {/* Header bar skeleton */}
      <div className="border-border bg-card/80 flex h-14 items-center justify-between border-b px-4 sm:px-6">
        <div className="skeleton h-5 w-36 rounded-md" />
        <div className="flex items-center gap-2">
          <div className="skeleton hidden h-7 w-20 rounded-full sm:block" />
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="skeleton h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Main turn area skeleton */}
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-6">
        {/* User prompt bubble */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-12 w-72 rounded-2xl sm:w-96" />
        </div>

        {/* 3 Model cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="surface flex flex-col justify-between space-y-6 p-5"
            >
              <div>
                <div className="border-border mb-4 flex items-center justify-between border-b pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton h-7 w-7 rounded-full" />
                    <div className="skeleton h-4 w-28 rounded-md" />
                  </div>
                  <div className="skeleton h-6 w-20 rounded-md" />
                </div>
                <div className="space-y-2.5">
                  <div className="skeleton h-3.5 w-full rounded" />
                  <div className="skeleton h-3.5 w-5/6 rounded" />
                  <div className="skeleton h-3.5 w-4/6 rounded" />
                  <div className="skeleton h-3.5 w-full rounded" />
                  <div className="skeleton h-3.5 w-3/4 rounded" />
                </div>
              </div>
              <div className="border-border flex items-center justify-between border-t pt-3.5">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-3 w-28 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt input skeleton */}
      <div className="border-border bg-card/80 border-t p-3 sm:p-4">
        <div className="mx-auto max-w-4xl space-y-2">
          <div className="flex gap-2">
            <div className="skeleton h-5 w-24 rounded-md" />
            <div className="skeleton h-5 w-24 rounded-md" />
            <div className="skeleton h-5 w-24 rounded-md" />
          </div>
          <div className="skeleton h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ThreadSkeleton() {
  return <ArenaSkeleton />;
}
