"use client";

import Link from "next/link";
import { useBreadcrumbs } from "@/lib/breadcrumb-context";

export function BreadcrumbRenderer({ rootLabel = "Dashboard" }: { rootLabel?: string; pathname?: string }) {
  const { segments } = useBreadcrumbs();

  if (segments.length > 0) {
    return (
      <nav className="hidden md:flex items-center text-sm text-muted">
        <Link href="/dashboard" className="text-primary font-medium hover:text-primary/80 transition-colors">{rootLabel}</Link>
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center">
            <span className="mx-2 text-primary/20">/</span>
            {seg.href ? (
              <Link href={seg.href} className="hover:text-primary transition-colors">{seg.label}</Link>
            ) : (
              <span className="text-primary font-medium">{seg.label}</span>
            )}
          </span>
        ))}
      </nav>
    );
  }

  return null;
}
