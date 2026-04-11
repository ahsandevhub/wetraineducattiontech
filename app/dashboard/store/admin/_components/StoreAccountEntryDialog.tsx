"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";

type StoreAccountCategory =
  | "MONTHLY_ALLOCATION"
  | "EMPLOYEE_PAYMENT"
  | "PURCHASE"
  | "REFUND"
  | "REVERSAL"
  | "CORRECTION"
  | "PENALTY"
  | "BONUS_OR_REWARD"
  | "OTHER";

type AccountEntryDirection = "CREDIT" | "DEBIT";

type StoreUserOption = {
  id: string;
  full_name: string;
  email: string;
  current_balance: number;
};

export type StoreAccountEntryFormValues = {
  userId: string;
  amount: string;
  direction: AccountEntryDirection;
  category: StoreAccountCategory;
  reason: string;
  entryDate: string;
  monthKey: string;
};

type StoreAccountEntryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: StoreUserOption[];
  categories: StoreAccountCategory[];
  isSaving: boolean;
  onSave: (values: StoreAccountEntryFormValues) => void;
};

const today = new Date().toISOString().slice(0, 10);
const thisMonth = today.slice(0, 7);

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StoreAccountEntryDialog({
  open,
  onOpenChange,
  users,
  categories,
  isSaving,
  onSave,
}: StoreAccountEntryDialogProps) {
  const initialValues = useMemo<StoreAccountEntryFormValues>(
    () => ({
      userId: "",
      amount: "",
      direction: "CREDIT",
      category: "MONTHLY_ALLOCATION",
      reason: "",
      entryDate: today,
      monthKey: thisMonth,
    }),
    [],
  );

  const [values, setValues] = useState(initialValues);

  const reset = () => setValues(initialValues);

  const selectedUser = users.find((user) => user.id === values.userId);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <WalletCards className="mr-2 h-4 w-4" />
          Add Balance Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Account Entry</DialogTitle>
          <DialogDescription>
            Add or deduct employee balance with a category and optional notes.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(values);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="account-user">Employee</Label>
            <Select
              value={values.userId}
              onValueChange={(value) =>
                setValues((prev) => ({ ...prev, userId: value }))
              }
              disabled={isSaving}
            >
              <SelectTrigger id="account-user">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUser ? (
              <p className="text-xs text-muted-foreground">
                Current balance: {selectedUser.current_balance.toFixed(2)} BDT
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-direction">Direction</Label>
              <Select
                value={values.direction}
                onValueChange={(value) =>
                  setValues((prev) => ({
                    ...prev,
                    direction: value as AccountEntryDirection,
                  }))
                }
                disabled={isSaving}
              >
                <SelectTrigger id="account-direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-amount">Amount</Label>
              <Input
                id="account-amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={values.amount}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="0.00"
                disabled={isSaving}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-category">Category</Label>
            <Select
              value={values.category}
              onValueChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  category: value as StoreAccountCategory,
                }))
              }
              disabled={isSaving}
            >
              <SelectTrigger id="account-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {formatCategory(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-entry-date">Effective Date</Label>
              <Input
                id="account-entry-date"
                type="date"
                value={values.entryDate}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, entryDate: event.target.value }))
                }
                disabled={isSaving}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-month">Effective Month</Label>
              <Input
                id="account-month"
                type="month"
                value={values.monthKey}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, monthKey: event.target.value }))
                }
                disabled={isSaving}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-reason">Reason/Notes</Label>
            <Textarea
              id="account-reason"
              value={values.reason}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, reason: event.target.value }))
              }
              placeholder="Optional context for this balance entry"
              disabled={isSaving}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
