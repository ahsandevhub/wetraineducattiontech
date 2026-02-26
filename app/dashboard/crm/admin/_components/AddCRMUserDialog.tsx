"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
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
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { linkUserToCRM } from "../../_actions/users";

type User = { id: string; fullName: string; email: string };

export default function AddCRMUserDialog({
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
    role: "MARKETER" as "ADMIN" | "MARKETER",
  });

  const selectedUser = searchResults.find((u) => u.id === formData.userId);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId) {
      toast.error("Please select a user");
      return;
    }

    startTransition(async () => {
      const result = await linkUserToCRM({
        userId: formData.userId,
        crmRole: formData.role,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User added to CRM");
        setDialogOpen(false);
        setFormData({ userId: "", role: "MARKETER" });
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add User to CRM</DialogTitle>
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
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => {
                          setFormData({ ...formData, userId: user.id });
                          setUserOpen(false);
                        }}
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
              CRM Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  role: value as "ADMIN" | "MARKETER",
                })
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

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Adding..." : "Add User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
