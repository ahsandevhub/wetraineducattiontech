import { getMyLeadRequests } from "../_actions/lead-requests";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { LeadRequestWithRequester } from "../_types";
import RequestsClient from "./requests-client";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function MyRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status || "all") as
    | "all"
    | "PENDING"
    | "APPROVED"
    | "DECLINED";
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || "10", 10);
  const offset = (page - 1) * pageSize;

  // Fetch marketer's requests
  const result = await getMyLeadRequests({
    status:
      status === "all"
        ? undefined
        : (status as "PENDING" | "APPROVED" | "DECLINED"),
    search: search || undefined,
    limit: pageSize,
    offset,
  });

  const requests = (result.data || []) as unknown as LeadRequestWithRequester[];
  const totalCount = result.count || 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="My Lead Requests"
        description="View and track your lead add/assign requests and their status"
      />
      <RequestsClient
        initialRequests={requests}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        defaultStatus={status}
        defaultSearch={search}
      />
    </div>
  );
}
