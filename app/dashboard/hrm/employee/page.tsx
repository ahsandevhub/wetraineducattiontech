"use client";

import {
  DialogBreakdownLoadingSkeleton,
  KpiDashboardLoadingSkeleton,
} from "@/components/hrm/DashboardLoadingSkeletons";
import { EmptyState } from "@/components/hrm/EmptyState";
import { PerformanceTrendChart } from "@/components/hrm/PerformanceTrendChart";
import {
  CompletenessChip,
  MonthStatusChip,
} from "@/components/hrm/StatusChips";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  AlertCircle,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Coins,
  Eye,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type MonthlyResult = {
  id: string;
  monthKey: string;
  monthlyScore: number;
  tier: string;
  actionType: string;
  baseFine: number;
  finalFine: number;
  weeksCountUsed: number;
  expectedWeeksCount: number;
  isCompleteMonth: boolean;
  status: string;
};

type CriteriaScore = {
  criteriaId: string;
  criteriaName: string;
  score: number;
};

type WeeklySubmission = {
  id: string;
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

export default function EmployeeDashboard() {
  const [results, setResults] = useState<MonthlyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestResult, setLatestResult] = useState<MonthlyResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [weeklyDetails, setWeeklyDetails] = useState<WeeklyDetail[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [fundStats, setFundStats] = useState({
    fineCollected: 0,
    fineDue: 0,
    bonusPaid: 0,
    bonusDue: 0,
  });

  useEffect(() => {
    fetchMonthlyResults();
    fetchFundStats();
  }, []);

  const fetchMonthlyResults = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hrm/employee/monthly?limit=6");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setResults(data.results || []);
      if (data.results && data.results.length > 0) {
        setLatestResult(data.results[0]);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load results";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFundStats = async () => {
    try {
      const res = await fetch("/api/hrm/employee/fund-stats");
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
  };

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
    return <KpiDashboardLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My KPI Dashboard</h1>
        <p className="text-muted-foreground">
          View your monthly performance results
        </p>
      </div>

      {/* Fund Stats - Fines & Bonuses */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Latest Month Summary */}
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
                {latestResult.status === "LOCKED" ? "Finalized" : "In Progress"}
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
                <div className="text-2xl font-bold text-green-600">No Fine</div>
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

      {/* Historical Results */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance History</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={BarChart3}
                title="No historical data"
                description="Your monthly performance history will appear here once available."
              />
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Weeks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {formatMonthDisplay(result.monthKey)}
                      </TableCell>
                      <TableCell>{result.monthlyScore.toFixed(2)}</TableCell>
                      <TableCell>{getTierBadge(result.tier)}</TableCell>
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
        </CardContent>
      </Card>

      {/* Performance Trend */}
      {results.length > 0 && (
        <PerformanceTrendChart
          data={results.slice(0, 6).map((r) => ({
            monthKey: r.monthKey,
            monthlyScore: r.monthlyScore,
            tier: r.tier,
          }))}
        />
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
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
                              <div className="flex items-center justify-between">
                                <div className="text-xl font-bold">
                                  Submission{" "}
                                  {week.submissions.indexOf(submission) + 1}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
