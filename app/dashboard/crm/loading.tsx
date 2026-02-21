import { ChartSkeleton } from "@/components/skeletons/ChartSkeleton";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Path 1: ADMIN - 4 Stat Cards */}
      {/* OR Path 2: MARKETER - 6 KPI Cards */}
      {/* Show generic layout that covers both */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Path 1: ADMIN - Trends Chart (full width) */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <ChartSkeleton height="h-80" title={false} />
      </div>

      {/* Path 1: ADMIN - Performance & Sources (side by side) */}
      {/* OR Path 2: MARKETER - Area Chart & Pie Chart (side by side) */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton height="h-80" title={true} />
        <ChartSkeleton height="h-80" title={true} />
      </div>

      {/* Path 1: ADMIN - Sources Chart OR Path 2: MARKETER fallback */}
      <div className="space-y-4">
        <ChartSkeleton height="h-64" title={true} />
      </div>
    </div>
  );
}
