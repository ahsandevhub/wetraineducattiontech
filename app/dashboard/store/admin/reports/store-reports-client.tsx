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
import { useMemo, useState } from "react";

type ReportsData = {
  monthOptions: string[];
  invoices: Array<{
    id: string;
    user_id: string;
    month_key: string;
    total_amount: number;
    status: "CONFIRMED" | "REVERSED";
  }>;
  invoiceItems: Array<{
    invoice_id: string;
    product_id: string;
    quantity: number;
    line_total: number;
  }>;
  accountEntries: Array<{
    user_id: string;
    month_key: string;
    amount: number;
    category: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    is_active: boolean;
    on_hand: number;
  }>;
  productNames: Record<string, string>;
  monthClosures: Array<{
    id: string;
    month_key: string;
    status: "OPEN" | "CLOSED";
    opening_balance: number;
    closing_balance: number | null;
    closed_at: string | null;
    closed_by: string | null;
    note: string | null;
    closed_by_name: string | null;
  }>;
};

type Props = {
  data: ReportsData;
};

function formatAmount(amount: number) {
  return `${amount.toFixed(2)} BDT`;
}

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StoreReportsClient({ data }: Props) {
  const [monthFilter, setMonthFilter] = useState(
    data.monthOptions[0]?.slice(0, 7) ?? "",
  );
  const [search, setSearch] = useState("");

  const invoiceMap = useMemo(
    () => new Map(data.invoices.map((invoice) => [invoice.id, invoice])),
    [data.invoices],
  );
  const userMap = useMemo(
    () => new Map(data.users.map((user) => [user.id, user])),
    [data.users],
  );

  const filteredInvoices = useMemo(
    () =>
      data.invoices.filter(
        (invoice) => !monthFilter || invoice.month_key.startsWith(monthFilter),
      ),
    [data.invoices, monthFilter],
  );

  const filteredInvoiceIds = useMemo(
    () => new Set(filteredInvoices.map((invoice) => invoice.id)),
    [filteredInvoices],
  );

  const filteredItems = useMemo(
    () =>
      data.invoiceItems.filter((item) =>
        filteredInvoiceIds.has(item.invoice_id),
      ),
    [data.invoiceItems, filteredInvoiceIds],
  );

  const filteredAccountEntries = useMemo(
    () =>
      data.accountEntries.filter(
        (entry) => !monthFilter || entry.month_key.startsWith(monthFilter),
      ),
    [data.accountEntries, monthFilter],
  );

  const purchasesByEmployee = useMemo(() => {
    const totals = new Map<
      string,
      {
        user_id: string;
        name: string;
        email: string;
        invoice_count: number;
        total: number;
      }
    >();

    for (const invoice of filteredInvoices) {
      if (invoice.status !== "CONFIRMED") continue;
      const user = userMap.get(invoice.user_id);
      const current = totals.get(invoice.user_id) ?? {
        user_id: invoice.user_id,
        name: user?.name ?? "Unknown",
        email: user?.email ?? "Unknown",
        invoice_count: 0,
        total: 0,
      };

      current.invoice_count += 1;
      current.total += invoice.total_amount;
      totals.set(invoice.user_id, current);
    }

    return Array.from(totals.values())
      .map((row) => ({ ...row, total: Number(row.total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);
  }, [filteredInvoices, userMap]);

  const purchasesByProduct = useMemo(() => {
    const totals = new Map<
      string,
      { product_id: string; name: string; quantity: number; total: number }
    >();

    for (const item of filteredItems) {
      const invoice = invoiceMap.get(item.invoice_id);
      if (!invoice || invoice.status !== "CONFIRMED") continue;

      const current = totals.get(item.product_id) ?? {
        product_id: item.product_id,
        name: data.productNames[item.product_id] ?? "Unknown product",
        quantity: 0,
        total: 0,
      };

      current.quantity += item.quantity;
      current.total += item.line_total;
      totals.set(item.product_id, current);
    }

    return Array.from(totals.values())
      .map((row) => ({ ...row, total: Number(row.total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);
  }, [data.productNames, filteredItems, invoiceMap]);

  const ledgerByCategory = useMemo(() => {
    const totals = new Map<
      string,
      { category: string; credits: number; debits: number; net: number }
    >();

    for (const entry of filteredAccountEntries) {
      const current = totals.get(entry.category) ?? {
        category: entry.category,
        credits: 0,
        debits: 0,
        net: 0,
      };

      if (entry.amount > 0) {
        current.credits += entry.amount;
      } else {
        current.debits += Math.abs(entry.amount);
      }
      current.net += entry.amount;
      totals.set(entry.category, current);
    }

    return Array.from(totals.values())
      .map((row) => ({
        ...row,
        credits: Number(row.credits.toFixed(2)),
        debits: Number(row.debits.toFixed(2)),
        net: Number(row.net.toFixed(2)),
      }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }, [filteredAccountEntries]);

  const negativeBalances = useMemo(() => {
    const totals = new Map<string, number>();

    for (const entry of data.accountEntries) {
      totals.set(
        entry.user_id,
        (totals.get(entry.user_id) ?? 0) + entry.amount,
      );
    }

    return data.users
      .map((user) => ({
        user_id: user.id,
        name: user.name,
        email: user.email,
        balance: Number((totals.get(user.id) ?? 0).toFixed(2)),
      }))
      .filter((user) => user.balance < 0)
      .sort((a, b) => a.balance - b.balance);
  }, [data.accountEntries, data.users]);

  const filteredLowStock = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.products
      .filter((product) => product.on_hand <= 5)
      .filter((product) =>
        !query ? true : product.name.toLowerCase().includes(query),
      )
      .sort((a, b) => a.on_hand - b.on_hand);
  }, [data.products, search]);

  const selectedMonthClosure = useMemo(
    () =>
      data.monthClosures.find((closure) =>
        monthFilter ? closure.month_key.startsWith(monthFilter) : false,
      ) ?? null,
    [data.monthClosures, monthFilter],
  );

  const selectedMonthSummary = useMemo(() => {
    const entries = filteredAccountEntries;

    const reversalTotal = entries
      .filter((entry) => entry.category === "REVERSAL")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const correctionNet = entries
      .filter(
        (entry) =>
          entry.category === "CORRECTION" ||
          entry.category === "REFUND" ||
          entry.category === "PENALTY" ||
          entry.category === "BONUS_OR_REWARD",
      )
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      reversalTotal: Number(reversalTotal.toFixed(2)),
      correctionNet: Number(correctionNet.toFixed(2)),
      hasClosure: Boolean(selectedMonthClosure),
    };
  }, [filteredAccountEntries, selectedMonthClosure]);

  const summary = useMemo(
    () => ({
      sales: filteredInvoices
        .filter((invoice) => invoice.status === "CONFIRMED")
        .reduce((sum, invoice) => sum + invoice.total_amount, 0),
      invoices: filteredInvoices.filter(
        (invoice) => invoice.status === "CONFIRMED",
      ).length,
      itemsSold: purchasesByProduct.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
      lowStockCount: filteredLowStock.length,
    }),
    [filteredInvoices, filteredLowStock.length, purchasesByProduct],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Reports</h1>
          <p className="text-muted-foreground">
            Review sales, employee purchases, product demand, low stock,
            negative balances, and ledger activity by category.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            type="month"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
            className="md:w-44"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search low-stock products"
            className="md:w-72"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(summary.sales)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Confirmed Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.invoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.itemsSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.lowStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-3 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
            <CardTitle>Purchases By Employee</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchasesByEmployee.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No employee purchases found for this month
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchasesByEmployee.map((row) => (
                      <TableRow key={row.user_id}>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell className="text-right">
                          {row.invoice_count}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(row.total)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="space-y-3 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
            <CardTitle>Purchases By Product</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchasesByProduct.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No product sales found for this month
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchasesByProduct.map((row) => (
                      <TableRow key={row.product_id}>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(row.total)}
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-3 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-0 pb-0 sm:px-6 sm:pb-6">
            {filteredLowStock.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No low-stock products found.
              </div>
            ) : (
              filteredLowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <Badge
                    variant={product.on_hand <= 0 ? "destructive" : "secondary"}
                  >
                    {product.on_hand} left
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="space-y-3 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
            <CardTitle>Negative Balances</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {negativeBalances.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No negative balances right now
                      </TableCell>
                    </TableRow>
                  ) : (
                    negativeBalances.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatAmount(user.balance)}
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

      <Card className="space-y-3 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
          <CardTitle>Ledger Activity By Category</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Debits</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerByCategory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No ledger activity found for this month
                    </TableCell>
                  </TableRow>
                ) : (
                  ledgerByCategory.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell className="font-medium">
                        {formatCategory(row.category)}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600">
                        {formatAmount(row.credits)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatAmount(row.debits)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          row.net < 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {row.net > 0 ? "+" : ""}
                        {formatAmount(row.net)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-3 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
            <CardTitle>Month Closure Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0 sm:px-6 sm:pb-6">
            {selectedMonthClosure ? (
              <>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm text-muted-foreground">Month</span>
                  <Badge
                    variant={
                      selectedMonthClosure.status === "CLOSED"
                        ? "default"
                        : "outline"
                    }
                  >
                    {selectedMonthClosure.month_key.slice(0, 7)} ·{" "}
                    {selectedMonthClosure.status}
                  </Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      Opening Balance
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {formatAmount(selectedMonthClosure.opening_balance)}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      Closing Balance
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {selectedMonthClosure.closing_balance === null
                        ? "—"
                        : formatAmount(selectedMonthClosure.closing_balance)}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      Reversal Activity
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {selectedMonthSummary.reversalTotal > 0 ? "+" : ""}
                      {formatAmount(selectedMonthSummary.reversalTotal)}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      Adjustment Net
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {selectedMonthSummary.correctionNet > 0 ? "+" : ""}
                      {formatAmount(selectedMonthSummary.correctionNet)}
                    </div>
                  </div>
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <div className="text-muted-foreground">
                    Carry-forward to next month
                  </div>
                  <div className="mt-1 font-medium">
                    {selectedMonthClosure.closing_balance === null
                      ? "Not available until the month is closed"
                      : formatAmount(selectedMonthClosure.closing_balance)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Closed by: {selectedMonthClosure.closed_by_name ?? "—"}
                  {" · "}
                  Closed at:{" "}
                  {selectedMonthClosure.closed_at
                    ? new Date(selectedMonthClosure.closed_at).toLocaleString()
                    : "—"}
                </div>
                {selectedMonthClosure.note ? (
                  <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                    {selectedMonthClosure.note}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No month closure snapshot found for the selected month yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="space-y-3 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
            <CardTitle>Month Closure History</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Opening</TableHead>
                    <TableHead className="text-right">Closing</TableHead>
                    <TableHead>Closed By</TableHead>
                    <TableHead>Closed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.monthClosures.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No month closure history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.monthClosures.map((closure) => (
                      <TableRow key={closure.id}>
                        <TableCell className="font-medium">
                          {closure.month_key.slice(0, 7)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              closure.status === "CLOSED"
                                ? "default"
                                : "outline"
                            }
                          >
                            {closure.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(closure.opening_balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          {closure.closing_balance === null
                            ? "—"
                            : formatAmount(closure.closing_balance)}
                        </TableCell>
                        <TableCell>{closure.closed_by_name ?? "—"}</TableCell>
                        <TableCell>
                          {closure.closed_at
                            ? new Date(closure.closed_at).toLocaleString()
                            : "—"}
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
  );
}
