"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MarkingForm } from "./MarkingForm";

type CriteriaItem = {
  id: string;
  criteriaId: string;
  weight: number;
  scaleMax: number;
  criteria: {
    id: string;
    key: string;
    name: string;
    description: string | null;
  };
};

type SubjectData = {
  subject: {
    id: string;
    fullName: string;
    email: string;
    hrmRole: string;
  };
  criteriaSet: {
    id: string;
    activeFrom: string;
    items: CriteriaItem[];
  } | null;
  existingSubmission: {
    id: string;
    totalScore: number;
    comment: string | null;
    items: Array<{ criteriaId: string; scoreRaw: number }>;
  } | null;
  weekStatus: string;
};

interface MarkingDialogProps {
  open: boolean;
  subjectUserId: string;
  weekKey: string;
  isLocked: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MarkingDialog({
  open,
  subjectUserId,
  weekKey,
  isLocked,
  onOpenChange,
  onSuccess,
}: MarkingDialogProps) {
  const [data, setData] = useState<SubjectData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/hrm/admin/subject/${subjectUserId}?weekKey=${weekKey}`,
      );
      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      setData(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load subject data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [subjectUserId, weekKey]);

  useEffect(() => {
    if (open && subjectUserId && weekKey) {
      fetchData();
    }
  }, [open, subjectUserId, weekKey, fetchData]);

  const handleSubmit = async (formData: {
    scores: Record<string, number>;
    comment: string;
  }) => {
    try {
      const items = Object.entries(formData.scores).map(
        ([criteriaId, scoreRaw]) => ({
          criteriaId,
          scoreRaw,
        }),
      );

      const res = await fetch("/api/hrm/admin/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekKey,
          subjectUserId,
          comment: formData.comment,
          items,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit marks");
      }

      // Submission successful - show success toast
      toast.success(
        `Marks submitted successfully! Total Score: ${result.totalScore.toFixed(
          2,
        )}`,
      );

      // Close dialog first
      onOpenChange(false);

      // Then refresh data (errors here won't show as submission errors)
      try {
        await fetchData();
        onSuccess?.();
      } catch (refreshError) {
        console.error("Error refreshing data after submit:", refreshError);
        // Don't show error toast - submission was successful
      }
    } catch (error) {
      // Only show error if submission actually failed
      const message =
        error instanceof Error ? error.message : "Failed to submit marks";
      console.error("Submit error:", error);
      toast.error(message);
    }
  };

  if (!data && loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="h-32 flex items-center justify-center">
            <div className="text-muted-foreground">Loading subject data...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data || !data.criteriaSet) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Unable to Load</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Criteria Not Configured</AlertTitle>
            <AlertDescription>
              This subject does not have an active criteria set. Please contact
              a Super Admin to configure their evaluation criteria.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  const existingScores =
    data.existingSubmission?.items.reduce(
      (acc, item) => {
        acc[item.criteriaId] = item.scoreRaw;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  const mode = isLocked ? "view" : "edit";
  const title =
    isLocked || data.existingSubmission
      ? `${mode === "view" ? "View" : "Edit"} Marks`
      : "Mark Subject";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {data.subject.fullName} • Week {weekKey}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Locked Alert */}
          {isLocked && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertTitle>Week Locked</AlertTitle>
              <AlertDescription>
                This week is locked. You can view but cannot edit this
                submission.
              </AlertDescription>
            </Alert>
          )}

          {/* Subject Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subject Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <div className="font-medium">{data.subject.fullName}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <div className="font-medium">{data.subject.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <div className="font-medium">{data.subject.hrmRole}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="font-medium">
                    {data.existingSubmission ? "✅ Submitted" : "⏳ Pending"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evaluation Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkingForm
                criteriaItems={data.criteriaSet.items}
                existingScores={existingScores}
                existingComment={data.existingSubmission?.comment || ""}
                isLocked={isLocked}
                onSubmit={handleSubmit}
                onCancel={() => onOpenChange(false)}
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
