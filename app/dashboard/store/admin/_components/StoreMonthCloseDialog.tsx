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
import { Loader2 } from "lucide-react";
import { useState } from "react";

export type StoreMonthCloseFormValues = {
  monthKey: string;
  note: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  initialMonthKey: string;
  onSave: (values: StoreMonthCloseFormValues) => void;
};

export default function StoreMonthCloseDialog({
  open,
  onOpenChange,
  isSaving,
  initialMonthKey,
  onSave,
}: Props) {
  const [values, setValues] = useState<StoreMonthCloseFormValues>({
    monthKey: initialMonthKey,
    note: "",
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          setValues({ monthKey: initialMonthKey, note: "" });
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Close Store Month</DialogTitle>
          <DialogDescription>
            Closing a month freezes new postings into that month and carries the
            closing balance forward as the next month&apos;s opening snapshot.
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
            <Label htmlFor="store-close-month">Month</Label>
            <Input
              id="store-close-month"
              type="month"
              value={values.monthKey}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, monthKey: event.target.value }))
              }
              disabled={isSaving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-close-note">Note</Label>
            <Textarea
              id="store-close-note"
              value={values.note}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, note: event.target.value }))
              }
              placeholder="Optional month-end note for future reference"
              disabled={isSaving}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                "Close Month"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
