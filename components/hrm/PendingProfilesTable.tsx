/**
 * PendingProfilesTable
 * Display pending HRM profiles with status and link info
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  CheckCircle2,
  Edit,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

type PendingProfile = {
  id: string;
  email: string;
  full_name: string | null;
  desired_role: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
  is_active: boolean;
  linked_auth_id: string | null;
  linked_at: string | null;
  created_at: string;
};

type PendingProfilesTableProps = {
  profiles: PendingProfile[];
  onRefresh: () => void;
};

export function PendingProfilesTable({
  profiles,
  onRefresh,
}: PendingProfilesTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleActive = async (profile: PendingProfile) => {
    setActionLoading(profile.id);
    try {
      const response = await fetch(
        `/api/hrm/super/pending-profiles/${profile.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isActive: !profile.is_active,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      toast.success(
        `Profile ${!profile.is_active ? "activated" : "deactivated"}`,
      );
      onRefresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this pending profile?")) {
      return;
    }

    setActionLoading(profileId);
    try {
      const response = await fetch(
        `/api/hrm/super/pending-profiles/${profileId}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete profile");
      }

      toast.success("Profile deleted successfully");
      onRefresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete profile";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No pending profiles found. Create one to pre-register HRM users.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Linked</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">{profile.email}</TableCell>
              <TableCell>{profile.full_name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    profile.desired_role === "ADMIN" ? "default" : "secondary"
                  }
                >
                  {profile.desired_role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={profile.is_active ? "default" : "secondary"}>
                  {profile.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {profile.linked_auth_id ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">
                      {profile.linked_at
                        ? format(new Date(profile.linked_at), "MMM d, yyyy")
                        : "Yes"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">No</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(profile.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={actionLoading === profile.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleToggleActive(profile)}
                      disabled={!!profile.linked_auth_id}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {profile.is_active ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(profile.id)}
                      disabled={!!profile.linked_auth_id}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
