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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  listLeadRequests,
  reviewLeadRequest,
} from "../../_actions/lead-requests";
import { DataTable } from "../../_components/DataTable";
import { LeadRequestWithRequester } from "../../_types";

interface LeadRequestsClientProps {
  initialRequests: LeadRequestWithRequester[];
}

export default function LeadRequestsClient({
  initialRequests,
}: LeadRequestsClientProps) {
  const router = useRouter();
  const [requests, setRequests] =
    useState<LeadRequestWithRequester[]>(initialRequests);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "DECLINED"
  >("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<LeadRequestWithRequester | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  // Fetch requests based on filters
  const handleFilterChange = async () => {
    try {
      const result = await listLeadRequests({
        status:
          statusFilter === "ALL"
            ? undefined
            : (statusFilter as "PENDING" | "APPROVED" | "DECLINED" | undefined),
        search: searchTerm || undefined,
      });
      const newRequests = (result.data ||
        []) as unknown as LeadRequestWithRequester[];
      setRequests(newRequests);
    } catch (error) {
      toast.error("Failed to fetch requests");
      console.error(error);
    }
  };

  // Review a request (approve or decline)
  const handleReview = async (decision: "APPROVE" | "DECLINE") => {
    if (!selectedRequest) return;

    setIsReviewing(true);
    try {
      const result = await reviewLeadRequest({
        requestId: selectedRequest.id,
        decision,
        adminNote: adminNote || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          decision === "APPROVE"
            ? "Lead request approved and assigned to marketer"
            : "Lead request declined",
        );
        setReviewDialogOpen(false);
        setAdminNote("");
        setSelectedRequest(null);
        router.refresh();
        await handleFilterChange();
      }
    } catch (error) {
      toast.error("Failed to review request");
      console.error(error);
    } finally {
      setIsReviewing(false);
    }
  };

  const openReviewDialog = (request: LeadRequestWithRequester) => {
    setSelectedRequest(request);
    setAdminNote("");
    setReviewDialogOpen(true);
  };

  // Get status badge color
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

  // Format phone number for display (just return as-is since we can't normalize client-side)
  const formatPhone = (phone: string) => {
    return phone;
  };

  const columns: ColumnDef<LeadRequestWithRequester>[] = [
    {
      accessorKey: "created_at",
      header: "Submitted At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return format(date, "MMM d, yyyy h:mm a");
      },
    },
    {
      accessorKey: "requester.full_name",
      header: "Requester",
      cell: ({ row }) => {
        const requester = row.original.requester;
        if (!requester) return "-";
        return (
          <div className="text-sm">
            <p className="font-medium">{requester.full_name}</p>
            <p className="text-xs text-slate-500">{requester.email}</p>
          </div>
        );
      },
    },
    {
      id: "lead_name",
      header: "Lead Name",
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
        return (
          <code className="text-xs bg-slate-100 px-2 py-1 rounded">
            {formatPhone(payload?.phone || "-")}
          </code>
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
        return <Badge className={getStatusColor(status)}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const request = row.original;
        const isPending = request.status === "PENDING";
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openReviewDialog(request)}
              title={isPending ? "Review request" : "View details"}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {isPending && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setAdminNote("");
                    handleReview("APPROVE");
                  }}
                  title="Approve request"
                  className="text-green-600 hover:text-green-800"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setAdminNote("");
                    handleReview("DECLINE");
                  }}
                  title="Decline request"
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
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
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            onKeyUp={handleFilterChange}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(
              value as "ALL" | "PENDING" | "APPROVED" | "DECLINED",
            );
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="DECLINED">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleFilterChange}>Filter</Button>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={requests} />

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Lead Request</DialogTitle>
            <DialogDescription>
              Review the lead request details and decide whether to approve or
              decline
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Request Details */}
              <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600">
                    REQUESTER
                  </p>
                  <p className="font-medium text-slate-900">
                    {selectedRequest.requester?.full_name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedRequest.requester?.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600">
                    SUBMITTED
                  </p>
                  <p className="text-sm text-slate-700">
                    {format(
                      new Date(selectedRequest.created_at),
                      "MMM d, yyyy h:mm a",
                    )}
                  </p>
                </div>

                {/* Lead Details */}
                {(() => {
                  const payload =
                    typeof selectedRequest.lead_payload === "string"
                      ? JSON.parse(selectedRequest.lead_payload)
                      : selectedRequest.lead_payload;

                  return (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-slate-600">
                          LEAD NAME
                        </p>
                        <p className="font-medium text-slate-900">
                          {payload?.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-600">
                          PHONE
                        </p>
                        <p className="font-mono text-sm text-slate-700">
                          {formatPhone(payload?.phone)}
                        </p>
                      </div>

                      {payload?.email && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            EMAIL
                          </p>
                          <p className="text-sm text-slate-700">
                            {payload.email}
                          </p>
                        </div>
                      )}

                      {payload?.company && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            COMPANY
                          </p>
                          <p className="text-sm text-slate-700">
                            {payload.company}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-semibold text-slate-600">
                          SOURCE
                        </p>
                        <p className="text-sm text-slate-700">
                          {payload?.source || "UNKNOWN"}
                        </p>
                      </div>

                      {payload?.notes && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600">
                            NOTES
                          </p>
                          <p className="text-sm text-slate-700">
                            {payload.notes}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Admin Note Field */}
              {selectedRequest.status === "PENDING" && (
                <div className="space-y-2">
                  <Label htmlFor="admin-note">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin-note"
                    placeholder="Add any notes about this review decision..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Status Display for Reviewed Requests */}
              {selectedRequest.status !== "PENDING" && (
                <div className="rounded-lg border bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    STATUS
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                  </div>
                  {selectedRequest.admin_note && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-slate-600">
                        REVIEW NOTE
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {selectedRequest.admin_note}
                      </p>
                    </div>
                  )}
                  {selectedRequest.reviewed_at && (
                    <p className="text-xs text-slate-600 mt-2">
                      Reviewed on{" "}
                      {format(
                        new Date(selectedRequest.reviewed_at),
                        "MMM d, yyyy h:mm a",
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={isReviewing}
            >
              Close
            </Button>
            {selectedRequest?.status === "PENDING" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleReview("DECLINE")}
                  disabled={isReviewing}
                >
                  {isReviewing ? "Processing..." : "Decline"}
                </Button>
                <Button
                  onClick={() => handleReview("APPROVE")}
                  disabled={isReviewing}
                >
                  {isReviewing ? "Processing..." : "Approve & Assign"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
