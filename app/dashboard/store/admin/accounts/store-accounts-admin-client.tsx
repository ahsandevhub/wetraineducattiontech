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
import { createStoreAccountEntry } from "../../_actions/accounts";
import { closeStoreMonth } from "../../_actions/month-closures";
import StoreAccountEntryDialog, {
  type StoreAccountEntryFormValues,
} from "../_components/StoreAccountEntryDialog";
import StoreMonthCloseDialog, {
  type StoreMonthCloseFormValues,
} from "../_components/StoreMonthCloseDialog";

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

type StoreUser = {
  id: string;
  full_name: string;
  email: string;
  store_role: "USER" | "ADMIN";
  current_balance: number;
};

type StoreEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  month_key: string;
  amount: number;
  category: StoreAccountCategory;
  reason: string;
  invoice_id: string | null;
  reversed_from_entry_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  actor_name: string;
};

type Summary = {
  totalBalance: number;
  positiveBalanceCount: number;
  negativeBalanceCount: number;
};

type StoreMonthClosure = {
  id: string;
  month_key: string;
  status: "OPEN" | "CLOSED";
  opening_balance: number;
  closing_balance: number | null;
  closed_at: string | null;
  closed_by: string | null;
  note: string | null;
  closed_by_name: string | null;
};

type Props = {
  users: StoreUser[];
  entries: StoreEntry[];
  categories: StoreAccountCategory[];
  summary: Summary;
  monthClosures: StoreMonthClosure[];
};

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatAmount(amount: number) {
  return `${amount > 0 ? "+" : ""}${amount.toFixed(2)} BDT`;
}

export function StoreAccountsAdminClient({
  users,
  entries,
  categories,
  summary,
  monthClosures,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [monthCloseLoading, setMonthCloseLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [monthCloseOpen, setMonthCloseOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const currentMonth = new Date().toISOString().slice(0, 7);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return entries.filter((entry) => {
      if (categoryFilter !== "all" && entry.category !== categoryFilter) {
        return false;
      }

      if (userFilter !== "all" && entry.user_id !== userFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        entry.user_name.toLowerCase().includes(query) ||
        entry.user_email.toLowerCase().includes(query) ||
        entry.reason.toLowerCase().includes(query) ||
        entry.actor_name.toLowerCase().includes(query)
      );
    });
  }, [categoryFilter, entries, search, userFilter]);

  const handleSave = async (values: StoreAccountEntryFormValues) => {
    setLoading(true);
    try {
      const result = await createStoreAccountEntry(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Account entry added successfully");
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthClose = async (values: StoreMonthCloseFormValues) => {
    setMonthCloseLoading(true);
    try {
      const result = await closeStoreMonth(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Store month closed successfully");
      setMonthCloseOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setMonthCloseLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Accounts</h1>
          <p className="text-muted-foreground">
            Add manual credits or debits and review employee balance history.
          </p>
        </div>
        <StoreAccountEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          users={users}
          categories={categories}
          isSaving={loading}
          onSave={handleSave}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalBalance.toFixed(2)} BDT
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Positive Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.positiveBalanceCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Negative Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.negativeBalanceCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="flex flex-col gap-3 px-0 pt-0 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <CardTitle>Month Closures</CardTitle>
            <p className="text-sm text-muted-foreground">
              Closing a month freezes new postings there and snapshots the net
              closing balance into the next month&apos;s opening balance.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setMonthCloseOpen(true)}
            className="w-full sm:w-auto sm:shrink-0"
          >
            Close Month
          </Button>
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
                  <TableHead>Closed By</TableHead>
                  <TableHead>Closed At</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthClosures.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No month snapshots have been created yet
                    </TableCell>
                  </TableRow>
                ) : (
                  monthClosures.map((closure) => (
                    <TableRow key={closure.id}>
                      <TableCell>{closure.month_key.slice(0, 7)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            closure.status === "CLOSED" ? "default" : "outline"
                          }
                        >
                          {closure.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {closure.opening_balance.toFixed(2)} BDT
                      </TableCell>
                      <TableCell className="text-right">
                        {closure.closing_balance === null
                          ? "—"
                          : `${closure.closing_balance.toFixed(2)} BDT`}
                      </TableCell>
                      <TableCell>{closure.closed_by_name ?? "—"}</TableCell>
                      <TableCell>
                        {closure.closed_at
                          ? new Date(closure.closed_at).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        {closure.note ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
          <CardTitle>Employee Balances</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Store Role</TableHead>
                  <TableHead className="text-right">Current Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No Store users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.store_role === "ADMIN"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.store_role}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          user.current_balance < 0
                            ? "text-red-600"
                            : user.current_balance > 0
                              ? "text-emerald-600"
                              : ""
                        }`}
                      >
                        {user.current_balance.toFixed(2)} BDT
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
          <CardTitle>Ledger Entries</CardTitle>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee, reason, or actor"
              className="w-full md:w-72"
            />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No ledger entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{entry.user_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.user_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatCategory(entry.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate">
                        {entry.reason}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.invoice_id
                          ? `Invoice: ${entry.invoice_id}`
                          : entry.reversed_from_entry_id
                            ? `Reversal of: ${entry.reversed_from_entry_id}`
                            : "—"}
                      </TableCell>
                      <TableCell>{entry.month_key}</TableCell>
                      <TableCell>{entry.actor_name}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          entry.amount < 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
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

      <StoreMonthCloseDialog
        open={monthCloseOpen}
        onOpenChange={setMonthCloseOpen}
        isSaving={monthCloseLoading}
        initialMonthKey={currentMonth}
        onSave={handleMonthClose}
      />
    </div>
  );
}
