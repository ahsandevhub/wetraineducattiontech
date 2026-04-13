"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { reverseStoreInvoice } from "../../_actions/invoices";
import StoreInvoiceReversalDialog from "../_components/StoreInvoiceReversalDialog";

type StoreAdminInvoiceItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name: string;
};

type StoreAdminInvoice = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  invoice_date: string;
  month_key: string;
  status: "CONFIRMED" | "REVERSED";
  total_amount: number;
  confirmed_at: string;
  reversed_at: string | null;
  reversed_by: string | null;
  reversed_by_name: string | null;
  reversal_reason: string | null;
  items: StoreAdminInvoiceItem[];
};

type Props = {
  invoices: StoreAdminInvoice[];
};

function formatStatus(status: StoreAdminInvoice["status"]) {
  return status === "REVERSED" ? "Reversed" : "Confirmed";
}

export function StoreAdminInvoicesClient({ invoices }: Props) {
  const router = useRouter();
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "CONFIRMED" | "REVERSED"
  >("all");
  const [search, setSearch] = useState("");
  const [savingInvoiceId, setSavingInvoiceId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] =
    useState<StoreAdminInvoice | null>(null);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      if (monthFilter && !invoice.month_key.startsWith(monthFilter)) {
        return false;
      }

      if (statusFilter !== "all" && invoice.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        invoice.id.toLowerCase().includes(query) ||
        invoice.user_name.toLowerCase().includes(query) ||
        invoice.user_email.toLowerCase().includes(query) ||
        invoice.items.some((item) =>
          item.product_name.toLowerCase().includes(query),
        )
      );
    });
  }, [invoices, monthFilter, search, statusFilter]);

  const summary = useMemo(
    () => ({
      confirmedCount: invoices.filter(
        (invoice) => invoice.status === "CONFIRMED",
      ).length,
      reversedCount: invoices.filter((invoice) => invoice.status === "REVERSED")
        .length,
      totalSales: invoices
        .filter((invoice) => invoice.status === "CONFIRMED")
        .reduce((sum, invoice) => sum + invoice.total_amount, 0),
    }),
    [invoices],
  );

  const handleReverse = async (reason: string) => {
    if (!selectedInvoice) {
      return;
    }

    setSavingInvoiceId(selectedInvoice.id);

    try {
      const result = await reverseStoreInvoice({
        invoiceId: selectedInvoice.id,
        reason,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Invoice reversed successfully");
      setSelectedInvoice(null);
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSavingInvoiceId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Invoices</h1>
          <p className="text-muted-foreground">
            Review confirmed invoices and reverse them safely through
            append-only account and stock entries.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Confirmed Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.confirmedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Reversed Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.reversedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Confirmed Sales Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalSales.toFixed(2)} BDT
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
          <CardTitle>Invoice History</CardTitle>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="md:w-44"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "CONFIRMED" | "REVERSED")
              }
            >
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="REVERSED">Reversed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice, employee, or product"
              className="md:w-80"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-0 pb-0 sm:px-6 sm:pb-6">
          {filteredInvoices.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No invoices found for the current filter.
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <details key={invoice.id} className="rounded-md border">
                <summary className="cursor-pointer list-none p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium">{invoice.user_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {invoice.user_email}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Invoice ID: {invoice.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          invoice.status === "REVERSED"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {formatStatus(invoice.status)}
                      </Badge>
                      <div className="text-right">
                        <div className="font-medium">
                          {invoice.total_amount.toFixed(2)} BDT
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </summary>

                <div className="space-y-4 border-t p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-muted-foreground">
                      Confirmed{" "}
                      {new Date(invoice.confirmed_at).toLocaleString()}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                      disabled={
                        invoice.status === "REVERSED" ||
                        savingInvoiceId === invoice.id
                      }
                    >
                      Reverse Invoice
                    </Button>
                  </div>

                  {invoice.status === "REVERSED" ? (
                    <div className="rounded-md border bg-muted/30 p-4 text-sm">
                      <div className="font-medium">
                        Reversed{" "}
                        {invoice.reversed_at
                          ? new Date(invoice.reversed_at).toLocaleString()
                          : "previously"}
                      </div>
                      <div className="text-muted-foreground">
                        By: {invoice.reversed_by_name ?? "Unknown"}
                      </div>
                      <div className="mt-2 text-muted-foreground">
                        Reason: {invoice.reversal_reason ?? "—"}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border bg-amber-50/60 p-4 text-sm text-amber-900">
                      Confirmed invoices are immutable. If there is a mistake,
                      reverse the invoice instead of editing or deleting it.
                    </div>
                  )}

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead className="text-right">
                            Line Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.product_name}
                            </TableCell>
                            <TableCell>
                              {item.unit_price.toFixed(2)} BDT
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {item.line_total.toFixed(2)} BDT
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </details>
            ))
          )}
        </CardContent>
      </Card>

      <StoreInvoiceReversalDialog
        key={selectedInvoice?.id ?? "no-invoice-selected"}
        open={Boolean(selectedInvoice)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedInvoice(null);
          }
        }}
        invoice={
          selectedInvoice
            ? {
                id: selectedInvoice.id,
                user_name: selectedInvoice.user_name,
                total_amount: selectedInvoice.total_amount,
              }
            : null
        }
        isSaving={Boolean(savingInvoiceId)}
        onConfirm={handleReverse}
      />
    </div>
  );
}
