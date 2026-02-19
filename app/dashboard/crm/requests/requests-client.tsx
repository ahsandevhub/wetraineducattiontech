"use client";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, Clock, Copy, Eye, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { DataTable } from "../_components/DataTable";
import { LeadRequestWithRequester } from "../_types";

interface RequestsClientProps {
  initialRequests: LeadRequestWithRequester[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  defaultStatus: "all" | "PENDING" | "APPROVED" | "DECLINED";
  defaultSearch: string;
}

export default function RequestsClient({
  initialRequests,
  defaultStatus,
  defaultSearch,
}: RequestsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "PENDING" | "APPROVED" | "DECLINED"
  >(defaultStatus);
  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<LeadRequestWithRequester | null>(null);

  // Handle filter changes
  const handleFilterChange = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", statusFilter);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/dashboard/crm/requests?${params.toString()}`);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Get status badge styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "DECLINED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "APPROVED":
        return <Check className="h-4 w-4" />;
      case "DECLINED":
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const columns: ColumnDef<LeadRequestWithRequester>[] = [
    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
          <span className="text-sm">{format(date, "MMM d, yyyy h:mm a")}</span>
        );
      },
    },
    {
      id: "lead_name",
      header: "Lead",
      cell: ({ row }) => {
        const payload =
          typeof row.original.lead_payload === "string"
            ? JSON.parse(row.original.lead_payload)
            : row.original.lead_payload;
        return <span className="font-medium">{payload?.name || "-"}</span>;
      },
    },
    {
      id: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const payload =
          typeof row.original.lead_payload === "string"
            ? JSON.parse(row.original.lead_payload)
            : row.original.lead_payload;
        const phone = payload?.phone || "-";
        return (
          <div className="flex items-center gap-2">
            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
              {phone}
            </code>
            {phone !== "-" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(phone)}
                title="Copy phone"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      },
    },
    {
      id: "source",
      header: "Source",
      cell: ({ row }) => {
        const payload =
          typeof row.original.lead_payload === "string"
            ? JSON.parse(row.original.lead_payload)
            : row.original.lead_payload;
        return <Badge variant="outline">{payload?.source || "UNKNOWN"}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={`flex items-center gap-1 w-fit ${getStatusColor(status)}`}
          >
            {getStatusIcon(status)}
            {status}
          </Badge>
        );
      },
    },
    {
      id: "admin_note",
      header: "Admin Note",
      cell: ({ row }) => {
        const note = row.original.admin_note;
        if (!note) return <span className="text-slate-500 text-sm">-</span>;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-slate-600 cursor-help underline dotted">
                  View
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{note}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "reviewed_at",
      header: "Reviewed At",
      cell: ({ row }) => {
        const date = row.getValue("reviewed_at");
        if (!date) return <span className="text-slate-500 text-sm">-</span>;
        return (
          <span className="text-sm">
            {format(new Date(date as string), "MMM d, yyyy h:mm a")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const request = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRequest(request);
              setViewDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-slate-700">Search</label>
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleFilterChange();
              }
            }}
          />
        </div>
        <div className="w-32">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(
                value as "all" | "PENDING" | "APPROVED" | "DECLINED",
              );
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="DECLINED">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleFilterChange}>Filter</Button>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={initialRequests} />

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Request Details</DialogTitle>
            <DialogDescription>
              View your lead request submission and approval status
            </DialogDescription>
          </DialogHeader>

          {selectedRequest &&
            (() => {
              const payload =
                typeof selectedRequest.lead_payload === "string"
                  ? JSON.parse(selectedRequest.lead_payload)
                  : selectedRequest.lead_payload;

              return (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-600">
                      STATUS:
                    </p>
                    <Badge
                      className={`flex items-center gap-1 w-fit ${getStatusColor(selectedRequest.status)}`}
                    >
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status}
                    </Badge>
                  </div>

                  {/* Lead Details */}
                  <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-600">
                        NAME:
                      </p>
                      <p className="font-medium text-slate-900">
                        {payload?.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-600">
                        PHONE:
                      </p>
                      <p className="font-mono text-sm text-slate-700">
                        {payload?.phone}
                      </p>
                    </div>

                    {payload?.email && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-600">
                          EMAIL:
                        </p>
                        <p className="text-sm text-slate-700">
                          {payload.email}
                        </p>
                      </div>
                    )}

                    {payload?.company && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-600">
                          COMPANY:
                        </p>
                        <p className="text-sm text-slate-700">
                          {payload.company}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-600">
                        SOURCE:
                      </p>
                      <p className="text-sm text-slate-700">
                        {payload?.source || "UNKNOWN"}
                      </p>
                    </div>

                    {payload?.notes && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-600">
                          NOTES:
                        </p>
                        <p className="text-sm text-slate-700">
                          {payload.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Admin Review Info */}
                  {selectedRequest.status !== "PENDING" && (
                    <div className="rounded-lg border bg-slate-50 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-600">
                          REVIEWED AT:
                        </p>
                        <p className="text-sm text-slate-700">
                          {selectedRequest.reviewed_at
                            ? format(
                                new Date(selectedRequest.reviewed_at),
                                "MMM d, yyyy h:mm a",
                              )
                            : "-"}
                        </p>
                      </div>

                      {selectedRequest.admin_note && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-600">
                            ADMIN NOTE:
                          </p>
                          <p className="text-sm text-slate-700">
                            {selectedRequest.admin_note}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Link to Created Lead */}
                  {selectedRequest.status === "APPROVED" &&
                    selectedRequest.lead_id && (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-sm text-green-900 mb-2">
                          Your lead has been created and assigned to you.
                        </p>
                        <Link
                          href={`/dashboard/crm/leads/${selectedRequest.lead_id}`}
                        >
                          <Button className="w-full" variant="default">
                            Open Lead Detail
                          </Button>
                        </Link>
                      </div>
                    )}
                </div>
              );
            })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
