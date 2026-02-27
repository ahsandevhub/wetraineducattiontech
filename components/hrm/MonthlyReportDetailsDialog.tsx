"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMonthDisplay } from "@/lib/hrm/week-utils";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CriteriaScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
}

interface Submission {
  id: string;
  markerName: string;
  markerEmail: string;
  totalScore: number;
  comment?: string;
  submittedAt: string;
  criteriaScores: CriteriaScore[];
}

interface WeeklyDetail {
  weekKey: string;
  fridayDate: string;
  weeklyScore: number;
  isComplete: boolean;
  computedAt?: string;
  submissions: Submission[];
}

interface MonthlyReportDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName: string;
  subjectEmail: string;
  monthKey: string;
  subjectUserId: string;
}

export function MonthlyReportDetailsDialog({
  open,
  onOpenChange,
  subjectName,
  subjectEmail,
  monthKey,
  subjectUserId,
}: MonthlyReportDetailsDialogProps) {
  const [weeklyDetails, setWeeklyDetails] = useState<WeeklyDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const fetchWeeklyDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/hrm/super/weekly-details?subjectUserId=${subjectUserId}&monthKey=${monthKey}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch weekly details");
      }

      setWeeklyDetails(data.weeklyDetails || []);
      // Auto-expand first week
      if (data.weeklyDetails && data.weeklyDetails.length > 0) {
        setExpandedWeeks(new Set([data.weeklyDetails[0].weekKey]));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load details";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [subjectUserId, monthKey]);

  useEffect(() => {
    if (open) {
      fetchWeeklyDetails();
    }
  }, [open, fetchWeeklyDetails]);

  const toggleWeekExpand = (weekKey: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekKey)) {
      newExpanded.delete(weekKey);
    } else {
      newExpanded.add(weekKey);
    }
    setExpandedWeeks(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle>Weekly Breakdown Details</DialogTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                <span className="font-medium">{subjectName}</span>
                <span className="text-xs ml-2">{subjectEmail}</span>
              </div>
              <div>
                Month:{" "}
                <span className="font-medium">
                  {formatMonthDisplay(monthKey)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(80vh-180px)] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : weeklyDetails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No weekly data available for this month
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyDetails.map((week) => (
                <div
                  key={week.weekKey}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Week Header */}
                  <button
                    onClick={() => toggleWeekExpand(week.weekKey)}
                    className="w-full bg-muted hover:bg-muted/80 transition p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-left">
                          Week ending: {formatDate(week.fridayDate)}
                        </div>
                        <div className="text-xs text-muted-foreground text-left">
                          {week.weekKey}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          {week.weeklyScore.toFixed(2)}
                        </div>
                        <Badge
                          variant={week.isComplete ? "default" : "outline"}
                          className="text-xs"
                        >
                          {week.isComplete ? "Complete" : "Incomplete"}
                        </Badge>
                      </div>
                      {expandedWeeks.has(week.weekKey) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {/* Week Details */}
                  {expandedWeeks.has(week.weekKey) && (
                    <div className="border-t p-3 space-y-3 bg-background">
                      {week.submissions.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No submissions for this week
                        </div>
                      ) : (
                        week.submissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="border rounded p-3 bg-muted/30 space-y-2"
                          >
                            {/* Marker Info */}
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-sm">
                                  {submission.markerName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {submission.markerEmail}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-primary">
                                  {submission.totalScore.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(submission.submittedAt)}
                                </div>
                              </div>
                            </div>

                            {/* Criteria Scores */}
                            {submission.criteriaScores.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs font-medium mb-2">
                                  Criteria Breakdown:
                                </div>
                                <Table className="text-xs border">
                                  <TableHeader className="bg-muted">
                                    <TableRow className="*:border-x">
                                      <TableHead className="text-xs font-medium">
                                        Criteria
                                      </TableHead>
                                      <TableHead className="text-xs font-medium text-right">
                                        Score
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {submission.criteriaScores.map(
                                      (criteria) => (
                                        <TableRow
                                          className="*:border-x"
                                          key={criteria.criteriaId}
                                        >
                                          <TableCell className="text-xs">
                                            {criteria.criteriaName}
                                          </TableCell>
                                          <TableCell className="text-xs text-right font-medium">
                                            {criteria.score.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      ),
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            )}

                            {/* Comment */}
                            {submission.comment && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs font-medium mb-1">
                                  Comment:
                                </div>
                                <div className="text-xs text-muted-foreground italic">
                                  {submission.comment}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
