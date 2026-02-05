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
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImageUpload } from "../_components/ImageUpload";
import type { AdminCertificationRow } from "../types";

export type CertificationFormValues = {
  title: string;
  issuer: string;
  issuedAt: string;
  description: string;
  credentialId: string;
  verifyUrl: string;
  imageUrl: string;
};

type CertificationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certification?: AdminCertificationRow | null;
  isSaving: boolean;
  onSave: (values: CertificationFormValues) => void;
};

export default function CertificationDialog({
  open,
  onOpenChange,
  certification,
  isSaving,
  onSave,
}: CertificationDialogProps) {
  const initialValues = useMemo<CertificationFormValues>(
    () => ({
      title: certification?.title ?? "",
      issuer: certification?.issuer ?? "",
      issuedAt: certification?.issuedAt ?? "",
      description: certification?.description ?? "",
      credentialId: certification?.credentialId ?? "",
      verifyUrl: certification?.verifyUrl ?? "",
      imageUrl: certification?.imageUrl ?? "",
    }),
    [certification],
  );

  const [values, setValues] = useState<CertificationFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const isEdit = Boolean(certification);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Certification" : "Add Certification"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the certification details."
              : "Add a new certification or credential."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(values);
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input
                id="issuer"
                value={values.issuer}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, issuer: event.target.value }))
                }
                required
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issuedAt">Issued At</Label>
              <Input
                id="issuedAt"
                value={values.issuedAt}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    issuedAt: event.target.value,
                  }))
                }
                required
                disabled={isSaving}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credentialId">Credential ID (optional)</Label>
              <Input
                id="credentialId"
                value={values.credentialId}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    credentialId: event.target.value,
                  }))
                }
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={values.description}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              disabled={isSaving}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Certification description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verifyUrl">Verify URL (optional)</Label>
            <Input
              id="verifyUrl"
              value={values.verifyUrl}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  verifyUrl: event.target.value,
                }))
              }
              disabled={isSaving}
              placeholder="https://"
            />
          </div>

          <ImageUpload
            label="Certification Image (optional)"
            bucket="certifications"
            currentUrl={values.imageUrl}
            isLoading={isSaving}
            onUpload={(url) =>
              setValues((prev) => ({ ...prev, imageUrl: url }))
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
                "Create Certification"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
