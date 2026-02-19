"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartLegend } from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartDataPoint {
  day: string;
  total?: number;
  sold?: number;
  notInterested?: number;
  noResponse?: number;
  invalidNumber?: number;
  contacted?: number;
  pipeline?: number;
}

interface CrmLeadsAreaChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  variant: "total" | "outcomes";
  tooltipText?: string;
  dateRangeLabel?: string;
  scope?: "assigned" | "created";
}

/**
 * Reusable area chart for CRM leads trends
 * Supports two variants:
 * - "total": Shows total leads trend
 * - "outcomes": Shows won/lost/pipeline stacked
 */
export function CrmLeadsAreaChart({
  title,
  description,
  data,
  variant,
  tooltipText,
  dateRangeLabel,
  scope,
}: CrmLeadsAreaChartProps) {
  const getTotalConfig: ChartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--primary))",
    },
  };

  const getOutcomesConfig: ChartConfig = {
    pipeline: {
      label: "Pipeline",
      color: "hsl(var(--warning))",
    },
    sold: {
      label: "Sold",
      color: "hsl(var(--success))",
    },
    notInterested: {
      label: "Not Interested",
      color: "hsl(var(--destructive))",
    },
  };

  const config = variant === "total" ? getTotalConfig : getOutcomesConfig;

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((point) => ({
    day: point.day,
    total: point.total || 0,
    sold: point.sold || 0,
    notInterested: point.notInterested || 0,
    pipeline: point.pipeline || 0,
  }));

  const defaultTooltipText =
    variant === "total"
      ? "Aggregated server-side. Shows total leads created on each day."
      : "Aggregated server-side. Sold = status SOLD, Not Interested = status NOT_INTERESTED, Pipeline = Total - Sold - Not Interested - No Response - Invalid Number";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{title}</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>{tooltipText || defaultTooltipText}</p>
                    {dateRangeLabel && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Range: {dateRangeLabel}
                      </p>
                    )}
                    {scope && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Scope:{" "}
                        {scope === "assigned"
                          ? "Leads assigned to you (owner_id)"
                          : "Leads created/requested by you (created_by)"}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--success))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--success))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--destructive))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--destructive))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--warning))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--warning))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  return (
                    <div className="rounded-md border border-border bg-background p-2 shadow-md">
                      <p className="font-medium text-sm">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex gap-2 text-xs mt-1">
                          <span
                            className="w-2 h-2 rounded-sm mt-0.5"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-muted-foreground">
                            {config[entry.dataKey as keyof typeof config]
                              ?.label || entry.dataKey}
                            :
                          </span>
                          <span className="font-mono font-medium">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              />
              {variant === "total" && (
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  isAnimationActive={false}
                />
              )}
              {variant === "outcomes" && (
                <>
                  <Area
                    type="monotone"
                    dataKey="pipeline"
                    stackId="1"
                    stroke="none"
                    fill="url(#colorPipeline)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="sold"
                    stackId="1"
                    stroke="none"
                    fill="url(#colorWon)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="notInterested"
                    stackId="1"
                    stroke="none"
                    fill="url(#colorLost)"
                    isAnimationActive={false}
                  />
                </>
              )}
              <ChartLegend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
