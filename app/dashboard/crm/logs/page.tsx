import { requireCrmAccess } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogsPageClient } from "./logs-client";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireCrmAccess();
  const userWithRoles = await getCurrentUserWithRoles();

  if (!userWithRoles) {
    redirect("/login");
  }

  const { userId, crmRole } = userWithRoles;
  const supabase = await createClient();
  const params = await searchParams;

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

  // Pagination params
  const pageParam = typeof params.page === "string" ? params.page : "1";
  const pageSizeParam =
    typeof params.pageSize === "string" ? params.pageSize : "25";
  const pageNumber = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = Math.max(
    1,
    Math.min(500, parseInt(pageSizeParam, 10) || 25),
  );
  const offset = (pageNumber - 1) * pageSize;

  // Build query for contact logs (only get id from crm_users, enrich names from profiles)
  let logsQuery = supabase
    .from("crm_contact_logs")
    .select(
      `
      *,
      user:crm_users!crm_contact_logs_user_id_fkey (
        id
      ),
      lead:crm_leads (
        id,
        name,
        phone,
        company
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  // If not admin, only show logs for their leads
  if (!isAdmin) {
    const { data: userLeadIds } = await supabase
      .from("crm_leads")
      .select("id")
      .eq("owner_id", crmUser.id);

    if (userLeadIds && userLeadIds.length > 0) {
      logsQuery = logsQuery.in(
        "lead_id",
        userLeadIds.map((l) => l.id),
      );
    } else {
      // User has no leads, return empty
      return (
        <LogsPageClient
          logs={[]}
          isAdmin={isAdmin}
          currentPage={pageNumber}
          pageSize={pageSize}
          totalCount={0}
        />
      );
    }
  }

  const { data: logsRaw, count } = await logsQuery;
  const totalCount = count ?? 0;

  // Enrich user names/emails from profiles
  const userIds = [
    ...new Set(
      (logsRaw || [])
        .map((l) => (l.user as { id: string } | null)?.id)
        .filter(Boolean) as string[],
    ),
  ];
  const profileMap = new Map<
    string,
    { full_name: string | null; email: string | null }
  >();
  if (userIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);
    if (profs) {
      for (const p of profs) profileMap.set(p.id, p);
    }
  }
  const logs = (logsRaw || []).map((l) => {
    const user = l.user as { id: string } | null;
    return {
      ...l,
      user: user ? { id: user.id, ...profileMap.get(user.id) } : null,
    };
  });

  return (
    <LogsPageClient
      logs={logs}
      isAdmin={isAdmin}
      currentPage={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
    />
  );
}
