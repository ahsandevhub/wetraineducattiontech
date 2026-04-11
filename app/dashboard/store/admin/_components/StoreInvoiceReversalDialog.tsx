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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type StoreInvoiceSummary = {
  id: string;
  user_name: string;
  total_amount: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: StoreInvoiceSummary | null;
  isSaving: boolean;
  onConfirm: (reason: string) => void;
};

export default function StoreInvoiceReversalDialog({
  open,
  onOpenChange,
  invoice,
  isSaving,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reverse Invoice</DialogTitle>
          <DialogDescription>
            This will restore the employee balance and stock through append-only
            reversal entries. The original invoice will remain in history.
          </DialogDescription>
        </DialogHeader>

        {invoice ? (
          <div className="space-y-4">
            <div className="rounded-md border bg-muted/30 p-4 text-sm">
              <div className="font-medium">{invoice.user_name}</div>
              <div className="text-muted-foreground">Invoice ID: {invoice.id}</div>
              <div className="mt-1 text-muted-foreground">
                Total: {invoice.total_amount.toFixed(2)} BDT
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-reversal-reason">Reason/Notes</Label>
              <Textarea
                id="invoice-reversal-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Optional context for this reversal"
                disabled={isSaving}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(reason)}
            disabled={isSaving || !invoice}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reversing...
              </>
            ) : (
              "Confirm Reversal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
