/**
 * Marketer KPI Stats Cards
 * Displays key performance indicators for a marketer with tooltips
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Award,
  BarChart3,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { MarketerKpiMetrics } from "./crm-metrics";

interface CrmMarketerKpiCardsProps {
  metrics: MarketerKpiMetrics;
  rangeLabel?: string;
}

export function CrmMarketerKpiCards({
  metrics,
  rangeLabel = "Last 30 Days",
}: CrmMarketerKpiCardsProps) {
  const conversionColor =
    metrics.conversionRate > 50
      ? "text-green-600"
      : metrics.conversionRate > 25
        ? "text-blue-600"
        : "text-orange-600";

  const conversionBadgeVariant =
    metrics.conversionRate > 50
      ? "default"
      : metrics.conversionRate > 25
        ? "secondary"
        : "outline";

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-xs">
                    <p>
                      <strong>Total leads created by you</strong>
                    </p>
                    <p>Period: {rangeLabel}</p>
                    <p className="text-muted-foreground">
                      Scope: Your leads only (owner_id = your CRM user)
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-slate-500">All leads in period</p>
          </CardContent>
        </Card>

        {/* Converted */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Converted</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-xs">
                    <p>
                      <strong>Leads with status = SOLD</strong>
                    </p>
                    <p>Period: {rangeLabel}</p>
                    <p className="text-muted-foreground">
                      Scope: Your leads only (owner_id = your CRM user)
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.converted}
            </div>
            <p className="text-xs text-slate-500">Sold deals</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Conv. Rate</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-xs">
                    <p>
                      <strong>Formula: (Converted / Total) × 100</strong>
                    </p>
                    <p>Period: {rangeLabel}</p>
                    <p className="text-muted-foreground">
                      Scope: Your leads only (owner_id = your CRM user)
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${conversionColor}`}>
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <BadgeContainer variant={conversionBadgeVariant}>
              {metrics.conversionRate > 50
                ? "Excellent"
                : metrics.conversionRate > 25
                  ? "Good"
                  : "Below Target"}
            </BadgeContainer>
          </CardContent>
        </Card>

        {/* Lost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Lost</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-xs">
                    <p>
                      <strong>
                        Leads with status = NOT_INTERESTED, NO_RESPONSE, or
                        INVALID_NUMBER
                      </strong>
                    </p>
                    <p>Period: {rangeLabel}</p>
                    <p className="text-muted-foreground">
                      Scope: Your leads only (owner_id = your CRM user)
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.lost}
            </div>
            <p className="text-xs text-slate-500">Lost/closed leads</p>
          </CardContent>
        </Card>

        {/* Pipeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-xs">
                    <p>
                      <strong>Formula: Total – Converted – Lost</strong>
                    </p>
                    <p>Active opportunities in progress</p>
                    <p>Period: {rangeLabel}</p>
                    <p className="text-muted-foreground">
                      Scope: Your leads only (owner_id = your CRM user)
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.pipeline}
            </div>
            <p className="text-xs text-slate-500">In progress</p>
          </CardContent>
        </Card>

        {/* Contacted */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 text-xs">
                    <p>
                      <strong>
                        Statuses: CONTACTED, QUALIFIED, PROPOSAL, WON
                      </strong>
                    </p>
                    <p>Leads you have reached out to</p>
                    <p>Period: {rangeLabel}</p>
                    <p className="text-muted-foreground">
                      Scope: Your leads only (owner_id = your CRM user)
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {metrics.contacted}
            </div>
            <p className="text-xs text-slate-500">Reached out to</p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

function BadgeContainer({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "default" | "secondary" | "outline";
}) {
  return (
    <div className="mt-2">
      <Badge variant={variant}>{children}</Badge>
    </div>
  );
}
