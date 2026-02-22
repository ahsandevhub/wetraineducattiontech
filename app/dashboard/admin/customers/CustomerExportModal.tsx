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
import type { AdminCustomerRow } from "../types";

export interface CustomerExportModalProps {
  customers: AdminCustomerRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerExportModal({
  customers,
  open,
  onOpenChange,
}: CustomerExportModalProps) {
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (filters: ExportFilters) => {
    try {
      setIsExporting(true);

      // Filter customers based on date range and selected filters
      const filteredCustomers = customers.filter((customer) => {
        const customerDate = new Date(customer.createdAt || "");

        // Date range filter
        if (
          customerDate < filters.startDate ||
          customerDate > filters.endDate
        ) {
          return false;
        }

        // Role filter
        if (roleFilter !== null && customer.role !== roleFilter) {
          return false;
        }

        return true;
      });

      // Convert to CSV
      const columns: (keyof AdminCustomerRow)[] = [
        "id",
        "fullName",
        "email",
        "phone",
        "address",
        "city",
        "state",
        "postalCode",
        "country",
        "role",
        "createdAt",
      ];

      const csv = convertToCSV(filteredCustomers, columns);

      // Generate filename with date range
      const startDate = filters.startDate.toISOString().split("T")[0];
      const endDate = filters.endDate.toISOString().split("T")[0];
      const filename = `customers_${startDate}_${endDate}.csv`;

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
      title="Export Customers"
      description="Select filters and date range to export customer data"
      onClose={() => onOpenChange(false)}
      onExport={handleExport}
      isLoading={isExporting}
    >
      {/* Role Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Role Filter</label>
        <Select
          value={roleFilter || ""}
          onValueChange={(val) => setRoleFilter(val || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </ExportModal>
  );
}
