"use client";

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
import { formatStoreDateTime } from "../../_lib/date-format";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { createStoreOwnerPurchase } from "../../_actions/owner-purchases";
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

type Props = {
  currentMonthKey: string;
  monthOptions: string[];
  entries: StoreOwnerPurchase[];
  monthClosures: StoreOwnerMonthClosure[];
};

function formatAmount(amount: number) {
  return `${amount.toFixed(2)} BDT`;
}

export function StoreOwnerPurchasesClient({
  currentMonthKey,
  monthOptions,
  entries,
  monthClosures,
}: Props) {
  const router = useRouter();
  const [monthFilter, setMonthFilter] = useState(currentMonthKey.slice(0, 7));
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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
      monthClosures.find((closure) => closure.month_key.startsWith(monthFilter)) ??
      null,
    [monthClosures, monthFilter],
  );

  const summary = useMemo(() => {
    const purchasesTotal = filteredEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0,
    );
    const openingAmount = selectedClosure?.opening_amount ?? 0;
    const closingAmount =
      selectedClosure?.status === "CLOSED"
        ? (selectedClosure.closing_amount ?? openingAmount + purchasesTotal)
        : openingAmount + purchasesTotal;

    return {
      openingAmount,
      purchasesTotal,
      closingAmount,
      count: filteredEntries.length,
    };
  }, [filteredEntries, selectedClosure]);

  const handleSave = async (values: StoreOwnerPurchaseFormValues) => {
    setSaving(true);
    try {
      const result = await createStoreOwnerPurchase(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Owner purchase recorded successfully");
      setDialogOpen(false);
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
        <Button onClick={() => setDialogOpen(true)}>Add Owner Purchase</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Opening Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(summary.openingAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(summary.purchasesTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedClosure?.status === "CLOSED"
                ? "Closing Amount"
                : "Projected Closing"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(summary.closingAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.count}</div>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
                        <TableCell className="font-medium">{entry.title}</TableCell>
                        <TableCell>{entry.vendor ?? "—"}</TableCell>
                        <TableCell className="max-w-[280px] truncate">
                          {entry.note ?? "—"}
                        </TableCell>
                        <TableCell>{entry.actor_name}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatAmount(entry.amount)}
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
        key={monthFilter}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultMonth={monthFilter}
        isSaving={saving}
        onSave={handleSave}
      />
    </div>
  );
}
