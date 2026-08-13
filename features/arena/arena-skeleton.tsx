export function ArenaSkeleton() {
  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="flex justify-end">
        <div className="skeleton h-12 w-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function ThreadSkeleton() {
  return <ArenaSkeleton />;
}
