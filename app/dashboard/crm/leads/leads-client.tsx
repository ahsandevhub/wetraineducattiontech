"use client";

import { getCrmUserDisplayName } from "@/app/dashboard/crm/lib/user-display";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CheckCheck,
  Copy,
  Edit,
  Eye,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  MessageSquarePlus,
  Phone,
  PhoneCall,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { createContactLog } from "../_actions/contact-logs";
import { deleteLead, reassignLead, updateLead } from "../_actions/leads";
import AdminPageHeader from "../_components/AdminPageHeader";
import { DataTable, SortableHeader } from "../_components/DataTable";
import { LeadDialog } from "../_components/LeadDialog";
import { LeadFilters } from "../_components/LeadFilters";
import { LeadRequestDialog } from "../_components/LeadRequestDialog";
import {
  LEAD_STATUS_BADGE,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_OPTIONS,
} from "../_constants/lead-status";
import { useScrollRestoration } from "../_hooks/useScrollRestoration";
import type { ContactType, CrmUser, Lead, LeadStatus } from "../_types";
import { updateSearchParams } from "../lib/url-params";

// Helper to render status badge with icon
function renderStatusBadge(status: LeadStatus) {
  const config = LEAD_STATUS_BADGE[status];

  // Fallback for unknown status values (handles pre-migration data)
  if (!config) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        Unknown: {status}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}

// Helper to copy text to clipboard with feedback
function copyToClipboard(
  text: string,
  label: string,
  fieldId: string,
  onCopied: (id: string | null) => void,
) {
  navigator.clipboard.writeText(text);
  onCopied(fieldId);
  // Reset after 2 seconds
  setTimeout(() => {
    onCopied(null);
  }, 2000);
}

function getShortEmailLabel(email: string) {
  const [localPart] = email.split("@");
  if (!localPart) return email;

  return localPart.length <= 6 ? localPart : `${localPart.slice(0, 6)}...`;
}

type LeadRow = Lead & {
  owner?: { id: string; full_name: string | null; email: string | null };
  contact_logs?: {
    notes: string | null;
    created_at: string;
    user?: { id: string; full_name: string | null; email: string | null };
  }[];
};

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
  (value) => ({
    value,
    label: contactTypeMeta[value].label,
  }),
);

function InlineLeadStatusCell({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead.status);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedStatus(lead.status);
  }, [lead.status]);

  const handleStatusChange = (nextStatus: string) => {
    const normalizedStatus = nextStatus as LeadStatus;

    if (normalizedStatus === selectedStatus) {
      return;
    }

    const previousStatus = selectedStatus;
    setSelectedStatus(normalizedStatus);

    startTransition(async () => {
      const result = await updateLead(lead.id, { status: normalizedStatus });

      if (result.error) {
        setSelectedStatus(previousStatus);
        toast.error(result.error);
        return;
      }

      toast.success("Lead status updated");
      router.refresh();
    });
  };

  return (
    <div
      className="inline-flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        value={selectedStatus}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="group h-auto w-auto border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:opacity-0 hover:[&>svg]:opacity-100 focus:[&>svg]:opacity-100">
          <SelectValue asChild>{renderStatusBadge(selectedStatus)}</SelectValue>
        </SelectTrigger>
        <SelectContent align="start">
          {LEAD_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
      )}
    </div>
  );
}

