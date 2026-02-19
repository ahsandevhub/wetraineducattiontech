"use client";

import { DataTableToolbar } from "@/components/hrm/DataTableToolbar";
import { TableSkeleton } from "@/components/hrm/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  formatWeekWithNumber,
  getCurrentMonthKey,
  getMonthKeyFromWeekKey,
  getMonthOptions,
} from "@/lib/hrm/week-utils";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type Submission = {
  id: string;
  weekKey: string;
  weekFridayDate: string;
  weekStatus: "OPEN" | "LOCKED";
  markerAdmin: {
    id: string;
    fullName: string;
    email: string;
  };
  subject: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  totalScore: number;
  comment: string | null;
  submittedAt: string;
  items: Array<{
    id: string;
    criteriaId: string;
    criteriaKey: string;
    criteriaName: string;
    scoreRaw: number;
  }>;
};

type HrmUser = {
  id: string;
  full_name: string;
  email: string;
  hrm_role: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<
    Array<{ week_key: string; friday_date: string }>
  >([]);
  const [filteredWeeks, setFilteredWeeks] = useState<
    Array<{ week_key: string; friday_date: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] =
    useState<string>(getCurrentMonthKey());
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const monthOptions = getMonthOptions(12);
  const [search, setSearch] = useState("");

  // User lists for filter dropdowns
  const [admins, setAdmins] = useState<HrmUser[]>([]);
  const [employees, setEmployees] = useState<HrmUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  useEffect(() => {
    fetchAdminsAndEmployees();
    fetchAvailableWeeks();
  }, []);

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedWeek, selectedAdmin, selectedSubject, search]);

  // Filter weeks by selected month
  useEffect(() => {
    if (!availableWeeks.length) {
      setFilteredWeeks([]);
      return;
    }

    const filtered = availableWeeks.filter((week) => {
      const weekMonth = getMonthKeyFromWeekKey(week.week_key);
      return weekMonth === selectedMonth;
    });
    setFilteredWeeks(filtered);

    // If selected week is not in the filtered list, reset to "all"
    if (selectedWeek !== "all") {
      const weekExists = filtered.some((w) => w.week_key === selectedWeek);
      if (!weekExists) {
        setSelectedWeek("all");
      }
    }
  }, [availableWeeks, selectedMonth, selectedWeek]);

  const fetchAvailableWeeks = async () => {
    try {
      const response = await fetch("/api/hrm/super/weeks");
      const result = await response.json();
      if (response.ok) {
        setAvailableWeeks(
          result.weeks?.map((w: any) => ({
            week_key: w.week_key,
            friday_date: w.friday_date,
          })) || [],
        );
      }
    } catch (error) {
      console.error("Error fetching weeks:", error);
    }
  };

  const fetchAdminsAndEmployees = async () => {
    try {
      // Fetch admins
      const adminsResponse = await fetch(
        "/api/hrm/super/people?role=ADMIN&active=true",
      );
      const adminsResult = await adminsResponse.json();
      if (adminsResponse.ok) {
        setAdmins(adminsResult.users || []);
      }

      // Fetch employees
      const employeesResponse = await fetch(
        "/api/hrm/super/people?role=EMPLOYEE&active=true",
      );
      const employeesResult = await employeesResponse.json();
      if (employeesResponse.ok) {
        setEmployees(employeesResult.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.set("monthKey", selectedMonth);
      if (selectedWeek !== "all") params.set("weekKey", selectedWeek);
      if (selectedAdmin !== "all") params.set("markerAdminId", selectedAdmin);
      if (selectedSubject !== "all")
        params.set("subjectUserId", selectedSubject);
      if (search) params.set("search", search);

      const response = await fetch(`/api/hrm/super/submissions?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch submissions");
      }

      setSubmissions(result.submissions || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch submissions";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setDetailDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Dhaka",
    });
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleWeekChange = (week: string) => {
    setSelectedWeek(week);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KPI Submissions</h1>
          <p className="text-muted-foreground">
            View all KPI marking submissions across the organization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Submitted Marks - {submissions.length} shown
            {selectedWeek !== "all" && (
              <span className="text-muted-foreground font-normal text-base ml-2">
                • {formatWeekWithNumber(selectedWeek)}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <DataTableToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by admin or subject name..."
          >
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedWeek} onValueChange={handleWeekChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Weeks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {filteredWeeks.map((week) => (
                  <SelectItem key={week.week_key} value={week.week_key}>
                    {formatWeekWithNumber(week.week_key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Admins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Admins</SelectItem>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DataTableToolbar>

          {/* Table */}
          {loading ? (
            <TableSkeleton columns={7} rows={10} />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Marked By (Admin)</TableHead>
                    <TableHead>Subject (Employee)</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Week Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No submissions found for the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-mono font-medium">
                          {formatWeekWithNumber(submission.weekKey)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {submission.markerAdmin.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {submission.markerAdmin.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {submission.subject.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {submission.subject.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-lg font-semibold">
                            {submission.totalScore.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {submission.weekStatus === "OPEN" ? (
                            <Badge variant="default">Open</Badge>
                          ) : (
                            <Badge variant="secondary">Locked</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(submission.submittedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(submission)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Detailed breakdown of the KPI submission
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Week
                  </div>
                  <div className="font-mono">
                    {formatWeekWithNumber(selectedSubmission.weekKey)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Score
                  </div>
                  <div className="font-mono text-2xl font-bold">
                    {selectedSubmission.totalScore.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Marked By
                  </div>
                  <div>{selectedSubmission.markerAdmin.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedSubmission.markerAdmin.email}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Subject
                  </div>
                  <div>{selectedSubmission.subject.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedSubmission.subject.email}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Submitted At
                  </div>
                  <div>{formatDate(selectedSubmission.submittedAt)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Week Status
                  </div>
                  <div>
                    {selectedSubmission.weekStatus === "OPEN" ? (
                      <Badge variant="default">Open</Badge>
                    ) : (
                      <Badge variant="secondary">Locked</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment */}
              {selectedSubmission.comment && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Comment
                  </div>
                  <div className="rounded-md border p-3 text-sm">
                    {selectedSubmission.comment}
                  </div>
                </div>
              )}

              {/* Criteria Breakdown */}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-3">
                  Criteria Breakdown
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Criteria</TableHead>
                        <TableHead className="text-right">Raw Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSubmission.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">
                              {item.criteriaName}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {item.criteriaKey}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {item.scoreRaw.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
