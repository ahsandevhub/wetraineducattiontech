"use client";

/**
 * DashboardScrollManager - Placeholder for dashboard-wide effects
 *
 * Currently unused - browser's native scroll restoration handles back/forward navigation.
 * LeadFilters prevents mount-time router.push to avoid scroll-to-top on back navigation.
 */
export function DashboardScrollManager() {
  // Let browser handle scroll restoration naturally
  // No need to set history.scrollRestoration = "manual"
  return null;
}
