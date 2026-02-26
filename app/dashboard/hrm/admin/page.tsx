"use client";

import {
  AdminDashboardLoadingSkeleton,
  DialogBreakdownLoadingSkeleton,
} from "@/components/hrm/DashboardLoadingSkeletons";
import { EmptyState } from "@/components/hrm/EmptyState";
import { PerformanceTrendChart } from "@/components/hrm/PerformanceTrendChart";
import {
  CompletenessChip,
  MonthStatusChip,
  WeekStatusChip,
} from "@/components/hrm/StatusChips";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatMonthDisplay,
  formatWeekDisplay,
  getCurrentMonthKey,
  getMonthKeyFromWeekKey,
  getMonthOptions,
} from "@/lib/hrm/week-utils";
import {
  AlertCircle,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Eye,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
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

type MonthlyResult = {
  id: string;
  monthKey: string;
  monthlyScore: number;
  tier: string;
  actionType: string;
  baseFine: number;
  finalFine: number;
  giftAmount: number | null;
  weeksCountUsed: number;
  expectedWeeksCount: number;
  isCompleteMonth: boolean;
  status: string;
};

type FundStats = {
  fineCollected: number;
  fineDue: number;
  bonusPaid: number;
  bonusDue: number;
};

type CriteriaScore = {
  criteriaId: string;
  criteriaName: string;
  score: number;
};

type WeeklySubmission = {
  id: string;
  markerName: string;
  markerEmail: string;
  totalScore: number;
  comment?: string;
  submittedAt: string;
  criteriaScores: CriteriaScore[];
};

type WeeklyDetail = {
  weekKey: string;
  fridayDate: string;
  weeklyScore: number;
  isComplete: boolean;
  computedAt?: string;
  submissions: WeeklySubmission[];
};

export default function AdminDashboardPage() {
  const [weekInfo, setWeekInfo] = useState<WeekInfo | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriday, setIsFriday] = useState(false);
  const [selectedMonth, setSelectedMonth] =
    useState<string>(getCurrentMonthKey());
  const [myResults, setMyResults] = useState<MonthlyResult[]>([]);
  const [latestResult, setLatestResult] = useState<MonthlyResult | null>(null);
  const [fundStats, setFundStats] = useState<FundStats>({
    fineCollected: 0,
    fineDue: 0,
    bonusPaid: 0,
    bonusDue: 0,
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [weeklyDetails, setWeeklyDetails] = useState<WeeklyDetail[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
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

  const fetchFundStats = useCallback(async () => {
    try {
      const res = await fetch("/api/hrm/admin/fund-stats");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setFundStats({
        fineCollected: data.fineCollected || 0,
        fineDue: data.fineDue || 0,
        bonusPaid: data.bonusPaid || 0,
        bonusDue: data.bonusDue || 0,
      });
    } catch (error) {
      console.error("Failed to load fund stats:", error);
    }
  }, []);

  const fetchMyResults = useCallback(async () => {
    try {
      const res = await fetch("/api/hrm/employee/monthly?limit=6");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setMyResults(data.results || []);
      if (data.results && data.results.length > 0) {
        setLatestResult(data.results[0]);
      }
    } catch (error) {
      console.error("Failed to load my results:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchMyResults();
    fetchFundStats();
  }, [fetchData, fetchMyResults, fetchFundStats]);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "BONUS":
        return <Badge className="bg-purple-500">Bonus</Badge>;
      case "APPRECIATION":
        return <Badge className="bg-green-500">Appreciation</Badge>;
      case "IMPROVEMENT":
        return <Badge className="bg-yellow-500">Improvement</Badge>;
      case "FINE":
        return <Badge variant="destructive">Fine</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "BONUS":
      case "APPRECIATION":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "IMPROVEMENT":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "FINE":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const fetchMonthlyBreakdown = async (monthKey: string) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(
        `/api/hrm/employee/weekly-details?monthKey=${monthKey}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch marks breakdown");
      }

      const details = data.weeklyDetails || [];
      setWeeklyDetails(details);

      if (details.length > 0) {
        setExpandedWeeks(new Set([details[0].weekKey]));
      } else {
        setExpandedWeeks(new Set());
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load breakdown";
      toast.error(message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewBreakdown = (monthKey: string) => {
    setSelectedMonthKey(monthKey);
    setDetailsOpen(true);
    fetchMonthlyBreakdown(monthKey);
  };

  const toggleWeekExpand = (weekKey: string) => {
    const next = new Set(expandedWeeks);
    if (next.has(weekKey)) {
      next.delete(weekKey);
    } else {
      next.add(weekKey);
    }
    setExpandedWeeks(next);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

      {/* My KPI Dashboard - As Admin is also a Subject */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My KPI Dashboard</h2>
        <p className="text-sm text-muted-foreground mb-4">
          View your monthly performance results (as you are also marked by
          higher admins)
        </p>

        {/* Latest Performance Summary */}
        {latestResult ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Latest Month
                </CardTitle>
                {getTierIcon(latestResult.tier)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMonthDisplay(latestResult.monthKey)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestResult.status === "LOCKED"
                    ? "Finalized"
                    : "In Progress"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Score
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestResult.monthlyScore.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tier</CardTitle>
                {getTierIcon(latestResult.tier)}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getTierBadge(latestResult.tier)}
                  <span className="text-sm text-muted-foreground">
                    {latestResult.actionType}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {latestResult.finalFine > 0 ? "Fine Amount" : "Status"}
                </CardTitle>
                {latestResult.finalFine > 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
              </CardHeader>
              <CardContent>
                {latestResult.finalFine > 0 ? (
                  <div className="text-2xl font-bold text-red-600">
                    ৳{latestResult.finalFine}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    No Fine
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Weeks: {latestResult.weeksCountUsed}/
                  {latestResult.expectedWeeksCount}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={BarChart3}
                title="No results yet"
                description="Your monthly results will appear here once the Super Admin computes them."
              />
            </CardContent>
          </Card>
        )}

        {/* Bonus & Fine Stats */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fine Collected
              </CardTitle>
              <Coins className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ৳{fundStats.fineCollected}
              </div>
              <p className="text-xs text-muted-foreground">
                Total collected fines
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fine Due</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ৳{fundStats.fineDue}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending fine collection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bonus Paid</CardTitle>
              <Coins className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ৳{fundStats.bonusPaid}
              </div>
              <p className="text-xs text-muted-foreground">
                Total bonus received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bonus Due</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ৳{fundStats.bonusDue}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending bonus payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Results Table */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Monthly Performance History
          </h3>
          {myResults.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <EmptyState
                  icon={BarChart3}
                  title="No historical data"
                  description="Your monthly performance history will appear here once available."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Weeks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {formatMonthDisplay(result.monthKey)}
                      </TableCell>
                      <TableCell>{result.monthlyScore.toFixed(2)}</TableCell>
                      <TableCell>{getTierBadge(result.tier)}</TableCell>
                      <TableCell>{result.actionType}</TableCell>
                      <TableCell>
                        {result.finalFine > 0 ? (
                          <span className="text-red-600 font-semibold">
                            ৳{result.finalFine}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <CompletenessChip
                          weeksUsed={result.weeksCountUsed}
                          expectedWeeks={result.expectedWeeksCount}
                        />
                      </TableCell>
                      <TableCell>
                        <MonthStatusChip
                          status={result.status as "OPEN" | "LOCKED"}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => handleViewBreakdown(result.monthKey)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent"
                          aria-label="View marks breakdown"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Performance Trend */}
      {myResults.length > 0 && (
        <div className="mt-6">
          <PerformanceTrendChart
            data={myResults.slice(0, 6).map((r) => ({
              monthKey: r.monthKey,
              monthlyScore: r.monthlyScore,
              tier: r.tier,
            }))}
          />
        </div>
      )}

      {/* Marks Breakdown Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Marks Breakdown • {formatMonthDisplay(selectedMonthKey || "")}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-2">
            {detailsLoading ? (
              <DialogBreakdownLoadingSkeleton />
            ) : weeklyDetails.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No marks breakdown available for this month.
              </div>
            ) : (
              <div className="space-y-4">
                {weeklyDetails.map((week) => (
                  <div
                    key={week.weekKey}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleWeekExpand(week.weekKey)}
                      className="w-full p-3 bg-muted hover:bg-muted/80 transition flex items-center justify-between"
                    >
                      <div className="text-left">
                        <div className="font-medium">
                          Week ending: {formatDate(week.fridayDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {week.weekKey}
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
                                  <div className="font-bold text-lg text-primary">
                                    {submission.totalScore.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(submission.submittedAt)}
                                  </div>
                                </div>
                              </div>
                              {submission.criteriaScores.length > 0 && (
                                <div className="text-sm space-y-1 border-t pt-2">
                                  {submission.criteriaScores.map((score) => (
                                    <div
                                      key={score.criteriaId}
                                      className="flex justify-between"
                                    >
                                      <span className="text-muted-foreground">
                                        {score.criteriaName}
                                      </span>
                                      <span className="font-medium">
                                        {score.score.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {submission.comment && (
                                <div className="text-sm border-t pt-2">
                                  <div className="text-muted-foreground">
                                    Comment:
                                  </div>
                                  <div className="text-xs mt-1">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
