/**
 * Shared CRM Metrics Computation
 * Works for both Admin (all leads) and Marketer (scoped leads)
 */

import { createClient } from "@/app/utils/supabase/server";

export interface CrmMetrics {
  totalLeads: number;
  converted: number;
  lost: number;
  pipeline: number;
  conversionRate: number;
  contacted: number;
}

export interface ComputeMetricsParams {
  ownerId?: string; // If provided, filters to this marketer's leads
  fromISO?: string; // ISO 8601 datetime: YYYY-MM-DDTHH:mm:ss.sssZ
  toISO?: string;
}

/**
 * Compute CRM metrics for admin (all leads) or marketer (scoped leads)
 * If ownerId is provided, filters by owner_id
 * If date range is provided, filters by created_at
 *
 * Uses COUNT queries for accurate totals regardless of row count
 */
export async function computeCrmMetrics(
  params: ComputeMetricsParams,
): Promise<CrmMetrics> {
  const supabase = await createClient();

  try {
    // Helper function to build count queries with filters
    const buildCountQuery = (statusFilter?: string) => {
      let query = supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true });
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      if (params.ownerId) {
        query = query.eq("owner_id", params.ownerId);
      }
      if (params.fromISO) {
        query = query.gte("created_at", params.fromISO);
      }
      if (params.toISO) {
        query = query.lte("created_at", params.toISO);
      }
      return query;
    };

    // Get counts using COUNT queries (accurate for any row count)
    const { count: totalCount } = await buildCountQuery();
    const totalLeads = totalCount || 0;

    const { count: convertedCount } = await buildCountQuery("WON");
    const converted = convertedCount || 0;

    const { count: lostCount } = await buildCountQuery("LOST");
    const lost = lostCount || 0;

    // For contacted, we need to count multiple statuses
    // Fetch the data to filter, but with a higher limit for accuracy
    let contactedQuery = supabase.from("crm_leads").select("status");
    if (params.ownerId) {
      contactedQuery = contactedQuery.eq("owner_id", params.ownerId);
    }
    if (params.fromISO) {
      contactedQuery = contactedQuery.gte("created_at", params.fromISO);
    }
    if (params.toISO) {
      contactedQuery = contactedQuery.lte("created_at", params.toISO);
    }
    const { data: contactedData } = await contactedQuery
      .in("status", ["CONTACTED", "QUALIFIED", "PROPOSAL", "WON"])
      .limit(5000);
    const contacted = contactedData?.length || 0;

    // Calculate derived metrics
    const pipeline = totalLeads - converted - lost;
    const conversionRate =
      totalLeads > 0 ? Math.round((converted / totalLeads) * 100 * 10) / 10 : 0;

    return {
      totalLeads,
      converted,
      lost,
      pipeline,
      conversionRate,
      contacted,
    };
  } catch (error) {
    console.error("Error in computeCrmMetrics:", error);
    return {
      totalLeads: 0,
      converted: 0,
      lost: 0,
      pipeline: 0,
      conversionRate: 0,
      contacted: 0,
    };
  }
}
