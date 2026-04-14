"use client";

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
import { formatStoreDateTime } from "../../_lib/date-format";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  unlinkUserFromStore,
  updateStoreUserRole,
} from "../../_actions/users";
import AddStoreUserDialog from "../_components/AddStoreUserDialog";

type StoreRole = "USER" | "ADMIN";

type StoreUser = {
  id: string;
  full_name: string;
  email: string;
  store_role: StoreRole;
  created_at: string;
};

interface StoreEmployeesClientProps {
  users: StoreUser[];
  currentUserId: string;
}

export function StoreEmployeesClient({
  users: initialUsers,
  currentUserId,
}: StoreEmployeesClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers ?? []);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [editRole, setEditRole] = useState<StoreRole>("USER");

  useEffect(() => {
    setUsers(initialUsers ?? []);
  }, [initialUsers]);

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const result = await updateStoreUserRole({
        userId: selectedUser.id,
        newRole: editRole,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Store role updated successfully");
        setIsEditDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: StoreUser) => {
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
    setSelectedUser(user);
    setEditRole(user.store_role);
    setIsEditDialogOpen(true);
  };

  const canEditUser = (user: StoreUser) => user.id !== currentUserId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Access Management</h1>
          <p className="text-muted-foreground">
            Manage Store users and their Store roles independently from other
            modules.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <AddStoreUserDialog onUserAdded={() => router.refresh()} />
        </div>
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
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
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
                            user.store_role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.store_role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatStoreDateTime(user.created_at)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          disabled={loading || !canEditUser(user)}
                          className={!canEditUser(user) ? "opacity-50" : ""}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          disabled={loading || !canEditUser(user)}
                          className={!canEditUser(user) ? "opacity-50" : ""}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store Role</DialogTitle>
            <DialogDescription>Update user Store access role</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User</Label>
                <div className="rounded border bg-muted p-2">
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
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove from Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
