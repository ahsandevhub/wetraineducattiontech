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
import { Input } from "@/components/ui/input";
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
import {
  Edit,
  Loader2,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
  updateUser,
} from "../../_actions/users";
import AdminPageHeader from "../../_components/AdminPageHeader";
import type { CrmUser } from "../../_types";

type UserRole = "ADMIN" | "MARKETER";

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  crmRole: UserRole;
}

interface UsersPageClientProps {
  users: CrmUser[];
  currentUserId: string;
}

export function UsersPageClient({
  users: initialUsers,
  currentUserId,
}: UsersPageClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<CrmUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync users state when initialUsers changes (after router.refresh())
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Create user form
  const [createForm, setCreateForm] = useState<CreateUserData>({
    email: "",
    password: "",
    fullName: "",
    crmRole: "MARKETER",
  });

  // Edit user form
  const [editForm, setEditForm] = useState({
    fullName: "",
    crmRole: "MARKETER" as UserRole,
  });

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password || !createForm.fullName) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await createUser(createForm);
      setLoading(false);

      if (result.error) {
        console.error("Create user error:", result.error);
        toast.error(result.error);
      } else {
        toast.success("User created successfully");
        setIsCreateDialogOpen(false);
        setCreateForm({
          email: "",
          password: "",
          fullName: "",
          crmRole: "MARKETER",
        });
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const result = await updateUser(selectedUser.id, {
        fullName: editForm.fullName,
        role: editForm.crmRole,
      });
      setLoading(false);

      if (result.error) {
        console.error("Update user error:", result.error);
        toast.error(result.error);
      } else {
        toast.success("User updated successfully");
        setIsEditDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleDeleteUser = (userId: string) => {
    // Prevent deleting own account
    if (userId === currentUserId) {
      toast.error("You cannot delete your own account");
      return;
    }

    setSelectedUser(users.find((u) => u.id === userId) || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const result = await deleteUser(selectedUser.id);
      setLoading(false);

      if (result.error) {
        console.error("Delete user error:", result.error);
        toast.error(result.error);
      } else {
        toast.success("User deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setLoading(true);
    try {
      const result = await toggleUserStatus(userId);
      setLoading(false);

      if (result.error) {
        console.error("Toggle status error:", result.error);
        toast.error(result.error);
      } else {
        toast.success("User status updated");
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !resetPasswordValue) {
      toast.error("Enter a password");
      return;
    }

    setLoading(true);
    try {
      const result = await resetUserPassword(
        selectedUser.id,
        resetPasswordValue,
      );
      setLoading(false);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password reset successfully");
        setIsResetDialogOpen(false);
        setResetPasswordValue("");
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const openEditDialog = (user: CrmUser) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.full_name || "",
      crmRole: user.crm_role,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        description="Manage users and their roles"
        action={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.crm_role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.crm_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={loading}
                      >
                        {user.is_active ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={
                          loading || user.auth_user_id === currentUserId
                        }
                        className={
                          user.auth_user_id === currentUserId
                            ? "opacity-50"
                            : ""
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setResetPasswordValue("");
                          setIsResetDialogOpen(true);
                        }}
                        disabled={loading}
                      >
                        Reset
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={createForm.fullName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, fullName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="john@wetrain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={createForm.crmRole}
                onValueChange={(value: UserRole) =>
                  setCreateForm({ ...createForm, crmRole: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKETER">Marketer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select
                  value={editForm.crmRole}
                  onValueChange={(value: UserRole) =>
                    setEditForm({ ...editForm, crmRole: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKETER">Marketer</SelectItem>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser?.email}</span>? This
              action cannot be undone. All associated data will be permanently
              removed.
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
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
