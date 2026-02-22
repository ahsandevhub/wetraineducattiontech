/**
 * KPI metrics using shared leads query builder
 * Ensures dashboard KPIs match the leads page exactly
 * Uses COUNT queries for accuracy beyond 1000 row limit
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  getDateRangeParams,
  type LeadsFilters,
  type LeadsFilterScope,
} from "./leads-query";

/**
 * KPI metrics response
 */
export interface KpiMetrics {
  total: number;
  sold: number;
  notInterested: number;
  noResponse: number;
  invalidNumber: number;
  contacted: number;
  pipeline: number;
  conversionRate: number;
}

/**
 * Get lead counts using the shared query builder
 * Uses COUNT queries (not data.length) so it works accurately for any row count
 *
 * IMPORTANT: This uses COUNT which is accurate for any number of rows,
 * unlike data.length which has a 1000 row limit in PostgREST.
 *
 * @param supabase - Supabase client
 * @param isAdmin - Whether user is admin
 * @param crmUserId - The CRM user ID (used if not admin)
 * @param fromISO - Optional ISO start date
 * @param toISO - Optional ISO end date
 * @param scope - Filter scope: "owner" (default) or "created"
 * @param filters - Additional filters (search, status, source, owner)
 *
 * @returns KpiMetrics object
 */
export async function getLeadKpiMetrics(
  supabase: SupabaseClient,
  isAdmin: boolean,
  crmUserId: string,
  fromISO?: string,
  toISO?: string,
  scope: LeadsFilterScope = "owner",
  filters: Omit<LeadsFilters, "fromDate" | "toDate"> = {},
): Promise<KpiMetrics> {
  try {
    // Convert ISO dates to YYYY-MM-DD format for query builder
    const dateParams = getDateRangeParams(fromISO, toISO);
    const fullFilters: LeadsFilters = { ...filters, ...dateParams };

    // Helper to build base query with filters (must call select() immediately for filter chain)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeBaseQuery = (): any => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: false });

      // Apply owner filter
      if (!isAdmin) {
        if (scope === "created") {
          q = q.eq("created_by", crmUserId);
        } else {
          q = q.eq("owner_id", crmUserId);
        }
      }

      // Apply date filters
      if (fullFilters.fromDate) {
        q = q.gte("created_at", fullFilters.fromDate);
      }
      if (fullFilters.toDate) {
        q = q.lte("created_at", `${fullFilters.toDate}T23:59:59`);
      }

      // Apply search filter
      if (fullFilters.search) {
        q = q.or(
          `name.ilike.%${fullFilters.search}%,phone.ilike.%${fullFilters.search}%,email.ilike.%${fullFilters.search}%,company.ilike.%${fullFilters.search}%`,
        );
      }

      // Apply status filter
      if (fullFilters.status && fullFilters.status !== "all") {
        q = q.eq("status", fullFilters.status.toUpperCase());
      }

      // Apply source filter
      if (fullFilters.source && fullFilters.source !== "all") {
        q = q.eq("source", fullFilters.source.toUpperCase());
      }

      // Apply owner filter for admin
      if (fullFilters.owner && fullFilters.owner !== "all" && isAdmin) {
        if (fullFilters.owner === "unassigned") {
          q = q.is("owner_id", null);
        } else {
          q = q.eq("owner_id", fullFilters.owner);
        }
      }

      return q;
    };

    // Get total count
    const totalResult = await makeBaseQuery();
    const total = totalResult.count || totalResult.data?.length || 0;

    // Get SOLD count (new status value)
    const soldResult = await makeBaseQuery().eq("status", "SOLD");
    const sold = soldResult.count || soldResult.data?.length || 0;

    // Get NOT_INTERESTED count
    const notInterestedResult = await makeBaseQuery().eq(
      "status",
      "NOT_INTERESTED",
    );
    const notInterested =
      notInterestedResult.count || notInterestedResult.data?.length || 0;

    // Get NO_RESPONSE count
    const noResponseResult = await makeBaseQuery().eq("status", "NO_RESPONSE");
    const noResponse =
      noResponseResult.count || noResponseResult.data?.length || 0;

    // Get INVALID_NUMBER count
    const invalidNumberResult = await makeBaseQuery().eq(
      "status",
      "INVALID_NUMBER",
    );
    const invalidNumber =
      invalidNumberResult.count || invalidNumberResult.data?.length || 0;

    // Get CONTACTED count (active progress statuses)
    const contactedResult = await makeBaseQuery().in("status", [
      "CONTACTED",
      "INTERESTED",
      "SOLD",
    ]);
    const contacted =
      contactedResult.count || contactedResult.data?.length || 0;

    // Calculate derived metrics
    // Pipeline = leads that are still in progress (not in terminal states)
    const pipeline = total - sold - notInterested - noResponse - invalidNumber;
    const conversionRate =
      total > 0 ? Math.round((sold / total) * 100 * 10) / 10 : 0;

    return {
      total,
      sold,
      notInterested,
      noResponse,
      invalidNumber,
      contacted,
      pipeline,
      conversionRate,
    };
  } catch (error) {
    console.error("Error fetching lead KPI metrics:", error);
    return {
      total: 0,
      sold: 0,
      notInterested: 0,
      noResponse: 0,
      invalidNumber: 0,
      contacted: 0,
      pipeline: 0,
      conversionRate: 0,
    };
  }
}

