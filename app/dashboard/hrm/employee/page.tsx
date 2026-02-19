"use client";

import { EmptyState } from "@/components/hrm/EmptyState";
import {
  CompletenessChip,
  MonthStatusChip,
} from "@/components/hrm/StatusChips";
import { CardSkeleton } from "@/components/hrm/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function EmployeeDashboard() {
  const [results, setResults] = useState<MonthlyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestResult, setLatestResult] = useState<MonthlyResult | null>(null);

  useEffect(() => {
    fetchMonthlyResults();
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

  if (loading) {
    return <CardSkeleton rows={4} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My KPI Dashboard</h1>
        <p className="text-muted-foreground">
          View your monthly performance results
        </p>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
