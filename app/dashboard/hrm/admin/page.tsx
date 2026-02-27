"use client";

import { AdminDashboardLoadingSkeleton } from "@/components/hrm/DashboardLoadingSkeletons";
import { WeekStatusChip } from "@/components/hrm/StatusChips";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatWeekDisplay,
  getCurrentMonthKey,
  getMonthKeyFromWeekKey,
  getMonthOptions,
} from "@/lib/hrm/week-utils";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type WeekInfo = {
  weekKey: string;
  fridayDate: string;
  status: string;
  isLocked: boolean;
};

type Summary = {
  expected: number;
  submitted: number;
  pending: number;
};

export default function AdminDashboardPage() {
  const [weekInfo, setWeekInfo] = useState<WeekInfo | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriday, setIsFriday] = useState(false);
  const [selectedMonth, setSelectedMonth] =
    useState<string>(getCurrentMonthKey());
  const monthOptions = getMonthOptions(12);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Get current week first to determine which week to fetch for selected month
      const weekRes = await fetch("/api/hrm/admin/week/current");
      const weekData = await weekRes.json();

      if (!weekRes.ok) throw new Error(weekData.error);

      // Check if current week is in selected month
      const currentWeekMonth = getMonthKeyFromWeekKey(weekData.weekKey);
      const isCurrentMonth = currentWeekMonth === selectedMonth;

      // If selected month is current month, use current week; otherwise use first week of month
      let targetWeekKey = weekData.weekKey;
      if (!isCurrentMonth) {
        // Fetch weeks for the selected month
        const weeksRes = await fetch("/api/hrm/admin/weeks");
        const weeksData = await weeksRes.json();
        if (weeksRes.ok && weeksData.weeks) {
          const monthWeeks = weeksData.weeks.filter(
            (w: any) => getMonthKeyFromWeekKey(w.week_key) === selectedMonth,
          );
          if (monthWeeks.length > 0) {
            // Use the latest week in the selected month
            targetWeekKey = monthWeeks[monthWeeks.length - 1].week_key;
          }
        }
      }

      setWeekInfo({
        weekKey: targetWeekKey,
        fridayDate: targetWeekKey,
        status: weekData.status,
        isLocked: weekData.isLocked,
      });

      // Get marking list to compute summary
      const listRes = await fetch(
        `/api/hrm/admin/marking-list?weekKey=${targetWeekKey}`,
      );
      const listData = await listRes.json();

      if (!listRes.ok) throw new Error(listData.error);

      const subjects = listData.subjects || [];
      const submitted = subjects.filter(
        (s: any) => s.submissionStatus === "submitted",
      ).length;
      const expected = subjects.length;

      setSummary({
        expected,
        submitted,
        pending: expected - submitted,
      });

      // Check if today is Friday
      const now = new Date();
      const day = now.getDay();
      setIsFriday(day === 5);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <AdminDashboardLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Weekly KPI marking and submission tracking
        </p>
      </div>

      {/* Warning if Friday and pending */}
      {isFriday && summary && summary.pending > 0 && !weekInfo?.isLocked && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required - Today is Friday!</AlertTitle>
          <AlertDescription>
            You have {summary.pending} pending submission(s). Please complete
            your marking before the end of the day.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Week Info */}
      {weekInfo && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Week Information
            </CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-lg font-semibold">
              {formatWeekDisplay(weekInfo.weekKey)}
            </div>
            <div className="flex items-center gap-2">
              <WeekStatusChip status={weekInfo.isLocked ? "LOCKED" : "OPEN"} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Assigned
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.expected}</div>
              <p className="text-xs text-muted-foreground">
                Subjects to mark this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.submitted}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {summary.pending}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting your marks
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <Link
          href={
            summary && summary.pending > 0
              ? "/dashboard/hrm/admin/marking?status=pending"
              : "/dashboard/hrm/admin/marking"
          }
        >
          <Button size="lg">
            {summary && summary.pending > 0
              ? `Complete ${summary.pending} Pending Mark(s)`
              : "View Marking List"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
