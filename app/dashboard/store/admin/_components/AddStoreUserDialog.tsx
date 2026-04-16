"use client";

import type { StorePermission } from "@/app/utils/auth/roles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { linkUserToStore } from "../../_actions/users";

type User = { id: string; fullName: string; email: string };
type StoreRole = "USER" | "ADMIN";

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

export default function AddStoreUserDialog({
  onUserAdded,
}: {
  onUserAdded: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    role: "USER" as StoreRole,
    permissions: [] as StorePermission[],
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/auth/users/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!userOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [userOpen]);

  const togglePermission = (permission: StorePermission, checked: boolean) => {
    setFormData((current) => ({
      ...current,
      permissions: checked
        ? current.permissions.includes(permission)
          ? current.permissions
          : [...current.permissions, permission]
        : current.permissions.filter((item) => item !== permission),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId) {
      toast.error("Please select a user");
      return;
    }

    startTransition(async () => {
      const result = await linkUserToStore({
        userId: formData.userId,
        role: formData.role,
        permissions: formData.role === "ADMIN" ? formData.permissions : [],
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User added to Store");
        setDialogOpen(false);
        setFormData({ userId: "", role: "USER", permissions: [] });
        setSelectedUser(null);
        onUserAdded();
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add User to Store</DialogTitle>
          <DialogDescription>
            Choose a Store role, then assign feature permissions for admins.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Search User <span className="text-red-500">*</span>
            </Label>
            <Popover open={userOpen} onOpenChange={setUserOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={userOpen}
                  className="w-full justify-between"
                >
                  {selectedUser
                    ? `${selectedUser.fullName} (${selectedUser.email})`
                    : "Select user..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search by name or email..."
                    className="h-9"
                    value={searchQuery}
                    onValueChange={handleSearch}
                  />
                  <CommandList>
                    {isSearching && (
                      <div className="p-2 text-center text-xs text-gray-500">
                        Searching...
                      </div>
                    )}
                    {!isSearching &&
                      searchQuery.trim() &&
                      searchResults.length === 0 && (
                        <CommandEmpty>No user found.</CommandEmpty>
                      )}
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => {
                          setFormData({ ...formData, userId: user.id });
                          setSelectedUser(user);
                          setUserOpen(false);
                        }}
                        role="option"
                        aria-selected={formData.userId === user.id}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.userId === user.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{user.fullName}</span>
                          <span className="text-xs text-gray-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>
              Store Role <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Select Admin to reveal the permission checklist below.
            </p>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((current) => ({
                  ...current,
                  role: value as StoreRole,
                  permissions: value === "ADMIN" ? current.permissions : [],
                }))
              }
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

          {formData.role === "ADMIN" ? (
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base">Admin Permissions</Label>
              </div>
              <div className="grid gap-3">
                {PERMISSION_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <Checkbox
                      checked={formData.permissions.includes(option.key)}
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
                Leave all options unchecked to create a read-only Store admin.
              </p>
            </div>
          ) : null}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Adding..." : "Add User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
