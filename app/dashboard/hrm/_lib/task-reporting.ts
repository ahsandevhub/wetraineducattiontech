import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createAdminClient } from "@/app/utils/supabase/admin";
import { createClient } from "@/app/utils/supabase/server";
import {
  HRM_TASK_REPORT_CATEGORIES,
  type HrmReportingFilters,
  type HrmReportingPageData,
  type HrmReportingScope,
  type HrmTaskReportCategory,
  type HrmTaskReportListItem,
} from "./task-reporting-shared";

type RawSearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

function normalizeString(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function clampPage(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizePageSize(value: string) {
  const parsed = Number.parseInt(value, 10);
  return [10, 25, 50].includes(parsed) ? parsed : 10;
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getMonthToDateDefaults() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return {
    dateFrom: `${year}-${month}-01`,
    dateTo: `${year}-${month}-${day}`,
  };
}

export async function parseHrmReportingFilters(
  searchParams: RawSearchParams,
): Promise<HrmReportingFilters> {
  const resolved = await searchParams;
  const defaults = getMonthToDateDefaults();

  const q = normalizeString(resolved.q).trim();
  const category = normalizeString(resolved.category).trim();
  const userId = normalizeString(resolved.userId).trim();
  const dateFrom = normalizeString(resolved.dateFrom).trim();
  const dateTo = normalizeString(resolved.dateTo).trim();
  const page = clampPage(normalizeString(resolved.page, "1"), 1);
  const pageSize = normalizePageSize(normalizeString(resolved.pageSize, "10"));

  return {
    q,
    category:
      HRM_TASK_REPORT_CATEGORIES.includes(category as HrmTaskReportCategory)
        ? category
        : "",
    userId,
    dateFrom: isIsoDate(dateFrom) ? dateFrom : defaults.dateFrom,
    dateTo: isIsoDate(dateTo) ? dateTo : defaults.dateTo,
    page,
    pageSize,
  };
}

async function getAssignedSubjectIds(adminId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hrm_assignments")
    .select("subject_user_id")
    .eq("marker_admin_id", adminId)
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  return [...new Set((data || []).map((item) => item.subject_user_id))];
}

async function getProfileMap(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, { full_name: string | null; email: string | null }>();
  }

  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  if (error) {
    throw error;
  }

  return new Map(
    (data || []).map((profile) => [
      profile.id,
      {
        full_name: profile.full_name ?? null,
        email: profile.email ?? null,
      },
    ]),
  );
}

export async function getHrmReportingPageData(
  scope: HrmReportingScope,
  searchParams: RawSearchParams,
): Promise<HrmReportingPageData> {
  const roles = await getCurrentUserWithRoles();

  if (!roles?.hrmRole) {
    throw new Error("Unauthorized");
  }

  if (scope === "EMPLOYEE" && roles.hrmRole !== "EMPLOYEE") {
    throw new Error("Forbidden");
  }

  if (scope === "ADMIN" && roles.hrmRole !== "ADMIN") {
    throw new Error("Forbidden");
  }

  if (scope === "SUPER_ADMIN" && roles.hrmRole !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }

  const filters = await parseHrmReportingFilters(searchParams);
  const supabase = await createClient();

  let allowedUserIds: string[] = [roles.userId];

  if (roles.hrmRole === "ADMIN") {
    allowedUserIds = [roles.userId, ...(await getAssignedSubjectIds(roles.userId))];
  } else if (roles.hrmRole === "SUPER_ADMIN") {
    const { data, error } = await supabase
      .from("hrm_users")
      .select("id")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    allowedUserIds = (data || []).map((row) => row.id);
  }

  allowedUserIds = [...new Set(allowedUserIds)];

  let effectiveUserId = "";

  if (roles.hrmRole === "EMPLOYEE") {
    effectiveUserId = roles.userId;
  } else if (roles.hrmRole === "ADMIN") {
    effectiveUserId =
      filters.userId && allowedUserIds.includes(filters.userId)
        ? filters.userId
        : roles.userId;
  } else if (filters.userId && allowedUserIds.includes(filters.userId)) {
    effectiveUserId = filters.userId;
  }

  let countQuery = supabase
    .from("hrm_task_reports")
    .select("*", { count: "exact", head: true });

  let dataQuery = supabase
    .from("hrm_task_reports")
    .select(
      "id, author_user_id, category, task_title, proof_url, notes, reported_at, updated_at",
    )
    .order("reported_at", { ascending: false })
    .order("updated_at", { ascending: false });

  if (effectiveUserId) {
    countQuery = countQuery.eq("author_user_id", effectiveUserId);
    dataQuery = dataQuery.eq("author_user_id", effectiveUserId);
  } else if (roles.hrmRole !== "SUPER_ADMIN") {
    countQuery = countQuery.in("author_user_id", allowedUserIds);
    dataQuery = dataQuery.in("author_user_id", allowedUserIds);
  }

  if (filters.category) {
    countQuery = countQuery.eq("category", filters.category);
    dataQuery = dataQuery.eq("category", filters.category);
  }

  if (filters.dateFrom) {
    countQuery = countQuery.gte("reported_at", `${filters.dateFrom}T00:00:00.000Z`);
    dataQuery = dataQuery.gte("reported_at", `${filters.dateFrom}T00:00:00.000Z`);
  }

  if (filters.dateTo) {
    countQuery = countQuery.lte("reported_at", `${filters.dateTo}T23:59:59.999Z`);
    dataQuery = dataQuery.lte("reported_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  if (filters.q) {
    const escaped = filters.q.replace(/,/g, " ");
    countQuery = countQuery.or(`task_title.ilike.%${escaped}%,notes.ilike.%${escaped}%`);
    dataQuery = dataQuery.or(`task_title.ilike.%${escaped}%,notes.ilike.%${escaped}%`);
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  dataQuery = dataQuery.range(from, to);

  const [{ count, error: countError }, { data, error: dataError }] =
    await Promise.all([countQuery, dataQuery]);

  if (countError) {
    throw countError;
  }

  if (dataError) {
    throw dataError;
  }

  const userIds = [
    ...new Set([...(data || []).map((item) => item.author_user_id), ...allowedUserIds]),
  ];
  const profileMap = await getProfileMap(userIds);

  const userOptions = allowedUserIds
    .map((id) => {
      const profile = profileMap.get(id);
      return {
        id,
        fullName: profile?.full_name || profile?.email || "Unnamed user",
        email: profile?.email || "",
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const items: HrmTaskReportListItem[] = (data || []).map((item) => {
    const isOwnRecord = item.author_user_id === roles.userId;
    const canEdit =
      roles.hrmRole === "SUPER_ADMIN" ||
      (isOwnRecord && (roles.hrmRole === "EMPLOYEE" || roles.hrmRole === "ADMIN"));

    return {
      ...item,
      category: item.category as HrmTaskReportCategory,
      authorName: profileMap.get(item.author_user_id)?.full_name || null,
      authorEmail: profileMap.get(item.author_user_id)?.email || null,
      isOwnRecord,
      canEdit,
      canDelete: canEdit,
    };
  });

  const totalRows = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / filters.pageSize));

  return {
    role: roles.hrmRole,
    currentUserId: roles.userId,
    filters: {
      ...filters,
      userId: effectiveUserId,
    },
    items,
    totalRows,
    totalPages,
    userOptions,
  };
}
