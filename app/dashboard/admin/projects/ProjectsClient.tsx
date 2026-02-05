"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "react-hot-toast";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import CopyButton from "../_components/CopyButton";
import TablePagination from "../_components/TablePagination";
import { createProject, deleteProject, updateProject } from "../actions";
import type { AdminProjectRow } from "../types";
import ProjectDialog, { type ProjectFormValues } from "./ProjectDialog";

type ProjectsClientProps = {
  projects: AdminProjectRow[];
};

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const projectSearch = searchParams.get("projectSearch") ?? "";
  const projectPage = parseInt(searchParams.get("projectPage") ?? "1");
  const projectRowsPerPage = parseInt(
    searchParams.get("projectRowsPerPage") ?? "10",
  );

  const [searchValue, setSearchValue] = useState(projectSearch);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProjectRow | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminProjectRow | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState<{
    id: string;
    type: "save" | "delete";
  } | null>(null);

  const updateParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [searchParams, router],
  );

  useEffect(() => {
    setSearchValue(projectSearch);
  }, [projectSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === projectSearch) return;
      updateParams({ projectSearch: searchValue || null, projectPage: 1 });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, projectSearch, updateParams]);

  const filteredProjects = useMemo(() => {
    const query = projectSearch.toLowerCase();
    return projects.filter((project) => {
      if (!query) return true;

      return (
        project.title.toLowerCase().includes(query) ||
        project.slug.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query)
      );
    });
  }, [projects, projectSearch]);

  const startIndex = (projectPage - 1) * projectRowsPerPage;
  const paginated = filteredProjects.slice(
    startIndex,
    startIndex + projectRowsPerPage,
  );
  const totalPages = Math.ceil(filteredProjects.length / projectRowsPerPage);

  const handleSave = (values: ProjectFormValues) => {
    if (!values.featuredImageUrl) {
      toast.error("Featured image is required");
      return;
    }

    const cleanedTech = values.techStack
      .map((tech) => tech.trim())
      .filter(Boolean);

    const isEdit = Boolean(editingProject);
    setActionLoading({ id: editingProject?.id ?? "new", type: "save" });
    startTransition(async () => {
      try {
        if (isEdit && editingProject) {
          await updateProject(editingProject.id, {
            title: values.title,
            slug: values.slug,
            category: values.category,
            description: values.description,
            techStack: cleanedTech,
            featuredImageUrl: values.featuredImageUrl,
            liveUrl: values.liveUrl || null,
            githubUrl: values.githubUrl || null,
          });
          toast.success("Project updated");
        } else {
          await createProject({
            title: values.title,
            slug: values.slug,
            category: values.category,
            description: values.description,
            techStack: cleanedTech,
            featuredImageUrl: values.featuredImageUrl,
            liveUrl: values.liveUrl || null,
            githubUrl: values.githubUrl || null,
          });
          toast.success("Project created");
        }
        setDialogOpen(false);
        setEditingProject(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save project",
        );
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setActionLoading({ id: deleteTarget.id, type: "delete" });
    startTransition(async () => {
      try {
        await deleteProject(deleteTarget.id);
        toast.success("Project deleted");
        setDeleteTarget(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete project",
        );
      } finally {
        setActionLoading(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-600">Manage featured projects.</p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by title, slug or category..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-xs"
          />

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">
                    Project
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Tech Stack
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Updated
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-gray-900">
                          {project.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{project.slug}</span>
                          <CopyButton text={project.slug} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{project.category}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {project.techStack.length
                        ? project.techStack.join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {project.updatedAt
                        ? new Date(project.updatedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={
                              actionLoading?.id === project.id &&
                              actionLoading.type === "save"
                            }
                          >
                            {actionLoading?.id === project.id &&
                            actionLoading.type === "save" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingProject(project);
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteTarget(project)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="text-sm text-gray-500">
                        No projects found.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={projectPage}
            totalPages={totalPages}
            rowsPerPage={projectRowsPerPage}
            totalRows={filteredProjects.length}
            onPageChange={(page) => updateParams({ projectPage: page })}
            onRowsPerPageChange={(rows) =>
              updateParams({ projectRowsPerPage: rows, projectPage: 1 })
            }
          />
        </CardContent>
      </Card>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProject(null);
        }}
        project={editingProject}
        isSaving={isPending || actionLoading?.type === "save"}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete project"
        description={`Are you sure you want to delete ${deleteTarget?.title ?? "this project"}? This action cannot be undone.`}
        confirmText={
          actionLoading?.type === "delete" ? "Deleting..." : "Delete"
        }
        isLoading={actionLoading?.type === "delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
