"use client";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

export type StoreOwnerPurchaseFormValues = {
  purchaseDate: string;
  monthKey: string;
  title: string;
  amount: string;
  vendor: string;
  note: string;
};

type StoreOwnerPurchaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMonth: string;
  isSaving: boolean;
  onSave: (values: StoreOwnerPurchaseFormValues) => void;
  initialValues?: StoreOwnerPurchaseFormValues;
  title?: string;
  description?: string;
  submitLabel?: string;
};

function buildInitialValues(
  defaultMonth: string,
  initialValues?: StoreOwnerPurchaseFormValues,
): StoreOwnerPurchaseFormValues {
  const monthValue = defaultMonth.slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);
  const purchaseDate = today.startsWith(monthValue)
    ? today
    : `${monthValue}-01`;

  return {
    purchaseDate: initialValues?.purchaseDate ?? purchaseDate,
    monthKey: initialValues?.monthKey ?? monthValue,
    title: initialValues?.title ?? "",
    amount: initialValues?.amount ?? "",
    vendor: initialValues?.vendor ?? "",
    note: initialValues?.note ?? "",
  };
}

export default function StoreOwnerPurchaseDialog({
  open,
  onOpenChange,
  defaultMonth,
  isSaving,
  onSave,
  initialValues,
  title = "Add Owner Purchase",
  description = "Record owner-level store costs separately from employee invoices and account ledgers.",
  submitLabel = "Save Purchase",
}: StoreOwnerPurchaseDialogProps) {
  const [values, setValues] = useState<StoreOwnerPurchaseFormValues>(
    buildInitialValues(defaultMonth, initialValues),
  );

  useEffect(() => {
    if (open) {
      setValues(buildInitialValues(defaultMonth, initialValues));
    }
  }, [open, defaultMonth, initialValues]);

  const reset = () =>
    setValues(buildInitialValues(defaultMonth, initialValues));

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(values);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="owner-purchase-title">Title / Purpose</Label>
            <Input
              id="owner-purchase-title"
              value={values.title}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Supplier payment, utility bill, office expense..."
              disabled={isSaving}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner-purchase-date">Purchase Date</Label>
              <Input
                id="owner-purchase-date"
                type="date"
                value={values.purchaseDate}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    purchaseDate: event.target.value,
                  }))
                }
                disabled={isSaving}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-purchase-month">Month</Label>
              <Input
                id="owner-purchase-month"
                type="month"
                value={values.monthKey}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    monthKey: event.target.value,
                  }))
                }
                disabled={isSaving}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner-purchase-amount">Amount</Label>
              <Input
                id="owner-purchase-amount"
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
            <div className="space-y-2">
              <Label htmlFor="owner-purchase-vendor">Vendor / Source</Label>
              <Input
                id="owner-purchase-vendor"
                value={values.vendor}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, vendor: event.target.value }))
                }
                placeholder="Optional vendor or source"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-purchase-note">Note</Label>
            <Textarea
              id="owner-purchase-note"
              value={values.note}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, note: event.target.value }))
              }
              placeholder="Optional context for this owner purchase"
              disabled={isSaving}
            />
          </div>

          <DialogFooter>
            <Button
              className="mt-3 sm:mt-0"
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
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