function InlineLeadOwnerCell({
  lead,
  assignableOwners,
}: {
  lead: LeadRow;
  assignableOwners: CrmUser[];
}) {
  const router = useRouter();
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(
    lead.owner?.id ?? "unassigned",
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedOwnerId(lead.owner?.id ?? "unassigned");
  }, [lead.owner?.id]);

  const handleOwnerChange = (nextOwnerId: string) => {
    if (nextOwnerId === selectedOwnerId) {
      return;
    }

    const previousOwnerId = selectedOwnerId;
    setSelectedOwnerId(nextOwnerId);

    startTransition(async () => {
      const result = await reassignLead(
        lead.id,
        nextOwnerId === "unassigned" ? "" : nextOwnerId,
      );

      if (result.error) {
        setSelectedOwnerId(previousOwnerId);
        toast.error(result.error);
        return;
      }

      toast.success("Lead owner updated");
      router.refresh();
    });
  };

  const ownerLabel =
    assignableOwners.find((owner) => owner.id === selectedOwnerId) || null;

  const ownerDisplay = (() => {
    if (selectedOwnerId === "unassigned") {
      return <span className="text-slate-400 italic">Unassigned</span>;
    }

    const fullName = ownerLabel?.full_name || lead.owner?.full_name;
    if (fullName) {
      return fullName;
    }

    const email = ownerLabel?.email || lead.owner?.email;
    if (!email) {
      return "Unknown";
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help underline decoration-dotted underline-offset-2">
              {getShortEmailLabel(email)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{email}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  })();

  return (
    <div
      className="inline-flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        value={selectedOwnerId}
        onValueChange={handleOwnerChange}
        disabled={isPending}
      >
        <SelectTrigger className="group h-auto w-auto border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:opacity-0 hover:[&>svg]:opacity-100 focus:[&>svg]:opacity-100">
          <SelectValue>{ownerDisplay}</SelectValue>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {assignableOwners.map((owner) => (
            <SelectItem key={owner.id} value={owner.id}>
              {getCrmUserDisplayName(owner)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
      )}
    </div>
  );
}

function AddContactLogDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: LeadRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [contactType, setContactType] = useState<ContactType>("CALL");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setContactType("CALL");
      setNotes("");
      setLoading(false);
    }
  }, [open, lead?.id]);

  const handleAddLog = async () => {
    if (!lead) return;

    if (!notes.trim()) {
      toast.error("Please add some notes");
      return;
    }

    setLoading(true);
    const result = await createContactLog({
      lead_id: lead.id,
      contact_type: contactType,
      notes: notes.trim(),
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Contact log added successfully");
    onOpenChange(false);
    router.refresh();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contact Log</DialogTitle>
          <DialogDescription>
            {lead
              ? `Record a new interaction for ${lead.name}.`
              : "Record a new interaction for this lead."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table-contact-type">Contact Type</Label>
            <Select
              value={contactType}
              onValueChange={(value) => setContactType(value as ContactType)}
              disabled={loading}
            >
              <SelectTrigger id="table-contact-type">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span className={contactTypeMeta[contactType].colorClass}>
                      {contactTypeMeta[contactType].icon}
                    </span>
                    <span>{contactTypeMeta[contactType].label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {contactTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          contactTypeMeta[type.value as ContactType].colorClass
                        }
                      >
                        {contactTypeMeta[type.value as ContactType].icon}
                      </span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-contact-notes">Notes</Label>
            <Textarea
              id="table-contact-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what happened in this interaction..."
              disabled={loading}
              className="min-h-[140px] resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleAddLog} disabled={loading || !notes.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Add Contact Log
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LeadsPageClientProps {
  leads: LeadRow[];
  ownerFilterOptions: CrmUser[];
  assignableOwners: CrmUser[];
  isAdmin: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export function LeadsPageClient({
  leads,
  ownerFilterOptions,
  assignableOwners,
  isAdmin,
  currentPage,
  pageSize,
  totalCount,
}: LeadsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [contactLogDialogOpen, setContactLogDialogOpen] = useState(false);
  const [contactLogLead, setContactLogLead] = useState<LeadRow | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPagePending, startPageTransition] = useTransition();
  const [isFilterPending, setIsFilterPending] = useState(false);
  const { saveScrollPosition } = useScrollRestoration();

  // Handle page change - update URL with new page number
  const handlePageChange = (newPage: number) => {
    saveScrollPosition();
    const currentParams: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((value, key) => {
      currentParams[key] = value;
    });

    const newParams = updateSearchParams(currentParams, { page: newPage });
    const pathname = "/dashboard/crm/leads";
    startPageTransition(() => {
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    });
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingLead(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingLeadId) return;

    const result = await deleteLead(deletingLeadId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Lead deleted successfully");
      router.refresh();
    }
    setDeleteDialogOpen(false);
    setDeletingLeadId(null);
  };

  const columns: ColumnDef<LeadRow>[] = [
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const raw = row.getValue("phone") as string;
        const display = raw || "-";
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <PhoneCall className="size-4 text-slate-500" />
            <span>{display}</span>
            {raw && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(
                          raw,
                          "Phone",
                          `phone-${row.original.id}`,
                          setCopiedField,
                        );
                      }}
                    >
                      {copiedField === `phone-${row.original.id}` ? (
                        <CheckCheck className="size-4 text-green-700" />
                      ) : (
                        <Copy className="size-4 text-gray-400" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy phone number</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>Name</SortableHeader>
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/crm/leads/${row.original.id}`}
          className="font-medium hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            saveScrollPosition();
          }}
          scroll={false}
        >
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => {
        return <InlineLeadStatusCell lead={row.original} />;
      },
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <SortableHeader column={column}>Source</SortableHeader>
      ),
      cell: ({ row }) => {
        const source = row.getValue("source") as string;
        return <span className="text-sm">{source}</span>;
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.original.notes;
        if (!notes) return <span className="text-slate-400 italic">-</span>;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm text-slate-700 truncate max-w-[200px] cursor-help">
                  {notes}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{notes}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <SortableHeader column={column}>Created</SortableHeader>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
          <div className="text-sm">
            <div>{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-muted-foreground">
              {format(date, "HH:mm:ss")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <SortableHeader column={column}>Last Updated</SortableHeader>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("updated_at"));
        return (
          <div className="text-sm">
            <div>{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-muted-foreground">
              {format(date, "HH:mm:ss")}
            </div>
          </div>
        );
      },
    },
    {
      id: "last_interaction",
      header: ({ column }) => (
        <SortableHeader column={column}>Last Interaction</SortableHeader>
      ),
      cell: ({ row }) => {
        const latest =
          row.original.contact_logs?.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0] || null;
        if (!latest) return <span className="text-slate-400">Never</span>;
        const contactDate = new Date(latest.created_at);
        const dateStr = format(contactDate, "dd MMM, yyyy");
        const timeStr = format(contactDate, "hh:mm a");

        const stripHtml = (html: string) => {
          if (!html) return "";
          const withoutTags = html.replace(/<[^>]*>/g, " ");
          return withoutTags.replace(/\s+/g, " ").trim();
        };

        const notesText = latest.notes ? stripHtml(latest.notes) : "(no notes)";

        return (
          <div className="text-sm">
            <div className="max-w-[260px] truncate text-slate-700">
              {notesText}
            </div>
            <div className="text-xs text-muted-foreground">
              {dateStr} • {timeStr}
              {isAdmin && latest.user && (
                <span> • by {getCrmUserDisplayName(latest.user)}</span>
              )}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }: { row: Row<LeadRow> }) => {
        return (
          <InlineLeadOwnerCell
            lead={row.original}
            assignableOwners={assignableOwners}
          />
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center gap-1">
            <Link
              href={`/dashboard/crm/leads/${lead.id}`}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
              scroll={false}
              onClick={(e) => {
                e.stopPropagation();
                saveScrollPosition();
              }}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View lead</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setContactLogLead(lead);
                setContactLogDialogOpen(true);
              }}
              title="Add contact log"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(lead);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingLeadId(lead.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isAdmin ? "All Leads" : "My Leads"}
        description={
          isAdmin
            ? "Manage all leads in the system"
            : "View and manage your assigned leads"
        }
        action={
          isAdmin ? (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          ) : (
            <Button onClick={() => setRequestDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Request Lead
            </Button>
          )
        }
      />

      <LeadFilters
        owners={ownerFilterOptions}
        isAdmin={isAdmin}
        onPendingChange={setIsFilterPending}
      />

      <DataTable
        columns={columns}
        data={leads}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        isExternalPagination={true}
        isLoading={isPagePending || isFilterPending}
      />

      <LeadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={editingLead}
        owners={assignableOwners}
        isAdmin={isAdmin}
        onSuccess={() => router.refresh()}
      />

      <AddContactLogDialog
        lead={contactLogLead}
        open={contactLogDialogOpen}
        onOpenChange={setContactLogDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              lead and all associated contact logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LeadRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
