import type { Lead } from "@/app/dashboard/crm/_types";
import {
  compareCrmUsersByDisplayName,
} from "@/app/dashboard/crm/lib/user-display";
import { getCrmUserDirectoryMap } from "@/app/dashboard/crm/lib/user-directory";
import { requireCrmAccess } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { getMarketers } from "../_actions/users";
import { buildCrmLeadSearchOr } from "../lib/phone";
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

  const { userId, canAccessCrmAdmin } = userWithRoles;
  const supabase = await createClient();
  const params = await searchParams;

  const isAdmin = canAccessCrmAdmin;

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

  const applyLeadFilters = (query: any) => {
    let q = query.order("created_at", { ascending: false });

    if (!isAdmin) {
      q = q.eq("owner_id", crmUser.id);
    }

    if (search) {
      q = q.or(buildCrmLeadSearchOr(search));
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

    return q.range(offset, offset + pageSize - 1);
  };

  const { data: leadData, count, error } = await applyLeadFilters(
    supabase.from("crm_leads").select(
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
    ),
  );

  if (error) {
    console.error("Error fetching leads:", error);
  }

  const totalCount = count ?? 0;

  type RawLead = typeof leadData extends (infer T)[] | null ? T : never;
  const baseLeads = ((leadData || []) as RawLead[]).map((lead) => {
    const l = lead as {
      owner?: {
        id: string;
      } | null;
      contact_logs?:
        | {
            user?: {
              id: string;
            } | null;
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
        ? {
            id: l.owner.id,
            full_name: null,
            email: null,
          }
        : undefined,
      contact_logs: (l.contact_logs || []).map((log) => ({
        ...log,
        user: log.user
          ? {
              id: log.user.id,
              full_name: null,
              email: null,
            }
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

  const relatedUserIds = Array.from(
    new Set(
      baseLeads.flatMap((lead) => [
        ...(lead.owner?.id ? [lead.owner.id] : []),
        ...(lead.contact_logs || [])
          .map((log) => log.user?.id)
          .filter((id): id is string => Boolean(id)),
      ]),
    ),
  );

  const profileMap = await getCrmUserDirectoryMap(relatedUserIds);

  const leads = baseLeads.map((lead) => ({
    ...lead,
    owner: lead.owner
      ? {
          id: lead.owner.id,
          full_name: profileMap.get(lead.owner.id)?.full_name ?? null,
          email: profileMap.get(lead.owner.id)?.email ?? null,
        }
      : undefined,
    contact_logs: (lead.contact_logs || []).map((log) => ({
      ...log,
      user: log.user
        ? {
            id: log.user.id,
            full_name: profileMap.get(log.user.id)?.full_name ?? null,
            email: profileMap.get(log.user.id)?.email ?? null,
          }
        : undefined,
    })),
  }));

  // Fetch all CRM users for owner filter options
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

  const crmUserIds = (crmUsers || []).map((user) => user.id);
  const crmUserProfileMap = await getCrmUserDirectoryMap(crmUserIds);

  const ownerFilterOptions = ((crmUsers || []) as CrmUserRow[])
    .map((u) => ({
      id: u.id,
      crm_role: u.crm_role as "ADMIN" | "MARKETER",
      full_name: crmUserProfileMap.get(u.id)?.full_name ?? null,
      email: crmUserProfileMap.get(u.id)?.email ?? null,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }))
    .sort(compareCrmUsersByDisplayName);

  const { data: assignableOwners } = await getMarketers();

  return (
    <LeadsPageClient
      leads={leads || []}
      ownerFilterOptions={ownerFilterOptions}
      assignableOwners={assignableOwners || []}
      isAdmin={isAdmin}
      currentPage={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
    />
  );
}
