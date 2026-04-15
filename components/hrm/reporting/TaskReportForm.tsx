"use client";

import {
  createTaskReport,
  updateTaskReport,
} from "@/app/dashboard/hrm/_actions/task-reporting";
import {
  HRM_TASK_REPORT_CATEGORY_SECTIONS,
  type HrmTaskReportListItem,
} from "@/app/dashboard/hrm/_lib/task-reporting-shared";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";

type TaskReportFormValues = {
  category: string;
  taskTitle: string;
  proofUrl: string;
  notes: string;
};

type TaskReportFormProps = {
  mode: "create" | "edit";
  report?: HrmTaskReportListItem;
  createPreviewTimestamp: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getInitialValues(
  report?: HrmTaskReportListItem,
): TaskReportFormValues {
  return {
    category: report?.category ?? "",
    taskTitle: report?.task_title ?? "",
    proofUrl: report?.proof_url ?? "",
    notes: report?.notes ?? "",
  };
}

function FormFields({
  values,
  setValues,
  timestampLabel,
  pending,
}: {
  values: TaskReportFormValues;
  setValues: React.Dispatch<React.SetStateAction<TaskReportFormValues>>;
  timestampLabel: string;
  pending: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reportedAt">Date and time</Label>
        <Input id="reportedAt" value={timestampLabel} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          list="task-report-category-list"
          value={values.category}
          onChange={(event) =>
            setValues((current) => ({ ...current, category: event.target.value }))
          }
          placeholder="Select or type a category"
          disabled={pending}
        />
        <datalist id="task-report-category-list">
          {HRM_TASK_REPORT_CATEGORY_SECTIONS.flatMap((section) =>
            section.categories.map((category) => (
              <option key={`${section.label}-${category}`} value={category} />
            )),
          )}
        </datalist>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taskTitle">Task Title</Label>
        <Input
          id="taskTitle"
          value={values.taskTitle}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              taskTitle: event.target.value,
            }))
          }
          placeholder="What task did you complete?"
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proofUrl">Proof</Label>
        <Input
          id="proofUrl"
          type="url"
          value={values.proofUrl}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              proofUrl: event.target.value,
            }))
          }
          placeholder="https://example.com"
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={values.notes}
          onChange={(event) =>
            setValues((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="Add any helpful context"
          disabled={pending}
          rows={4}
        />
      </div>
    </div>
  );
}

export function TaskReportForm({
  mode,
  report,
  createPreviewTimestamp,
  open = true,
  onOpenChange,
}: TaskReportFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<TaskReportFormValues>(() =>
    getInitialValues(report),
  );

  useEffect(() => {
    setValues(getInitialValues(report));
  }, [report]);

  const handleSubmit = () => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createTaskReport({
              category: values.category,
              taskTitle: values.taskTitle,
              proofUrl: values.proofUrl,
              notes: values.notes,
            })
          : await updateTaskReport({
              reportId: report?.id,
              category: values.category,
              taskTitle: values.taskTitle,
              proofUrl: values.proofUrl,
              notes: values.notes,
            });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "create" ? "Task report created" : "Task report updated",
      );
      if (mode === "create") {
        setValues(getInitialValues());
        onOpenChange?.(false);
      } else {
        onOpenChange?.(false);
      }
      router.refresh();
    });
  };

  const timestampLabel = formatDateTime(
    mode === "edit" && report ? report.reported_at : createPreviewTimestamp,
  );

  if (mode === "create") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Log Regular Task</DialogTitle>
            <DialogDescription>
              Add a new regular task entry. The report time is recorded
              automatically.
            </DialogDescription>
          </DialogHeader>
          <FormFields
            values={values}
            setValues={setValues}
            timestampLabel={timestampLabel}
            pending={isPending}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Saving..." : "Save Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Task Report</DialogTitle>
          <DialogDescription>
            Update the task details. The original report time stays unchanged.
          </DialogDescription>
        </DialogHeader>
        <FormFields
          values={values}
          setValues={setValues}
          timestampLabel={timestampLabel}
          pending={isPending}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
