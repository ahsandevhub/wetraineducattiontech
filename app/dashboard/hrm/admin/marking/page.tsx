"use client";

import {
  MarkingListTable,
  MarkingSubject,
} from "@/components/hrm/admin/MarkingListTable";
import { DataTableToolbar } from "@/components/hrm/DataTableToolbar";
import { TableSkeleton } from "@/components/hrm/TableSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatWeekWithNumber,
  getCurrentMonthKey,
  getMonthKeyFromWeekKey,
  getMonthOptions,
} from "@/lib/hrm/week-utils";
import { AlertCircle, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Week {
  week_key: string;
  friday_date: string;
  status: string;
}

export default function MarkingListPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const [availableWeeks, setAvailableWeeks] = useState<Week[]>([]);
  const [filteredWeeks, setFilteredWeeks] = useState<Week[]>([]);
  const [selectedMonth, setSelectedMonth] =
    useState<string>(getCurrentMonthKey());
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [weekStatus, setWeekStatus] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [subjects, setSubjects] = useState<MarkingSubject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<MarkingSubject[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [weeksLoading, setWeeksLoading] = useState(true);

  // Track initial load to auto-select current week once
  const hasInitialLoad = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filters - set statusFilter based on query param if present
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>(
    statusParam === "pending" ? "pending" : "all",
  );
  const [search, setSearch] = useState("");

  const monthOptions = getMonthOptions(12);

  const fetchAvailableWeeks = useCallback(async () => {
    setWeeksLoading(true);
    try {
      const res = await fetch("/api/hrm/admin/weeks");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAvailableWeeks(data.weeks || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load weeks";
      toast.error(message);
    } finally {
      setWeeksLoading(false);
    }
  }, []);

  const fetchCurrentWeek = useCallback(async () => {
    try {
      const weekRes = await fetch("/api/hrm/admin/week/current");
      const weekData = await weekRes.json();

      if (!weekRes.ok) throw new Error(weekData.error);

      // Auto-select current week and set status
      setSelectedWeek(weekData.weekKey);
      setWeekStatus(weekData.status);
      setIsLocked(weekData.isLocked);

      return weekData.weekKey;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load current week";
      toast.error(message);
      return null;
    }
  }, []);

  const handleWeekChange = (selectedWeekKey: string) => {
    setSelectedWeek(selectedWeekKey);

    if (selectedWeekKey === "all") {
      setWeekStatus("");
      setIsLocked(false);
    } else {
      // Find selected week in available weeks
      const week = availableWeeks.find((w) => w.week_key === selectedWeekKey);
      if (week) {
        setWeekStatus(week.status);
        setIsLocked(week.status === "LOCKED");
      }
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
  };

  const fetchMarkingList = useCallback(
    async (weekKeyToFetch: string, monthKey: string, signal?: AbortSignal) => {
      setLoading(true);
      try {
        if (weekKeyToFetch && weekKeyToFetch !== "all") {
          // Single week mode - use existing endpoint
          const listRes = await fetch(
            `/api/hrm/admin/marking-list?weekKey=${weekKeyToFetch}`,
            { signal },
          );
          const listData = await listRes.json();

          if (!listRes.ok) throw new Error(listData.error);

          setSubjects(listData.subjects || []);
        } else {
          // All weeks mode - use monthly endpoint
          const listRes = await fetch(
            `/api/hrm/admin/marking-list/month?monthKey=${monthKey}`,
            { signal },
          );
          const listData = await listRes.json();

          if (!listRes.ok) throw new Error(listData.error);

          setSubjects(listData.subjects || []);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Ignore abort errors
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load marking list";
        toast.error(message);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch available weeks on mount
  useEffect(() => {
    fetchAvailableWeeks();
  }, [fetchAvailableWeeks]);

  // Auto-select current week on first mount and fetch its data
  useEffect(() => {
    if (availableWeeks.length > 0 && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
      fetchCurrentWeek().then((currentWeekKey) => {
        if (currentWeekKey) {
          // Immediately fetch data for current week
          fetchMarkingList(currentWeekKey, selectedMonth);
        }
      });
    }
  }, [availableWeeks, fetchCurrentWeek, fetchMarkingList, selectedMonth]);

  // Fetch marking list when filters change (with abort controller for race condition prevention)
  useEffect(() => {
    if (!selectedWeek || availableWeeks.length === 0) return;

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    fetchMarkingList(selectedWeek, selectedMonth, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [selectedWeek, selectedMonth, fetchMarkingList, availableWeeks.length]);

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

    // If selected week is not in the filtered list, reset to "all" or first available
    if (selectedWeek && selectedWeek !== "all") {
      const weekExists = filtered.some((w) => w.week_key === selectedWeek);
      if (!weekExists) {
        // Set to "all" to show all weeks in the new month
        setSelectedWeek("all");
      }
    }
  }, [availableWeeks, selectedMonth, selectedWeek]);

  useEffect(() => {
    let filtered = [...subjects];

    if (roleFilter !== "all") {
      filtered = filtered.filter((s) => s.subjectRole === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.submissionStatus === statusFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.subjectName.toLowerCase().includes(searchLower) ||
          s.subjectEmail.toLowerCase().includes(searchLower),
      );
    }

    setFilteredSubjects(filtered);
  }, [subjects, roleFilter, statusFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Marking List</h1>
        <p className="text-muted-foreground">
          View and manage KPI markings for your assigned employees
        </p>
      </div>

      {/* Locked Warning */}
      {isLocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Week Locked</AlertTitle>
          <AlertDescription>
            This week is locked. You can view submissions but cannot edit them.
          </AlertDescription>
        </Alert>
      )}

      {/* No Criteria Set Warning */}
      {subjects.some((s) => !s.hasActiveCriteriaSet) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Criteria Not Configured</AlertTitle>
          <AlertDescription>
            Some subjects do not have criteria sets configured. You cannot mark
            them until a Super Admin sets up their evaluation criteria.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Marking List - {filteredSubjects.length} shown
            {subjects.length > filteredSubjects.length &&
              ` of ${subjects.length} total`}
            {selectedWeek !== "all" && (
              <span className="text-muted-foreground font-normal text-base ml-2">
                • {formatWeekWithNumber(selectedWeek)} ({weekStatus})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <DataTableToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name or email..."
          >
            <Select
              value={selectedMonth}
              onValueChange={handleMonthChange}
              disabled={weeksLoading}
            >
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

            <Select
              value={selectedWeek}
              onValueChange={handleWeekChange}
              disabled={weeksLoading || loading || filteredWeeks.length === 0}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {filteredWeeks.map((week) => (
                  <SelectItem key={week.week_key} value={week.week_key}>
                    {formatWeekWithNumber(week.week_key)} - {week.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                {selectedWeek === "all" && (
                  <SelectItem value="partial">Partial</SelectItem>
                )}
              </SelectContent>
            </Select>
          </DataTableToolbar>

          {/* Table */}
          {loading ? (
            <TableSkeleton columns={7} rows={5} />
          ) : (
            <MarkingListTable
              subjects={filteredSubjects}
              weekKey={selectedWeek}
              isLocked={isLocked}
              onRefresh={() => fetchMarkingList(selectedWeek, selectedMonth)}
              isAllWeeksMode={selectedWeek === "all"}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
