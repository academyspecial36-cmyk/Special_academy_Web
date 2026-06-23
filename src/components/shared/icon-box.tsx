"use client";

import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

const SIZE_MAP = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4", shape: "rounded-lg" },
  md: { container: "w-9 h-9", icon: "w-4 h-4", shape: "rounded-xl" },
  lg: { container: "w-10 h-10", icon: "w-5 h-5", shape: "rounded-xl" },
  xl: { container: "w-11 h-11", icon: "w-5 h-5", shape: "rounded-lg" },
  "2xl": { container: "w-12 h-12 md:w-16 md:h-16", icon: "w-5 h-5 md:w-6 h-6", shape: "rounded-full" },
} as const;

interface IconBoxProps {
  icon: ReactElement;
  size?: keyof typeof SIZE_MAP;
  variant?: "primary" | "emerald" | "amber" | "violet" | "secondary" | "blue" | "purple" | "white" | "ghost";
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-primary/5 text-primary",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  secondary: "bg-secondary/10 text-secondary",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  white: "bg-white/10 text-white",
  ghost: "bg-primary/[0.03] text-primary",
};

export function IconBox({ icon, size = "lg", variant = "primary", className }: IconBoxProps) {
  const s = SIZE_MAP[size];
  return (
    <div className={cn(s.container, s.shape, "flex items-center justify-center shrink-0", VARIANT_CLASSES[variant], className)}>
      <div className={s.icon}>{icon}</div>
    </div>
  );
}
