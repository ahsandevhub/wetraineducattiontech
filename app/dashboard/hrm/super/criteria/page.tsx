"use client";

import { CriteriaDialog } from "@/components/hrm/CriteriaDialog";
import { CriteriaTable, HrmCriteria } from "@/components/hrm/CriteriaTable";
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
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function CriteriaPage() {
  const [criteria, setCriteria] = useState<HrmCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCriteria, setSelectedCriteria] = useState<HrmCriteria | null>(
    null,
  );
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [criteriaToDelete, setCriteriaToDelete] = useState<HrmCriteria | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const fetchCriteria = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hrm/super/criteria");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch criteria");
      }

      setCriteria(result.criteria);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch criteria";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  const handleCreate = () => {
    setSelectedCriteria(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (criteria: HrmCriteria) => {
    setSelectedCriteria(criteria);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = (criteria: HrmCriteria) => {
    setCriteriaToDelete(criteria);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!criteriaToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/hrm/super/criteria/${criteriaToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete criteria");
      }

      toast.success("Criteria deleted successfully");
      fetchCriteria();
      setDeleteDialogOpen(false);
      setCriteriaToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete criteria";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCriteria(null);
  };

  const handleDialogSuccess = () => {
    fetchCriteria();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Criteria Library</h1>
          <p className="text-muted-foreground">
            Manage evaluation criteria for HRM KPI system
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Criteria
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Criteria ({criteria.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton columns={5} rows={5} />
          ) : (
            <CriteriaTable
              criteria={criteria}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <CriteriaDialog
        criteria={selectedCriteria}
        mode={dialogMode}
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Criteria</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{criteriaToDelete?.name}
              &rdquo;? This action cannot be undone and will fail if the
              criteria is currently in use.
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
