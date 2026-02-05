"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AdminProductRow } from "../types";

export type ProductFormValues = {
  name: string;
  slug: string;
  code: string;
  category: string;
  price: string;
  currency: string;
};

type ProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: AdminProductRow | null;
  isSaving: boolean;
  onSave: (values: ProductFormValues) => void;
};

const categories = ["marketing", "it", "course", "challenge"] as const;

export default function ProductDialog({
  open,
  onOpenChange,
  product,
  isSaving,
  onSave,
}: ProductDialogProps) {
  const initialValues = useMemo<ProductFormValues>(
    () => ({
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      code: product?.code ?? "",
      category: product?.category ?? "marketing",
      price:
        product?.price === null || product?.price === undefined
          ? ""
          : String(product.price),
      currency: product?.currency ?? "BDT",
    }),
    [product],
  );

  const [values, setValues] = useState<ProductFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const isEdit = Boolean(product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update product details and pricing."
              : "Create a new product for the catalog."}
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
              required
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={values.slug}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, slug: event.target.value }))
                }
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={values.code}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, code: event.target.value }))
                }
                required
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={values.category}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, category: value }))
                }
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={values.currency}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    currency: event.target.value,
                  }))
                }
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (leave blank for custom)</Label>
            <Input
              id="price"
              inputMode="decimal"
              value={values.price}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, price: event.target.value }))
              }
              disabled={isSaving}
              placeholder="e.g. 12999"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
