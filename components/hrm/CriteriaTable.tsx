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
import { Edit, ListChecks, Trash2 } from "lucide-react";
import { EmptyState } from "./EmptyState";

export type HrmCriteria = {
  id: string;
  key: string;
  name: string;
  default_scale_max: number;
  description: string | null;
};

type CriteriaTableProps = {
  criteria: HrmCriteria[];
  onEdit: (criteria: HrmCriteria) => void;
  onDelete: (criteria: HrmCriteria) => void;
  onCreate?: () => void;
};

export function CriteriaTable({
  criteria,
  onEdit,
  onDelete,
  onCreate,
}: CriteriaTableProps) {
  if (criteria.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No Criteria Configured"
        description="Create evaluation criteria to define what metrics will be used to assess HRM users. These criteria will be used when creating criteria sets for subjects."
        actionLabel="Create Criteria"
        onActionClick={onCreate}
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Default Scale</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {criteria.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="font-mono text-sm">{item.key}</TableCell>
              <TableCell>{item.default_scale_max}</TableCell>
              <TableCell className="max-w-md truncate">
                {item.description || "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
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
