/**
 * Server query helper for marketer KPI metrics
 * Delegates to the shared KPI builder for consistent filtering
 */

import { createClient } from "@/app/utils/supabase/server";

/**
 * Date range filter parameters
 */
export interface DateRange {
  from?: string; // ISO date string or YYYY-MM-DD
  to?: string; // ISO date string or YYYY-MM-DD
}

/**
 * Marketer KPI metrics
 */
export interface MarketerKpiMetrics {
  totalLeads: number;
  converted: number;
  conversionRate: number;
  lost: number;
  pipeline: number;
  contacted: number;
  lastUpdated: string;
}

/**
 * Metrics scope type
 * - "assigned": Metrics for leads where marketer is the owner (owner_id)
 * - "created": Metrics for leads created/requested by the marketer (created_by)
 */
export type MetricsScope = "assigned" | "created";

/**
 * Status breakdown by count
 */
export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

/**
 * Fetch KPI metrics for a specific marketer (MARKETER role)
 *
 * @param crmUserId - The ID of the marketer/user
 * @param scope - Metrics scope: "assigned" (owner_id) or "created" (created_by)
 * @param dateRange - Optional date range filter (from/to as ISO or YYYY-MM-DD)
 * @returns MarketerKpiMetrics
 */
export async function getMarketerKpiMetrics(
  crmUserId: string,
  scope: MetricsScope = "assigned",
  dateRange?: DateRange,
): Promise<MarketerKpiMetrics> {
  const supabase = await createClient();

  // Convert date range to ISO format if needed
  // dateRange.from/to can be either ISO or YYYY-MM-DD
  // We'll normalize to ISO format for consistency
  const fromISO = dateRange?.from
    ? dateRange.from.includes("T")
      ? dateRange.from
      : `${dateRange.from}T00:00:00.000Z`
    : undefined;

  const toISO = dateRange?.to
    ? dateRange.to.includes("T")
      ? dateRange.to
      : `${dateRange.to}T23:59:59.999Z`
    : undefined;

  try {
    const { getLeadKpiMetrics } = await import("../lib/kpi");

    const metrics = await getLeadKpiMetrics(
      supabase,
      false, // isAdmin = false for marketer
      crmUserId,
      fromISO,
      toISO,
      scope === "created" ? "created" : "owner",
    );

    return {
      totalLeads: metrics.total,
      converted: metrics.sold,
      conversionRate: metrics.conversionRate,
      lost: metrics.notInterested + metrics.noResponse + metrics.invalidNumber,
      pipeline: metrics.pipeline,
      contacted: metrics.contacted,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `Error fetching marketer KPI metrics (scope: ${scope}):`,
      error,
    );
    return {
      totalLeads: 0,
      converted: 0,
      conversionRate: 0,
      lost: 0,
      pipeline: 0,
      contacted: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Fetch status breakdown for a specific marketer
 * @param crmUserId - The ID of the marketer/user
 * @param scope - Metrics scope: "assigned" (owner_id) or "created" (created_by)
 * @param dateRange - Optional date range filter (from/to as ISO or YYYY-MM-DD)
 */
export async function getMarketerStatusBreakdown(
  crmUserId: string,
  scope: MetricsScope = "assigned",
  dateRange?: DateRange,
): Promise<StatusBreakdown[]> {
  const supabase = await createClient();

  // Convert date range to ISO format if needed
  const fromISO = dateRange?.from
    ? dateRange.from.includes("T")
      ? dateRange.from
      : `${dateRange.from}T00:00:00.000Z`
    : undefined;

  const toISO = dateRange?.to
    ? dateRange.to.includes("T")
      ? dateRange.to
      : `${dateRange.to}T23:59:59.999Z`
    : undefined;

  try {
    const { getLeadStatusBreakdown } = await import("../lib/kpi");

    const breakdown = await getLeadStatusBreakdown(
      supabase,
      false, // isAdmin = false for marketer
      crmUserId,
      fromISO,
      toISO,
      scope === "created" ? "created" : "owner",
    );

    return breakdown;
  } catch (error) {
    console.error("Error in getMarketerStatusBreakdown:", error);
    return [];
  }
}
