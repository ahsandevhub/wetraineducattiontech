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
import TablePagination from "../_components/TablePagination";
import { createStory, deleteStory, updateStory } from "../actions";
import type { AdminStoryRow } from "../types";
import StoryDialog, { type StoryFormValues } from "./StoryDialog";

type StoriesClientProps = {
  stories: AdminStoryRow[];
};

export default function StoriesClient({ stories }: StoriesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const storySearch = searchParams.get("storySearch") ?? "";
  const storyPage = parseInt(searchParams.get("storyPage") ?? "1");
  const storyRowsPerPage = parseInt(
    searchParams.get("storyRowsPerPage") ?? "10",
  );

  const [searchValue, setSearchValue] = useState(storySearch);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<AdminStoryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminStoryRow | null>(null);
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
    setSearchValue(storySearch);
  }, [storySearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === storySearch) return;
      updateParams({ storySearch: searchValue || null, storyPage: 1 });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, storySearch, updateParams]);

  const filteredStories = useMemo(() => {
    const query = storySearch.toLowerCase();
    return stories.filter((story) => {
      if (!query) return true;
      return (
        story.name.toLowerCase().includes(query) ||
        story.role.toLowerCase().includes(query)
      );
    });
  }, [stories, storySearch]);

  const startIndex = (storyPage - 1) * storyRowsPerPage;
  const paginated = filteredStories.slice(
    startIndex,
    startIndex + storyRowsPerPage,
  );
  const totalPages = Math.ceil(filteredStories.length / storyRowsPerPage);

  const handleSave = (values: StoryFormValues) => {
    const parsedRating = Number(values.rating || 5);
    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    const isEdit = Boolean(editingStory);
    setActionLoading({ id: editingStory?.id ?? "new", type: "save" });
    startTransition(async () => {
      try {
        if (isEdit && editingStory) {
          await updateStory(editingStory.id, {
            name: values.name,
            role: values.role,
            quote: values.quote,
            achievement: values.achievement,
            rating: parsedRating,
            imageUrl: values.imageUrl || null,
          });
          toast.success("Story updated");
        } else {
          await createStory({
            name: values.name,
            role: values.role,
            quote: values.quote,
            achievement: values.achievement,
            rating: parsedRating,
            imageUrl: values.imageUrl || null,
          });
          toast.success("Story created");
        }
        setDialogOpen(false);
        setEditingStory(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save story",
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
        await deleteStory(deleteTarget.id);
        toast.success("Story deleted");
        setDeleteTarget(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete story",
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
          <h1 className="text-3xl font-bold text-gray-900">Client Stories</h1>
          <p className="text-sm text-gray-600">
            Manage testimonials and client stories.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingStory(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Story
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Stories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by name or role..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-xs"
          />

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-primary-100">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">
                    Client
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Role
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Rating
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((story) => (
                  <TableRow key={story.id} className="hover:bg-primary-50">
                    <TableCell className="font-medium text-gray-900">
                      {story.name}
                    </TableCell>
                    <TableCell>{story.role}</TableCell>
                    <TableCell>{story.rating}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={
                              actionLoading?.id === story.id &&
                              actionLoading.type === "save"
                            }
                          >
                            {actionLoading?.id === story.id &&
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
                              setEditingStory(story);
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteTarget(story)}
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
                    <TableCell colSpan={4} className="text-center py-10">
                      <div className="text-sm text-gray-500">
                        No stories found.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={storyPage}
            totalPages={totalPages}
            rowsPerPage={storyRowsPerPage}
            totalRows={filteredStories.length}
            onPageChange={(page) => updateParams({ storyPage: page })}
            onRowsPerPageChange={(rows) =>
              updateParams({ storyRowsPerPage: rows, storyPage: 1 })
            }
          />
        </CardContent>
      </Card>

      <StoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingStory(null);
        }}
        story={editingStory}
        isSaving={isPending || actionLoading?.type === "save"}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete story"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? "this story"}? This action cannot be undone.`}
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
