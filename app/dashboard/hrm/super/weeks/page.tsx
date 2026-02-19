"use client";

import { DataTableToolbar } from "@/components/hrm/DataTableToolbar";
import { TableSkeleton } from "@/components/hrm/TableSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  getCurrentFridayDate,
  getCurrentMonthKey,
  getMonthKeyFromWeekKey,
  getMonthOptions,
  getWeekKeyFromFridayDate,
} from "@/lib/hrm/week-utils";
import { Calendar, Lock, LockOpen, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type HrmWeek = {
  id: string;
  week_key: string;
  friday_date: string;
  status: "OPEN" | "LOCKED";
  created_at: string;
  updated_at: string;
};

export default function WeeksManagementPage() {
  const [weeks, setWeeks] = useState<HrmWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekKey, setCurrentWeekKey] = useState<string>("");

  // Month filter
  const [selectedMonth, setSelectedMonth] =
    useState<string>(getCurrentMonthKey());
  const [filteredWeeks, setFilteredWeeks] = useState<HrmWeek[]>([]);
  const monthOptions = getMonthOptions(12);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [fridayDate, setFridayDate] = useState("");
  const [creating, setCreating] = useState(false);

  // Lock/Unlock dialog
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"lock" | "unlock">("lock");
  const [selectedWeek, setSelectedWeek] = useState<HrmWeek | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Get current week key
    const currentFriday = getCurrentFridayDate();
    const weekKey = getWeekKeyFromFridayDate(currentFriday);
    setCurrentWeekKey(weekKey);

    fetchWeeks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  // Filter weeks by selected month
  useEffect(() => {
    if (!weeks.length) {
      setFilteredWeeks([]);
      return;
    }

    const filtered = weeks.filter((week) => {
      const weekMonth = getMonthKeyFromWeekKey(week.week_key);
      return weekMonth === selectedMonth;
    });

    setFilteredWeeks(filtered);
  }, [weeks, selectedMonth]);

  const fetchWeeks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/hrm/super/weeks?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch weeks");
      }

      setWeeks(result.weeks || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch weeks";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleCreateWeek = async () => {
    if (!fridayDate) {
      toast.error("Please select a Friday date");
      return;
    }

    // Validate it's a Friday
    const date = new Date(fridayDate);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 5) {
      toast.error("Selected date must be a Friday");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/hrm/super/weeks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fridayDate }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create week");
      }

      toast.success(result.message || "Week created successfully");
      setCreateDialogOpen(false);
      setFridayDate("");
      fetchWeeks();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create week";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleLockUnlock = (week: HrmWeek, action: "lock" | "unlock") => {
    setSelectedWeek(week);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedWeek) return;

    setActionLoading(true);
    try {
      const endpoint =
        actionType === "lock"
          ? `/api/hrm/super/weeks/${selectedWeek.week_key}/lock`
          : `/api/hrm/super/weeks/${selectedWeek.week_key}/unlock`;

      const response = await fetch(endpoint, { method: "POST" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${actionType} week`);
      }

      toast.success(result.message || `Week ${actionType}ed successfully`);
      setActionDialogOpen(false);
      setSelectedWeek(null);
      fetchWeeks();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : `Failed to ${actionType} week`;
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Dhaka",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Week Management</h1>
          <p className="text-muted-foreground">
            Manage HRM weeks - create, lock, and unlock weekly periods
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Week
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            HRM Weeks - {filteredWeeks.length} shown
            {weeks.length > filteredWeeks.length && ` of ${weeks.length} total`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <DataTableToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by week key..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="LOCKED">Locked</SelectItem>
              </SelectContent>
            </Select>
          </DataTableToolbar>

          {/* Table */}
          {loading ? (
            <TableSkeleton columns={5} rows={10} />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week Key</TableHead>
                    <TableHead>Friday Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWeeks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {weeks.length === 0
                          ? "No weeks found. Create your first week to get started."
                          : "No weeks found for the selected month."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWeeks.map((week) => (
                      <TableRow key={week.id}>
                        <TableCell className="font-mono font-medium">
                          {formatWeekWithNumber(week.week_key)}
                          {week.week_key === currentWeekKey && (
                            <Badge variant="outline" className="ml-2">
                              Current
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(week.friday_date)}</TableCell>
                        <TableCell>
                          {week.status === "OPEN" ? (
                            <Badge variant="default" className="gap-1">
                              <LockOpen className="h-3 w-3" />
                              Open
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(week.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {week.status === "OPEN" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLockUnlock(week, "lock")}
                              >
                                <Lock className="mr-1 h-3 w-3" />
                                Lock
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLockUnlock(week, "unlock")}
                              >
                                <LockOpen className="mr-1 h-3 w-3" />
                                Unlock
                              </Button>
                            )}
                          </div>
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

      {/* Create Week Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Week</DialogTitle>
            <DialogDescription>
              Select a Friday date to create a new HRM week. The system will
              auto-generate the week key.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fridayDate">Friday Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fridayDate"
                  type="date"
                  value={fridayDate}
                  onChange={(e) => setFridayDate(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Only Fridays can be selected as the week endpoint
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setFridayDate("");
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWeek} disabled={creating}>
              {creating ? "Creating..." : "Create Week"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock/Unlock Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "lock" ? "Lock Week" : "Unlock Week"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "lock"
                ? `Are you sure you want to lock week ${selectedWeek?.week_key}? This will prevent admins from submitting or editing KPI marks for this week.`
                : `Are you sure you want to unlock week ${selectedWeek?.week_key}? This will allow admins to submit or edit KPI marks.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={actionLoading}
              className={
                actionType === "lock" ? "bg-orange-500 hover:bg-orange-600" : ""
              }
            >
              {actionLoading
                ? `${actionType === "lock" ? "Locking" : "Unlocking"}...`
                : actionType === "lock"
                  ? "Lock Week"
                  : "Unlock Week"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
