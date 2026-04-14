"use client";

import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { CheckCheck, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { formatStoreDateTime } from "../_lib/date-format";

type StorePurchaseItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name: string;
};

type StorePurchaseInvoice = {
  id: string;
  invoice_date: string;
  month_key: string;
  status: "CONFIRMED" | "REVERSED";
  total_amount: number;
  confirmed_at: string;
  items: StorePurchaseItem[];
};

type Props = {
  invoices: StorePurchaseInvoice[];
};

export function StorePurchasesClient({ invoices }: Props) {
  const [monthFilter, setMonthFilter] = useState("");
  const [search, setSearch] = useState("");

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      if (monthFilter && !invoice.month_key.startsWith(monthFilter)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        invoice.id.toLowerCase().includes(query) ||
        invoice.items.some((item) =>
          item.product_name.toLowerCase().includes(query),
        )
      );
    });
  }, [invoices, monthFilter, search]);

  const totalSpent = filteredInvoices.reduce(
    (sum, invoice) =>
      invoice.status === "CONFIRMED" ? sum + invoice.total_amount : sum,
    0,
  );

  const getInvoiceStatusUi = (status: StorePurchaseInvoice["status"]) => {
    if (status === "CONFIRMED") {
      return {
        icon: CheckCheck,
        label: "Confirmed",
        className: "border-emerald-300 bg-emerald-500/10 text-emerald-700",
      };
    }

    return {
      icon: RotateCcw,
      label: "Reversed",
      className: "border-red-200 bg-red-500/10 text-red-700",
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Purchases</h1>
        <p className="text-muted-foreground">
          Review your Store invoices and the items included in each purchase.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSpent.toFixed(2)} BDT
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items Bought</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredInvoices.reduce(
                (sum, invoice) =>
                  sum +
                  invoice.items.reduce(
                    (itemSum, item) => itemSum + item.quantity,
                    0,
                  ),
                0,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="space-y-5 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
          <CardTitle>Purchase History</CardTitle>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="w-full md:w-44"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice or product"
              className="w-full md:w-72"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-0 pb-0 sm:px-6 sm:pb-6">
          {filteredInvoices.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No purchases found for the current filter.
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <details
                key={invoice.id}
                className={cn(
                  "rounded-md overflow-hidden border bg-gray-50",
                  invoice.status === "CONFIRMED"
                    ? "border-emerald-200"
                    : "border-red-200",
                )}
              >
                <summary
                  className={cn(
                    "cursor-pointer list-none p-4",
                    invoice.status === "CONFIRMED"
                      ? "bg-emerald-50 border-emerald-400"
                      : "bg-red-50 border-red-300",
                  )}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                    <div>
                      {(() => {
                        const statusUi = getInvoiceStatusUi(invoice.status);
                        const StatusIcon = statusUi.icon;

                        return (
                          <Badge
                            variant="outline"
                            className={cn(
                              "mb-2 inline-flex items-center gap-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em]",
                              statusUi.className,
                            )}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusUi.label}
                          </Badge>
                        );
                      })()}
                      <div className="font-medium">
                        {formatStoreDateTime(invoice.confirmed_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {invoice.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="md:text-right">
                        <div className="font-medium">
                          {invoice.total_amount.toFixed(2)} BDT
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {invoice.items.length} item
                          {invoice.items.length === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>
                  </div>
                </summary>

                <div className="border-t p-4">
                  <div className="mb-3 text-sm text-muted-foreground">
                    Confirmed {formatStoreDateTime(invoice.confirmed_at)}
                  </div>
                  <div className="overflow-x-auto rounded-md border">
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
    </div>
  );
}
