"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";
import { DASHBOARD_SIDEBAR } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { useAppContext } from "@/lib/app-context";
import { BreadcrumbProvider } from "@/lib/breadcrumb-context";
import { LandingLoader } from "@/components/landing/landing-loader";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { NotificationsProvider } from "@/lib/notifications-context";
import { CommandPalette, type CommandItem } from "@/components/ai/command-palette";
import { FloatingActionButton } from "@/components/ai/floating-action-button";

const DashboardSidebar = dynamic(() => import("@/components/dashboard/dashboard-sidebar"), { ssr: false });
const DashboardHeader = dynamic(() => import("@/components/dashboard/dashboard-header"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { loading, settings } = useAppContext();

  const commandItems: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [];
    for (const item of DASHBOARD_SIDEBAR) {
      if (item.type === "link") {
        items.push({ id: item.href, label: item.label, href: item.href, icon: item.icon, section: "Pages" });
      } else {
        for (const child of item.children) {
          items.push({ id: child.href, label: child.label, href: child.href, icon: child.icon, section: item.label });
        }
      }
    }
    return items;
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/"); return; }
    if (user.role !== "admin") { router.replace("/login"); return; }
    if (typeof window !== "undefined" && !sessionStorage.getItem("admin_session")) {
      logout();
    }
  }, [user, isLoading, router, logout]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  useEffect(() => {
    const groupsToOpen = DASHBOARD_SIDEBAR.filter(
      (item): item is { type: "group"; label: string; icon: string; children: { label: string; href: string; icon: string }[] } =>
        item.type === "group" && item.children.some((c) => pathname.startsWith(c.href))
    ).map((g) => g.label);
    setExpandedGroups((prev) => {
      const next = new Set([...prev, ...groupsToOpen]);
      return Array.from(next);
    });
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
        return;
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-accent flex">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        expandedGroups={expandedGroups}
        toggleGroup={toggleGroup}
        pathname={pathname}
        user={user}
        settings={settings}
        logout={logout}
      />

      <div className="flex-1 min-w-0">
        <BreadcrumbProvider>
        <NotificationsProvider>
          <DashboardHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
            user={user}
            initials={initials}
            logout={logout}
          />
          <main className="p-4 lg:p-8">
            {loading ? <LandingLoader /> : <ErrorBoundary>{children}</ErrorBoundary>}
          </main>
        </NotificationsProvider>
        </BreadcrumbProvider>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid hsl(var(--primary) / 0.05)",
            borderRadius: "12px",
            boxShadow: "0 4px 24px hsl(var(--primary) / 0.08)",
          },
        }}
      />
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSelect={(item) => {
          if (item.href) router.push(item.href);
        }}
        items={commandItems}
      />
      {pathname !== "/dashboard/ai" && (
        <FloatingActionButton onClick={() => router.push("/dashboard/ai")} />
      )}
    </div>
  );
}
