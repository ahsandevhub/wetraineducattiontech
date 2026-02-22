"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Receipt } from "lucide-react";
import { useTransition } from "react";
import { toast } from "react-hot-toast";
import { formatCurrency, getStatusColor } from "../_components/formatters";
import type { AdminPaymentRow } from "../types";
import { generateInvoice, generateReceipt } from "./pdfGenerator";

export interface PaymentViewDialogProps {
  payment: AdminPaymentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkPaid?: (paymentId: string) => Promise<void>;
}

export function PaymentViewDialog({
  payment,
  open,
  onOpenChange,
  onMarkPaid,
}: PaymentViewDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!payment) return null;

  const handleDownloadDocument = async (type: "invoice" | "receipt") => {
    try {
      const response = await fetch(
        `/api/admin/payments?paymentId=${payment.id}`,
      );
      if (!response.ok) {
        toast.error("Failed to fetch payment data");
        return;
      }

      const paymentData = await response.json();

      if (type === "invoice") {
        generateInvoice(paymentData);
      } else {
        generateReceipt(paymentData);
      }
      toast.success(`${type} downloaded successfully`);
    } catch (error) {
      toast.error(`Failed to generate ${type}`);
      console.error(error);
    }
  };

  const handleMarkPaid = async () => {
    if (!onMarkPaid) return;

    startTransition(async () => {
      try {
        await onMarkPaid(payment.id);
        toast.success("Payment marked as paid");
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to mark payment as paid",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            View and manage payment information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Payment ID</p>
              <p className="font-mono text-sm font-medium">
                {payment.id.slice(0, 12)}...
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={getStatusColor(payment.status)}>
                {payment.status}
              </Badge>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm">Customer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{payment.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm">{payment.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Method</p>
                <p className="font-medium capitalize">{payment.method}</p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium">
              {payment.createdAt
                ? new Date(payment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDownloadDocument("invoice")}
              disabled={isPending}
            >
              <FileText className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>

            {payment.status === "paid" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDownloadDocument("receipt")}
                disabled={isPending}
              >
                <Receipt className="mr-2 h-4 w-4 text-green-600" />
                Download Receipt
              </Button>
            )}

            {payment.status === "pending" && onMarkPaid && (
              <Button
                className="w-full"
                onClick={handleMarkPaid}
                disabled={isPending}
              >
                {isPending ? "Marking..." : "Mark as Paid"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
