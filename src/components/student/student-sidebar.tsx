"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Bell,
  User,
  ClipboardCheck,
  X,
  LogOut,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDENT_NAV } from "@/constants";
import type { AuthUser } from "@/lib/auth-context";
import type { AppSettings } from "@/lib/context/seed-data";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  BookOpen,
  Bell,
  User,
  ClipboardCheck,
  Video,
};

interface StudentSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  pathname: string;
  user: AuthUser | null;
  settings: AppSettings | null;
  logout: () => void;
}

export default function StudentSidebar({
  sidebarOpen,
  setSidebarOpen,
  pathname,
  user,
  settings,
  logout,
}: StudentSidebarProps) {
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
          "fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-64 bg-white border-r border-primary/5 flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-primary/5">
          <Link href="/student" className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative">
              <Image
                src={settings?.appIcon || "/icon-image.png"}
                alt="Special academy"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-sm text-primary">
                Special academy
              </span>
              <span className="block text-[10px] text-muted">
                Student Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-md hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {STUDENT_NAV.map((item) => {
            const Icon = iconMap[item.icon || ""];
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-accent hover:text-primary",
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-primary/5">
          <button
            onClick={() => {
              setSidebarOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
