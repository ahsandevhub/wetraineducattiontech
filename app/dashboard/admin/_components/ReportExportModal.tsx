"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { toast } from "react-hot-toast";
import type {
  AdminCustomerRow,
  AdminOrderRow,
  AdminPaymentRow,
} from "../types";
import {
  DATE_RANGE_PRESETS,
  getEndOfDayUTC,
  getStartOfDayUTC,
} from "./dateUtils";
import { convertToCSV, downloadCSV } from "./exportUtils";

interface ReportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: AdminCustomerRow[];
  payments: AdminPaymentRow[];
  orders: AdminOrderRow[];
}

export function ReportExportModal({
  open,
  onOpenChange,
  customers,
  payments,
  orders,
}: ReportExportModalProps) {
  const [selectedItems, setSelectedItems] = useState({
    customers: true,
    revenue: true,
    orders: true,
    failedPayments: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  // Get current month start and end as default
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: getStartOfDayUTC(currentMonthStart),
    to: getEndOfDayUTC(currentMonthEnd),
  });

  const handleQuickSelect = (
    preset: "last7Days" | "last30Days" | "last3Months",
  ) => {
    const range = DATE_RANGE_PRESETS[preset]();
    setDate({ from: range.start, to: range.end });
  };

  const handleToggle = (key: keyof typeof selectedItems) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExport = async () => {
    if (!date?.from || !date?.to) {
      toast.error("Please select a date range");
      return;
    }

    try {
      setIsExporting(true);

      const reportData: Record<string, string> = {};

      // Generate report summary
      const startDate = date.from;
      const endDate = date.to;
      const monthName = startDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      reportData["Report Generated"] = new Date().toLocaleString();
      reportData["Report Period"] =
        `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      reportData[""] = "";

      // Customers
      if (selectedItems.customers) {
        reportData["Total Customers"] = customers.length.toString();
        const periodCustomers = customers.filter((c) => {
          if (!c.createdAt) return false;
          const customerDate = new Date(c.createdAt);
          return customerDate >= startDate && customerDate <= endDate;
        });
        reportData["New Customers in Period"] =
          periodCustomers.length.toString();
      }

      // Revenue
      if (selectedItems.revenue) {
        const paidPayments = payments.filter(
          (p) =>
            p.status === "paid" &&
            new Date(p.createdAt || "") >= startDate &&
            new Date(p.createdAt || "") <= endDate,
        );
        const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        reportData[""] = "";
        reportData["Total Revenue"] = totalRevenue.toLocaleString();
        reportData["Paid Transactions"] = paidPayments.length.toString();
      }

      // Orders
      if (selectedItems.orders) {
        const periodOrders = orders.filter((o) => {
          if (!o.createdAt) return false;
          const orderDate = new Date(o.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
        const totalOrderRevenue = periodOrders.reduce(
          (sum, o) => sum + o.amount,
          0,
        );
        reportData[""] = "";
        reportData["Total Orders"] = periodOrders.length.toString();
        reportData["Order Revenue"] = totalOrderRevenue.toLocaleString();
      }

      // Failed Payments
      if (selectedItems.failedPayments) {
        const failedPayments = payments.filter(
          (p) =>
            p.status === "failed" &&
            new Date(p.createdAt || "") >= startDate &&
            new Date(p.createdAt || "") <= endDate,
        );
        const failedAmount = failedPayments.reduce(
          (sum, p) => sum + p.amount,
          0,
        );
        reportData[""] = "";
        reportData["Failed Payments"] = failedPayments.length.toString();
        reportData["Failed Payment Amount"] = failedAmount.toLocaleString();
      }

      // Convert to CSV
      type ReportRow = { Metric: string; Value: string };
      const csvData: ReportRow[] = Object.entries(reportData).map(
        ([key, value]) => ({ Metric: key, Value: value }),
      );

      const csv = convertToCSV<ReportRow>(csvData, [
        "Metric",
        "Value",
      ] as (keyof ReportRow)[]);
      const filename = `report_${monthName.replace(" ", "_")}_${new Date().toISOString().split("T")[0]}.csv`;

      downloadCSV(csv, filename);
      toast.success("Report exported successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to export report");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Select what to include in your report for the current month
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="customers"
                checked={selectedItems.customers}
                onCheckedChange={() => handleToggle("customers")}
              />
              <label
                htmlFor="customers"
                className="text-sm font-medium cursor-pointer"
              >
                Customer Data
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="revenue"
                checked={selectedItems.revenue}
                onCheckedChange={() => handleToggle("revenue")}
              />
              <label
                htmlFor="revenue"
                className="text-sm font-medium cursor-pointer"
              >
                Revenue & Payments
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="orders"
                checked={selectedItems.orders}
                onCheckedChange={() => handleToggle("orders")}
              />
              <label
                htmlFor="orders"
                className="text-sm font-medium cursor-pointer"
              >
                Orders
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="failedPayments"
                checked={selectedItems.failedPayments}
                onCheckedChange={() => handleToggle("failedPayments")}
              />
              <label
                htmlFor="failedPayments"
                className="text-sm font-medium cursor-pointer"
              >
                Failed Payments
              </label>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Date Range</label>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickSelect("last7Days")}
              >
                Last 7 Days
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickSelect("last30Days")}
              >
                Last 30 Days
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickSelect("last3Months")}
              >
                Last 3 Months
              </Button>
            </div>

            {/* Range Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker-range"
                  className="w-full justify-start px-2.5 font-normal"
                >
                  <CalendarIcon />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
