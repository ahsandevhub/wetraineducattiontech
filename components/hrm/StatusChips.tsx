/**
 * HRM Status Chip Components
 * Reusable status badges for Week, Month, and Completeness states
 */

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, Unlock, XCircle } from "lucide-react";

type WeekStatus = "OPEN" | "LOCKED";
type MonthStatus = "OPEN" | "LOCKED";

/**
 * Week Status Chip
 */
export function WeekStatusChip({ status }: { status: WeekStatus }) {
  if (status === "LOCKED") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Lock className="h-3 w-3" />
        Locked
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1 bg-green-600">
      <Unlock className="h-3 w-3" />
      Open
    </Badge>
  );
}

/**
 * Month Status Chip
 */
export function MonthStatusChip({ status }: { status: MonthStatus }) {
  if (status === "LOCKED") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Lock className="h-3 w-3" />
        Finalized
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1 bg-blue-600">
      <Unlock className="h-3 w-3" />
      In Progress
    </Badge>
  );
}

/**
 * Completeness Chip
 * Shows if monthly report has all expected weeks
 */
export function CompletenessChip({
  weeksUsed,
  expectedWeeks,
}: {
  weeksUsed: number;
  expectedWeeks: number;
}) {
  const isComplete = weeksUsed >= expectedWeeks;

  if (isComplete) {
    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Complete ({weeksUsed}/{expectedWeeks})
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" />
      Incomplete ({weeksUsed}/{expectedWeeks})
    </Badge>
  );
}

/**
 * Assignment Status Chip
 */
export function AssignmentStatusChip({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge variant="default" className="bg-green-600">
        Active
      </Badge>
    );
  }

  return <Badge variant="secondary">Inactive</Badge>;
}

/**
 * Criteria Set Status Chip
 */
export function CriteriaSetStatusChip({
  hasActiveSet,
}: {
  hasActiveSet: boolean;
}) {
  if (hasActiveSet) {
    return (
      <Badge variant="default" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Active Set
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <XCircle className="h-3 w-3" />
      No Set
    </Badge>
  );
}
