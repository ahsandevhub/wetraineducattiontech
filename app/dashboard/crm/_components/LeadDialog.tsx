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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { LEAD_STATUS_OPTIONS } from "../_constants/lead-status";
import type { CrmUser, Lead, LeadStatus } from "../_types";

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  marketers?: CrmUser[];
  isAdmin: boolean;
  onSuccess: () => void;
}

export function LeadDialog({
  open,
  onOpenChange,
  lead,
  marketers,
  isAdmin,
  onSuccess,
}: LeadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    company: string;
    status: LeadStatus;
    owner_id: string | null;
    notes: string;
  }>({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "NEW" as LeadStatus,
    owner_id: null,
    notes: "",
  });

  // Initialize form data when dialog opens or lead changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: lead?.name || "",
        email: lead?.email || "",
        phone: lead?.phone || "",
        company: lead?.company || "",
        status: lead?.status || "NEW",
        owner_id: lead?.owner_id ?? null,
        notes: lead?.notes || "",
      });
    }
  }, [open, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Import actions dynamically to avoid circular dependencies
      const { createLead, updateLead, reassignLead } =
        await import("../_actions/leads");

      let result;
      if (lead) {
        // Check if owner_id changed and handle reassignment
        const newOwnerId = formData.owner_id ?? null;
        const oldOwnerId = lead.owner_id ?? null;

        if (newOwnerId !== oldOwnerId) {
          // Owner changed, call reassignLead (server validates permissions)
          const reassignResult = await reassignLead(lead.id, newOwnerId ?? "");
          if (reassignResult.error) {
            toast.error("Failed to reassign lead: " + reassignResult.error);
            setLoading(false);
            return;
          }
        }

        // Update other fields
        result = await updateLead(lead.id, {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          company: formData.company || undefined,
          status: formData.status as LeadStatus,
          notes: formData.notes || undefined,
        });
      } else {
        result = await createLead({
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          company: formData.company || undefined,
          status: formData.status as LeadStatus,
          source: "ADMIN",
          owner_id: formData.owner_id || "",
          notes: formData.notes || undefined,
        });
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          lead ? "Lead updated successfully!" : "Lead created successfully!",
        );
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "Create New Lead"}</DialogTitle>
          <DialogDescription>
            {lead ? "Update lead information" : "Add a new lead to the system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Lead Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                disabled={loading || (!isAdmin && !!lead)}
              />
              {!isAdmin && lead && (
                <p className="text-xs text-muted-foreground">
                  Phone can only be changed by admin
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Lead Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className={cn("space-y-2")}>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as LeadStatus })
                }
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!!lead && marketers && (
              <div className="space-y-2">
                <Label htmlFor="owner">Assign To</Label>
                <Select
                  value={formData.owner_id ?? ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, owner_id: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="owner">
                    <SelectValue placeholder="Select marketer" />
                  </SelectTrigger>
                  <SelectContent>
                    {marketers.map((marketer) => (
                      <SelectItem key={marketer.id} value={marketer.id}>
                        {marketer.full_name || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              placeholder="Enter notes about the lead, such as contact attempts, lead preferences, etc."
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {lead ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{lead ? "Update Lead" : "Create Lead"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
