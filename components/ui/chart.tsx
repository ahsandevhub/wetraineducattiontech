"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  );
};

const ChartContext = React.createContext<{
  config: ChartConfig;
}>({
  config: {},
});

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          "flex aspect-auto h-80 w-full flex-col justify-center overflow-hidden rounded-md bg-background p-0 sm:p-4",
          className,
        )}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #${chartId} .recharts-surface {
                overflow: visible;
              }
              #${chartId} .recharts-wrapper {
                font-size: 12px;
              }
              #${chartId}
              .recharts-tooltip-wrapper
              .recharts-tooltip-item[color="#82ca9d"] {
                color: hsl(var(--success));
              }
              #${chartId}
              .recharts-tooltip-wrapper
              .recharts-tooltip-item[color="#8884d8"] {
                color: hsl(var(--primary));
              }
              #${chartId}
              .recharts-tooltip-wrapper
              .recharts-tooltip-item[color="#ffc658"] {
                color: hsl(var(--warning));
              }
              #${chartId}
              .recharts-cartesian-axis-tick text {
                fill: hsl(var(--muted-foreground));
                opacity: var(--tw-text-opacity);
              }
              #${chartId} .recharts-cartesian-axis-line {
                stroke: hsl(var(--border));
              }
              #${chartId} .recharts-surface {
                color: hsl(var(--foreground));
              }
              #${chartId}
              .recharts-default-tooltip
              .recharts-tooltip-item {
                color: hsl(var(--foreground));
              }
              #${chartId} .recharts-legend-wrapper {
                padding-top: 16px !important;
              }
              #${chartId} .recharts-legend-item {
                padding-right: 12px !important;
              }
              #${chartId}
              .recharts-legend-item
              .recharts-surface:not(svg)
              text,
              #${chartId} .recharts-graphical-child {
                font-size: 12px;
              }
              #${chartId} .recharts-wrapper li {
                list-style: none;
              }
              #${chartId}
              .recharts-wrapper
              table {
                caption-side: unset;
              }
            `,
          }}
        />
        <RechartsPrimitive.ResponsiveContainer
          width="100%"
          height="100%"
          id={chartId}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

type ChartStyleWithCustomProps = React.CSSProperties & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "none";
    contentStyle?: ChartStyleWithCustomProps;
    formatter?: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any,
      name: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      item: any,
    ) => React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    active?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    label?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labelStyle?: any;
    labelClassName?: string;
  }
>(
  (
    {
      active,
      payload,
      label,
      hideLabel = false,
      hideIndicator = false,
      indicator = "line",
      contentStyle,
      formatter,
      labelStyle,
      labelClassName,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload || payload.length === 0) {
        return null;
      }

      const [item] = payload;
      const key = `${item.dataKey}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _itemConfig = config[key];
      const value =
        !labelClassName && typeof label === "string"
          ? label
          : config[label as string]?.label || label;

      return (
        <div className={cn("font-medium", labelClassName)} style={labelStyle}>
          {value}
        </div>
      );
    }, [label, payload, hideLabel, labelClassName, labelStyle, config]);

    if (!active || !payload || payload.length === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border border-border/80 bg-background px-2.5 py-1.5 text-xs shadow-md",
          contentStyle?.className,
        )}
        style={contentStyle}
      >
        {tooltipLabel}
        <div className="space-y-1">
          {payload.map(
            (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              item: any,
              index: number,
            ) => {
              const key = `${item.dataKey}`;
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const _itemConfig = config[key];
              const indicatorColor =
                item.payload[`fill_${item.dataKey}`] ||
                item.color ||
                "hsl(var(--foreground))";

              return (
                <div
                  key={`${item.dataKey}-${index}`}
                  className="flex w-full flex-nowrap items-center gap-1.5"
                >
                  {hideIndicator !== true ? (
                    <div
                      className={cn(
                        "shrink-0 rounded-[2px] border-[--color] bg-[--color]",
                        {
                          "h-2 w-2": indicator === "dot",
                          "w-1": indicator === "line",
                        },
                      )}
                      style={
                        {
                          "--color": indicatorColor,
                        } as ChartStyleWithCustomProps
                      }
                    />
                  ) : null}
                  <span className="flex w-full justify-between gap-8 text-foreground">
                    <span className="text-muted-foreground">
                      {config[key]?.label || key}
                    </span>
                    <span className="font-mono font-medium">
                      {formatter
                        ? formatter(item.value, item.dataKey as string, item)
                        : item.value}
                    </span>
                  </span>
                </div>
              );
            },
          )}
        </div>
      </div>
    );
  },
);
ChartTooltip.displayName = "ChartTooltip";

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    Omit<RechartsPrimitive.LegendProps, "wrapperStyle"> & {
      hideIcon?: boolean;
      layout?: "vertical" | "horizontal";
      verticalAlign?: "top" | "middle" | "bottom";
      wrapperClassName?: string;
    }
>(
  (
    {
      hideIcon = false,
      layout = "horizontal",
      verticalAlign = "bottom",
      className,
      wrapperClassName,
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref,
  ) => {
    const { config } = useChart();

    return (
      <RechartsPrimitive.Legend
        layout={layout}
        verticalAlign={verticalAlign}
        wrapperStyle={{
          paddingTop: 16,
        }}
        className={cn("[&>*]:!static [&>*]:gap-3 [&>*]:px-0", wrapperClassName)}
        content={({ payload }) =>
          payload ? (
            <div
              className={cn(
                "flex flex-wrap items-center justify-center gap-4",
                className,
              )}
            >
              {payload.map((entry, index) => {
                const key = `${entry.dataKey}`;
                const itemConfig = config[key];

                return (
                  <div
                    key={`legend-${entry.dataKey}-${index}`}
                    className="flex items-center gap-1.5"
                  >
                    {hideIcon !== true ? (
                      <div
                        className="h-2 w-2 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: entry.color,
                        }}
                      />
                    ) : null}
                    <span className="text-xs font-medium text-foreground">
                      {itemConfig?.label || key}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null
        }
      />
    );
  },
);
ChartLegend.displayName = "ChartLegend";

export { ChartContainer, ChartLegend, ChartTooltip, useChart };
export type { ChartConfig };
