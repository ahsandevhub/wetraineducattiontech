"use client";

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
  PhoneCall,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { deleteLead } from "../_actions/leads";
import AdminPageHeader from "../_components/AdminPageHeader";
import { DataTable, SortableHeader } from "../_components/DataTable";
import { LeadDialog } from "../_components/LeadDialog";
import { LeadFilters } from "../_components/LeadFilters";
import { LeadRequestDialog } from "../_components/LeadRequestDialog";
import {
  LEAD_STATUS_BADGE,
  LEAD_STATUS_LABELS,
} from "../_constants/lead-status";
import type { CrmUser, Lead, LeadStatus } from "../_types";
import { updateSearchParams } from "../lib/url-params";

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

interface LeadsPageClientProps {
  leads: (Lead & {
    owner?: { full_name: string; email: string };
    contact_logs?: {
      notes: string | null;
      created_at: string;
      user?: { full_name: string };
    }[];
  })[];
  marketers: CrmUser[];
  isAdmin: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export function LeadsPageClient({
  leads,
  marketers,
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Handle page change - update URL with new page number
  const handlePageChange = (newPage: number) => {
    const currentParams: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((value, key) => {
      currentParams[key] = value;
    });

    const newParams = updateSearchParams(currentParams, { page: newPage });
    const pathname = "/dashboard/crm/leads";
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
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

  const columns: ColumnDef<Lead & { owner?: { full_name: string } }>[] = [
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const raw = row.getValue("phone") as string;
        const info = normalizeBdPhone(raw || "");
        const display =
          info.status === "VALID_BD" && info.local
            ? info.local
            : info.cleaned || raw || "-";
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
          onClick={(e) => e.stopPropagation()}
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
        const status = row.getValue("status") as LeadStatus;
        return renderStatusBadge(status);
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
      id: "last_interaction",
      header: ({ column }) => (
        <SortableHeader column={column}>Last Interaction</SortableHeader>
      ),
      cell: ({ row }) => {
        const original = row.original as Lead & {
          contact_logs?: {
            notes: string | null;
            created_at: string;
            user?: { full_name: string };
          }[];
        };
        const latest =
          original.contact_logs?.sort(
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
              {isAdmin && latest.user?.full_name && (
                <span> • by {latest.user.full_name}</span>
              )}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    ...(isAdmin
      ? [
          {
            accessorKey: "owner",
            header: "Owner",
            cell: ({
              row,
            }: {
              row: Row<Lead & { owner?: { full_name: string } }>;
            }) => {
              const owner = row.getValue("owner") as
                | { full_name: string }
                | undefined;
              return owner?.full_name ? (
                owner.full_name
              ) : (
                <span className="text-slate-400 italic">Unassigned</span>
              );
            },
          },
        ]
      : []),
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
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View lead</span>
            </Link>
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

      <LeadFilters marketers={marketers} isAdmin={isAdmin} />

      <DataTable
        columns={columns}
        data={leads}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        isExternalPagination={true}
      />

      <LeadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={editingLead}
        marketers={marketers}
        isAdmin={isAdmin}
        onSuccess={() => router.refresh()}
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
