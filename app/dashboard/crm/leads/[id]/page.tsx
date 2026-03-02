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

  // Get CRM user ID (crm_users.id = auth.users.id)
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!crmUser) {
    redirect("/unauthorized");
  }

  // Fetch lead with owner info from crm_users
  const { data: lead } = await supabase
    .from("crm_leads")
    .select(
      `
      *,
      owner:crm_users!crm_leads_owner_id_fkey (
        id,
        full_name,
        email
      )
    `,
    )
    .eq("id", id)
    .single();

  if (!lead) {
    notFound();
  }

  // Check access (marketers can see their leads or unassigned leads)
  if (!isAdmin && lead.owner_id !== crmUser.id && lead.owner_id !== null) {
    redirect("/dashboard/crm/leads");
  }

  // Fetch contact logs with crm_users fields directly
  const { data: rawLogs } = await supabase
    .from("crm_contact_logs")
    .select(
      `
      *,
      user:crm_users!crm_contact_logs_user_id_fkey (
        id,
        full_name,
        email
      )
    `,
    )
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const owner = lead.owner as {
    id: string;
    full_name?: string | null;
    email?: string | null;
  } | null;
  const leadWithOwner = {
    ...lead,
    owner: owner
      ? {
          id: owner.id,
          full_name: owner.full_name ?? null,
          email: owner.email ?? null,
        }
      : undefined,
  };

  const logs = (rawLogs || []).map((log) => {
    const u = log.user as {
      id: string;
      full_name?: string | null;
      email?: string | null;
    } | null;
    return {
      ...log,
      user: u
        ? {
            id: u.id,
            full_name: u.full_name ?? null,
            email: u.email ?? null,
          }
        : undefined,
    };
  });

  return (
    <LeadDetailClient lead={leadWithOwner} logs={logs} isAdmin={isAdmin} />
  );
}
