"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Bell,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  HelpCircle,
  GraduationCap,
  Tags,
  ClipboardCheck,
  Megaphone,
  StickyNote,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Sparkles,
} from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { DASHBOARD_SIDEBAR } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { useAppContext } from "@/lib/app-context";
import { LandingLoader } from "@/components/landing/landing-loader";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { NotificationsProvider } from "@/lib/notifications-context";
import { NotificationBell } from "@/components/shared/notification-bell";
import { CommandPalette } from "@/components/ai/command-palette";
import { FloatingActionButton } from "@/components/ai/floating-action-button";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  BookOpen,
  Bell,
  FileText,
  MessageSquare,
  ImageIcon,
  Settings,
  HelpCircle,
  GraduationCap,
  Tags,
  ClipboardCheck,
  Megaphone,
  StickyNote,
  Sparkles,
};

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
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-[100dvh] bg-primary text-white flex flex-col transition-all duration-300 lg:translate-x-0",
          sidebarCollapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className={cn("h-16 flex items-center border-b border-white/10 shrink-0", sidebarCollapsed ? "justify-center px-0" : "px-6")}>
          <Link href="/dashboard" className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-2.5")}>
            <div className="w-8 h-8 relative shrink-0">
              <Image src={settings?.appIcon || "/icon-image.png"} alt="Special academy" width={32} height={32} className="object-contain" unoptimized />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <span className="font-bold text-sm">Special academy</span>
                <span className="block text-[10px] text-white/50">Admin Dashboard</span>
              </div>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto p-1.5 rounded-md hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          <div className={cn("space-y-1", sidebarCollapsed ? "px-2" : "px-3")}>
            {DASHBOARD_SIDEBAR.map((item) => {
              if (item.type === "link") {
                const Icon = iconMap[item.icon || ""];
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      sidebarCollapsed ? "justify-center px-0" : "",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {Icon && <Icon className="w-4 h-4 shrink-0" />}
                    {!sidebarCollapsed && item.label}
                  </Link>
                );
              }

              const isExpanded = expandedGroups.includes(item.label);
              const GroupIcon = iconMap[item.icon || ""];
              const hasActiveChild = item.children.some((c) => pathname.startsWith(c.href));

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      sidebarCollapsed ? "justify-center px-0" : "",
                      hasActiveChild || isExpanded
                        ? "text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {GroupIcon && <GroupIcon className="w-4 h-4 shrink-0" />}
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        <ChevronRight
                          className={cn(
                            "w-3.5 h-3.5 transition-transform text-white/40",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {isExpanded && !sidebarCollapsed && (
                    <div className="ml-2 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
                      {item.children.map((child) => {
                        const ChildIcon = iconMap[child.icon || ""];
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                              isChildActive
                                ? "bg-white/10 text-white"
                                : "text-white/50 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {ChildIcon && <ChildIcon className="w-3.5 h-3.5 shrink-0" />}
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 flex flex-col gap-1">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all w-full"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 mx-auto shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
          <button
            onClick={() => logout()}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all w-full",
              sidebarCollapsed ? "justify-center px-0" : ""
            )}
            title={sidebarCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <NotificationsProvider>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-primary/5 h-16 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-primary/5 text-primary mr-3"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center text-sm text-muted">
            <span className="text-primary font-medium">Dashboard</span>
            {pathname !== "/dashboard" && (
              <>
                <span className="mx-2 text-primary/20">/</span>
                <span className="capitalize">{pathname.split("/").pop()}</span>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                  {user?.avatar_url ? (
                    <Image src={user.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    initials
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted hidden sm:block" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-elevated border border-primary/5 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-primary/5">
                      <p className="text-sm font-medium text-primary">{user?.name ?? "Admin User"}</p>
                      <p className="text-xs text-muted">{user?.email ?? "admin@cadetacademy.edu"}</p>
                    </div>
                    <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-muted hover:bg-accent hover:text-primary transition-colors">
                      Settings
                    </Link>
                    <Link href="/dashboard/guide" className="block px-4 py-2 text-sm text-muted hover:bg-accent hover:text-primary transition-colors">
                      Guide
                    </Link>
                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
             <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {loading ? <LandingLoader /> : <ErrorBoundary>{children}</ErrorBoundary>}
        </main>
        </NotificationsProvider>
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
        onCommand={(cmd) => {
          setCmdOpen(false);
          router.push("/dashboard/ai");
        }}
      />
      {pathname !== "/dashboard/ai" && (
        <FloatingActionButton onClick={() => router.push("/dashboard/ai")} />
      )}
    </div>
  );
}
