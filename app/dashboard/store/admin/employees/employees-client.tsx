"use client";

import type { StorePermission } from "@/app/utils/auth/roles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
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
import { Edit, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  unlinkUserFromStore,
  updateStoreUserPermissions,
  updateStoreUserRole,
} from "../../_actions/users";
import { formatStoreDateTime } from "../../_lib/date-format";
import AddStoreUserDialog from "../_components/AddStoreUserDialog";

type StoreRole = "USER" | "ADMIN";

type StoreUser = {
  id: string;
  full_name: string;
  email: string;
  store_role: StoreRole;
  created_at: string;
  permissions: StorePermission[];
};

const PERMISSION_OPTIONS: Array<{
  key: StorePermission;
  label: string;
  description: string;
}> = [
  {
    key: "owner_purchase_manage",
    label: "Owner Purchases",
    description: "Add, edit, and delete owner purchase entries.",
  },
  {
    key: "balance_add",
    label: "Balances & Month Closing",
    description: "Post balance entries and close Store months.",
  },
  {
    key: "stock_manage",
    label: "Stock",
    description: "Record stock restocks, deductions, and adjustments.",
  },
  {
    key: "product_manage",
    label: "Products",
    description: "Create, edit, and archive Store products.",
  },
  {
    key: "invoice_manage",
    label: "Invoices",
    description: "Reverse confirmed invoices when needed.",
  },
  {
    key: "permissions_manage",
    label: "Permissions",
    description: "Manage Store access, roles, and admin permissions.",
  },
];

interface StoreEmployeesClientProps {
  users: StoreUser[];
  currentUserId: string;
  canManagePermissions: boolean;
}

export function StoreEmployeesClient({
  users: initialUsers,
  currentUserId,
  canManagePermissions,
}: StoreEmployeesClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers ?? []);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [editRole, setEditRole] = useState<StoreRole>("USER");
  const [selectedPermissions, setSelectedPermissions] = useState<
    StorePermission[]
  >([]);

  useEffect(() => {
    setUsers(initialUsers ?? []);
  }, [initialUsers]);

  const togglePermission = (permission: StorePermission, checked: boolean) => {
    setSelectedPermissions((current) => {
      if (checked) {
        return current.includes(permission)
          ? current
          : [...current, permission];
      }

      return current.filter((item) => item !== permission);
    });
  };

  const handleEditUser = async () => {
    if (!selectedUser || !canManagePermissions) return;

    setLoading(true);
    try {
      const roleResult = await updateStoreUserRole({
        userId: selectedUser.id,
        newRole: editRole,
      });

      if (roleResult.error) {
        toast.error(roleResult.error);
        return;
      }

      if (editRole === "ADMIN") {
        const permissionResult = await updateStoreUserPermissions({
          userId: selectedUser.id,
          permissions: selectedPermissions,
        });

        if (permissionResult.error) {
          toast.error(permissionResult.error);
          return;
        }
      }

      toast.success("Store access updated successfully");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: StoreUser) => {
    if (!canManagePermissions) {
      toast.error("You do not have permission to manage Store access");
      return;
    }

    if (user.id === currentUserId) {
      toast.error("You cannot remove your own Store access");
      return;
    }

    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const result = await unlinkUserFromStore(selectedUser.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User removed from Store successfully");
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: StoreUser) => {
    if (!canManagePermissions || user.id === currentUserId) {
      return;
    }

    setSelectedUser(user);
    setEditRole(user.store_role);
    setSelectedPermissions(user.permissions ?? []);
    setIsEditDialogOpen(true);
  };

  const canEditUser = (user: StoreUser) =>
    canManagePermissions && user.id !== currentUserId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Access Management</h1>
          <p className="text-muted-foreground">
            Manage Store users, roles, and fine-grained admin permissions.
          </p>
        </div>
        <div className="w-full md:w-auto">
          {canManagePermissions ? (
            <AddStoreUserDialog onUserAdded={() => router.refresh()} />
          ) : (
            <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Read-only access
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        {canManagePermissions
          ? "Use the Manage role & permissions button on any admin row to update Store access and feature permissions."
          : "You can review Store access here, but only admins with the permissions permission can change roles or assignments."}
      </div>

      <Card className="border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
          <CardTitle>Store Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Store Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No Store users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.store_role === "ADMIN"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.store_role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.store_role !== "ADMIN" ? (
                          <span className="text-sm text-muted-foreground">
                            Employee access only
                          </span>
                        ) : user.permissions.length === 0 ? (
                          <Badge variant="outline">Read-only admin</Badge>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {PERMISSION_OPTIONS.filter((option) =>
                              user.permissions.includes(option.key),
                            ).map((option) => (
                              <Badge key={option.key} variant="outline">
                                {option.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatStoreDateTime(user.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {canEditUser(user) ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              disabled={loading}
                              title="Manage role and permissions"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                              disabled={loading}
                              title="Remove Store access"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary">Read only</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Store Access</DialogTitle>
            <DialogDescription>
              Update the Store role and assigned permissions for this user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>User</Label>
                <div className="rounded border bg-muted p-3">
                  <div className="font-medium">{selectedUser.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editStoreRole">Store Role</Label>
                <Select
                  value={editRole}
                  onValueChange={(value) => setEditRole(value as StoreRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editRole === "ADMIN" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-base">Admin Permissions</Label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PERMISSION_OPTIONS.map((option) => (
                      <label
                        key={option.key}
                        className="flex items-start gap-3 rounded-md border p-3"
                      >
                        <Checkbox
                          checked={selectedPermissions.includes(option.key)}
                          onCheckedChange={(checked) =>
                            togglePermission(option.key, checked === true)
                          }
                        />
                        <div className="space-y-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Admins with no selected permissions stay read-only.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                  Standard Store users can view and use the employee-facing
                  Store flow without admin controls.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User from Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">{selectedUser?.full_name}</span> (
              {selectedUser?.email}) from the Store module? This user will no
              longer have Store access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Remove from Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
