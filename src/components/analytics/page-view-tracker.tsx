"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics/client";

const EXCLUDED_PATHS = ["/admin", "/api", "/_next"];

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;

    const key = pathname + (searchParams?.toString() || "");
    if (tracked.current === key) return;
    tracked.current = key;

    trackPageView(pathname);
  }, [pathname, searchParams]);

  return null;
}
