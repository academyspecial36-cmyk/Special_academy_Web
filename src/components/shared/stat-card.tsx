"use client";

import type { ReactElement } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IconBox } from "./icon-box";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactElement;
  label: string;
  value: string | number;
  variant?: "large" | "mini";
  change?: string;
  up?: boolean;
  changeLabel?: string;
  accentBorder?: string;
  iconVariant?: "primary" | "emerald" | "amber" | "violet" | "secondary";
  className?: string;
}

export function StatCard({
  icon, label, value, variant = "large",
  change, up, changeLabel,
  accentBorder = "border-l-primary/10",
  iconVariant = "primary",
  className,
}: StatCardProps) {
  if (variant === "mini") {
    return (
      <Card className={cn("border-t-2 border-t-primary/10", className)}>
        <CardContent className="p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider truncate">{label}</p>
            <p className="text-base font-bold text-primary mt-0.5">{value}</p>
          </div>
          <IconBox icon={icon} size="md" variant="ghost" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-l-4 overflow-hidden", accentBorder, className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <IconBox icon={icon} size="lg" variant={iconVariant === "primary" ? "ghost" : iconVariant} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted uppercase tracking-wider truncate">{label}</p>
              <p className="text-xl sm:text-2xl font-bold text-primary mt-0.5 truncate">{value}</p>
            </div>
          </div>
          {change !== undefined && (
            <span className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-1",
              up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}>
              {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}
            </span>
          )}
        </div>
        {changeLabel && <p className="text-xs text-muted mt-2 ml-[52px]">{changeLabel}</p>}
      </CardContent>
    </Card>
  );
}
