"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "./utils";

// Theme selectors
const THEMES = { light: "", dark: ".dark" };

const ChartContext = React.createContext(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context)
    throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

export function ChartContainer({ id, className, children, config, ...props }) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartStyle({ id, config }) {
  const colorKeys = Object.entries(config).filter(
    ([_, v]) => v.color || v.theme
  );

  if (!colorKeys.length) return null;

  const styles = Object.entries(THEMES)
    .map(
      ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorKeys
  .map(([key, v]) => {
    const color = v.theme?.[theme] || v.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
    )
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  formatter,
  nameKey,
  labelKey,
}) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  const getConfig = (item, key) => config[key] || config[item.name] || {};

  return (
    <div
      className={cn(
        "bg-background border px-2.5 py-1.5 rounded-lg text-xs shadow-md",
        className
      )}
    >
      {payload.map((item, index) => {
        const key = nameKey || item.dataKey || item.name;
        const { label } = getConfig(item, key);
        const displayLabel = label || item.name;
        const displayValue = item.value?.toLocaleString();
        const color = item.color || item.payload?.fill;

        return (
          <div key={index} className="flex items-center gap-2 justify-between">
            {!hideIndicator && (
              <span
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="text-muted-foreground">{displayLabel}</span>
            <span className="font-mono font-medium">{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}

export const ChartLegend = RechartsPrimitive.Legend;

export function ChartLegendContent({
  className,
  payload,
  hideIcon = false,
  verticalAlign = "bottom",
}) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      className={cn(
        "flex justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const conf = config[item.dataKey] || {};
        return (
          <div key={item.value} className="flex items-center gap-1.5">
            {!hideIcon && (
              <span
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
            )}
            {conf.label}
          </div>
        );
      })}
    </div>
  );
}
