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

  // Fetch lead with owner id from crm_users (profile data comes from profiles)
  const { data: lead } = await supabase
    .from("crm_leads")
    .select(
      `
      *,
      owner:crm_users!crm_leads_owner_id_fkey (
        id
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

  // Fetch contact logs with crm_users id (profile data comes from profiles)
  const { data: rawLogs } = await supabase
    .from("crm_contact_logs")
    .select(
      `
      *,
      user:crm_users!crm_contact_logs_user_id_fkey (
        id
      )
    `,
    )
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const owner = lead.owner as {
    id: string;
  } | null;

  const relatedUserIds = Array.from(
    new Set([
      ...(owner?.id ? [owner.id] : []),
      ...((rawLogs || [])
        .map((log) => (log.user as { id: string } | null)?.id)
        .filter((userId): userId is string => Boolean(userId))),
    ]),
  );

  const { data: profiles } = relatedUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", relatedUserIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] };

  const profileMap = new Map(
    (profiles || []).map((profile) => [
      profile.id,
      {
        full_name: profile.full_name ?? null,
        email: profile.email ?? null,
      },
    ]),
  );

  const leadWithOwner = {
    ...lead,
    owner: owner
      ? {
          id: owner.id,
          full_name: profileMap.get(owner.id)?.full_name ?? null,
          email: profileMap.get(owner.id)?.email ?? null,
        }
      : undefined,
  };

  const logs = (rawLogs || []).map((log) => {
    const u = log.user as {
      id: string;
    } | null;
    return {
      ...log,
      user: u
        ? {
            id: u.id,
            full_name: profileMap.get(u.id)?.full_name ?? null,
            email: profileMap.get(u.id)?.email ?? null,
          }
        : undefined,
    };
  });

  return (
    <LeadDetailClient lead={leadWithOwner} logs={logs} isAdmin={isAdmin} />
  );
}
