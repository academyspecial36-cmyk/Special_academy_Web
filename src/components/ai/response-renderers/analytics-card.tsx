"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

interface AnalyticsCardData {
  title?: string;
  metrics: Metric[];
}

export function AnalyticsCardRenderer({ data }: { data: AnalyticsCardData }) {
  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">{data.title ?? "Analytics"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {data.metrics.map((metric, i) => (
            <div key={i} className="space-y-1">
              <p className="text-xs text-muted">{metric.label}</p>
              <p className="text-xl font-semibold tracking-tight">{metric.value}</p>
              {metric.change !== undefined && (
                <div className="flex items-center gap-1">
                  {metric.change > 0 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                  ) : metric.change < 0 ? (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  ) : (
                    <Minus className="w-3 h-3 text-muted" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    metric.change > 0 ? "text-emerald-600" : metric.change < 0 ? "text-red-600" : "text-muted",
                  )}>
                    {metric.change > 0 ? "+" : ""}{metric.change}%
                    {metric.changeLabel && ` ${metric.changeLabel}`}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
