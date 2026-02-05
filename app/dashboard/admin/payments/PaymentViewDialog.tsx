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
import { FileText, Loader2, Receipt, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import CopyButton from "../_components/CopyButton";
import { formatCurrency, getStatusColor } from "../_components/formatters";
import type { AdminPaymentRow } from "../types";
import { generateInvoice, generateReceipt } from "./pdfGenerator";

export interface PaymentViewDialogProps {
  payment: AdminPaymentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkPaid?: (paymentId: string) => Promise<void>;
  onRejectPayment?: (paymentId: string) => Promise<void>;
}

export function PaymentViewDialog({
  payment,
  open,
  onOpenChange,
  onMarkPaid,
  onRejectPayment,
}: PaymentViewDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<{
    type: "mark-paid" | "reject";
  } | null>(null);

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

  const handleConfirmMarkPaid = async () => {
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
      } finally {
        setConfirmAction(null);
      }
    });
  };

  const handleConfirmReject = async () => {
    if (!onRejectPayment) return;

    startTransition(async () => {
      try {
        await onRejectPayment(payment.id);
        toast.success("Payment rejected");
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to reject payment",
        );
      } finally {
        setConfirmAction(null);
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View and manage payment information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment ID with Copy */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Payment ID</p>
              <CopyButton text={payment.id} truncateLength={30} />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={getStatusColor(payment.status)}>
                {payment.status}
              </Badge>
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
                  onClick={() => setConfirmAction({ type: "mark-paid" })}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Mark as Paid"
                  )}
                </Button>
              )}

              {payment.status === "pending" && onRejectPayment && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setConfirmAction({ type: "reject" })}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Reject Payment
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Confirmation */}
      <ConfirmDialog
        open={confirmAction?.type === "mark-paid"}
        title="Mark Payment as Paid"
        description="Are you sure you want to mark this payment as paid? This action cannot be undone."
        confirmText="Mark as Paid"
        cancelText="Cancel"
        onConfirm={handleConfirmMarkPaid}
        onCancel={() => setConfirmAction(null)}
        isLoading={isPending}
      />

      {/* Reject Payment Confirmation */}
      <ConfirmDialog
        open={confirmAction?.type === "reject"}
        title="Reject Payment"
        description="Are you sure you want to reject this payment? This action cannot be undone."
        confirmText="Reject"
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={handleConfirmReject}
        onCancel={() => setConfirmAction(null)}
        isLoading={isPending}
      />
    </>
  );
}
