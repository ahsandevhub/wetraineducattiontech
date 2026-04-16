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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createStoreOwnerPurchase,
  deleteStoreOwnerPurchase,
  updateStoreOwnerPurchase,
} from "../../_actions/owner-purchases";
import { formatStoreDateTime } from "../../_lib/date-format";
import StoreOwnerPurchaseDialog, {
  type StoreOwnerPurchaseFormValues,
} from "../_components/StoreOwnerPurchaseDialog";

type StoreOwnerPurchase = {
  id: string;
  purchase_date: string;
  month_key: string;
  title: string;
  amount: number;
  vendor: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  actor_name: string;
};

type StoreOwnerMonthClosure = {
  id: string;
  month_key: string;
  status: "OPEN" | "CLOSED";
  opening_amount: number;
  closing_amount: number | null;
  closed_at: string | null;
  closed_by: string | null;
  note: string | null;
  closed_by_name: string | null;
};

type StoreOwnerMonthlySales = {
  month_key: string;
  total_amount: number;
};

type Props = {
  currentMonthKey: string;
  monthOptions: string[];
  entries: StoreOwnerPurchase[];
  salesByMonth: StoreOwnerMonthlySales[];
  stockValuation: number;
  monthClosures: StoreOwnerMonthClosure[];
  canManageOwnerPurchases: boolean;
};

function formatAmount(amount: number) {
  return `${amount.toFixed(2)} BDT`;
}

