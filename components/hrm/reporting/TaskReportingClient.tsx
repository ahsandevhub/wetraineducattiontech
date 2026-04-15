"use client";

import { ConfirmDialog } from "@/app/dashboard/admin/_components/ConfirmDialog";
import TablePagination from "@/app/dashboard/admin/_components/TablePagination";
import { deleteTaskReport } from "@/app/dashboard/hrm/_actions/task-reporting";
import type {
  HrmReportingFilters,
  HrmReportingPageData,
  HrmReportingScope,
  HrmTaskReportListItem,
} from "@/app/dashboard/hrm/_lib/task-reporting-shared";
import { HRM_TASK_REPORT_CATEGORY_SECTIONS } from "@/app/dashboard/hrm/_lib/task-reporting-shared";
import { DataTableToolbar } from "@/components/hrm/DataTableToolbar";
import { EmptyState } from "@/components/hrm/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
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
import { Edit, ExternalLink, FileBarChart, Plus, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { TaskReportForm } from "./TaskReportForm";

type TaskReportingClientProps = {
  scope: HrmReportingScope;
  data: HrmReportingPageData;
  pageTitle: string;
  pageDescription: string;
  createPreviewTimestamp: string;
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

function buildSearchState(filters: HrmReportingFilters) {
  return {
    q: filters.q,
    category: filters.category || "all",
    userId: filters.userId || "all",
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
}

export function TaskReportingClient({
  scope,
  data,
  pageTitle,
  pageDescription,
  createPreviewTimestamp,
}: TaskReportingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingReport, setEditingReport] =
    useState<HrmTaskReportListItem | null>(null);
  const [deletingReport, setDeletingReport] =
    useState<HrmTaskReportListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const filterState = buildSearchState(data.filters);

  const updateParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const showEmployeeColumn = scope !== "EMPLOYEE";
  const showUserFilter = scope !== "EMPLOYEE";

  const userFilterOptions = useMemo(() => {
    const options = data.userOptions.map((user) => ({
      value: user.id,
      label: user.fullName,
    }));

    if (scope === "ADMIN") {
      return [{ value: "all", label: "All allowed users" }, ...options];
    }

    if (scope === "SUPER_ADMIN") {
      return [{ value: "all", label: "All HRM users" }, ...options];
    }

    return options;
  }, [data.userOptions, scope]);

  const handleDelete = async () => {
    if (!deletingReport) return;

    setDeleteLoading(true);
    const result = await deleteTaskReport(deletingReport.id);
    setDeleteLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Task report deleted");
    setDeletingReport(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add New Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DataTableToolbar
            searchValue={data.filters.q}
            onSearchChange={(value) =>
              updateParams({ q: value || null, page: 1 })
            }
            searchPlaceholder="Search task title or notes..."
          >
            <Select
              value={filterState.category}
              onValueChange={(value) => {
                updateParams({
                  category: value === "all" ? null : value,
                  page: 1,
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectSeparator />
                {HRM_TASK_REPORT_CATEGORY_SECTIONS.map((section, index) => (
                  <div key={section.label}>
                    <SelectGroup>
                      <SelectLabel>{section.label}</SelectLabel>
                      {section.categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    {index < HRM_TASK_REPORT_CATEGORY_SECTIONS.length - 1 ? (
                      <SelectSeparator />
                    ) : null}
                  </div>
                ))}
              </SelectContent>
            </Select>

            {showUserFilter && (
              <Select
                value={filterState.userId}
                onValueChange={(value) => {
                  updateParams({
                    userId: value === "all" ? null : value,
                    page: 1,
                  });
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent>
                  {userFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Input
              type="date"
              value={filterState.dateFrom}
              onChange={(event) => {
                const value = event.target.value;
                updateParams({ dateFrom: value || null, page: 1 });
              }}
              className="w-[160px]"
            />

            <Input
              type="date"
              value={filterState.dateTo}
              onChange={(event) => {
                const value = event.target.value;
                updateParams({ dateTo: value || null, page: 1 });
              }}
              className="w-[160px]"
            />
          </DataTableToolbar>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reported At</TableHead>
                  {showEmployeeColumn && <TableHead>Employee</TableHead>}
                  <TableHead>Category</TableHead>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={showEmployeeColumn ? 7 : 6}
                      className="h-48"
                    >
                      <EmptyState
                        icon={FileBarChart}
                        title="No task reports found"
                        description="Try adjusting your filters or log a new task report."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(item.reported_at)}
                      </TableCell>
                      {showEmployeeColumn && (
                        <TableCell>
                          <div className="font-medium">
                            {item.authorName || "Unknown user"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.authorEmail || item.author_user_id}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="font-medium">
                        {item.task_title}
                      </TableCell>
                      <TableCell>
                        {item.proof_url ? (
                          <a
                            href={item.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            Open <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        {item.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.canEdit ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingReport(item)}
                              disabled={isPending}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingReport(item)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={data.filters.page}
            totalPages={data.totalPages}
            rowsPerPage={data.filters.pageSize}
            totalRows={data.totalRows}
            onPageChange={(page) => updateParams({ page })}
            onRowsPerPageChange={(rows) =>
              updateParams({ pageSize: rows, page: 1 })
            }
          />
        </CardContent>
      </Card>

      <TaskReportForm
        mode="create"
        createPreviewTimestamp={createPreviewTimestamp}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {editingReport && (
        <TaskReportForm
          mode="edit"
          report={editingReport}
          createPreviewTimestamp={createPreviewTimestamp}
          open={!!editingReport}
          onOpenChange={(open) => !open && setEditingReport(null)}
        />
      )}

      <ConfirmDialog
        open={!!deletingReport}
        title="Delete Task Report"
        description={`Delete "${deletingReport?.task_title}"? This cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeletingReport(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}
