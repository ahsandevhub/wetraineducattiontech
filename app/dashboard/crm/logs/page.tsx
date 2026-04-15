import {
  compareCrmUsersByDisplayName,
} from "@/app/dashboard/crm/lib/user-display";
import { getCrmUserDirectoryMap } from "@/app/dashboard/crm/lib/user-directory";
import { requireCrmAccess } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { CrmUser } from "../_types";
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

  const getCreatorOptions = async (): Promise<CrmUser[]> => {
    if (!isAdmin) return [];

    type CrmUserRow = {
      id: string;
      crm_role: "ADMIN" | "MARKETER";
      created_at: string;
      updated_at: string;
    };

    const { data: crmUsers } = await supabase
      .from("crm_users")
      .select("id, crm_role, created_at, updated_at")
      .in("crm_role", ["ADMIN", "MARKETER"]);

    const creatorProfileMap = await getCrmUserDirectoryMap(
      (crmUsers || []).map((user) => user.id),
    );

    return ((crmUsers || []) as CrmUserRow[])
      .map((user) => ({
        id: user.id,
        crm_role: user.crm_role,
        full_name: creatorProfileMap.get(user.id)?.full_name ?? null,
        email: creatorProfileMap.get(user.id)?.email ?? null,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }))
      .sort(compareCrmUsersByDisplayName);
  };

  // Get CRM user ID (crm_users.id = auth.users.id)
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!crmUser) {
    redirect("/unauthorized");
  }

  const search = typeof params.search === "string" ? params.search : undefined;
  const contactType = typeof params.type === "string" ? params.type : undefined;
  const createdBy = typeof params.user === "string" ? params.user : undefined;
  const fromDate = typeof params.from === "string" ? params.from : undefined;
  const toDate = typeof params.to === "string" ? params.to : undefined;

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

  let scopedLeadIds: string[] | null = null;

  if (!isAdmin) {
    const { data: userLeadIds } = await supabase
      .from("crm_leads")
      .select("id")
      .eq("owner_id", crmUser.id);

    if (!userLeadIds || userLeadIds.length === 0) {
      return (
        <LogsPageClient
          logs={[]}
          creators={[]}
          isAdmin={isAdmin}
          currentPage={pageNumber}
          pageSize={pageSize}
          totalCount={0}
        />
      );
    }

    scopedLeadIds = userLeadIds.map((lead) => lead.id);
  }

  let leadSearchIds: string[] | null = null;
  if (search) {
    let leadSearchQuery = supabase
      .from("crm_leads")
      .select("id")
      .or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,company.ilike.%${search}%`,
      );

    if (scopedLeadIds) {
      leadSearchQuery = leadSearchQuery.in("id", scopedLeadIds);
    }

    const { data: matchingLeads } = await leadSearchQuery;
    leadSearchIds = (matchingLeads || []).map((lead) => lead.id);
  }

  // Build query for contact logs (crm_users stays id-only; enrich from profiles)
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
    .order("created_at", { ascending: false });

  if (scopedLeadIds) {
    logsQuery = logsQuery.in("lead_id", scopedLeadIds);
  }

  if (search) {
    if (!leadSearchIds || leadSearchIds.length === 0) {
      return (
        <LogsPageClient
          logs={[]}
          creators={await getCreatorOptions()}
          isAdmin={isAdmin}
          currentPage={pageNumber}
          pageSize={pageSize}
          totalCount={0}
        />
      );
    }

    logsQuery = logsQuery.in("lead_id", leadSearchIds);
  }

  if (contactType && contactType !== "all") {
    logsQuery = logsQuery.eq("contact_type", contactType.toUpperCase());
  }

  if (isAdmin && createdBy && createdBy !== "all") {
    logsQuery = logsQuery.eq("user_id", createdBy);
  }

  if (fromDate) {
    logsQuery = logsQuery.gte("created_at", fromDate);
  }

  if (toDate) {
    logsQuery = logsQuery.lte("created_at", `${toDate}T23:59:59`);
  }

  const { data: logsRaw, count } = await logsQuery.range(
    offset,
    offset + pageSize - 1,
  );
  const totalCount = count ?? 0;

  const userIds = Array.from(
    new Set(
      (logsRaw || [])
        .map((log) => (log.user as { id: string } | null)?.id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const profileMap = await getCrmUserDirectoryMap(userIds);

  const logs = (logsRaw || []).map((l) => {
    const user = l.user as {
      id: string;
    } | null;
    return {
      ...l,
      user: user
        ? {
            id: user.id,
            full_name: profileMap.get(user.id)?.full_name ?? null,
            email: profileMap.get(user.id)?.email ?? null,
          }
        : null,
    };
  });

  const creators = await getCreatorOptions();

  return (
    <LogsPageClient
      logs={logs}
      creators={creators}
      isAdmin={isAdmin}
      currentPage={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
    />
  );
}
