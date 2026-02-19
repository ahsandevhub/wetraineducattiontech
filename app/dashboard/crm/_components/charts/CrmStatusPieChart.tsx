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

  const totalLeads = breakdown.reduce((sum, item) => sum + item.count, 0);

  // Transform breakdown to chart data
  const chartData = breakdown.map((item) => ({
    status: item.status,
    count: item.count,
    percentage: item.percentage,
    fill:
      STATUS_CHART_COLORS[item.status]?.color || "hsl(var(--muted-foreground))",
  }));

  // Create chart config
  const chartConfig: ChartConfig = breakdown.reduce((config, item) => {
    const statusInfo = STATUS_CHART_COLORS[item.status] || {
      displayName: item.status,
      color: "hsl(var(--muted-foreground))",
    };
    config[item.status] = {
      label: statusInfo.displayName,
      color: statusInfo.color,
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card className="mt-6">
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
                const item = breakdown.find((b) => b.status === name);
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
