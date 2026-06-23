"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconBox } from "./icon-box";

interface IconCardProps {
  icon: ReactElement;
  title: string;
  description: string;
  href?: string;
  className?: string;
}

export function IconCard({ icon, title, description, href, className }: IconCardProps) {
  const content = (
    <div className={cn(
      "group p-5 sm:p-7 rounded-xl bg-white border border-primary/5 hover:border-primary/10 hover:shadow-card transition-all duration-300",
      className
    )}>
      <IconBox icon={icon} size="lg" variant="ghost" className="mb-4 sm:mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300" />
      <h3 className="text-base sm:text-lg font-semibold text-primary mb-3">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );

  if (href) return <Link href={href} className="block h-full">{content}</Link>;
  return content;
}
