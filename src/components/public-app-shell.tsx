"use client";

import { useAppContext } from "@/lib/app-context";
import { MaintenancePage } from "./maintenance-page";

export function PublicAppShell({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useAppContext();

  if (loading) return <>{children}</>;

  if (settings.maintenanceMode) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}
