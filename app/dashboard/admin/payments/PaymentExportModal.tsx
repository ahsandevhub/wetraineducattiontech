"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ExportModal, type ExportFilters } from "../_components/ExportModal";
import { convertToCSV, downloadCSV } from "../_components/exportUtils";
import type { AdminPaymentRow } from "../types";

export interface PaymentExportModalProps {
  payments: AdminPaymentRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentExportModal({
  payments,
  open,
  onOpenChange,
}: PaymentExportModalProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (filters: ExportFilters) => {
    try {
      setIsExporting(true);

      // Filter payments based on date range and selected filters
      const filteredPayments = payments.filter((payment) => {
        const paymentDate = new Date(payment.createdAt || "");

        // Date range filter
        if (paymentDate < filters.startDate || paymentDate > filters.endDate) {
          return false;
        }

        // Status filter
        if (statusFilter !== null && payment.status !== statusFilter) {
          return false;
        }

        // Method filter
        if (methodFilter !== null && payment.method !== methodFilter) {
          return false;
        }

        return true;
      });

      // Convert to CSV
      const columns: (keyof AdminPaymentRow)[] = [
        "id",
        "customerName",
        "customerEmail",
        "amount",
        "method",
        "status",
        "createdAt",
      ];

      const csv = convertToCSV(filteredPayments, columns);

      // Generate filename with date range
      const startDate = filters.startDate.toISOString().split("T")[0];
      const endDate = filters.endDate.toISOString().split("T")[0];
      const filename = `payments_${startDate}_${endDate}.csv`;

      // Download
      downloadCSV(csv, filename);

      onOpenChange(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ExportModal
      open={open}
      title="Export Payments"
      description="Select filters and date range to export payment data"
      onClose={() => onOpenChange(false)}
      onExport={handleExport}
      isLoading={isExporting}
    >
      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status Filter</label>
        <Select
          value={statusFilter || ""}
          onValueChange={(val) => setStatusFilter(val || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Method Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Payment Method Filter</label>
        <Select
          value={methodFilter || ""}
          onValueChange={(val) => setMethodFilter(val || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Methods" />
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
    </ExportModal>
  );
}
