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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { unlinkUserFromCRM, updateCRMUserRole } from "../../_actions/users";
import AdminPageHeader from "../../_components/AdminPageHeader";
import type { CrmUser } from "../../_types";
import AddCRMUserDialog from "../_components/AddCRMUserDialog";

type UserRole = "ADMIN" | "MARKETER";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CrmUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync users state when initialUsers changes (after router.refresh())
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Edit user form (role only)
  const [editForm, setEditForm] = useState({
    crmRole: "MARKETER" as UserRole,
  });

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const result = await updateCRMUserRole(selectedUser.id, editForm.crmRole);
      setLoading(false);

      if (result.error) {
        console.error("Update user error:", result.error);
        toast.error(result.error);
      } else {
        toast.success("User role updated successfully");
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
    // Prevent removing own account
    if (userId === currentUserId) {
      toast.error("You cannot remove yourself from CRM");
      return;
    }

    setSelectedUser(users.find((u) => u.id === userId) || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const result = await unlinkUserFromCRM(selectedUser.id);
      setLoading(false);

      if (result.error) {
        console.error("Remove user error:", result.error);
        toast.error(result.error);
      } else {
        toast.success("User removed from CRM successfully");
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

  const openEditDialog = (user: CrmUser) => {
    setSelectedUser(user);
    setEditForm({
      crmRole: user.crm_role,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        description="Manage users and their roles"
        action={<AddCRMUserDialog onUserAdded={() => router.refresh()} />}
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
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={loading || user.id === currentUserId}
                        className={
                          user.id === currentUserId ? "opacity-50" : ""
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>Update user CRM role</DialogDescription>
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
                <Label htmlFor="editRole">CRM Role</Label>
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
            <AlertDialogTitle>Remove User from CRM</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">{selectedUser?.full_name}</span> (
              {selectedUser?.email}) from CRM? This user will no longer have
              access to the CRM system.
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
              Remove from CRM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
