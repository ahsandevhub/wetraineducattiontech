"use client";

import { ImageUpload } from "@/app/dashboard/admin/_components/ImageUpload";
import { StoreBarcodeScannerDialog } from "@/app/dashboard/store/_components/StoreBarcodeScannerDialog";
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
import { Loader2, Plus, ScanBarcode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type StoreProductFormValues = {
  name: string;
  sku: string;
  barcode: string;
  imageUrl: string;
  unitPrice: string;
  isActive: boolean;
  tracksStock: boolean;
};

export type StoreProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  image_url: string | null;
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
      imageUrl: product?.image_url ?? "",
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
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const reset = () => {
    setValues(initialValues);
    setIsBarcodeScannerOpen(false);
  };

  const isEdit = Boolean(product);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset();
        }
      }}
    >
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-barcode">Barcode</Label>
              <div className="flex flex-col gap-3 sm:flex-row">
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
              </div>
              <p className="text-xs text-muted-foreground">
                You can type the barcode manually or scan it with the camera.
              </p>
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

          <div className="space-y-2">
            <ImageUpload
              label="Product Image"
              bucket="store-products"
              folder="products"
              currentUrl={values.imageUrl || undefined}
              isLoading={isSaving}
              onUpload={(url) =>
                setValues((prev) => ({
                  ...prev,
                  imageUrl: url,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Optional. Upload one product image for the catalog preview.
            </p>
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
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
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

        <StoreBarcodeScannerDialog
          open={isBarcodeScannerOpen}
          onOpenChange={setIsBarcodeScannerOpen}
          title="Scan Product Barcode"
          description="Scan a product barcode or enter it manually to populate the product form."
          onBarcodeDetected={(barcode) => {
            setValues((prev) => ({ ...prev, barcode }));
            setIsBarcodeScannerOpen(false);
          }}
          findButtonLabel="Use Barcode"
          idleHint="Scanning will fill the barcode field automatically."
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
