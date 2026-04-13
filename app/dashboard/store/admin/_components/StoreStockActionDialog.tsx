"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { StoreBarcodeScannerDialog } from "@/app/dashboard/store/_components/StoreBarcodeScannerDialog";
import { Loader2, PackagePlus, ScanBarcode } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

type ActionType = "RESTOCK" | "DEDUCT" | "ADJUST";

type StockProductOption = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  on_hand: number;
  is_active: boolean;
};

export type StockActionFormValues = {
  productId: string;
  actionType: ActionType;
  quantity: string;
  unitCost: string;
  reason: string;
  referenceType: string;
  referenceNumber: string;
};

type StoreStockActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: StockProductOption[];
  initialProductId?: string | null;
  initialActionType?: ActionType;
  isSaving: boolean;
  onSave: (values: StockActionFormValues) => void;
};

export default function StoreStockActionDialog({
  open,
  onOpenChange,
  products,
  initialProductId = null,
  initialActionType = "RESTOCK",
  isSaving,
  onSave,
}: StoreStockActionDialogProps) {
  const initialValues = useMemo<StockActionFormValues>(
    () => ({
      productId: initialProductId ?? "",
      actionType: initialActionType,
      quantity: "",
      unitCost: "",
      reason: "",
      referenceType: "",
      referenceNumber: "",
    }),
    [initialActionType, initialProductId],
  );

  const [values, setValues] = useState<StockActionFormValues>(initialValues);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  const selectedProduct = products.find(
    (product) => product.id === values.productId,
  );

  const actionLabel =
    values.actionType === "RESTOCK"
      ? "Restock"
      : values.actionType === "DEDUCT"
      ? "Deduct"
      : "Adjust";

  const quantityLabel =
    values.actionType === "ADJUST" ? "Final On-Hand Quantity" : "Quantity";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!initialProductId ? (
        <DialogTrigger asChild>
          <Button>
            <PackagePlus className="mr-2 h-4 w-4" />
            Record Stock Change
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{actionLabel} Stock</DialogTitle>
          <DialogDescription>
            Record an immutable stock movement for a tracked Store product.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(values);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="stock-product">Product</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Select
                  value={values.productId}
                  onValueChange={(value) =>
                    setValues((prev) => ({ ...prev, productId: value }))
                  }
                  disabled={isSaving || Boolean(initialProductId)}
                >
                  <SelectTrigger id="stock-product">
                    <SelectValue placeholder="Select a tracked product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {values.actionType === "RESTOCK" && !initialProductId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsBarcodeScannerOpen(true)}
                  disabled={isSaving}
                >
                  <ScanBarcode className="mr-2 h-4 w-4" />
                  Scan Barcode
                </Button>
              ) : null}
            </div>
            {selectedProduct ? (
              <p className="text-xs text-muted-foreground">
                Current on-hand stock: {selectedProduct.on_hand}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock-action-type">Action Type</Label>
            <Select
              value={values.actionType}
              onValueChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  actionType: value as ActionType,
                  unitCost: value === "RESTOCK" ? prev.unitCost : "",
                  referenceType: value === "RESTOCK" ? prev.referenceType : "",
                  referenceNumber:
                    value === "RESTOCK" ? prev.referenceNumber : "",
                }))
              }
              disabled={isSaving}
            >
              <SelectTrigger id="stock-action-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESTOCK">Add stock</SelectItem>
                <SelectItem value="DEDUCT">Deduct stock</SelectItem>
                <SelectItem value="ADJUST">Adjust stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock-quantity">{quantityLabel}</Label>
            <Input
              id="stock-quantity"
              type="number"
              min={values.actionType === "ADJUST" ? "0" : "1"}
              step="1"
              inputMode="numeric"
              value={values.quantity}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  quantity: event.target.value,
                }))
              }
              placeholder="0"
              disabled={isSaving}
              required
            />
            <p className="text-xs text-muted-foreground">
              {values.actionType === "DEDUCT"
                ? "Deduction cannot reduce the product below zero stock."
                : values.actionType === "ADJUST"
                ? "Adjustment sets the final on-hand stock after a physical count or correction."
                : "Restock creates both a stock entry and a stock movement record."}
            </p>
          </div>

          {values.actionType === "RESTOCK" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock-unit-cost">Unit Cost (optional)</Label>
                  <Input
                    id="stock-unit-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={values.unitCost}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        unitCost: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock-reference-type">
                    Reference Type (optional)
                  </Label>
                  <Input
                    id="stock-reference-type"
                    value={values.referenceType}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        referenceType: event.target.value,
                      }))
                    }
                    placeholder="Invoice, cash memo, supplier"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock-reference-number">
                  Reference Number (optional)
                </Label>
                <Input
                  id="stock-reference-number"
                  value={values.referenceNumber}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      referenceNumber: event.target.value,
                    }))
                  }
                  placeholder="Memo or voucher number"
                  disabled={isSaving}
                />
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="stock-reason">Reason/Notes</Label>
            <Textarea
              id="stock-reason"
              value={values.reason}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, reason: event.target.value }))
              }
              placeholder="Optional context for this stock change"
              disabled={isSaving}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `${actionLabel} Stock`
              )}
            </Button>
          </DialogFooter>
        </form>

        <StoreBarcodeScannerDialog
          open={isBarcodeScannerOpen}
          onOpenChange={setIsBarcodeScannerOpen}
          title="Scan Product Barcode"
          description="Scan a barcode or enter it manually to select the tracked product for this restock."
          onBarcodeDetected={(barcode) => {
            const matchedProduct = products.find(
              (product) => product.is_active && product.barcode?.trim() === barcode,
            );

            if (!matchedProduct) {
              toast.error(
                `No active tracked product was found for barcode ${barcode}`,
              );
              return;
            }

            setValues((prev) => ({ ...prev, productId: matchedProduct.id }));
            toast.success(`Selected ${matchedProduct.name}`);
            setIsBarcodeScannerOpen(false);
          }}
          findButtonLabel="Find Product"
          idleHint="Scanning will select the matching tracked product so you can continue the restock."
          footer={
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBarcodeScannerOpen(false)}
            >
              Close
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
