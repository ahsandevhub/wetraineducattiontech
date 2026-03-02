"use client";

import { EmptyState } from "@/components/hrm/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type PendingSubmission = {
  weekKey: string;
  fridayDate: string;
  markerAdminId: string;
  markerName: string;
  markerEmail: string;
  subjectUserId: string;
  subjectName: string;
  subjectEmail: string;
  daysOverdue: number;
};

type FilterState = {
  monthKey: string;
  weekKey: string;
  markerAdminId: string;
  subjectUserId: string;
};

const MONTHS = [
  { value: "2023-01", label: "January 2023" },
  { value: "2023-02", label: "February 2023" },
  { value: "2023-03", label: "March 2023" },
  { value: "2023-04", label: "April 2023" },
  { value: "2023-05", label: "May 2023" },
  { value: "2023-06", label: "June 2023" },
  { value: "2023-07", label: "July 2023" },
  { value: "2023-08", label: "August 2023" },
  { value: "2023-09", label: "September 2023" },
  { value: "2023-10", label: "October 2023" },
  { value: "2023-11", label: "November 2023" },
  { value: "2023-12", label: "December 2023" },
  { value: "2024-01", label: "January 2024" },
  { value: "2024-02", label: "February 2024" },
  { value: "2024-03", label: "March 2024" },
  { value: "2024-04", label: "April 2024" },
  { value: "2024-05", label: "May 2024" },
  { value: "2024-06", label: "June 2024" },
  { value: "2024-07", label: "July 2024" },
  { value: "2024-08", label: "August 2024" },
  { value: "2024-09", label: "September 2024" },
  { value: "2024-10", label: "October 2024" },
  { value: "2024-11", label: "November 2024" },
  { value: "2024-12", label: "December 2024" },
  { value: "2025-01", label: "January 2025" },
  { value: "2025-02", label: "February 2025" },
  { value: "2025-03", label: "March 2025" },
  { value: "2025-04", label: "April 2025" },
  { value: "2025-05", label: "May 2025" },
  { value: "2025-06", label: "June 2025" },
  { value: "2025-07", label: "July 2025" },
  { value: "2025-08", label: "August 2025" },
  { value: "2025-09", label: "September 2025" },
  { value: "2025-10", label: "October 2025" },
  { value: "2025-11", label: "November 2025" },
  { value: "2025-12", label: "December 2025" },
  { value: "2026-01", label: "January 2026" },
  { value: "2026-02", label: "February 2026" },
  { value: "2026-03", label: "March 2026" },
];

export function PendingSubmissionsTab() {
  const [pending, setPending] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<Array<{ id: string; name: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [filters, setFilters] = useState<FilterState>({
    monthKey: "",
    weekKey: "",
    markerAdminId: "",
    subjectUserId: "",
  });

  // Fetch pending submissions whenever filters change
  useEffect(() => {
    const load = async () => {
      await fetchPendingSubmissions();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.monthKey,
    filters.weekKey,
    filters.markerAdminId,
    filters.subjectUserId,
  ]);

  // Fetch admins and subjects for filter dropdowns
  useEffect(() => {
    fetchAdminsAndSubjects();
  }, []);

  const fetchAdminsAndSubjects = async () => {
    try {
      // Fetch admins
      const adminsRes = await fetch("/api/hrm/users?role=ADMIN");
      if (adminsRes.ok) {
        const adminsData = await adminsRes.json();
        setAdmins(
          (adminsData.users || []).map((a: any) => ({
            id: a.id,
            name: a.full_name,
          })),
        );
      }

      // Fetch subjects
      const subjectsRes = await fetch("/api/hrm/users?role=USER");
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(
          (subjectsData.users || []).map((s: any) => ({
            id: s.id,
            name: s.full_name,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPendingSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.monthKey) params.append("monthKey", filters.monthKey);
      if (filters.weekKey) params.append("weekKey", filters.weekKey);
      if (filters.markerAdminId)
        params.append("markerAdminId", filters.markerAdminId);
      if (filters.subjectUserId)
        params.append("subjectUserId", filters.subjectUserId);

      const response = await fetch(
        `/api/hrm/admin/kpi/pending?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setPending(data.submissions || []);
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      toast.error("Failed to fetch pending submissions");
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      monthKey: "",
      weekKey: "",
      markerAdminId: "",
      subjectUserId: "",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getOverdueColor = (days: number) => {
    if (days >= 30) return "text-red-700";
    if (days >= 14) return "text-orange-600";
    if (days >= 7) return "text-amber-600";
    return "text-yellow-600";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Month</label>
              <Select
                value={filters.monthKey}
                onValueChange={(value) =>
                  setFilters({ ...filters, monthKey: value, weekKey: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All months</SelectItem>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Marker (Admin)
              </label>
              <Select
                value={filters.markerAdminId}
                onValueChange={(value) =>
                  setFilters({ ...filters, markerAdminId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All admins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All admins</SelectItem>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Subject (Employee)
              </label>
              <Select
                value={filters.subjectUserId}
                onValueChange={(value) =>
                  setFilters({ ...filters, subjectUserId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="">All subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Pending Submissions
            {pending.length > 0 && (
              <Badge className="ml-2 bg-orange-100 text-orange-800">
                {pending.length}
              </Badge>
            )}
          </h3>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>

        {pending.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={AlertCircle}
                title="No pending submissions"
                description="All assignments for past weeks have been submitted!"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Deadline (Friday)</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Marker (Admin)</TableHead>
                    <TableHead>Subject (Employee)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((item) => (
                    <TableRow
                      key={`${item.weekKey}-${item.markerAdminId}-${item.subjectUserId}`}
                    >
                      <TableCell className="font-mono text-sm">
                        {item.weekKey}
                      </TableCell>
                      <TableCell>{formatDate(item.fridayDate)}</TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${getOverdueColor(item.daysOverdue)}`}
                        >
                          {item.daysOverdue} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{item.markerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.markerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{item.subjectName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.subjectEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
