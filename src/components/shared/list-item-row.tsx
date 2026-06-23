"use client";

import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ListItemRowProps {
  icon?: ReactElement;
  label: string;
  value?: string | number;
  badge?: { label: string; variant?: "default" | "success" | "destructive" | "outline" };
  secondary?: string;
  href?: string;
  className?: string;
}

export function ListItemRow({ icon, label, value, badge, secondary, href, className }: ListItemRowProps) {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      href={href}
      className={cn(
        "flex items-center justify-between py-1.5 sm:py-2 border-b border-primary/5 last:border-0",
        href && "hover:bg-accent/50 transition-colors -mx-2 px-2 rounded-lg",
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm truncate">{label}</p>
          {secondary && <p className="text-[10px] sm:text-xs text-muted truncate">{secondary}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {value !== undefined && <span className="text-xs sm:text-sm font-medium text-primary">{value}</span>}
        {badge && <Badge variant={badge.variant || "outline"} className="text-[10px] font-mono">{badge.label}</Badge>}
      </div>
    </Tag>
  );
}
