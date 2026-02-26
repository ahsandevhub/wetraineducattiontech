/**
 * Shared leads query builder
 * Ensures consistent filtering logic between leads page and dashboard
 * This is the single source of truth for how leads are filtered
 */

import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Filter parameters for leads query
 */
export interface LeadsFilters {
  search?: string;
  status?: string;
  source?: string;
  owner?: string; // admin only
  fromDate?: string; // YYYY-MM-DD format
  toDate?: string; // YYYY-MM-DD format
}

/**
 * Scope for filtering leads
 * - "owner": Filter by owner_id (marketer's assigned leads)
 */
export type LeadsFilterScope = "owner";

/**
 * Build a leads query with consistent filtering logic
 * Matches the exact filtering from app/dashboard/crm/leads/page.tsx
 *
 * @param supabase - Supabase client
 * @param isAdmin - Whether user is admin
 * @param crmUserId - The CRM user ID (used if not admin and not "created" scope)
 * @param filters - Query filters
 * @param includeRelations - Include owner/contact_logs relations (for leads page data fetch)
 * @param forCountOnly - Optimize for count query (no relations needed)
 *
 * @returns The configured query, ready to add pagination or execute count
 */
export function buildLeadsQuery(
  supabase: SupabaseClient,
  isAdmin: boolean,
  crmUserId: string,
  filters: LeadsFilters = {},
  includeRelations = false,
  forCountOnly = false,
) {
  // Build select statement
  let selectStr = "*";
  if (includeRelations && !forCountOnly) {
    selectStr = `
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
    `;
  }

  // Start base query
  let q = supabase.from("crm_leads").select(selectStr);

  // Owner filter - only filter by owner_id if not admin
  if (!isAdmin) {
    q = q.eq("owner_id", crmUserId);
  }

  // Search filter (matches leads page)
  if (filters.search) {
    q = q.or(
      `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`,
    );
  }

  // Status filter (matches leads page)
  if (filters.status && filters.status !== "all") {
    q = q.eq("status", filters.status.toUpperCase());
  }

  // Source filter (matches leads page)
  if (filters.source && filters.source !== "all") {
    q = q.eq("source", filters.source.toUpperCase());
  }

  // Owner filter for admin (matches leads page)
  if (filters.owner && filters.owner !== "all" && isAdmin) {
    if (filters.owner === "unassigned") {
      q = q.is("owner_id", null);
    } else {
      q = q.eq("owner_id", filters.owner);
    }
  }

  // Date range filters (matches leads page exactly)
  // IMPORTANT: fromDate and toDate should be in YYYY-MM-DD format
  // The leads page applies:
  // - gte("created_at", fromDate) - from midnight of start date
  // - lte("created_at", "${toDate}T23:59:59") - until end of day
  if (filters.fromDate) {
    q = q.gte("created_at", filters.fromDate);
  }

  if (filters.toDate) {
    q = q.lte("created_at", `${filters.toDate}T23:59:59`);
  }

  // Don't add ordering or pagination - let caller handle that
  return q;
}

/**
 * Convert ISO date string to YYYY-MM-DD format for query
 * @param isoDate - ISO 8601 date string (e.g., 2026-02-01T00:00:00.000Z)
 * @returns YYYY-MM-DD format (e.g., 2026-02-01)
 */
export function isoToDateString(
  isoDate: string | undefined,
): string | undefined {
  if (!isoDate) return undefined;
  // Extract YYYY-MM-DD from ISO string
  const match = isoDate.match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[0] : undefined;
}

/**
 * Get date range parameters suitable for buildLeadsQuery
 * Converts dashboard ISO dates to YYYY-MM-DD format
 *
 * @param fromISO - Optional ISO date string
 * @param toISO - Optional ISO date string
 * @returns Object with fromDate and toDate in YYYY-MM-DD format
 */
export function getDateRangeParams(
  fromISO?: string,
  toISO?: string,
): { fromDate?: string; toDate?: string } {
  return {
    fromDate: isoToDateString(fromISO),
    toDate: isoToDateString(toISO),
  };
}
