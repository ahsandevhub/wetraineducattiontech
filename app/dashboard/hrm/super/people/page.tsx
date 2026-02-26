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
import { Edit, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  getAllHRMUsers,
  unlinkUserFromHRM,
  updateHRMUserRole,
} from "../_actions/users";
import AddHRMUserDialog from "../_components/AddHRMUserDialog";

type HrmRole = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";

type HrmUser = {
  id: string;
  full_name: string;
  email: string;
  hrm_role: HrmRole;
  created_at: string;
};

export default function PeoplePage() {
  const [users, setUsers] = useState<HrmUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<HrmUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit user form (role only)
  const [editForm, setEditForm] = useState({
    hrmRole: "EMPLOYEE" as HrmRole,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllHRMUsers();
      if (result.error) {
        toast.error(result.error);
      } else {
        setUsers(result.data || []);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch users";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const result = await updateHRMUserRole({
        userId: selectedUser.id,
        newRole: editForm.hrmRole,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User role updated successfully");
        setIsEditDialogOpen(false);
        fetchUsers();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = (user: HrmUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const result = await unlinkUserFromHRM(selectedUser.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User removed from HRM successfully");
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (user: HrmUser) => {
    setSelectedUser(user);
    setEditForm({
      hrmRole: user.hrm_role,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">People Management</h1>
          <p className="text-muted-foreground">
            Manage HRM user roles and permissions
          </p>
        </div>
        <AddHRMUserDialog onUserAdded={fetchUsers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HRM Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
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
                        No users found
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
                              user.hrm_role === "SUPER_ADMIN" ||
                              user.hrm_role === "ADMIN"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user.hrm_role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            disabled={actionLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={actionLoading}
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
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>Update user HRM role</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User</Label>
                <div className="p-2 border rounded bg-muted">
                  <div className="font-medium">{selectedUser.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">HRM Role</Label>
                <Select
                  value={editForm.hrmRole}
                  onValueChange={(value: HrmRole) =>
                    setEditForm({ hrmRole: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User from HRM</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">{selectedUser?.full_name}</span> (
              {selectedUser?.email}) from HRM? This user will no longer have
              access to the HRM system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remove from HRM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
