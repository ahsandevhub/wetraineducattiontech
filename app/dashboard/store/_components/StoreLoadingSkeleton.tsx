import { Skeleton } from "@/components/ui/skeleton";

type StoreLoadingSkeletonProps = {
  showAction?: boolean;
  statsCount?: number;
};

export function StoreLoadingSkeleton({
  showAction = true,
  statsCount = 3,
}: StoreLoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        {showAction ? <Skeleton className="h-10 w-40" /> : null}
      </div>

      <div
        className={`grid gap-4 ${
          statsCount >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3"
        }`}
      >
        {Array.from({ length: statsCount }).map((_, index) => (
          <div key={index} className="rounded-xl border p-6 shadow-sm">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex flex-col gap-3 md:flex-row">
            <Skeleton className="h-10 w-full md:w-44" />
            <Skeleton className="h-10 w-full md:w-56" />
            <Skeleton className="h-10 w-full md:w-72" />
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52" />
              </div>
              <div className="space-y-2 md:text-right">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
