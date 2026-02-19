"use client";

/**
 * CRM Lead Sources Pie Chart
 * Shows where leads are coming from using shadcn/ui charts
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
import { Cell, Label, Pie, PieChart } from "recharts";

interface CrmLeadSourcesPieChartProps {
  data: Record<string, number>;
  totalLeads: number;
  title?: string;
  description?: string;
}

const SOURCE_COLORS: Record<string, string> = {
  WEBSITE: "hsl(217, 91%, 60%)", // blue
  REFERRAL: "hsl(142, 71%, 45%)", // green
  SOCIAL_MEDIA: "hsl(262, 83%, 58%)", // purple
  EMAIL: "hsl(47, 96%, 53%)", // yellow
  PHONE: "hsl(15, 80%, 50%)", // orange
  REASSIGNED: "hsl(0, 72%, 51%)", // red
  OTHER: "hsl(0, 0%, 63%)", // gray
};

export function CrmLeadSourcesPieChart({
  data,
  totalLeads,
  title = "Lead Sources",
  description = "Where your leads are coming from",
}: CrmLeadSourcesPieChartProps) {
  if (!data || Object.keys(data).length === 0) {
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

  // Transform data for chart
  const chartData = Object.entries(data).map(([source, count]) => ({
    source,
    count,
    percentage: ((count / totalLeads) * 100).toFixed(1),
    fill: SOURCE_COLORS[source] || "hsl(var(--muted-foreground))",
  }));

  // Create chart config
  const chartConfig: ChartConfig = Object.keys(data).reduce(
    (config, source) => {
      config[source] = {
        label: source.replace(/_/g, " "),
        color: SOURCE_COLORS[source] || "hsl(var(--muted-foreground))",
      };
      return config;
    },
    {} as ChartConfig,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              formatter={(value: number, name: string) => {
                const item = chartData.find((d) => d.source === name);
                return `${value} (${item?.percentage}%)`;
              }}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="source"
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
