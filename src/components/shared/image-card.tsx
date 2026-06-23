"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ImageCardBadge {
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
  className?: string;
}

interface ImageCardProps {
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
  badges?: ImageCardBadge[];
  imageHeight?: string;
  children?: ReactNode;
  className?: string;
}

export function ImageCard({
  image, title, subtitle, description, href,
  badges, imageHeight = "h-40 sm:h-52",
  children, className,
}: ImageCardProps) {
  return (
    <Link href={href} className={cn(
      "group bg-white rounded-xl overflow-hidden border border-primary/5 hover:border-primary/10 hover:shadow-elevated transition-all duration-300 flex flex-col h-full",
      className
    )}>
      <div className={cn("relative overflow-hidden", imageHeight)}>
        <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {badges && badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {badges.map((b, i) => (
              <Badge key={i} className={b.className || "bg-white/90 text-primary border-0 text-[10px]"} variant={b.variant}>
                {b.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        {subtitle && <p className="text-xs text-muted mb-1">{subtitle}</p>}
        <h3 className="text-base sm:text-lg font-bold text-primary mb-2 group-hover:text-secondary transition-colors line-clamp-2">{title}</h3>
        {description && <p className="text-sm text-muted line-clamp-2 mb-4 flex-1">{description}</p>}
        {children}
      </div>
    </Link>
  );
}
