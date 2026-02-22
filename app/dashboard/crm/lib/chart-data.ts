/**
 * Server-side functions to fetch chart data for CRM dashboards
 * Uses RPC for efficient time-series aggregation
 */

import { createClient } from "@/app/utils/supabase/server";

/**
 * Chart data point structure
 */
export interface ChartDataPoint {
  day: string; // YYYY-MM-DD format
  total: number;
  sold: number;
  notInterested: number;
  noResponse: number;
  invalidNumber: number;
  contacted: number;
  pipeline: number;
}

/**
 * Fetch time-series data for admin dashboard (all leads)
 */
export async function getAdminChartData(
  fromISO: string,
  toISO: string,
): Promise<ChartDataPoint[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("crm_leads_timeseries", {
      from_ts: fromISO,
      to_ts: toISO,
      scope_owner_id: null,
      scope_created_by: null,
    });

    if (error) {
      console.error("Error fetching admin chart data:", error);
      return [];
    }

    // Transform to chart format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((row: any) => ({
      day: row.day,
      total: Number(row.total),
      sold: Number(row.sold),
      notInterested: Number(row.not_interested),
      noResponse: Number(row.no_response),
      invalidNumber: Number(row.invalid_number),
      contacted: Number(row.contacted),
      pipeline: Number(row.pipeline),
    }));
  } catch (error) {
    console.error("Error in getAdminChartData:", error);
    return [];
  }
}

/**
 * Fetch time-series data for marketer dashboard (assigned leads - owner_id)
 */
export async function getMarketerAssignedChartData(
  crmUserId: string,
  fromISO: string,
  toISO: string,
): Promise<ChartDataPoint[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("crm_leads_timeseries", {
      from_ts: fromISO,
      to_ts: toISO,
      scope_owner_id: crmUserId,
      scope_created_by: null,
    });

    if (error) {
      console.error("Error fetching marketer assigned chart data:", error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((row: any) => ({
      day: row.day,
      total: Number(row.total),
      sold: Number(row.sold),
      notInterested: Number(row.not_interested),
      noResponse: Number(row.no_response),
      invalidNumber: Number(row.invalid_number),
      contacted: Number(row.contacted),
      pipeline: Number(row.pipeline),
    }));
  } catch (error) {
    console.error("Error in getMarketerAssignedChartData:", error);
    return [];
  }
}

/**
 * Fetch time-series data for marketer dashboard (created leads - created_by)
 */
export async function getMarketerCreatedChartData(
  crmUserId: string,
  fromISO: string,
  toISO: string,
): Promise<ChartDataPoint[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("crm_leads_timeseries", {
      from_ts: fromISO,
      to_ts: toISO,
      scope_owner_id: null,
      scope_created_by: crmUserId,
    });

    if (error) {
      console.error("Error fetching marketer created chart data:", error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((row: any) => ({
      day: row.day,
      total: Number(row.total),
      sold: Number(row.sold),
      notInterested: Number(row.not_interested),
      noResponse: Number(row.no_response),
      invalidNumber: Number(row.invalid_number),
      contacted: Number(row.contacted),
      pipeline: Number(row.pipeline),
    }));
  } catch (error) {
    console.error("Error in getMarketerCreatedChartData:", error);
    return [];
  }
}
