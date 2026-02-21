"use client";

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
import { Download, FileText, Filter, MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import CopyButton from "../../admin/_components/CopyButton";
import {
  formatCurrency,
  getStatusColor,
} from "../../admin/_components/formatters";
import TablePagination from "../../admin/_components/TablePagination";
import {
  generateInvoice,
  generateReceipt,
} from "../../admin/payments/pdfGenerator";
import type { CustomerPaymentRow, CustomerProfile } from "../types";

type CustomerPaymentsClientProps = {
  payments: CustomerPaymentRow[];
  profile: CustomerProfile;
};

export default function CustomerPaymentsClient({
  payments,
  profile,
}: CustomerPaymentsClientProps) {
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
    if (
      paymentStatusFilter &&
      payment.status.toLowerCase() !== paymentStatusFilter.toLowerCase()
    ) {
      return false;
    }

    if (
      paymentMethodFilter &&
      payment.method.toLowerCase() !== paymentMethodFilter.toLowerCase()
    ) {
      return false;
    }

    if (paymentSearch) {
      const query = paymentSearch.toLowerCase();
      return (
        payment.id.toLowerCase().includes(query) ||
        payment.reference.toLowerCase().includes(query) ||
        (payment.service && payment.service.toLowerCase().includes(query))
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

  const handleDownload = (
    payment: CustomerPaymentRow,
    type: "invoice" | "receipt",
  ) => {
    setDownloadingId(`${payment.id}-${type}`);
    try {
      const paymentData = {
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        service: payment.service,
        reference: payment.reference,
        created_at: payment.createdAt || new Date().toISOString(),
        profiles: {
          full_name: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          postal_code: profile.postalCode,
          country: profile.country,
        },
      };

      if (type === "invoice") {
        generateInvoice(paymentData);
      } else {
        generateReceipt(paymentData);
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      alert(`Failed to generate ${type}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const totalSpent = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter((p) => p.status === "paid").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and download your invoices and receipts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-gray-600">
              Total Payments
            </div>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {payments.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">All transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-gray-600">
              Paid Invoices
            </div>
            <Badge className="bg-green-100 text-green-800">{paidCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-gray-600">Pending</div>
            <Badge className="bg-yellow-100 text-yellow-800">
              {payments.filter((p) => p.status === "pending").length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                payments
                  .filter((p) => p.status === "pending")
                  .reduce((sum, p) => sum + p.amount, 0),
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by ID, reference, or service..."
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
                    Reference
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Service
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
                    <TableRow key={payment.id} className="hover:bg-primary-50">
                      <TableCell>
                        <CopyButton text={payment.id} />
                      </TableCell>
                      <TableCell>
                        <CopyButton
                          text={payment.reference}
                          truncateLength={20}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {payment.service || "—"}
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
                              onClick={() => handleDownload(payment, "invoice")}
                              disabled={
                                downloadingId === `${payment.id}-invoice`
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {downloadingId === `${payment.id}-invoice`
                                ? "Generating..."
                                : "Download Invoice"}
                            </DropdownMenuItem>
                            {payment.status === "paid" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDownload(payment, "receipt")
                                }
                                disabled={
                                  downloadingId === `${payment.id}-receipt`
                                }
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {downloadingId === `${payment.id}-receipt`
                                  ? "Generating..."
                                  : "Download Receipt"}
                              </DropdownMenuItem>
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
    </div>
  );
}
