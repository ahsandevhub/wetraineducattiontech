import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for Profile Page
 * Mirrors: Header + Avatar section + Form fields (8 inputs) + Action buttons
 */
export function ProfilePageLoadingSkeleton() {
  return (
    <div className="container max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Form Fields - Email */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-40" />
          </div>

          {/* Form Fields - Full Name */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Form Fields - Phone */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Form Fields - Address */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Form Fields - City, State, Postal (Grid) */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Form Fields - Country */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-36" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Loading skeleton for Criteria Set Detail Page (HRM Super Admin)
 * Mirrors: Back button + Header + Subject info + CriteriaSetBuilder table + Action buttons
 */
export function CriteriaSetDetailLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Criteria Set Builder Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-full col-span-5" />
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-4 w-full col-span-3" />
              <Skeleton className="h-4 w-full col-span-2" />
            </div>
            {/* Table Rows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 py-2">
                <Skeleton className="h-10 w-full col-span-5" />
                <Skeleton className="h-10 w-full col-span-2" />
                <Skeleton className="h-10 w-full col-span-3" />
                <Skeleton className="h-10 w-full col-span-2" />
              </div>
            ))}
            {/* Add Criteria Button */}
            <Skeleton className="h-10 w-40" />
            {/* Total Weight */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-44" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for Marking Form Page (HRM Admin)
 * Mirrors: Back button + Header + Subject info card + Marking form card
 */
export function MarkingFormPageLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Subject Info Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex items-center gap-5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center gap-5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex items-center gap-5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marking Form Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Criteria Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 pb-4 border-b last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-12" />
                ))}
              </div>
            </div>
          ))}

          {/* Total Score */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-7 w-20" />
          </div>

          {/* Comment Field */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Loading skeleton for Notification Card
 * Mirrors: Icon + Title/Badge + Date + Message + Action button
 */
export function NotificationCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-blue-500 bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <Skeleton className="h-8 w-8 rounded" />
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-7 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
