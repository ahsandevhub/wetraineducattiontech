"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, UserCog } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { AssignmentStatusChip } from "./StatusChips";

export type HrmAssignment = {
  id: string;
  marker_admin_id: string;
  subject_user_id: string;
  is_active: boolean;
  created_at: string;
  marker?: {
    full_name: string;
    email: string;
  };
  subject?: {
    full_name: string;
    email: string;
  };
};

type AssignmentsTableProps = {
  assignments: HrmAssignment[];
  onEdit?: (assignment: HrmAssignment) => void;
  onDelete: (assignment: HrmAssignment) => void;
  onCreate?: () => void;
};

export function AssignmentsTable({
  assignments,
  onEdit,
  onDelete,
  onCreate,
}: AssignmentsTableProps) {
  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={UserCog}
        title="No Assignments Found"
        description="Create assignments to link marker admins with subject users. Markers will be able to evaluate their assigned subjects each week."
        actionLabel="Create Assignment"
        onActionClick={onCreate}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marker Admin</TableHead>
            <TableHead>Subject Employee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {assignment.marker?.full_name || "Unknown"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {assignment.marker?.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {assignment.subject?.full_name || "Unknown"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {assignment.subject?.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <AssignmentStatusChip isActive={assignment.is_active} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(assignment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(assignment)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
