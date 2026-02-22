"use client";

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
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type HrmCriteria = {
  id: string;
  key: string;
  name: string;
  default_scale_max: number;
  description: string | null;
};

type CriteriaDialogProps = {
  criteria: HrmCriteria | null;
  mode: "create" | "edit";
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function CriteriaDialog({
  criteria,
  mode,
  open,
  onClose,
  onSuccess,
}: CriteriaDialogProps) {
  const [key, setKey] = useState(criteria?.key || "");
  const [name, setName] = useState(criteria?.name || "");
  const [defaultScaleMax, setDefaultScaleMax] = useState(
    criteria?.default_scale_max || 10,
  );
  const [description, setDescription] = useState(criteria?.description || "");
  const [loading, setLoading] = useState(false);

  // Update form fields when criteria or dialog opens
  useEffect(() => {
    if (open && criteria) {
      setKey(criteria.key);
      setName(criteria.name);
      setDefaultScaleMax(criteria.default_scale_max);
      setDescription(criteria.description || "");
    } else if (open && mode === "create") {
      // Reset form for create mode
      setKey("");
      setName("");
      setDefaultScaleMax(10);
      setDescription("");
    }
  }, [open, criteria, mode]);

  const handleSubmit = async () => {
    if (!name || !key) {
      toast.error("Name and key are required");
      return;
    }

    setLoading(true);
    try {
      const url =
        mode === "create"
          ? "/api/hrm/super/criteria"
          : `/api/hrm/super/criteria/${criteria?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          name,
          defaultScaleMax,
          description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save criteria");
      }

      toast.success(
        mode === "create"
          ? "Criteria created successfully"
          : "Criteria updated successfully",
      );
      onSuccess();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save criteria";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Criteria" : "Edit Criteria"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new evaluation criteria to the library"
              : "Update evaluation criteria"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Key (slug)</Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g., attendance"
              disabled={mode === "edit"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Attendance"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scale">Default Scale Max</Label>
            <Input
              id="scale"
              type="number"
              min="1"
              max="100"
              value={defaultScaleMax}
              onChange={(e) => setDefaultScaleMax(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
