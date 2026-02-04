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
import type { AdminOrderRow } from "../types";

export interface OrderExportModalProps {
  orders: AdminOrderRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderExportModal({
  orders,
  open,
  onOpenChange,
}: OrderExportModalProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (filters: ExportFilters) => {
    try {
      setIsExporting(true);

      // Filter orders based on date range and selected filters
      const filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt || "");

        // Date range filter
        if (orderDate < filters.startDate || orderDate > filters.endDate) {
          return false;
        }

        // Status filter
        if (statusFilter !== null && order.status !== statusFilter) {
          return false;
        }

        return true;
      });

      // Convert to CSV
      const columns: (keyof AdminOrderRow)[] = [
        "id",
        "customerName",
        "customerEmail",
        "packageName",
        "amount",
        "status",
        "createdAt",
      ];

      const csv = convertToCSV(filteredOrders, columns);

      // Generate filename with date range
      const startDate = filters.startDate.toISOString().split("T")[0];
      const endDate = filters.endDate.toISOString().split("T")[0];
      const filename = `orders_${startDate}_${endDate}.csv`;

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
      title="Export Orders"
      description="Select filters and date range to export order data"
      onClose={() => onOpenChange(false)}
      onExport={handleExport}
      isLoading={isExporting}
    >
      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status Filter</label>
        <Select
          value={statusFilter || "all"}
          onValueChange={(val) => setStatusFilter(val === "all" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </ExportModal>
  );
}
