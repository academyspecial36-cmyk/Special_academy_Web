"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbContextValue {
  segments: BreadcrumbSegment[];
  setSegments: (segments: BreadcrumbSegment[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [segments, setSegments] = useState<BreadcrumbSegment[]>([]);
  return (
    <BreadcrumbContext.Provider value={{ segments, setSegments }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error("useBreadcrumbs must be used within BreadcrumbProvider");
  return ctx;
}
