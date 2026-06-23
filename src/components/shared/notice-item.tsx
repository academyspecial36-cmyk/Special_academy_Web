"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NoticeItemProps {
  title: string;
  date: string;
  category?: string;
  href?: string;
  variant?: "default" | "compact";
  className?: string;
}

export function NoticeItem({ title, date, category, href, variant = "default", className }: NoticeItemProps) {
  const content = (
    <div className={cn(
      variant === "compact" ? "pb-3 border-b border-primary/5 last:border-0 last:pb-0" : "p-4 sm:p-5 rounded-xl bg-accent border border-primary/5",
      className
    )}>
      <p className={cn(
        "font-medium text-primary mb-1",
        variant === "compact" ? "text-xs sm:text-sm line-clamp-1" : "text-sm sm:text-base line-clamp-2 group-hover:text-secondary transition-colors"
      )}>
        {title}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("text-muted flex items-center gap-1", variant === "compact" ? "text-[10px] sm:text-xs" : "text-xs")}>
          <Clock className="w-3 h-3" />
          {date}
        </span>
        {category && (
          <Badge variant="outline" className="text-[10px] shrink-0">{category}</Badge>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className={cn("block group", variant === "default" && "h-full")}>{content}</Link>;
  }
  return content;
}
