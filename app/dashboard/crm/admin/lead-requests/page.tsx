import { listLeadRequests } from "../../_actions/lead-requests";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { LeadRequestWithRequester } from "../../_types";
import LeadRequestsClient from "./lead-requests-client";

export default async function LeadRequestsPage() {
  // Fetch all lead requests for initial display
  const result = await listLeadRequests({
    status: "PENDING",
  });
  const requests = (result.data || []) as unknown as LeadRequestWithRequester[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Lead Requests"
        description="Review and manage lead requests from marketers"
      />
      <LeadRequestsClient initialRequests={requests} />
    </div>
  );
}
