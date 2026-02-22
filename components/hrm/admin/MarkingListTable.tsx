"use client";

import { EmptyState } from "@/components/hrm/EmptyState";
import { MarkingDialog } from "@/components/hrm/admin/MarkingDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWeekWithNumber } from "@/lib/hrm/week-utils";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Lock,
  LockOpen,
  Pencil,
  PlusCircle,
  UserCog,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export type WeeklyData = {
  weekKey: string;
  weekStatus: string;
  submissionStatus: "submitted" | "pending";
  submissionId: string | null;
  totalScore: number | null;
  submittedAt: string | null;
};

export type MarkingSubject = {
  assignmentId: string;
  subjectUserId: string;
  subjectName: string;
  subjectEmail: string;
  subjectRole: string;
  hasActiveCriteriaSet: boolean;
  submissionStatus: "submitted" | "pending" | "partial";
  submissionId?: string | null;
  totalScore?: number | null;
  submittedAt?: string | null;
  weekly?: WeeklyData[];
};

type MarkingListTableProps = {
  subjects: MarkingSubject[];
  weekKey: string;
  isLocked: boolean;
  onRefresh?: () => void;
  isAllWeeksMode?: boolean;
};

export function MarkingListTable({
  subjects,
  weekKey,
  isLocked,
  onRefresh,
  isAllWeeksMode = false,
}: MarkingListTableProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogIsLocked, setDialogIsLocked] = useState(false);

  const handleMarkClick = (
    subjectUserId: string,
    specificWeekKey?: string,
    weekLocked?: boolean,
  ) => {
    setSelectedSubject(subjectUserId);
    setSelectedWeekKey(specificWeekKey || weekKey);
    setDialogIsLocked(weekLocked || isLocked || false);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    // Refresh the parent component's data
    onRefresh?.();
  };

  const renderWeekKeyColumn = (subject: MarkingSubject) => {
    if (!isAllWeeksMode || !subject.weekly) {
      // Single week mode - just show the weekKey
      return (
        <div className="text-sm font-mono">{formatWeekWithNumber(weekKey)}</div>
      );
    }

    // All weeks mode - show list of weeks
    return (
      <div className="space-y-1">
        {subject.weekly.map((week) => (
          <div
            key={week.weekKey}
            className="flex items-center gap-2 text-xs py-1"
          >
            <Badge variant="outline" className="font-mono">
              {formatWeekWithNumber(week.weekKey)}
            </Badge>
            <Badge
              variant={week.weekStatus === "LOCKED" ? "destructive" : "default"}
              className="text-xs px-1 py-0"
            >
              {week.weekStatus === "LOCKED" ? (
                <Lock className="h-2 w-2" />
              ) : (
                <LockOpen className="h-2 w-2" />
              )}
              {week.weekStatus}
            </Badge>
            <Badge
              variant={
                week.submissionStatus === "submitted" ? "default" : "outline"
              }
              className="text-xs px-1 py-0"
            >
              {week.submissionStatus === "submitted" ? (
                <CheckCircle className="h-2 w-2 mr-1" />
              ) : (
                <AlertCircle className="h-2 w-2 mr-1" />
              )}
              {week.submissionStatus}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  const renderStatusBadge = (subject: MarkingSubject) => {
    if (subject.submissionStatus === "submitted") {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Submitted
        </Badge>
      );
    } else if (subject.submissionStatus === "partial") {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Partial
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
  };

  const renderActions = (subject: MarkingSubject) => {
    if (!subject.hasActiveCriteriaSet) {
      return (
        <Button variant="ghost" size="sm" disabled>
          No Criteria
        </Button>
      );
    }

    if (!isAllWeeksMode || !subject.weekly) {
      // Single week mode
      return (
        <Button
          variant={
            subject.submissionStatus === "submitted" ? "outline" : "default"
          }
          size="sm"
          onClick={() =>
            handleMarkClick(subject.subjectUserId, undefined, isLocked)
          }
          className="gap-2"
        >
          {isLocked ? (
            <>
              <Eye className="h-4 w-4" />
              View
            </>
          ) : subject.submissionStatus === "submitted" ? (
            <>
              <Pencil className="h-4 w-4" />
              Edit
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4" />
              Mark Now
            </>
          )}
        </Button>
      );
    }

    // All weeks mode - show button for each week
    return (
      <div className="space-y-1 flex flex-col items-end">
        {subject.weekly.map((week) => {
          const weekLocked = week.weekStatus === "LOCKED";
          const submitted = week.submissionStatus === "submitted";

          return (
            <Button
              key={week.weekKey}
              variant={submitted ? "outline" : "default"}
              size="sm"
              className="text-xs"
              onClick={() =>
                handleMarkClick(subject.subjectUserId, week.weekKey, weekLocked)
              }
            >
              {weekLocked ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  View
                </>
              ) : submitted ? (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </>
              ) : (
                <>
                  <PlusCircle className="h-3.5 w-3.5" />
                  Mark
                </>
              )}
              <span>{formatWeekWithNumber(week.weekKey).split(" ")[0]}</span>
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Week Key</TableHead>
            <TableHead>Criteria Set</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-48">
                <EmptyState
                  icon={UserCog}
                  title="No assigned subjects"
                  description="You have no subjects assigned for marking. Contact a Super Admin if this is unexpected."
                />
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject) => (
              <TableRow key={subject.subjectUserId}>
                <TableCell>
                  <div>
                    <div className="font-medium">{subject.subjectName}</div>
                    <div className="text-sm text-muted-foreground">
                      {subject.subjectEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{subject.subjectRole}</Badge>
                </TableCell>
                <TableCell>{renderWeekKeyColumn(subject)}</TableCell>
                <TableCell>
                  {subject.hasActiveCriteriaSet ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Set
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{renderStatusBadge(subject)}</TableCell>
                <TableCell>
                  {subject.totalScore !== null &&
                  subject.totalScore !== undefined ? (
                    <span className="font-mono font-semibold">
                      {subject.totalScore.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {renderActions(subject)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Marking Dialog */}
      {selectedSubject && (
        <MarkingDialog
          open={dialogOpen}
          subjectUserId={selectedSubject}
          weekKey={selectedWeekKey}
          isLocked={dialogIsLocked}
          onOpenChange={setDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