export function StoreOwnerPurchasesClient({
  currentMonthKey,
  monthOptions,
  entries,
  salesByMonth,
  stockValuation,
  monthClosures,
  canManageOwnerPurchases,
}: Props) {
  const router = useRouter();
  const [monthFilter, setMonthFilter] = useState(currentMonthKey.slice(0, 7));
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StoreOwnerPurchase | null>(
    null,
  );
  const [deletingEntry, setDeletingEntry] = useState<StoreOwnerPurchase | null>(
    null,
  );

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return entries.filter((entry) => {
      if (monthFilter && !entry.month_key.startsWith(monthFilter)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        entry.title.toLowerCase().includes(query) ||
        (entry.vendor ?? "").toLowerCase().includes(query) ||
        (entry.note ?? "").toLowerCase().includes(query) ||
        entry.actor_name.toLowerCase().includes(query)
      );
    });
  }, [entries, monthFilter, search]);

  const selectedClosure = useMemo(
    () =>
      monthClosures.find((closure) =>
        closure.month_key.startsWith(monthFilter),
      ) ?? null,
    [monthClosures, monthFilter],
  );

  const summary = useMemo(() => {
    const purchasesTotal = filteredEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0,
    );
    const salesAmount =
      salesByMonth.find((row) => row.month_key.startsWith(monthFilter))
        ?.total_amount ?? 0;
    const openingAmount = selectedClosure?.opening_amount ?? 0;
    const closingAmount =
      selectedClosure?.status === "CLOSED"
        ? (selectedClosure.closing_amount ?? openingAmount + purchasesTotal)
        : openingAmount + purchasesTotal;

    return {
      openingAmount,
      purchasesTotal,
      salesAmount,
      closingAmount,
      count: filteredEntries.length,
    };
  }, [filteredEntries, monthFilter, salesByMonth, selectedClosure]);

  const handleSave = async (values: StoreOwnerPurchaseFormValues) => {
    setSaving(true);
    try {
      const result = editingEntry
        ? await updateStoreOwnerPurchase(editingEntry.id, values)
        : await createStoreOwnerPurchase(values);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        editingEntry
          ? "Owner purchase updated successfully"
          : "Owner purchase recorded successfully",
      );
      setDialogOpen(false);
      setEditingEntry(null);
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry: StoreOwnerPurchase) => {
    setSaving(true);
    try {
      const result = await deleteStoreOwnerPurchase(entry.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Owner purchase deleted successfully");
      if (editingEntry?.id === entry.id) {
        setDialogOpen(false);
        setEditingEntry(null);
      }
      setDeletingEntry(null);
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Owner Purchases</h1>
          <p className="text-muted-foreground">
            Track owner-level store costs separately from employee purchases,
            invoices, stock, and balance ledgers.
          </p>
        </div>
        {canManageOwnerPurchases ? (
          <Button
            onClick={() => {
              setEditingEntry(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Owner Purchase
          </Button>
        ) : (
          <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
            Read-only access
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Purchases Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(summary.purchasesTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Owner purchase records for the selected month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sales Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(summary.salesAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmed Store invoice sales for the selected month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Stock Valuation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(stockValuation)}
            </div>
            <p className="text-xs text-muted-foreground">
              Live stock on hand valued at current selling price
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
            <CardTitle>Purchase History</CardTitle>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                type="month"
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
                list="owner-purchase-months"
                className="md:w-44"
              />
              <datalist id="owner-purchase-months">
                {monthOptions.map((monthKey) => (
                  <option key={monthKey} value={monthKey.slice(0, 7)} />
                ))}
              </datalist>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, vendor, note, or actor"
                className="md:w-80"
              />
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No owner purchases found for the current filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>{entry.purchase_date}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatStoreDateTime(entry.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.title}
                        </TableCell>
                        <TableCell>{entry.vendor ?? "—"}</TableCell>
                        <TableCell className="max-w-[280px] truncate">
                          {entry.note ?? "—"}
                        </TableCell>
                        <TableCell>{entry.actor_name}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatAmount(entry.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {canManageOwnerPurchases ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setEditingEntry(entry);
                                  setDialogOpen(true);
                                }}
                                disabled={saving}
                                title="Edit purchase"
                                aria-label="Edit purchase"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={() => setDeletingEntry(entry)}
                                disabled={saving}
                                title="Delete purchase"
                                aria-label="Delete purchase"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Read only
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
            <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
              <CardTitle>Month Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0 pb-0 sm:px-6 sm:pb-6">
              <div className="rounded-md border p-4">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="mt-1 font-medium">
                  {selectedClosure?.status ?? "OPEN"}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Opening</div>
                  <div className="mt-1 text-lg font-semibold">
                    {formatAmount(summary.openingAmount)}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Closing</div>
                  <div className="mt-1 text-lg font-semibold">
                    {formatAmount(summary.closingAmount)}
                  </div>
                </div>
              </div>
              <div className="rounded-md border p-3 text-sm text-muted-foreground">
                {selectedClosure?.closed_at ? (
                  <>
                    Closed by {selectedClosure.closed_by_name ?? "Unknown"} on{" "}
                    {formatStoreDateTime(selectedClosure.closed_at)}
                  </>
                ) : (
                  "This month is still open. Closing will forward the closing amount into the next month opening."
                )}
              </div>
              {selectedClosure?.note ? (
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                  {selectedClosure.note}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
            <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
              <CardTitle>Month History</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Opening</TableHead>
                      <TableHead className="text-right">Closing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthClosures.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No month history found yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      monthClosures.map((closure) => (
                        <TableRow key={closure.id}>
                          <TableCell className="font-medium">
                            {closure.month_key.slice(0, 7)}
                          </TableCell>
                          <TableCell>{closure.status}</TableCell>
                          <TableCell className="text-right">
                            {formatAmount(closure.opening_amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {closure.closing_amount === null
                              ? "—"
                              : formatAmount(closure.closing_amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <StoreOwnerPurchaseDialog
        key={editingEntry?.id ?? monthFilter}
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen);
          if (!nextOpen) {
            setEditingEntry(null);
          }
        }}
        defaultMonth={editingEntry?.month_key ?? monthFilter}
        isSaving={saving}
        onSave={handleSave}
        initialValues={
          editingEntry
            ? {
                purchaseDate: editingEntry.purchase_date,
                monthKey: editingEntry.month_key.slice(0, 7),
                title: editingEntry.title,
                amount: String(editingEntry.amount),
                vendor: editingEntry.vendor ?? "",
                note: editingEntry.note ?? "",
              }
            : undefined
        }
        title={editingEntry ? "Edit Owner Purchase" : "Add Owner Purchase"}
        description={
          editingEntry
            ? "Update this owner purchase record or adjust its month and amount."
            : "Record owner-level store costs separately from employee invoices and account ledgers."
        }
        submitLabel={editingEntry ? "Update Purchase" : "Save Purchase"}
      />

      <AlertDialog
        open={Boolean(deletingEntry)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingEntry(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete owner purchase?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingEntry
                ? `This will permanently remove \"${deletingEntry.title}\". This action cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingEntry && handleDelete(deletingEntry)}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
