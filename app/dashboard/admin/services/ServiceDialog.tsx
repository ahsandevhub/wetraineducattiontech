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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImageUpload } from "../_components/ImageUpload";
import type { AdminServiceRow } from "../types";

export type ServiceFormValues = {
  title: string;
  slug: string;
  category: string;
  price: string;
  discount: string;
  currency: string;
  details: string;
  keyFeatures: string[];
  featuredImageUrl: string;
};

type ServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: AdminServiceRow | null;
  isSaving: boolean;
  onSave: (values: ServiceFormValues) => void;
};

const categories = ["course", "software", "marketing"] as const;

export default function ServiceDialog({
  open,
  onOpenChange,
  service,
  isSaving,
  onSave,
}: ServiceDialogProps) {
  const initialValues = useMemo<ServiceFormValues>(
    () => ({
      title: service?.title ?? "",
      slug: service?.slug ?? "",
      category: service?.category ?? "course",
      price:
        service?.price === null || service?.price === undefined
          ? ""
          : String(service.price),
      discount:
        service?.discount === null || service?.discount === undefined
          ? ""
          : String(service.discount),
      currency: service?.currency ?? "BDT",
      details: service?.details ?? "",
      keyFeatures: service?.keyFeatures ?? [""],
      featuredImageUrl: service?.featuredImageUrl ?? "",
    }),
    [service],
  );

  const [values, setValues] = useState<ServiceFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const isEdit = Boolean(service);

  const updateFeature = (index: number, value: string) => {
    setValues((prev) => {
      const next = [...prev.keyFeatures];
      next[index] = value;
      return { ...prev, keyFeatures: next };
    });
  };

  const addFeature = () => {
    setValues((prev) => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, ""],
    }));
  };

  const removeFeature = (index: number) => {
    setValues((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Service" : "Add Service"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update service details and pricing."
              : "Create a new service for the catalog."}
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, title: event.target.value }))
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
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
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
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                inputMode="decimal"
                value={values.discount}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    discount: event.target.value,
                  }))
                }
                disabled={isSaving}
                placeholder="e.g. 10"
              />
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
            <Label htmlFor="details">Details</Label>
            <textarea
              id="details"
              value={values.details}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, details: event.target.value }))
              }
              disabled={isSaving}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Service details"
            />
          </div>

          <div className="space-y-2">
            <Label>Key Features / What&apos;s Included</Label>
            <div className="space-y-3">
              {values.keyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(event) =>
                      updateFeature(index, event.target.value)
                    }
                    disabled={isSaving}
                    placeholder={`Feature ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(index)}
                    disabled={isSaving || values.keyFeatures.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                disabled={isSaving}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
            </div>
          </div>

          <ImageUpload
            label="Featured Image"
            bucket="services"
            currentUrl={values.featuredImageUrl}
            required
            isLoading={isSaving}
            onUpload={(url) =>
              setValues((prev) => ({ ...prev, featuredImageUrl: url }))
            }
          />

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
                "Create Service"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
