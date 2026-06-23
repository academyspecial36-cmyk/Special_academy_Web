"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ChevronDown,
} from "lucide-react";
import { BreadcrumbRenderer } from "@/components/shared/breadcrumb-renderer";
import { CommandHint } from "@/components/ai/command-hint";
import { NotificationBell } from "@/components/shared/notification-bell";
import type { AuthUser } from "@/lib/auth-context";

interface DashboardHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  user: AuthUser | null;
  initials: string;
  logout: () => void;
}

export default function DashboardHeader({
  sidebarOpen,
  setSidebarOpen,
  profileOpen,
  setProfileOpen,
  user,
  initials,
  logout,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-primary/5 h-16 flex items-center px-4 lg:px-8">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 rounded-md hover:bg-primary/5 text-primary mr-3"
      >
        <Menu className="w-5 h-5" />
      </button>

      <BreadcrumbRenderer />

      <div className="hidden lg:block ml-4">
        <CommandHint />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
              {user?.avatar_url ? (
                <Image src={user.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
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
  );
}
