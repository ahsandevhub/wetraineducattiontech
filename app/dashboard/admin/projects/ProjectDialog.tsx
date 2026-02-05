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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImageUpload } from "../_components/ImageUpload";
import type { AdminProjectRow } from "../types";

export type ProjectFormValues = {
  title: string;
  slug: string;
  category: string;
  description: string;
  techStack: string[];
  featuredImageUrl: string;
  liveUrl: string;
  githubUrl: string;
};

type ProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: AdminProjectRow | null;
  isSaving: boolean;
  onSave: (values: ProjectFormValues) => void;
};

export default function ProjectDialog({
  open,
  onOpenChange,
  project,
  isSaving,
  onSave,
}: ProjectDialogProps) {
  const initialValues = useMemo<ProjectFormValues>(
    () => ({
      title: project?.title ?? "",
      slug: project?.slug ?? "",
      category: project?.category ?? "",
      description: project?.description ?? "",
      techStack: project?.techStack ?? [""],
      featuredImageUrl: project?.featuredImageUrl ?? "",
      liveUrl: project?.liveUrl ?? "",
      githubUrl: project?.githubUrl ?? "",
    }),
    [project],
  );

  const [values, setValues] = useState<ProjectFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const isEdit = Boolean(project);

  const updateTech = (index: number, value: string) => {
    setValues((prev) => {
      const next = [...prev.techStack];
      next[index] = value;
      return { ...prev, techStack: next };
    });
  };

  const addTech = () => {
    setValues((prev) => ({
      ...prev,
      techStack: [...prev.techStack, ""],
    }));
  };

  const removeTech = (index: number) => {
    setValues((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Project" : "Add Project"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the featured project details."
              : "Add a new featured project."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(values);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, title: event.target.value }))
              }
              required
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={values.slug}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, slug: event.target.value }))
                }
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={values.category}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                required
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={values.description}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              disabled={isSaving}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Project description"
            />
          </div>

          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <div className="space-y-3">
              {values.techStack.map((tech, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={tech}
                    onChange={(event) => updateTech(index, event.target.value)}
                    disabled={isSaving}
                    placeholder={`Tech ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTech(index)}
                    disabled={isSaving || values.techStack.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTech}
                disabled={isSaving}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Tech
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="liveUrl">Live URL (optional)</Label>
              <Input
                id="liveUrl"
                value={values.liveUrl}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    liveUrl: event.target.value,
                  }))
                }
                disabled={isSaving}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
              <Input
                id="githubUrl"
                value={values.githubUrl}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    githubUrl: event.target.value,
                  }))
                }
                disabled={isSaving}
                placeholder="https://"
              />
            </div>
          </div>

          <ImageUpload
            label="Featured Image"
            bucket="projects"
            currentUrl={values.featuredImageUrl}
            required
            isLoading={isSaving}
            onUpload={(url) =>
              setValues((prev) => ({ ...prev, featuredImageUrl: url }))
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
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
