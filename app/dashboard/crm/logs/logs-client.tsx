"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "../_components/AdminPageHeader";
import { DataTable, SortableHeader } from "../_components/DataTable";
import type { ContactLog } from "../_types";
import { updateSearchParams } from "../lib/url-params";

const contactTypeMeta: Record<
  string,
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
  OTHER: {
    label: "Other",
    icon: <FileText className="h-4 w-4" />,
    colorClass: "text-slate-600",
  },
};

interface LogsPageClientProps {
  logs: (ContactLog & {
    user?: { full_name: string; email: string };
    lead?: { id: string; name: string; phone: string; company: string | null };
  })[];
  isAdmin: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export function LogsPageClient({
  logs,
  isAdmin,
  currentPage,
  pageSize,
  totalCount,
}: LogsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle page change - update URL with new page number
  const handlePageChange = (newPage: number) => {
    const currentParams: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((value, key) => {
      currentParams[key] = value;
    });

    const newParams = updateSearchParams(currentParams, { page: newPage });
    router.replace(`?${newParams.toString()}`);
  };

  const columns: ColumnDef<
    ContactLog & {
      user?: { full_name: string; email: string };
      lead?: {
        id: string;
        name: string;
        phone: string;
        company: string | null;
      };
    }
  >[] = [
    {
      accessorKey: "contact_type",
      header: "Type",
      cell: ({ row }) => {
        const contactType = row.getValue("contact_type") as string;
        const meta = contactTypeMeta[contactType];
        return (
          <Badge variant="outline" className="flex items-center gap-2 w-fit">
            <span className={meta?.colorClass || "text-slate-600"}>
              {meta?.icon || <FileText className="h-4 w-4" />}
            </span>
            <span>{meta?.label || contactType}</span>
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <SortableHeader column={column}>Date & Time</SortableHeader>
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
      accessorKey: "lead",
      header: "Lead",
      cell: ({ row }) => {
        const original = row.original;
        if (!original.lead)
          return <span className="text-slate-400 italic">-</span>;
        return (
          <Link
            href={`/dashboard/crm/leads/${original.lead.id}`}
            className="font-medium hover:underline cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {original.lead.name}
          </Link>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.original.notes;
        if (!notes) return <span className="text-slate-400 italic">-</span>;

        // Strip HTML tags for display
        const stripHtml = (html: string) => {
          return html
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        };

        const plainText = stripHtml(notes);
        return (
          <div className="text-sm text-slate-700 truncate max-w-[300px]">
            {plainText}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "user",
      header: "Created By",
      cell: ({ row }) => {
        const user = row.getValue("user") as { full_name: string } | undefined;
        return user?.full_name || <span className="text-slate-400">-</span>;
      },
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const log = row.original;
        if (!log.lead) return null;
        return (
          <Button
            variant="ghost"
            size="sm"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/dashboard/crm/leads/${log.lead.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact Logs"
        description={
          isAdmin
            ? "All contact activity across the system"
            : "Your contact activity history"
        }
      />

      {logs.length > 0 ? (
        <DataTable
          columns={columns}
          data={logs}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          isExternalPagination={true}
        />
      ) : (
        <div className="rounded-md border bg-white p-12">
          <p className="text-center text-slate-500">No contact logs yet</p>
        </div>
      )}
    </div>
  );
}
