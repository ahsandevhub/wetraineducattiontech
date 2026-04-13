"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type StoreProductFormValues = {
  name: string;
  sku: string;
  barcode: string;
  unitPrice: string;
  isActive: boolean;
  tracksStock: boolean;
};

export type StoreProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_price: number;
  is_active: boolean;
  tracks_stock: boolean;
  created_at: string;
  updated_at: string;
};

type StoreProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: StoreProduct | null;
  isSaving: boolean;
  onSave: (values: StoreProductFormValues) => void;
  triggerLabel?: string;
  showTrigger?: boolean;
};

export default function StoreProductDialog({
  open,
  onOpenChange,
  product,
  isSaving,
  onSave,
  triggerLabel = "Add Product",
  showTrigger = true,
}: StoreProductDialogProps) {
  const initialValues = useMemo<StoreProductFormValues>(
    () => ({
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      barcode: product?.barcode ?? "",
      unitPrice:
        product?.unit_price === undefined || product.unit_price === null
          ? ""
          : String(product.unit_price),
      isActive: product?.is_active ?? true,
      tracksStock: product?.tracks_stock ?? true,
    }),
    [product],
  );

  const [values, setValues] = useState<StoreProductFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const isEdit = Boolean(product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEdit && showTrigger ? (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update catalog details, pricing, and sellability."
              : "Create a sellable store item for employees."}
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
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={values.name}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Chocolate cone"
              disabled={isSaving}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input
                id="product-sku"
                value={values.sku}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, sku: event.target.value }))
                }
                placeholder="ICE-CONE-001"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-barcode">Barcode</Label>
              <Input
                id="product-barcode"
                value={values.barcode}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    barcode: event.target.value,
                  }))
                }
                placeholder="Optional barcode"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-price">Unit Price (BDT)</Label>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={values.unitPrice}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  unitPrice: event.target.value,
                }))
              }
              placeholder="0.00"
              disabled={isSaving}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                checked={values.isActive}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({
                    ...prev,
                    isActive: checked === true,
                  }))
                }
                disabled={isSaving}
              />
              <div className="space-y-1">
                <div className="text-sm font-medium">Active product</div>
                <div className="text-xs text-muted-foreground">
                  Inactive products remain in history but cannot be sold.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                checked={values.tracksStock}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({
                    ...prev,
                    tracksStock: checked === true,
                  }))
                }
                disabled={isSaving}
              />
              <div className="space-y-1">
                <div className="text-sm font-medium">Track stock</div>
                <div className="text-xs text-muted-foreground">
                  Enable stock validation and movement history for this item.
                </div>
              </div>
            </label>
          </div>

          <DialogFooter>
            <Button
              className="mt-3 sm:mt-0"
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
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
