"use client";

import {
  AssignmentsTable,
  HrmAssignment,
} from "@/components/hrm/AssignmentsTable";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type HrmUser = {
  id: string;
  full_name: string;
  email: string;
  hrm_role: string;
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<HrmAssignment[]>([]);
  const [admins, setAdmins] = useState<HrmUser[]>([]);
  const [subjects, setSubjects] = useState<HrmUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Filters
  const [markerFilter, setMarkerFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Create form
  const [selectedMarkerId, setSelectedMarkerId] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] =
    useState<HrmAssignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (markerFilter !== "all") params.set("markerAdminId", markerFilter);
      if (subjectFilter !== "all") params.set("subjectUserId", subjectFilter);
      if (statusFilter !== "all")
        params.set("isActive", statusFilter === "active" ? "true" : "false");
      if (search) params.set("search", search);

      const response = await fetch(`/api/hrm/super/assignments?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch assignments");
      }

      setAssignments(result.assignments);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch assignments";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch admins (for markers only)
      const adminsRes = await fetch("/api/hrm/super/people?role=ADMIN");
      const adminsResult = await adminsRes.json();
      if (adminsRes.ok) setAdmins(adminsResult.users);

      // Fetch all subjects (both ADMIN and EMPLOYEE)
      const subjectsRes = await fetch("/api/hrm/super/people");
      const subjectsResult = await subjectsRes.json();
      if (subjectsRes.ok) {
        // Filter to ADMIN and EMPLOYEE only
        const allSubjects = subjectsResult.users.filter(
          (u: HrmUser) => u.hrm_role === "ADMIN" || u.hrm_role === "EMPLOYEE",
        );
        setSubjects(allSubjects);
      }
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerFilter, subjectFilter, statusFilter, search]);

  const handleCreate = async () => {
    if (!selectedMarkerId || selectedSubjectIds.length === 0) {
      toast.error("Please select a marker and at least one subject");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/hrm/super/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markerAdminId: selectedMarkerId,
          subjectUserIds: selectedSubjectIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create assignments");
      }

      toast.success(
        `Created ${result.createdCount} assignment(s). Skipped ${result.skippedCount} duplicate(s).`,
      );
      setShowCreateForm(false);
      setSelectedMarkerId("");
      setSelectedSubjectIds([]);
      fetchAssignments();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create assignments";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (assignment: HrmAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/hrm/super/assignments/${assignmentToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete assignment");
      }

      toast.success("Assignment deleted");
      fetchAssignments();
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete assignment";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marker Assignments</h1>
          <p className="text-muted-foreground">
            Assign admin markers to subject users (Admins or Employees)
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Assignments</DialogTitle>
            <DialogDescription>
              Select a marker admin and one or more subject users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Marker Admin</Label>
              <Select
                value={selectedMarkerId}
                onValueChange={setSelectedMarkerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select marker admin" />
                </SelectTrigger>
                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.full_name} ({admin.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject Users</Label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject.id}
                      checked={selectedSubjectIds.includes(subject.id)}
                      onCheckedChange={() => toggleSubject(subject.id)}
                    />
                    <label
                      htmlFor={subject.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {subject.full_name} ({subject.email}) - {subject.hrm_role}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedSubjectIds.length} user(s) selected
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false);
                setSelectedMarkerId("");
                setSelectedSubjectIds([]);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create Assignments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters Toolbar */}
          <DataTableToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search assignments..."
          >
            <Select value={markerFilter} onValueChange={setMarkerFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Markers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markers</SelectItem>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.full_name} ({subject.hrm_role})
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </DataTableToolbar>

          {/* Table */}
          {loading ? (
            <TableSkeleton columns={4} rows={5} />
          ) : (
            <AssignmentsTable
              assignments={assignments}
              onDelete={handleDelete}
              onCreate={() => setShowCreateForm(true)}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
