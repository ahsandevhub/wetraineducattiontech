"use client";

/**
 * CRM Consolidated Area Chart
 * Shows trends of all KPI statuses in one unified chart using shadcn/ui
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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

interface CrmConsolidatedAreaChartProps {
  data: ChartDataPoint[];
  title?: string;
  description?: string;
  dateRangeLabel?: string;
}

const chartConfig = {
  total: {
    label: "Total Leads",
    color: "hsl(217, 91%, 60%)", // blue
  },
  sold: {
    label: "Sold",
    color: "hsl(142, 71%, 45%)", // green
  },
  contacted: {
    label: "Contacted",
    color: "hsl(47, 96%, 53%)", // yellow
  },
  pipeline: {
    label: "Pipeline",
    color: "hsl(262, 83%, 58%)", // purple
  },
  notInterested: {
    label: "Not Interested",
    color: "hsl(0, 72%, 51%)", // red
  },
} satisfies ChartConfig;

export function CrmConsolidatedAreaChart({
  data,
  title = "Lead Trends Over Time",
  description,
  dateRangeLabel,
}: CrmConsolidatedAreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for display
  const chartData = data.map((point) => ({
    date: new Date(point.day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    total: point.total || 0,
    sold: point.sold || 0,
    contacted: point.contacted || 0,
    pipeline: point.pipeline || 0,
    notInterested: point.notInterested || 0,
  }));

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{title}</span>
          {dateRangeLabel && (
            <span className="text-xs font-normal text-muted-foreground">
              {dateRangeLabel}
            </span>
          )}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(217, 91%, 60%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(217, 91%, 60%)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillSold" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142, 71%, 45%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 71%, 45%)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillContacted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(47, 96%, 53%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(47, 96%, 53%)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillPipeline" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(262, 83%, 58%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(262, 83%, 58%)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient
                id="fillNotInterested"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(0, 72%, 51%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(0, 72%, 51%)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#fillTotal)"
              fillOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="sold"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fill="url(#fillSold)"
              fillOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="contacted"
              stroke="hsl(47, 96%, 53%)"
              strokeWidth={2}
              fill="url(#fillContacted)"
              fillOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="pipeline"
              stroke="hsl(262, 83%, 58%)"
              strokeWidth={2}
              fill="url(#fillPipeline)"
              fillOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="notInterested"
              stroke="hsl(0, 72%, 51%)"
              strokeWidth={2}
              fill="url(#fillNotInterested)"
              fillOpacity={0.4}
            />
            <ChartLegend />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
