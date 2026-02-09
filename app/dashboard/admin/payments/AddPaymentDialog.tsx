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
import { Input } from "@/components/ui/input";
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

type Customer = { id: string; fullName: string; email: string };

type AddPaymentDialogProps = {
  customers: Array<Customer>;
  onPaymentAdded: () => void;
};

export default function AddPaymentDialog({
  customers,
  onPaymentAdded,
}: AddPaymentDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    method: "",
    status: "pending",
    service: "",
    reference: "",
  });

  // Get selected customer for display
  const selectedCustomer = customers.find((c) => c.id === formData.userId);

  // Search customers
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/admin/customers/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Reset search when popover closes
  useEffect(() => {
    if (!customerOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [customerOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.userId) {
      toast.error("Please select a customer");
      return;
    }

    if (!formData.amount) {
      toast.error("Please enter an amount");
      return;
    }

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }

    if (!formData.method) {
      toast.error("Please select a payment method");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            amount: parsedAmount,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Payment record created successfully");
          setDialogOpen(false);
          setFormData({
            userId: "",
            amount: "",
            method: "",
            status: "pending",
            service: "",
            reference: "",
          });
          onPaymentAdded();
        } else {
          // Show specific error message from API
          const errorMessage = data.error || "Failed to create payment";
          if (data.code === "PGRST204") {
            toast.error(
              "Database not initialized. Please run the migration in Supabase.",
              { duration: 5000 },
            );
          } else if (data.code === "42501") {
            toast.error(
              "RLS Policy Error: Please disable RLS on payments table in Supabase. See FIX_RLS_POLICY.md",
              { duration: 6000 },
            );
          } else {
            toast.error(errorMessage, { duration: 4000 });
          }
        }
      } catch (error) {
        console.error("Error creating payment:", error);
        toast.error("Network error. Please check your connection.");
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Payment Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Searchable Customer Combobox */}
          <div className="space-y-2">
            <Label htmlFor="customer">
              Customer <span className="text-red-500">*</span>
            </Label>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerOpen}
                  className="w-full justify-between"
                >
                  {selectedCustomer
                    ? `${selectedCustomer.fullName} (${selectedCustomer.email})`
                    : "Select customer..."}
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
                  {!isSearching &&
                    searchQuery.trim() &&
                    searchResults.length === 0 && (
                      <CommandEmpty>No customer found.</CommandEmpty>
                    )}
                  <CommandList>
                    {isSearching && (
                      <div className="p-2 text-center text-sm text-gray-500">
                        Searching...
                      </div>
                    )}
                    {!isSearching &&
                      searchResults.map((customer) => (
                        <div
                          key={customer.id}
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              userId: customer.id,
                            });
                            setCustomerOpen(false);
                          }}
                          role="option"
                          aria-selected={formData.userId === customer.id}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.userId === customer.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {customer.fullName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Service Input */}
          <div className="space-y-2">
            <Label htmlFor="service">
              Service <span className="text-gray-500">(Optional)</span>
            </Label>
            <Input
              id="service"
              value={formData.service}
              onChange={(e) =>
                setFormData({ ...formData, service: e.target.value })
              }
              placeholder="e.g., Web Development Course"
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (৳) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              required
            />
          </div>

          {/* Payment Method Select */}
          <div className="space-y-2">
            <Label htmlFor="method">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.method}
              onValueChange={(value) =>
                setFormData({ ...formData, method: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="rocket">Rocket</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference Input */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              placeholder="Transaction ID or reference"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
