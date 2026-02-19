/**
 * CRM Reports Panel (Admin)
 * Reusable component showing admin reports
 * Can be embedded in dashboard or shown on dedicated reports page
 */

import { getAdminChartData } from "@/app/dashboard/crm/lib/chart-data";
import { createClient } from "@/app/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BarChart3, TrendingUp, Users } from "lucide-react";
import { CrmConsolidatedAreaChart } from "./charts/CrmConsolidatedAreaChart";
import { CrmLeadSourcesPieChart } from "./charts/CrmLeadSourcesPieChart";
import { CrmMarketerPerformanceChart } from "./charts/CrmMarketerPerformanceChart";

interface CrmReportsPanelProps {
  isAdmin: boolean;
  dateRange?: {
    key: string;
    label: string;
    fromISO?: string;
    toISO?: string;
  };
}

export async function CrmReportsPanel({
  isAdmin,
  dateRange,
}: CrmReportsPanelProps) {
  if (!isAdmin) return null;

  const supabase = await createClient();

  // === GET ACCURATE COUNTS USING COUNT: "EXACT" ===
  // Helper function to build count queries with date filters
  const buildCountQuery = (statusFilter?: string) => {
    let query = supabase
      .from("crm_leads")
      .select("id", { count: "exact", head: true });
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }
    if (dateRange?.fromISO) {
      query = query.gte("created_at", dateRange.fromISO);
    }
    if (dateRange?.toISO) {
      query = query.lte("created_at", dateRange.toISO);
    }
    return query;
  };

  // Total leads (using COUNT, not data.length)
  const { count: totalLeadsCount } = await buildCountQuery();
  const totalLeads = totalLeadsCount || 0;

  // Sold leads count (NEW STATUS: SOLD)
  const { count: soldLeadsCount } = await buildCountQuery("SOLD");
  const soldLeads = soldLeadsCount || 0;

  // Lost leads count (NEW STATUSES: NOT_INTERESTED, NO_RESPONSE, INVALID_NUMBER)
  // We need to query each separately and sum them
  const { count: notInterestedCount } = await buildCountQuery("NOT_INTERESTED");
  const { count: noResponseCount } = await buildCountQuery("NO_RESPONSE");
  const { count: invalidNumberCount } = await buildCountQuery("INVALID_NUMBER");
  const lostLeads =
    (notInterestedCount || 0) +
    (noResponseCount || 0) +
    (invalidNumberCount || 0);

  // Derived metrics based on accurate counts
  const activeLeads = totalLeads - soldLeads - lostLeads;
  const conversionRate =
    totalLeads > 0 ? ((soldLeads / totalLeads) * 100).toFixed(1) : "0";

  // === GET BREAKDOWN DATA (with higher limit for accuracy) ===
  // Fetch leads with breakdown data for marketer performance and sources
  let breakdownQuery = supabase.from("crm_leads").select(
    `
      id,
      status,
      source,
      owner_id,
      owner:crm_users!crm_leads_owner_id_fkey(id, full_name)
    `,
    { count: "exact" },
  );

  // Apply date filters to breakdown query
  if (dateRange?.fromISO) {
    breakdownQuery = breakdownQuery.gte("created_at", dateRange.fromISO);
  }
  if (dateRange?.toISO) {
    breakdownQuery = breakdownQuery.lte("created_at", dateRange.toISO);
  }

  const { data: leads } = await breakdownQuery.limit(5000); // Fetch up to 5000 for accurate breakdowns

  // Get marketer performance
  interface MarketerStat {
    name: string;
    total: number;
    sold: number;
    lost: number;
    active: number;
  }
  const marketerStats = leads?.reduce(
    (acc: Record<string, MarketerStat>, lead) => {
      const ownerId = lead.owner_id;
      const ownerArray = lead.owner as { id: string; full_name: string }[];
      const ownerName = (ownerArray && ownerArray[0]?.full_name) || "Unknown";

      if (!acc[ownerId]) {
        acc[ownerId] = {
          name: ownerName,
          total: 0,
          sold: 0,
          lost: 0,
          active: 0,
        };
      }

      acc[ownerId].total++;
      // NEW STATUS LOGIC: SOLD instead of WON
      if (lead.status === "SOLD") acc[ownerId].sold++;
      // NEW STATUS LOGIC: NOT_INTERESTED, NO_RESPONSE, INVALID_NUMBER instead of LOST
      else if (
        lead.status === "NOT_INTERESTED" ||
        lead.status === "NO_RESPONSE" ||
        lead.status === "INVALID_NUMBER"
      )
        acc[ownerId].lost++;
      else acc[ownerId].active++;

      return acc;
    },
    {},
  );

  const marketerPerformance = Object.values(marketerStats || {}).sort(
    (a, b) => b.sold - a.sold,
  );

  // Lead sources breakdown
  const sourceStats = leads?.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});

  // Fetch chart data for trends
  const chartData = await getAdminChartData(
    dateRange?.fromISO ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dateRange?.toISO || new Date().toISOString(),
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-slate-500">
              {dateRange?.label || "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sold Deals</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{soldLeads}</div>
            <p className="text-xs text-slate-500">Successfully closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeLeads}
            </div>
            <p className="text-xs text-slate-500">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {conversionRate}%
            </div>
            <p className="text-xs text-slate-500">Won / Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Trends</h2>
        <CrmConsolidatedAreaChart
          data={chartData}
          title="All Leads Trends"
          description="Consolidated view of all KPI status counts over time (all team members)"
          dateRangeLabel={dateRange?.label}
        />
      </div>

      {/* Marketer Performance */}
      <CrmMarketerPerformanceChart
        data={marketerPerformance}
        title="Marketer Performance"
        description="Lead conversion by team member (stacked bar chart)"
      />

      {/* Lead Sources */}
      <CrmLeadSourcesPieChart
        data={sourceStats || {}}
        totalLeads={totalLeads}
        title="Lead Sources"
        description="Where your leads are coming from"
      />
    </div>
  );
}
