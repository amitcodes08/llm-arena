export function LeaderboardSkeleton() {
  return (
    <div className="animate-enter mx-auto flex h-full w-full max-w-5xl flex-1 flex-col space-y-6 overflow-y-auto p-4 sm:p-6">
      {/* Header & View Switcher Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-44 rounded-lg" />
          <div className="skeleton h-4 w-64 rounded-md sm:w-80" />
        </div>

        {/* View Switcher Pill Skeleton */}
        <div className="bg-muted/60 border-border flex h-9 w-44 items-center self-start rounded-xl border p-1 sm:self-auto">
          <div className="skeleton h-full flex-1 rounded-lg" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Desktop Table Skeleton */}
        <div className="surface hidden overflow-hidden md:block">
          {/* Table Header */}
          <div className="text-eyebrow border-border bg-muted/30 grid grid-cols-[3rem_1fr_13rem_7rem_7rem] gap-4 border-b px-5 py-3">
            <div className="skeleton h-3.5 w-4 rounded" />
            <div className="skeleton h-3.5 w-16 rounded" />
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-3.5 w-18 rounded" />
            <div className="skeleton h-3.5 w-18 rounded" />
          </div>

          {/* Table Rows */}
          <div className="divide-border divide-y">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="grid grid-cols-[3rem_1fr_13rem_7rem_7rem] items-center gap-4 px-5 py-4.5"
              >
                {/* Rank */}
                <div className="skeleton h-4 w-4 rounded" />

                {/* Model info */}
                <div className="min-w-0 space-y-1.5 pr-2">
                  <div
                    className="skeleton h-4 rounded-md"
                    style={{
                      width: `${60 + (idx % 3) * 15}%`,
                      maxWidth: "180px",
                    }}
                  />
                  <div className="skeleton h-3 w-40 rounded-md opacity-60" />
                </div>

                {/* Win Record */}
                <div className="space-y-2">
                  <div className="skeleton h-4 w-24 rounded-md" />
                  <div className="skeleton h-1.5 w-full rounded-full" />
                </div>

                {/* TTFT */}
                <div className="skeleton h-3.5 w-14 rounded-md" />

                {/* Speed */}
                <div className="skeleton h-3.5 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="space-y-3 md:hidden">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="surface space-y-3 p-4">
              {/* Card Header */}
              <div className="border-border flex items-center gap-2.5 border-b pb-2.5">
                <div className="skeleton h-6 w-6 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="skeleton h-4 w-32 rounded-md" />
                  <div className="skeleton h-3 w-44 rounded-md opacity-60" />
                </div>
              </div>

              {/* Hero Win Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="skeleton h-3.5 w-24 rounded-md" />
                  <div className="skeleton h-3.5 w-16 rounded-md opacity-60" />
                </div>
                <div className="skeleton h-1.5 w-full rounded-full" />
              </div>

              {/* Bottom Metrics Strip */}
              <div className="bg-muted/50 border-border grid grid-cols-2 gap-2 rounded-lg border p-2">
                <div className="space-y-1">
                  <div className="skeleton h-2.5 w-12 rounded" />
                  <div className="skeleton h-3.5 w-16 rounded-md" />
                </div>
                <div className="space-y-1">
                  <div className="skeleton h-2.5 w-12 rounded" />
                  <div className="skeleton h-3.5 w-16 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
