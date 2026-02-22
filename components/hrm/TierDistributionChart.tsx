"use client";

/**
 * HRM Tier Distribution Bar Chart
 * Shows performance tier breakdown using shadcn/ui charts
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
  ChartTooltip,
} from "@/components/ui/chart";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

type TierDistribution = {
  BONUS: number;
  APPRECIATION: number;
  IMPROVEMENT: number;
  FINE: number;
};

interface TierDistributionChartProps {
  distribution: TierDistribution;
  monthKey?: string;
  totalEmployees?: number;
}

const chartConfig = {
  count: {
    label: "Employees",
  },
  BONUS: {
    label: "Bonus",
    color: "hsl(262, 83%, 58%)", // purple
  },
  APPRECIATION: {
    label: "Appreciation",
    color: "hsl(142, 71%, 45%)", // green
  },
  IMPROVEMENT: {
    label: "Improvement",
    color: "hsl(47, 96%, 53%)", // yellow
  },
  FINE: {
    label: "Fine",
    color: "hsl(0, 72%, 51%)", // red
  },
} satisfies ChartConfig;

export function TierDistributionChart({
  distribution,
  monthKey,
  totalEmployees,
}: TierDistributionChartProps) {
  const chartData = [
    {
      tier: "BONUS",
      count: distribution.BONUS,
      label: "Bonus",
      fill: chartConfig.BONUS.color,
    },
    {
      tier: "APPRECIATION",
      count: distribution.APPRECIATION,
      label: "Appreciation",
      fill: chartConfig.APPRECIATION.color,
    },
    {
      tier: "IMPROVEMENT",
      count: distribution.IMPROVEMENT,
      label: "Improvement",
      fill: chartConfig.IMPROVEMENT.color,
    },
    {
      tier: "FINE",
      count: distribution.FINE,
      label: "Fine",
      fill: chartConfig.FINE.color,
    },
  ];

  const total = totalEmployees || 0;
  const hasData = total > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>
              {monthKey && `${monthKey} - `}
              {hasData ? `${total} Employees` : "No data yet"}
            </CardDescription>
          </div>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip hideLabel />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                fill="var(--color-count)"
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No performance data available for this month yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
