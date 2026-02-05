"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImageUpload } from "../_components/ImageUpload";
import type { AdminStoryRow } from "../types";

export type StoryFormValues = {
  name: string;
  role: string;
  quote: string;
  achievement: string;
  rating: string;
  imageUrl: string;
};

type StoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story?: AdminStoryRow | null;
  isSaving: boolean;
  onSave: (values: StoryFormValues) => void;
};

export default function StoryDialog({
  open,
  onOpenChange,
  story,
  isSaving,
  onSave,
}: StoryDialogProps) {
  const initialValues = useMemo<StoryFormValues>(
    () => ({
      name: story?.name ?? "",
      role: story?.role ?? "",
      quote: story?.quote ?? "",
      achievement: story?.achievement ?? "",
      rating: story?.rating ? String(story.rating) : "5",
      imageUrl: story?.imageUrl ?? "",
    }),
    [story],
  );

  const [values, setValues] = useState<StoryFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const isEdit = Boolean(story);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Story" : "Add Story"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the client story details."
              : "Add a new client story."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(values);
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, name: event.target.value }))
                }
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={values.role}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, role: event.target.value }))
                }
                required
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote">Story Quote</Label>
            <textarea
              id="quote"
              value={values.quote}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, quote: event.target.value }))
              }
              disabled={isSaving}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Client story quote"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievement">Achievement</Label>
            <Input
              id="achievement"
              value={values.achievement}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  achievement: event.target.value,
                }))
              }
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input
              id="rating"
              inputMode="numeric"
              value={values.rating}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, rating: event.target.value }))
              }
              disabled={isSaving}
            />
          </div>

          <ImageUpload
            label="Client Image (optional)"
            bucket="stories"
            currentUrl={values.imageUrl}
            isLoading={isSaving}
            onUpload={(url) =>
              setValues((prev) => ({ ...prev, imageUrl: url }))
            }
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Story"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
