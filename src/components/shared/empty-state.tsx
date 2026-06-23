import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: { icon: "w-6 h-6", padding: "py-8", title: "text-sm font-semibold", desc: "text-xs" },
  md: { icon: "w-8 h-8", padding: "py-12", title: "text-base font-semibold", desc: "text-sm" },
  lg: { icon: "w-12 h-12", padding: "py-16", title: "text-lg font-semibold", desc: "text-sm" },
};

export function EmptyState({ icon, title, description, size = "md", className }: EmptyStateProps) {
  const s = SIZE_CLASSES[size];
  return (
    <Card className={cn("border-0 shadow-none", className)}>
      <CardContent className={cn(s.padding, "text-center")}>
        <div className={cn(s.icon, "text-muted mx-auto mb-3")}>{icon}</div>
        <h3 className={cn(s.title, "text-primary mb-1")}>{title}</h3>
        {description && <p className={cn(s.desc, "text-muted max-w-md mx-auto")}>{description}</p>}
      </CardContent>
    </Card>
  );
}
