"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section-header";

interface SectionShellProps {
  label?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  bg?: "white" | "accent" | "primary";
  innerClassName?: string;
  id?: string;
}

const BG_CLASSES = {
  white: "bg-white",
  accent: "bg-accent",
  primary: "bg-primary",
};

export function SectionShell({
  label, title, description, children,
  className, bg = "white", innerClassName, id,
}: SectionShellProps) {
  return (
    <section className={cn("py-16 md:py-24", BG_CLASSES[bg], className)} id={id}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader label={label} title={title} description={description} />
        <div className={innerClassName}>
          {children}
        </div>
      </div>
    </section>
  );
}
