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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  CheckCircle,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import CopyButton from "../_components/CopyButton";
import { formatCurrency, getStatusColor } from "../_components/formatters";
import TablePagination from "../_components/TablePagination";
import { rejectPayment } from "../actions";
import type { AdminPaymentRow } from "../types";
import AddPaymentDialog from "./AddPaymentDialog";
import { PaymentExportModal } from "./PaymentExportModal";
import { PaymentViewDialog } from "./PaymentViewDialog";

type PaymentsClientProps = {
  payments: AdminPaymentRow[];
  customers: Array<{ id: string; fullName: string; email: string }>;
  updatePaymentStatus: (id: string, status: string) => Promise<void>;
};

export default function PaymentsClient({
  payments,
  customers,
  updatePaymentStatus,
}: PaymentsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const paymentStatusFilter = searchParams.get("paymentStatus") ?? "";
  const paymentMethodFilter = searchParams.get("paymentMethod") ?? "";
  const paymentSearch = searchParams.get("paymentSearch") ?? "";
  const paymentPage = parseInt(searchParams.get("paymentPage") ?? "1");
  const paymentRowsPerPage = parseInt(
    searchParams.get("paymentRowsPerPage") ?? "10",
  );

  const [searchValue, setSearchValue] = useState(paymentSearch);
  const [viewingPayment, setViewingPayment] = useState<AdminPaymentRow | null>(
    null,
  );
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    id: string;
    type: "paid" | "reject";
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "paid" | "reject";
    paymentId: string;
  }>({ open: false, type: "paid", paymentId: "" });

  const updateParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  useEffect(() => {
    setSearchValue(paymentSearch);
  }, [paymentSearch]);

  // Debounce search with 400ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === paymentSearch) return;
      updateParams({
        paymentSearch: searchValue || null,
        paymentPage: 1,
      });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, paymentSearch, updateParams]);

  const filteredPayments = payments.filter((payment) => {
    // Status filter
    if (
      paymentStatusFilter &&
      payment.status.toLowerCase() !== paymentStatusFilter.toLowerCase()
    ) {
      return false;
    }

    // Method filter
    if (
      paymentMethodFilter &&
      payment.method.toLowerCase() !== paymentMethodFilter.toLowerCase()
    ) {
      return false;
    }

    // Search filter
    if (paymentSearch) {
      const query = paymentSearch.toLowerCase();
      return (
        payment.id.toLowerCase().includes(query) ||
        payment.customerName.toLowerCase().includes(query) ||
        payment.customerEmail.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const startIndex = (paymentPage - 1) * paymentRowsPerPage;
  const paginated = filteredPayments.slice(
    startIndex,
    startIndex + paymentRowsPerPage,
  );
  const totalPages = Math.ceil(filteredPayments.length / paymentRowsPerPage);

  const handleMarkPaid = async (paymentId: string) => {
    setActionLoading({ id: paymentId, type: "paid" });
    setConfirmDialog({ open: false, type: "paid", paymentId: "" });
    startTransition(async () => {
      try {
        await updatePaymentStatus(paymentId, "paid");
        toast.success("Payment marked as paid");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to mark payment as paid",
        );
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleRejectPayment = async (paymentId: string) => {
    setActionLoading({ id: paymentId, type: "reject" });
    setConfirmDialog({ open: false, type: "reject", paymentId: "" });
    startTransition(async () => {
      try {
        await rejectPayment(paymentId);
        toast.success("Payment rejected");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to reject payment",
        );
      } finally {
        setActionLoading(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <AddPaymentDialog
            customers={customers}
            onPaymentAdded={() => router.refresh()}
          />
          <Button onClick={() => setExportModalOpen(true)}>Export</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by ID, name, or email..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select
                value={paymentStatusFilter || "all"}
                onValueChange={(value) =>
                  updateParams({
                    paymentStatus: value === "all" ? null : value,
                    paymentPage: 1,
                  })
                }
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={paymentMethodFilter || "all"}
                onValueChange={(value) =>
                  updateParams({
                    paymentMethod: value === "all" ? null : value,
                    paymentPage: 1,
                  })
                }
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="rocket">Rocket</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">
                    Payment ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Customer Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Customer Email
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Method
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50">
                      <TableCell>
                        <CopyButton text={payment.id} />
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">
                        {payment.customerName}
                      </TableCell>
                      <TableCell>
                        <CopyButton
                          text={payment.customerEmail}
                          truncateLength={20}
                        />
                      </TableCell>
                      <TableCell className="text-gray-900 font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-gray-600 capitalize">
                        {payment.method}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setViewingPayment(payment)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {payment.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  disabled={
                                    isPending ||
                                    (actionLoading?.id === payment.id &&
                                      actionLoading.type === "paid")
                                  }
                                  onClick={() =>
                                    setConfirmDialog({
                                      open: true,
                                      type: "paid",
                                      paymentId: payment.id,
                                    })
                                  }
                                >
                                  {actionLoading?.id === payment.id &&
                                  actionLoading.type === "paid" ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                      Mark as Paid
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setConfirmDialog({
                                      open: true,
                                      type: "reject",
                                      paymentId: payment.id,
                                    })
                                  }
                                  disabled={
                                    isPending ||
                                    (actionLoading?.id === payment.id &&
                                      actionLoading.type === "reject")
                                  }
                                >
                                  {actionLoading?.id === payment.id &&
                                  actionLoading.type === "reject" ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                      Reject
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={paymentPage}
            totalPages={totalPages}
            rowsPerPage={paymentRowsPerPage}
            totalRows={filteredPayments.length}
            onPageChange={(page) => updateParams({ paymentPage: page })}
            onRowsPerPageChange={(rows) =>
              updateParams({ paymentRowsPerPage: rows, paymentPage: 1 })
            }
          />
        </CardContent>
      </Card>

      {/* Payment View Dialog */}
      <PaymentViewDialog
        payment={viewingPayment}
        open={!!viewingPayment}
        onOpenChange={(open) => !open && setViewingPayment(null)}
        onMarkPaid={handleMarkPaid}
        onRejectPayment={handleRejectPayment}
      />

      {/* Export Modal */}
      <PaymentExportModal
        payments={filteredPayments}
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
      />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "paid"
                ? "Confirm Payment"
                : "Reject Payment"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "paid"
                ? "Are you sure you want to mark this payment as paid? This action will update the payment status."
                : "Are you sure you want to reject this payment? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.type === "paid") {
                  handleMarkPaid(confirmDialog.paymentId);
                } else {
                  handleRejectPayment(confirmDialog.paymentId);
                }
              }}
              className={
                confirmDialog.type === "paid"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {confirmDialog.type === "paid" ? "Confirm" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
