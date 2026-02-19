"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowBigLeft,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  StickyNote,
  User2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { createContactLog } from "../../_actions/contact-logs";
import {
  LEAD_STATUS_BADGE,
  LEAD_STATUS_LABELS,
} from "../../_constants/lead-status";
import type { ContactLog, ContactType, Lead, LeadStatus } from "../../_types";

// Normalize Bangladesh phone numbers
function normalizeBdPhone(phone: string): {
  status: string;
  local?: string;
  cleaned?: string;
} {
  if (!phone) return { status: "INVALID" };

  const cleaned = phone.replace(/\D/g, "");

  let local = cleaned;
  if (cleaned.startsWith("880")) {
    local = cleaned.slice(3);
  }

  if (local.length === 11 && local.startsWith("01")) {
    return { status: "VALID_BD", local, cleaned };
  }

  return { status: "INVALID", cleaned };
}

// Helper to render status badge with icon
function renderStatusBadge(status: LeadStatus) {
  const config = LEAD_STATUS_BADGE[status];

  // Fallback for unknown status values (handles pre-migration data)
  if (!config) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
        Unknown: {status}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}

// Helper to copy text to clipboard with feedback
function copyToClipboard(
  text: string,
  fieldId: string,
  onCopied: (id: string | null) => void,
) {
  navigator.clipboard.writeText(text);
  onCopied(fieldId);
  setTimeout(() => {
    onCopied(null);
  }, 2000);
}

interface LeadDetailClientProps {
  lead: Lead & { owner?: { full_name: string; email: string } };
  logs: (ContactLog & { user?: { full_name: string; email: string } })[];
  isAdmin: boolean;
}

const contactTypeMeta: Record<
  ContactType,
  { label: string; icon: React.ReactNode; colorClass: string }
> = {
  CALL: {
    label: "Phone Call",
    icon: <Phone className="h-4 w-4" />,
    colorClass: "text-emerald-600",
  },
  EMAIL: {
    label: "Email",
    icon: <Mail className="h-4 w-4" />,
    colorClass: "text-sky-600",
  },
  MEETING: {
    label: "Meeting",
    icon: <Users className="h-4 w-4" />,
    colorClass: "text-violet-600",
  },
  WHATSAPP: {
    label: "WhatsApp",
    icon: <MessageSquare className="h-4 w-4" />,
    colorClass: "text-green-600",
  },
  NOTE: {
    label: "Note",
    icon: <FileText className="h-4 w-4" />,
    colorClass: "text-amber-600",
  },
  OTHER: {
    label: "Other",
    icon: <FileText className="h-4 w-4" />,
    colorClass: "text-slate-600",
  },
};

const contactTypes = (Object.keys(contactTypeMeta) as ContactType[]).map(
  (k) => ({ value: k, label: contactTypeMeta[k].label }),
);

export function LeadDetailClient({
  lead,
  logs,
  isAdmin,
}: LeadDetailClientProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [contactType, setContactType] = useState<ContactType>("CALL");
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Client-only mount to safely check history
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const handleAddLog = async () => {
    if (!notes.trim()) {
      toast.error("Please add some notes");
      return;
    }

    setLoading(true);
    const result = await createContactLog({
      lead_id: lead.id,
      contact_type: contactType,
      notes,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Contact log added successfully");
      setNotes("");
      setContactType("CALL");
      router.refresh();
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (mounted && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/crm/leads");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          //   variant="ghost"
          size="icon"
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowBigLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {lead.name ? lead.name : "Unnamed Lead"}
          </h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lead Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lead Info</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Top row: Phone + Status */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      Phone
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              const rawPhone = lead.phone;
                              copyToClipboard(
                                rawPhone,
                                "phone",
                                setCopiedField,
                              );
                            }}
                          >
                            {copiedField === "phone" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy phone</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {(() => {
                      const info = normalizeBdPhone(lead.phone);
                      return info.status === "VALID_BD" && info.local
                        ? info.local
                        : info.cleaned || lead.phone;
                    })()}
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Status
                  </div>
                  <div className="mt-1">{renderStatusBadge(lead.status)}</div>
                </div>
              </div>

              {/* Middle row: Email + Company */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="hover:underline"
                        title={lead.email}
                      >
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No email</span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    Company
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {lead.company ? (
                      lead.company
                    ) : (
                      <span className="text-muted-foreground">No company</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom row: Created + Notes (Notes full-width on mobile) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Created
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <StickyNote className="h-3.5 w-3.5" />
                    Notes
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {lead.notes ? (
                      <p className="line-clamp-2 text-sm font-medium">
                        {lead.notes}
                      </p>
                    ) : (
                      <span className="text-muted-foreground">No notes</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned To (admin only) */}
              {isAdmin && lead.owner && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <User2 className="h-3.5 w-3.5" />
                    Assigned To
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {lead.owner.full_name}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Contact Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Contact Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-type">Contact Type</Label>
                <Select
                  value={contactType}
                  onValueChange={(value) =>
                    setContactType(value as ContactType)
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="contact-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              contactTypeMeta[type.value as ContactType]
                                ?.colorClass
                            }
                          >
                            {contactTypeMeta[type.value as ContactType]?.icon}
                          </span>
                          <span>
                            {contactTypeMeta[type.value as ContactType]
                              ?.label || type.label}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what happened in this interaction..."
                  disabled={loading}
                  className="resize-none min-h-[140px]"
                />
              </div>

              <Button
                onClick={handleAddLog}
                disabled={loading || !notes.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Contact Log
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact History Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Contact History</CardTitle>
              <CardDescription>
                {logs.length} interaction{logs.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => {
                    const meta = contactTypeMeta[
                      log.contact_type as ContactType
                    ] || {
                      label: log.contact_type,
                      icon: <FileText className="h-4 w-4" />,
                      colorClass: "text-slate-600",
                    };
                    return (
                      <div
                        key={log.id}
                        className="border-l-2 border-slate-200 pl-4 pb-4 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge
                            className="flex items-center gap-1 flex-shrink-0"
                            variant="outline"
                          >
                            <span className={meta.colorClass}>{meta.icon}</span>
                            <span className="text-xs">{meta.label}</span>
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">
                          {new Date(log.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {log.notes || "(no notes)"}
                        </p>
                        {log.user && (
                          <p className="text-xs text-slate-500 mt-2">
                            by {log.user.full_name}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No contact logs yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
