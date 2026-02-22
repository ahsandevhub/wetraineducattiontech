import { requireCrmAccess } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { LeadDetailClient } from "./lead-detail-client";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCrmAccess();
  const { id } = await params;
  const userWithRoles = await getCurrentUserWithRoles();

  if (!userWithRoles) {
    redirect("/login");
  }

  const { userId, crmRole } = userWithRoles;
  const supabase = await createClient();

  const isAdmin = crmRole === "ADMIN";

  // Get CRM user ID
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("id")
    .eq("auth_user_id", userId)
    .single();

  if (!crmUser) {
    redirect("/unauthorized");
  }

  // Fetch lead
  const { data: lead } = await supabase
    .from("crm_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (!lead) {
    notFound();
  }

  // Check access (marketers can see their leads or unassigned leads)
  if (!isAdmin && lead.owner_id !== crmUser.id && lead.owner_id !== null) {
    redirect("/dashboard/crm/leads");
  }

  // Fetch contact logs
  const { data: logs } = await supabase
    .from("crm_contact_logs")
    .select(
      `
      *,
      user:crm_users!crm_contact_logs_user_id_fkey (
        full_name,
        email
      )
    `,
    )
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return <LeadDetailClient lead={lead} logs={logs || []} isAdmin={isAdmin} />;
}
