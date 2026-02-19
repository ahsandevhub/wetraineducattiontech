/**
 * CRM Dashboard Home
 * Shows role-specific dashboard:
 * - ADMIN: Reports panel with team performance metrics
 * - MARKETER: KPI cards with conversion metrics and status breakdown
 */

import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CrmDateRangeSelect } from "./_components/CrmDateRangeSelect";
import { CrmMarketerKpiCards } from "./_components/CrmMarketerKpiCards";
import { CrmReportsPanel } from "./_components/CrmReportsPanel";
import { CrmConsolidatedAreaChart } from "./_components/charts/CrmConsolidatedAreaChart";
import { CrmStatusPieChart } from "./_components/charts/CrmStatusPieChart";
import {
  getMarketerKpiMetrics,
  getMarketerStatusBreakdown,
} from "./_components/crm-metrics";
import { getMarketerAssignedChartData } from "./lib/chart-data";
import { getCrmRange } from "./lib/date-range";

export default async function CrmDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const roles = await getCurrentUserWithRoles();
  const supabase = await createClient();

  const isAdmin = roles?.crmRole === "ADMIN";
  const isMarketer = roles?.crmRole === "MARKETER";

  // Get date range from URL params
  const range = getCrmRange({
    get: (key: string) => {
      const value = params[key];
      return typeof value === "string" ? value : null;
    },
  });

  // Quick stats for non-admin users
  const { count: totalLeads } = await supabase
    .from("crm_leads")
    .select("*", { count: "exact", head: true });

  const { count: activeLeads } = await supabase
    .from("crm_leads")
    .select("*", { count: "exact", head: true })
    .in("status", ["NEW", "CONTACTED", "QUALIFIED"]);

  const { count: totalUsers } = await supabase
    .from("crm_users")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {roles?.email} ({roles?.crmRole})
          </p>
        </div>
        <CrmDateRangeSelect currentRange={range.key} />
      </div>

      {/* ADMIN DASHBOARD */}
      {isAdmin && (
        <>
          <CrmReportsPanel isAdmin={true} dateRange={range} />
        </>
      )}

      {/* MARKETER DASHBOARD */}
      {isMarketer && roles?.crmUserId && (
        <>
          {/* Fetch marketer metrics */}
          <MarketerDashboardContent
            crmUserId={roles.crmUserId}
            dateRange={range}
          />
        </>
      )}

      {/* FALLBACK / GENERIC DASHBOARD (for other roles or initial load) */}
      {!isAdmin && !isMarketer && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLeads || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeLeads || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-lg border p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">CRM Module</h2>
            <p className="text-muted-foreground mb-4">
              LeadPilot features are being migrated here.
            </p>
            <div className="flex gap-2 justify-center">
              <Link
                href="/dashboard/crm/leads"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                View Leads
              </Link>
              {isAdmin && (
                <Link
                  href="/dashboard/crm/admin/users"
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Manage Users
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Marketer Dashboard Content
 * Server component that fetches marketer-specific metrics (both assigned and created leads)
 */
async function MarketerDashboardContent({
  crmUserId,
  dateRange,
}: {
  crmUserId: string;
  dateRange: { key: string; label: string; fromISO?: string; toISO?: string };
}) {
  // Fetch metrics for "Assigned to Me" ONLY (leads you own - owner_id = crmUserId)
  const assignedMetrics = await getMarketerKpiMetrics(crmUserId, "assigned", {
    from: dateRange.fromISO,
    to: dateRange.toISO,
  });
  const assignedStatusBreakdown = await getMarketerStatusBreakdown(
    crmUserId,
    "assigned",
    {
      from: dateRange.fromISO,
      to: dateRange.toISO,
    },
  );

  // Fetch chart data for assigned leads
  const defaultFromISO =
    dateRange?.fromISO ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const defaultToISO = dateRange?.toISO || new Date().toISOString();

  const assignedChartData = await getMarketerAssignedChartData(
    crmUserId,
    defaultFromISO,
    defaultToISO,
  );

  return (
    <>
      {/* PRIMARY: Assigned to Me (leads you own) */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>📋</span> Assigned to Me
            <span className="text-xs text-muted-foreground font-normal">
              (Leads you own)
            </span>
          </h2>
        </div>
        <CrmMarketerKpiCards
          metrics={assignedMetrics}
          rangeLabel={dateRange.label}
        />

        {/* Consolidated Chart - All KPI Trends */}
        <CrmConsolidatedAreaChart
          data={assignedChartData}
          title="Lead Trends Over Time"
          description="All KPI status counts visualized in one consolidated view"
          dateRangeLabel={dateRange.label}
        />

        <CrmStatusPieChart
          breakdown={assignedStatusBreakdown}
          title="Leads by Status"
          description="Visual breakdown of your assigned leads by current status"
        />
      </div>

      {/* Quick Links */}
      <div className="flex gap-2 mt-6">
        <Link
          href="/dashboard/crm/leads"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          View All Leads
        </Link>
      </div>
    </>
  );
}
