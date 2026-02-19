"use client";

import { EmptyState } from "@/components/hrm/EmptyState";
import { CompletenessChip } from "@/components/hrm/StatusChips";
import { TableSkeleton } from "@/components/hrm/TableSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { formatMonthDisplay, getCurrentMonthKey } from "@/lib/hrm/week-utils";
import {
  AlertCircle,
  BarChart3,
  Download,
  Lock,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Unlock,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type MonthlyResult = {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectEmail: string;
  subjectRole: string;
  monthlyScore: number;
  tier: string;
  actionType: string;
  baseFine: number;
  finalFine: number;
  giftAmount: number | null;
  weeksCountUsed: number;
  expectedWeeksCount: number;
  isCompleteMonth: boolean;
};

export default function MonthlyReportPage() {
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());
  const [monthStatus, setMonthStatus] = useState("OPEN");
  const [results, setResults] = useState<MonthlyResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<MonthlyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [computing, setComputing] = useState(false);
  const [summary, setSummary] = useState({
    totalSubjects: 0,
    bonusTier: 0,
    appreciationTier: 0,
    improvementTier: 0,
    fineTier: 0,
    completeMonths: 0,
    totalFines: 0,
  });

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [completenessFilter, setCompletenessFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (monthKey) {
      fetchMonthlyReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  useEffect(() => {
    let filtered = [...results];

    if (roleFilter !== "all") {
      filtered = filtered.filter((r) => r.subjectRole === roleFilter);
    }

    if (tierFilter !== "all") {
      filtered = filtered.filter((r) => r.tier === tierFilter);
    }

    if (completenessFilter === "complete") {
      filtered = filtered.filter((r) => r.isCompleteMonth);
    } else if (completenessFilter === "incomplete") {
      filtered = filtered.filter((r) => !r.isCompleteMonth);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.subjectName.toLowerCase().includes(searchLower) ||
          r.subjectEmail.toLowerCase().includes(searchLower),
      );
    }

    setFilteredResults(filtered);
  }, [results, roleFilter, tierFilter, completenessFilter, search]);

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/hrm/super/monthly-report?monthKey=${monthKey}`,
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setResults([]);
          setSummary({
            totalSubjects: 0,
            bonusTier: 0,
            appreciationTier: 0,
            improvementTier: 0,
            fineTier: 0,
            completeMonths: 0,
            totalFines: 0,
          });
          toast.error("Month not found or not computed yet");
          return;
        }
        throw new Error(data.error);
      }

      setMonthStatus(data.status);
      setResults(data.results || []);
      setSummary(data.summary);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load report";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeMonth = async () => {
    setComputing(true);
    try {
      const res = await fetch(
        `/api/hrm/system/compute-month?monthKey=${monthKey}`,
        {
          method: "POST",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      fetchMonthlyReport();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to compute month";
      toast.error(message);
    } finally {
      setComputing(false);
    }
  };

  const handleLockMonth = async () => {
    try {
      const res = await fetch(
        `/api/hrm/system/lock-month?monthKey=${monthKey}`,
        {
          method: "POST",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      setMonthStatus("LOCKED");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to lock month";
      toast.error(message);
    }
  };

  const handleUnlockMonth = async () => {
    try {
      const res = await fetch(
        `/api/hrm/system/unlock-month?monthKey=${monthKey}`,
        {
          method: "POST",
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      setMonthStatus("OPEN");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to unlock month";
      toast.error(message);
    }
  };

  const handleExportCSV = () => {
    if (filteredResults.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Month",
      "User ID",
      "Name",
      "Email",
      "Role",
      "Monthly Score",
      "Tier",
      "Action Type",
      "Fine Amount",
      "Weeks Used",
      "Weeks Expected",
      "Complete Month",
    ];

    const rows = filteredResults.map((r) => [
      monthKey,
      r.subjectId,
      r.subjectName,
      r.subjectEmail,
      r.subjectRole,
      r.monthlyScore.toFixed(2),
      r.tier,
      r.actionType,
      r.finalFine,
      r.weeksCountUsed,
      r.expectedWeeksCount,
      r.isCompleteMonth ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-report-${monthKey}.csv`;
    a.click();

    toast.success("CSV exported successfully");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monthly Report</h1>
          <p className="text-muted-foreground">
            {formatMonthDisplay(monthKey)} • Status: {monthStatus}
          </p>
        </div>
        <div className="flex gap-2">
          {monthStatus === "LOCKED" ? (
            <Button onClick={handleUnlockMonth} variant="outline">
              <Unlock className="mr-2 h-4 w-4" />
              Unlock Month
            </Button>
          ) : (
            <Button onClick={handleLockMonth} variant="outline">
              <Lock className="mr-2 h-4 w-4" />
              Lock Month
            </Button>
          )}
        </div>
      </div>

      {/* Month Selector & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Month Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="month"
              value={monthKey}
              onChange={(e) => {
                const value = e.target.value; // YYYY-MM format
                setMonthKey(value);
              }}
              className="w-48"
            />
            <Button
              onClick={handleComputeMonth}
              disabled={computing || monthStatus === "LOCKED"}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${computing ? "animate-spin" : ""}`}
              />
              {computing ? "Computing..." : "Compute Month"}
            </Button>
            <Button
              onClick={fetchMonthlyReport}
              variant="outline"
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          {monthStatus === "LOCKED" && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertTitle>Month Locked</AlertTitle>
              <AlertDescription>
                This month is locked. Unlock it to recompute results.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {!loading && results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subjects
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSubjects}</div>
              <p className="text-xs text-muted-foreground">
                {summary.completeMonths} complete months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reward Zone</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.bonusTier + summary.appreciationTier}
              </div>
              <p className="text-xs text-muted-foreground">
                Bonus: {summary.bonusTier} | Appreciation:{" "}
                {summary.appreciationTier}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Improvement Zone
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.improvementTier}
              </div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{summary.totalFines}</div>
              <p className="text-xs text-muted-foreground">
                {summary.fineTier} subjects
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Results</CardTitle>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="BONUS">Bonus</SelectItem>
                <SelectItem value="APPRECIATION">Appreciation</SelectItem>
                <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                <SelectItem value="FINE">Fine</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={completenessFilter}
              onValueChange={setCompletenessFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <TableSkeleton columns={8} rows={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Fine</TableHead>
                  <TableHead>Weeks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48">
                      <EmptyState
                        icon={BarChart3}
                        title="No monthly results"
                        description="Compute the month to generate monthly results for all HRM users."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.subjectName}
                      </TableCell>
                      <TableCell>{result.subjectEmail}</TableCell>
                      <TableCell>{result.subjectRole}</TableCell>
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
