"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useState } from "react";
import { toast } from "react-hot-toast";
import { createLeadRequest } from "../_actions/lead-requests";
import type { CreateLeadRequestData, LeadSource } from "../_types";

const LEAD_SOURCES: LeadSource[] = [
  "WEBSITE",
  "REFERRAL",
  "SOCIAL_MEDIA",
  "ADMIN",
  "OTHER",
];

interface LeadRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LeadRequestDialog({
  open,
  onOpenChange,
  onSuccess,
}: LeadRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateLeadRequestData>({
    name: "",
    phone: "",
    email: "",
    company: "",
    source: "OTHER",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Lead name is required");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);
    try {
      const result = await createLeadRequest({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || undefined,
        company: formData.company?.trim() || undefined,
        source: formData.source,
        notes: formData.notes?.trim() || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Lead request submitted to admin");
        setFormData({
          name: "",
          phone: "",
          email: "",
          company: "",
          source: "OTHER",
          notes: "",
        });
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error creating lead request:", error);
      toast.error("Failed to submit lead request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request New Lead</DialogTitle>
          <DialogDescription>
            Submit basic lead information for admin review. Once approved, the
            lead will be assigned to you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Lead Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="e.g., +880 1XX XXXXXXX"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              placeholder="e.g., Acme Corp"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Lead Source</Label>
            <Select
              value={formData.source}
              onValueChange={(value) =>
                setFormData({ ...formData, source: value as LeadSource })
              }
              disabled={loading}
            >
              <SelectTrigger id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this lead..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
