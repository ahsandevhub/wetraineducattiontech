"use client";

/**
 * CRM Marketer Performance Stacked Bar Chart
 * Shows lead conversion by team member using shadcn/ui charts
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export interface MarketerPerformanceData {
  name: string;
  total: number;
  sold: number;
  lost: number;
  active: number;
}

interface CrmMarketerPerformanceChartProps {
  data: MarketerPerformanceData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  sold: {
    label: "Sold",
    color: "hsl(142, 71%, 45%)", // green
  },
  active: {
    label: "Active",
    color: "hsl(217, 91%, 60%)", // blue
  },
  lost: {
    label: "Lost",
    color: "hsl(0, 72%, 51%)", // red
  },
} satisfies ChartConfig;

export function CrmMarketerPerformanceChart({
  data,
  title = "Marketer Performance",
  description = "Lead conversion by team member",
}: CrmMarketerPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart (abbreviated names for x-axis)
  const chartData = data.map((marketer) => ({
    name: marketer.name.split(" ")[0], // First name only for cleaner display
    fullName: marketer.name,
    sold: marketer.sold,
    active: marketer.active,
    lost: marketer.lost,
    total: marketer.total,
    conversionRate:
      marketer.total > 0
        ? ((marketer.sold / marketer.total) * 100).toFixed(1)
        : "0",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              formatter={(
                value: number,
                name: string,
                item: { payload: (typeof chartData)[0] },
              ) => {
                const dataPoint = item.payload;
                if (name === "sold" && dataPoint?.total > 0) {
                  return `${value} (${dataPoint.conversionRate}% conversion)`;
                }
                return value;
              }}
            />
            <Bar
              dataKey="sold"
              stackId="a"
              fill="hsl(142, 71%, 45%)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="active"
              stackId="a"
              fill="hsl(217, 91%, 60%)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="lost"
              stackId="a"
              fill="hsl(0, 72%, 51%)"
              radius={[4, 4, 0, 0]}
            />
            <ChartLegend />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
