import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // This page redirects immediately, so just show a minimal loader
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  );
}
