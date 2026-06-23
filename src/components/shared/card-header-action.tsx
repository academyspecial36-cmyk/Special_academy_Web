"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CardHeaderActionProps {
  title: string | ReactNode;
  icon?: ReactElement;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function CardHeaderAction({ title, icon, actionHref, actionLabel = "View All", className }: CardHeaderActionProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
        {icon && <span className="w-4 h-4 text-secondary shrink-0">{icon}</span>}
        {title}
      </CardTitle>
      {actionHref && (
        <Button variant="ghost" size="sm" asChild className="h-auto p-0 text-xs">
          <Link href={actionHref}>
            {actionLabel} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
      )}
    </div>
  );
}
