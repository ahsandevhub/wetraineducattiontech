"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, getStatusColor } from "../_components/formatters";
import type { AdminOrderRow } from "../types";

export interface OrderViewDialogProps {
  order: AdminOrderRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderViewDialog({
  order,
  open,
  onOpenChange,
}: OrderViewDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>View order information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono text-sm font-medium">
                {order.id.slice(0, 12)}...
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm">Customer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm">{order.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Package & Amount */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Package</p>
                <p className="font-medium">{order.packageName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(order.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-medium">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
