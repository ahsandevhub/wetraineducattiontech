import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Navigation Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-center">
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
