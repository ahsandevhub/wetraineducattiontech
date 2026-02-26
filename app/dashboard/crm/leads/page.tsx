import type { Lead } from "@/app/dashboard/crm/_types";
import { requireCrmAccess } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { LeadsPageClient } from "./leads-client";

export default async function LeadsPage({
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

  // Extract filter params
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const source = typeof params.source === "string" ? params.source : undefined;
  const owner = typeof params.owner === "string" ? params.owner : undefined;
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

  // Build initial query (only get id from crm_users FK joins, enrich names from profiles)
  let q = supabase
    .from("crm_leads")
    .select(
      `
    *,
    owner:crm_users!crm_leads_owner_id_fkey (
      id
    ),
    contact_logs:crm_contact_logs (
      notes,
      created_at,
      contact_type,
      user:crm_users!crm_contact_logs_user_id_fkey (
        id
      )
    )
  `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    q = q.eq("owner_id", crmUser.id);
  }

  // Apply filters
  if (search) {
    q = q.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`,
    );
  }

  if (status && status !== "all") {
    q = q.eq("status", status.toUpperCase());
  }

  if (source && source !== "all") {
    q = q.eq("source", source.toUpperCase());
  }

  if (owner && owner !== "all" && isAdmin) {
    if (owner === "unassigned") {
      q = q.is("owner_id", null);
    } else {
      q = q.eq("owner_id", owner);
    }
  }

  if (fromDate) {
    q = q.gte("created_at", fromDate);
  }

  if (toDate) {
    q = q.lte("created_at", `${toDate}T23:59:59`);
  }

  // Apply pagination
  q = q.range(offset, offset + pageSize - 1);

  const { data: leadData, count, error } = await q;

  if (error) {
    console.error("Error fetching leads:", error);
  }

  const totalCount = count ?? 0;

  // Collect user IDs to enrich with profiles
  type RawLead = typeof leadData extends (infer T)[] | null ? T : never;
  const ownerIds = new Set<string>();
  const logUserIds = new Set<string>();
  for (const lead of (leadData || []) as RawLead[]) {
    const l = lead as {
      owner?: { id: string } | null;
      contact_logs?: { user?: { id: string } | null }[] | null;
    };
    if (l.owner?.id) ownerIds.add(l.owner.id);
    for (const log of l.contact_logs || []) {
      if (log.user?.id) logUserIds.add(log.user.id);
    }
  }
  const allUserIds = [...new Set([...ownerIds, ...logUserIds])];
  const profileMap = new Map<
    string,
    { full_name: string | null; email: string | null }
  >();
  if (allUserIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", allUserIds);
    if (profs) {
      for (const p of profs) profileMap.set(p.id, p);
    }
  }

  const leads = ((leadData || []) as RawLead[]).map((lead) => {
    const l = lead as {
      owner?: { id: string } | null;
      contact_logs?:
        | {
            user?: { id: string } | null;
            notes: string | null;
            created_at: string;
            contact_type: string;
          }[]
        | null;
      [key: string]: unknown;
    };
    return {
      ...l,
      owner: l.owner
        ? { id: l.owner.id, ...profileMap.get(l.owner.id) }
        : undefined,
      contact_logs: (l.contact_logs || []).map((log) => ({
        ...log,
        user: log.user
          ? { id: log.user.id, ...profileMap.get(log.user.id) }
          : undefined,
      })),
    };
  }) as (Lead & {
    owner?: { id: string; full_name: string | null; email: string | null };
    contact_logs?: {
      notes: string | null;
      created_at: string;
      contact_type: string;
      user?: { id: string; full_name: string | null; email: string | null };
    }[];
  })[];

  // Fetch all marketers for admin and marketer reassignment, enriched from profiles
  const { data: marketerUsers } = await supabase
    .from("crm_users")
    .select("id, crm_role, created_at, updated_at")
    .eq("crm_role", "MARKETER");
  const marketerIds = (marketerUsers || []).map((u) => u.id);
  const marketerProfileMap = new Map<
    string,
    { full_name: string | null; email: string | null }
  >();
  if (marketerIds.length > 0) {
    const { data: mProfs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", marketerIds);
    if (mProfs) {
      for (const p of mProfs) marketerProfileMap.set(p.id, p);
    }
  }
  const marketers = (marketerUsers || [])
    .map((u) => ({
      id: u.id,
      crm_role: u.crm_role as "ADMIN" | "MARKETER",
      full_name: marketerProfileMap.get(u.id)?.full_name ?? null,
      email: marketerProfileMap.get(u.id)?.email ?? null,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }))
    .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));

  return (
    <LeadsPageClient
      leads={leads || []}
      marketers={marketers}
      isAdmin={isAdmin}
      currentPage={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
    />
  );
}
