"use client";

/**
 * HRM Performance Trend Chart
 * Shows employee performance over time using shadcn/ui charts
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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface PerformanceDataPoint {
  monthKey: string;
  monthlyScore: number;
  tier: string;
}

interface PerformanceTrendChartProps {
  data: PerformanceDataPoint[];
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(217, 91%, 60%)", // blue
  },
} satisfies ChartConfig;

const getTierColor = (tier: string): string => {
  switch (tier) {
    case "BONUS":
      return "#a855f7"; // purple
    case "APPRECIATION":
      return "#22c55e"; // green
    case "IMPROVEMENT":
      return "#eab308"; // yellow
    case "FINE":
      return "#ef4444"; // red
    default:
      return "#6366f1"; // indigo
  }
};

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Your monthly scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No performance data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart (reverse to show oldest to newest)
  const chartData = [...data].reverse().map((item) => ({
    month: item.monthKey,
    score: item.monthlyScore,
    tier: item.tier,
    fill: getTierColor(item.tier),
  }));

  // Calculate trend
  const avgScore =
    chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length;
  const latestScore = chartData[chartData.length - 1]?.score || 0;
  const trend = latestScore >= avgScore ? "above average" : "below average";
  const trendIcon = latestScore >= avgScore ? "↗" : "↘";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
        <CardDescription>
          Last {data.length} months • {trendIcon} Trending {trend}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 12,
              left: 12,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                // Format YYYY-MM to MMM 'YY
                const [year, month] = value.split("-");
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <ChartTooltip
              formatter={(value: any, name: string, item: any) => {
                const tierLabels: Record<string, string> = {
                  BONUS: "Bonus",
                  APPRECIATION: "Appreciation",
                  IMPROVEMENT: "Improvement",
                  FINE: "Fine",
                };
                return (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{value}/100</span>
                    <span className="text-xs text-muted-foreground">
                      {tierLabels[item.payload.tier] || item.payload.tier}
                    </span>
                  </div>
                );
              }}
            />
            <defs>
              <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-score)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-score)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="score"
              type="monotone"
              fill="url(#fillScore)"
              fillOpacity={0.4}
              stroke="var(--color-score)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
