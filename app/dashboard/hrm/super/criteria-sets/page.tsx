"use client";

import { CriteriaSetBuilder } from "@/components/hrm/CriteriaSetBuilder";
import { EmptyState } from "@/components/hrm/EmptyState";
import { CriteriaSetStatusChip } from "@/components/hrm/StatusChips";
import { TableSkeleton } from "@/components/hrm/TableSkeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type HrmCriteria = {
  id: string;
  key: string;
  name: string;
  default_scale_max: number;
};

type CriteriaSetItem = {
  criteriaId: string;
  scaleMax: number;
  weightagePercent: number;
};

type SubjectWithCriteriaSet = {
  userId: string;
  fullName: string;
  email: string;
  hasActiveCriteriaSet: boolean;
};

export default function CriteriaSetsPage() {
  const [subjects, setSubjects] = useState<SubjectWithCriteriaSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // Dialog form state
  const [dialogCriteria, setDialogCriteria] = useState<HrmCriteria[]>([]);
  const [dialogItems, setDialogItems] = useState<CriteriaSetItem[]>([]);
  const [originalItems, setOriginalItems] = useState<CriteriaSetItem[]>([]);
  const [dialogSubject, setDialogSubject] = useState<{
    full_name: string;
    email: string;
  } | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hrm/super/criteria-sets");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch subjects");
      }

      setSubjects(result.subjects);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch subjects";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setDialogLoading(true);
    try {
      // Fetch criteria library
      const criteriaRes = await fetch("/api/hrm/super/criteria");
      const criteriaResult = await criteriaRes.json();
      if (!criteriaRes.ok) throw new Error("Failed to fetch criteria");
      setDialogCriteria(criteriaResult.criteria);

      // Fetch subject's active criteria set
      const setRes = await fetch(`/api/hrm/super/criteria-sets/${subjectId}`);
      const setResult = await setRes.json();
      if (!setRes.ok) throw new Error("Failed to fetch criteria set");

      setDialogSubject(setResult.subject);
      const items =
        setResult.activeSet?.items.map((item: any) => ({
          criteriaId: item.criteriaId,
          scaleMax: item.scaleMax,
          weightagePercent: item.weight,
        })) || [];
      setDialogItems(items);
      setOriginalItems(JSON.parse(JSON.stringify(items))); // Deep copy
      setDialogOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load data";
      toast.error(message);
    } finally {
      setDialogLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedSubjectId(null);
    setDialogCriteria([]);
    setDialogItems([]);
    setOriginalItems([]);
    setDialogSubject(null);
  };

  const hasChanged =
    JSON.stringify(dialogItems) !== JSON.stringify(originalItems);

  const handleSave = async () => {
    if (!selectedSubjectId) return;

    // Validate total weight
    const totalWeight = dialogItems.reduce(
      (sum, item) => sum + item.weightagePercent,
      0,
    );
    if (totalWeight !== 100) {
      toast.error("Total weight must equal 100%");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `/api/hrm/super/criteria-sets/${selectedSubjectId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: dialogItems.map((item) => ({
              criteriaId: item.criteriaId,
              scaleMax: item.scaleMax,
              weight: item.weightagePercent,
            })),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save criteria set");
      }

      toast.success("Criteria set saved successfully");
      fetchSubjects();
      closeDialog();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save criteria set";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subject Criteria Sets</h1>
        <p className="text-muted-foreground">
          Configure evaluation criteria for each subject (Admin or Employee)
        </p>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Subject Criteria Sets</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton columns={4} rows={5} />
          </CardContent>
        </Card>
      ) : subjects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Subject Criteria Sets</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Settings}
              title="No Subjects Found"
              description="There are no HRM users (Admin or Employee) in the system yet. Create users from the People page to configure their criteria sets."
              actionLabel="Manage People"
              actionHref="/dashboard/hrm/super/people"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Subject Criteria Sets - {subjects.length} Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Criteria Set Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.userId}>
                      <TableCell className="font-medium">
                        {subject.fullName}
                      </TableCell>
                      <TableCell>{subject.email}</TableCell>
                      <TableCell>
                        <CriteriaSetStatusChip
                          hasActiveSet={subject.hasActiveCriteriaSet}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => openEditDialog(subject.userId)}
                          className="inline-flex items-center justify-center rounded-md hover:bg-accent p-2"
                          title={
                            subject.hasActiveCriteriaSet
                              ? "Edit Criteria Set"
                              : "Configure Criteria Set"
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Criteria Set Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogSubject
                ? `Edit Criteria Set - ${dialogSubject.full_name}`
                : "Edit Criteria Set"}
            </DialogTitle>
            <DialogDescription>
              {dialogSubject ? dialogSubject.email : ""}
            </DialogDescription>
          </DialogHeader>

          {dialogLoading ? (
            <div className="space-y-4">
              <TableSkeleton columns={1} rows={3} />
            </div>
          ) : (
            <div className="space-y-4">
              <CriteriaSetBuilder
                criteria={dialogCriteria}
                items={dialogItems}
                onChange={setDialogItems}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanged}
              title={!hasChanged ? "No changes to save" : ""}
            >
              {saving ? "Saving..." : "Save Criteria Set"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
