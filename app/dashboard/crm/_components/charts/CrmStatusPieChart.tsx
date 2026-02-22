"use client";

/**
 * CRM Status Breakdown Pie Chart
 * Replaces the table with a visual pie chart using shadcn/ui charts
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
} from "@/components/ui/chart";
import { Cell, Label, Pie, PieChart } from "recharts";
import { StatusBreakdown } from "../crm-metrics";

interface CrmStatusPieChartProps {
  breakdown: StatusBreakdown[];
  title?: string;
  description?: string;
}

const STATUS_CHART_COLORS: Record<
  string,
  { color: string; displayName: string }
> = {
  NEW: {
    color: "hsl(217, 91%, 60%)", // blue
    displayName: "New",
  },
  CONTACTED: {
    color: "hsl(47, 96%, 53%)", // yellow
    displayName: "Contacted",
  },
  INTERESTED: {
    color: "hsl(262, 83%, 58%)", // purple
    displayName: "Interested",
  },
  SOLD: {
    color: "hsl(142, 71%, 45%)", // green
    displayName: "Sold",
  },
  NOT_INTERESTED: {
    color: "hsl(0, 72%, 51%)", // red
    displayName: "Not Interested",
  },
  NO_RESPONSE: {
    color: "hsl(0, 0%, 63%)", // gray
    displayName: "No Response",
  },
  INVALID_NUMBER: {
    color: "hsl(15, 80%, 50%)", // orange
    displayName: "Invalid Number",
  },
  UNKNOWN: {
    color: "hsl(0, 0%, 63%)", // gray
    displayName: "Unknown",
  },
};

export function CrmStatusPieChart({
  breakdown,
  title = "Leads by Status",
  description,
}: CrmStatusPieChartProps) {
  if (!breakdown || breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No leads found
          </p>
        </CardContent>
      </Card>
    );
  }

  const normalizeStatusKey = (value?: string | null) => {
    const trimmed = value?.trim();
    if (!trimmed) return "UNKNOWN";
    const lower = trimmed.toLowerCase();
    if (lower === "undefined" || lower === "null") return "UNKNOWN";
    return trimmed.toUpperCase();
  };

  const formatStatusLabel = (value: string) => {
    if (value === "UNKNOWN") return "Unknown";
    return value
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const normalizedCounts = breakdown.reduce<Record<string, number>>(
    (acc, item) => {
      const statusKey = normalizeStatusKey(item.status);
      acc[statusKey] = (acc[statusKey] || 0) + item.count;
      return acc;
    },
    {},
  );

  const totalLeads = Object.values(normalizedCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Transform breakdown to chart data
  const chartData = Object.entries(normalizedCounts).map(([status, count]) => ({
    status,
    count,
    percentage: totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : "0",
    fill: STATUS_CHART_COLORS[status]?.color || "hsl(var(--muted-foreground))",
  }));

  // Create chart config
  const chartConfig: ChartConfig = Object.keys(normalizedCounts).reduce(
    (config, status) => {
      const statusInfo = STATUS_CHART_COLORS[status] || {
        displayName: formatStatusLabel(status),
        color: "hsl(var(--muted-foreground))",
      };
      config[status] = {
        label: statusInfo.displayName,
        color: statusInfo.color,
      };
      return config;
    },
    {} as ChartConfig,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              formatter={(value: number, name: string) => {
                const item = chartData.find((d) => d.status === name);
                return (
                  <span>
                    {value} ({item?.percentage}%)
                  </span>
                );
              }}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalLeads.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Total Leads
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
