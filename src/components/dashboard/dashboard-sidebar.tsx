"use client";

import Image from "next/image";
import Link from "next/link";
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
  Sparkles,
  HardDrive,
  Video,
  BarChart3,
  X,
  ChevronRight,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_SIDEBAR } from "@/constants";
import type { AuthUser } from "@/lib/auth-context";
import type { AppSettings } from "@/lib/context/seed-data";

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
  HardDrive,
  Video,
  BarChart3,
};

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  expandedGroups: string[];
  toggleGroup: (label: string) => void;
  pathname: string;
  user: AuthUser | null;
  settings: AppSettings | null;
  logout: () => void;
}

export default function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  expandedGroups,
  toggleGroup,
  pathname,
  user,
  settings,
  logout,
}: DashboardSidebarProps) {
  return (
    <>
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
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-[100dvh] bg-primary text-white flex flex-col transition-all duration-300 lg:translate-x-0",
          sidebarCollapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={cn("h-16 flex items-center border-b border-white/10 shrink-0", sidebarCollapsed ? "justify-center px-0" : "px-6")}>
          <Link href="/dashboard" className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-2.5")}>
            <div className="w-8 h-8 relative shrink-0">
              <Image src={settings?.appIcon || "/icon-image.png"} alt="Special academy" width={32} height={32} className="object-contain" />
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
    </>
  );
}
