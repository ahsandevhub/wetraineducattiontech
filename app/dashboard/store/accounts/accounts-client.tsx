"use client";

import { Badge } from "@/components/ui/badge";
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

type StoreAccountHistoryEntry = {
  id: string;
  entry_date: string;
  month_key: string;
  amount: number;
  category: StoreAccountCategory;
  reason: string;
  invoice_id: string | null;
  created_at: string;
};

type Props = {
  currentBalance: number;
  entries: StoreAccountHistoryEntry[];
  categories: StoreAccountCategory[];
};

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StoreAccountsClient({
  currentBalance,
  entries,
  categories,
}: Props) {
  const [monthFilter, setMonthFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return entries.filter((entry) => {
      if (monthFilter && !entry.month_key.startsWith(monthFilter)) {
        return false;
      }

      if (categoryFilter !== "all" && entry.category !== categoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        entry.reason.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query) ||
        (entry.invoice_id ?? "").toLowerCase().includes(query)
      );
    });
  }, [categoryFilter, entries, monthFilter, search]);

  const totalCredits = filteredEntries
    .filter((entry) => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const totalDebits = filteredEntries
    .filter((entry) => entry.amount < 0)
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Account</h1>
        <p className="text-muted-foreground">
          Review your balance history and see why each entry was added or
          deducted.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                currentBalance < 0
                  ? "text-red-600"
                  : currentBalance > 0
                    ? "text-emerald-600"
                    : ""
              }`}
            >
              {currentBalance.toFixed(2)} BDT
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {totalCredits.toFixed(2)} BDT
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalDebits.toFixed(2)} BDT
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="space-y-5 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
          <CardTitle>Account Ledger</CardTitle>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="w-full md:w-44"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {formatCategory(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reason or invoice"
              className="w-full md:w-72"
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Reference</TableHead>
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
                      No account entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatCategory(entry.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate">
                        {entry.reason}
                      </TableCell>
                      <TableCell>{entry.month_key}</TableCell>
                      <TableCell>{entry.invoice_id ?? "—"}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          entry.amount < 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {entry.amount.toFixed(2)} BDT
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
  );
}
