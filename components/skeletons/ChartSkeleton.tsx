import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  height?: string;
  showHeader?: boolean;
  title?: boolean;
}

export function ChartSkeleton({
  height = "h-64",
  showHeader = true,
  title = true,
}: ChartSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          {title && <Skeleton className="h-6 w-40" />}
          <Skeleton className="h-3 w-56 mt-2" />
        </CardHeader>
      )}
      <CardContent>
        <Skeleton className={`w-full ${height}`} />
      </CardContent>
    </Card>
  );
}