/**
 * Get status breakdown with accurate counts
 *
 * @param supabase - Supabase client
 * @param isAdmin - Whether user is admin
 * @param crmUserId - The CRM user ID (used if not admin)
 * @param fromISO - Optional ISO start date
 * @param toISO - Optional ISO end date
 * @param scope - Filter scope: "owner" (default) or "created"
 * @param filters - Additional filters
 *
 * @returns Array of { status, count, percentage }
 */
export async function getLeadStatusBreakdown(
  supabase: SupabaseClient,
  isAdmin: boolean,
  crmUserId: string,
  fromISO?: string,
  toISO?: string,
  scope: LeadsFilterScope = "owner",
  filters: Omit<LeadsFilters, "fromDate" | "toDate"> = {},
): Promise<Array<{ status: string; count: number; percentage: number }>> {
  try {
    // Convert ISO dates to YYYY-MM-DD format for query builder
    const dateParams = getDateRangeParams(fromISO, toISO);
    const fullFilters: LeadsFilters = { ...filters, ...dateParams };

    // Helper function to apply common filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyFilters = (q: any): any => {
      // Apply owner filter
      if (!isAdmin) {
        if (scope === "created") {
          q = q.eq("created_by", crmUserId);
        } else {
          q = q.eq("owner_id", crmUserId);
        }
      }

      // Apply date filters
      if (fullFilters.fromDate) {
        q = q.gte("created_at", fullFilters.fromDate);
      }
      if (fullFilters.toDate) {
        q = q.lte("created_at", `${fullFilters.toDate}T23:59:59`);
      }

      // Apply search filter
      if (fullFilters.search) {
        q = q.or(
          `name.ilike.%${fullFilters.search}%,phone.ilike.%${fullFilters.search}%,email.ilike.%${fullFilters.search}%,company.ilike.%${fullFilters.search}%`,
        );
      }

      // Apply status filter
      if (fullFilters.status && fullFilters.status !== "all") {
        q = q.eq("status", fullFilters.status.toUpperCase());
      }

      // Apply source filter
      if (fullFilters.source && fullFilters.source !== "all") {
        q = q.eq("source", fullFilters.source.toUpperCase());
      }

      // Apply owner filter for admin
      if (fullFilters.owner && fullFilters.owner !== "all" && isAdmin) {
        if (fullFilters.owner === "unassigned") {
          q = q.is("owner_id", null);
        } else {
          q = q.eq("owner_id", fullFilters.owner);
        }
      }

      return q;
    };

    // Get total count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let countQuery: any = supabase
      .from("crm_leads")
      .select("id", { count: "exact", head: true });
    countQuery = applyFilters(countQuery);
    const { count: total } = await countQuery;

    // Fetch all statuses with higher limit (up to 5000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dataQuery: any = supabase.from("crm_leads").select("status");
    dataQuery = applyFilters(dataQuery);
    const { data: theads, error } = await dataQuery.limit(5000);

    if (error) {
      console.error("Error fetching status breakdown:", error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leadsData: any[] = theads || [];

    // Group by status
    const statusCounts: Record<string, number> = {};
    leadsData.forEach((lead) => {
      const status = lead.status || "UNKNOWN";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Convert to array with percentages
    const breakdown = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage:
          (total || 0) > 0
            ? Math.round((count / (total || 1)) * 100 * 10) / 10
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return breakdown;
  } catch (error) {
    console.error("Error fetching status breakdown:", error);
    return [];
  }
}
