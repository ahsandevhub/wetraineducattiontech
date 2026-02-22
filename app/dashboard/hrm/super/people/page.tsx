"use client";

import { CreatePendingProfileDialog } from "@/components/hrm/CreatePendingProfileDialog";
import { DataTableToolbar } from "@/components/hrm/DataTableToolbar";
import { PendingProfilesTable } from "@/components/hrm/PendingProfilesTable";
import { PeopleDialog } from "@/components/hrm/PeopleDialog";
import { HrmUser, PeopleTable } from "@/components/hrm/PeopleTable";
import { TableSkeleton } from "@/components/hrm/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export type PendingProfile = {
  id: string;
  email: string;
  full_name: string;
  desired_role: "ADMIN" | "EMPLOYEE";
  is_active: boolean;
  linked_auth_id: string | null;
  linked_at: string | null;
  created_at: string;
};

export default function PeoplePage() {
  const [users, setUsers] = useState<HrmUser[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<HrmUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createPendingDialogOpen, setCreatePendingDialogOpen] = useState(false);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Pending filters
  const [pendingRoleFilter, setPendingRoleFilter] = useState<string>("all");
  const [pendingStatusFilter, setPendingStatusFilter] = useState<string>("all");
  const [pendingSearch, setPendingSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all")
        params.set("active", statusFilter === "active" ? "true" : "false");
      if (search) params.set("search", search);

      const response = await fetch(`/api/hrm/super/people?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch users");
      }

      setUsers(result.users);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch users";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProfiles = async () => {
    setPendingLoading(true);
    try {
      const params = new URLSearchParams();
      if (pendingRoleFilter !== "all") params.set("role", pendingRoleFilter);
      if (pendingStatusFilter !== "all")
        params.set(
          "active",
          pendingStatusFilter === "active" ? "true" : "false",
        );
      if (pendingSearch) params.set("search", pendingSearch);

      const response = await fetch(`/api/hrm/super/pending-profiles?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch pending profiles");
      }

      setPendingProfiles(result.data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch pending profiles";
      toast.error(message);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter, search]);

  useEffect(() => {
    fetchPendingProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRoleFilter, pendingStatusFilter, pendingSearch]);

  const handleEdit = (user: HrmUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDialogSuccess = () => {
    fetchUsers();
  };

  const handlePendingDialogSuccess = () => {
    fetchPendingProfiles();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">People Management</h1>
          <p className="text-muted-foreground">
            Manage HRM user roles and pending profiles
          </p>
        </div>
        <Button
          onClick={() => setCreatePendingDialogOpen(true)}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Create HRM Profile
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active HRM Users</TabsTrigger>
          <TabsTrigger value="pending">Pending Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active HRM Users - {users.length} Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <DataTableToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by name or email..."
              >
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </DataTableToolbar>

              {/* Table */}
              {loading ? (
                <TableSkeleton columns={5} rows={5} />
              ) : (
                <PeopleTable users={users} onEdit={handleEdit} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>
                Pending Profiles - {pendingProfiles.length} Total
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pending Filters */}
              <DataTableToolbar
                searchValue={pendingSearch}
                onSearchChange={setPendingSearch}
                searchPlaceholder="Search by email or name..."
              >
                <Select
                  value={pendingRoleFilter}
                  onValueChange={setPendingRoleFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={pendingStatusFilter}
                  onValueChange={setPendingStatusFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </DataTableToolbar>

              {/* Pending Profiles Table */}
              {pendingLoading ? (
                <TableSkeleton columns={7} rows={5} />
              ) : (
                <PendingProfilesTable
                  profiles={pendingProfiles}
                  onRefresh={fetchPendingProfiles}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PeopleDialog
        user={selectedUser}
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />

      <CreatePendingProfileDialog
        open={createPendingDialogOpen}
        onClose={() => setCreatePendingDialogOpen(false)}
        onSuccess={handlePendingDialogSuccess}
      />
    </div>
  );
}
