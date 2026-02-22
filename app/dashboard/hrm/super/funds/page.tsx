"use client";

import { EmptyState } from "@/components/hrm/EmptyState";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Coins, Pencil, Trash2, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type FundEntry = {
  id: string;
  entry_type: "FINE" | "BONUS";
  status: "DUE" | "COLLECTED" | "PAID";
  expected_amount: number;
  actual_amount: number | null;
  note: string | null;
  marked_at: string | null;
  created_at: string;
  month: { month_key: string } | null;
  subject: { id: string; full_name: string; email: string } | null;
};

type Summary = {
  fineCollected: number;
  bonusPaid: number;
  dueFine: number;
  dueBonus: number;
  currentBalance: number;
};

export default function FundManagementPage() {
  const [entries, setEntries] = useState<FundEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthKey, setMonthKey] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState<Summary>({
    fineCollected: 0,
    bonusPaid: 0,
    dueFine: 0,
    dueBonus: 0,
    currentBalance: 0,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FundEntry | null>(null);
  const [editStatus, setEditStatus] = useState<"DUE" | "COLLECTED" | "PAID">(
    "DUE",
  );
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<FundEntry | null>(null);

  const hasRows = entries.length > 0;

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, statusFilter, typeFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (monthKey) params.set("monthKey", monthKey);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("entryType", typeFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/hrm/super/funds?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load fund logs");

      setEntries(data.entries || []);
      setSummary(data.summary || summary);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load fund logs";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((entry) => {
      const name = entry.subject?.full_name?.toLowerCase() || "";
      const email = entry.subject?.email?.toLowerCase() || "";
      return name.includes(q) || email.includes(q);
    });
  }, [entries, search]);

  const openEditDialog = (entry: FundEntry) => {
    setEditTarget(entry);
    setEditStatus(entry.status);
    setEditAmount(entry.actual_amount ? String(entry.actual_amount) : "");
    setEditNote(entry.note || "");
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editTarget) return;

    if (editTarget.entry_type === "BONUS" && editStatus === "PAID") {
      const amount = Number(editAmount);
      if (!amount || amount <= 0) {
        toast.error("Paid amount is required for bonus");
        return;
      }
    }

    try {
      const res = await fetch(`/api/hrm/super/funds/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          actualAmount: editStatus === "PAID" ? Number(editAmount) : undefined,
          note: editNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update entry");

      toast.success("Fund log updated");
      setEditOpen(false);
      setEditTarget(null);
      fetchLogs();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update entry";
      toast.error(message);
    }
  };

  const deleteEntry = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/hrm/super/funds/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete entry");

      toast.success("Fund log deleted");
      setDeleteTarget(null);
      fetchLogs();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete entry";
      toast.error(message);
    }
  };

  const getStatusBadge = (entry: FundEntry) => {
    if (entry.entry_type === "FINE") {
      return entry.status === "COLLECTED" ? (
        <Badge className="bg-green-600">Collected</Badge>
      ) : (
        <Badge variant="secondary">Due</Badge>
      );
    }

    return entry.status === "PAID" ? (
      <Badge className="bg-green-600">Paid</Badge>
    ) : (
      <Badge variant="secondary">Due</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fund Management</h1>
        <p className="text-muted-foreground">
          Track fine collection, bonus payments, and current HRM fund balance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{summary.currentBalance}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fine Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ৳{summary.fineCollected}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bonus Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ৳{summary.bonusPaid}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fine Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{summary.dueFine}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bonus Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{summary.dueBonus}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Fund Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              type="month"
              value={monthKey}
              onChange={(e) => setMonthKey(e.target.value)}
              className="w-44"
            />
            <Input
              placeholder="Search name/email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FINE">Fine</SelectItem>
                <SelectItem value="BONUS">Bonus</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DUE">Due</SelectItem>
                <SelectItem value="COLLECTED">Collected</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchLogs}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground py-6">
              Loading logs...
            </div>
          ) : !hasRows ? (
            <EmptyState
              icon={Coins}
              title="No fund logs"
              description="Use Monthly Report actions to create due/collected/paid entries."
            />
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Marked At</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.month?.month_key || "—"}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {entry.subject?.full_name || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.subject?.email || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.entry_type === "FINE"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {entry.entry_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(entry)}</TableCell>
                      <TableCell>৳{entry.expected_amount}</TableCell>
                      <TableCell>
                        {entry.actual_amount != null
                          ? `৳${entry.actual_amount}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {entry.marked_at
                          ? new Date(entry.marked_at).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell
                        className="max-w-[220px] truncate"
                        title={entry.note || ""}
                      >
                        {entry.note || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => setDeleteTarget(entry)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fund Log</DialogTitle>
          </DialogHeader>

          {editTarget && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {editTarget.subject?.full_name} • {editTarget.entry_type}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(v) =>
                    setEditStatus(v as "DUE" | "COLLECTED" | "PAID")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DUE">Due</SelectItem>
                    {editTarget.entry_type === "FINE" ? (
                      <SelectItem value="COLLECTED">Collected</SelectItem>
                    ) : (
                      <SelectItem value="PAID">Paid</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {editTarget.entry_type === "BONUS" && editStatus === "PAID" && (
                <div className="space-y-2">
                  <Label>Paid Amount</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="Enter paid amount"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Note</Label>
                <Input
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Optional note"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitEdit}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete log entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected fund log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEntry}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
