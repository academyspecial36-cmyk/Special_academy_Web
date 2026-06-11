"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Bell,
  User,
  ClipboardCheck,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDENT_NAV } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { useAppContext } from "@/lib/app-context";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  BookOpen,
  Bell,
  User,
  ClipboardCheck,
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { settings } = useAppContext();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "student") router.replace("/");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "student") return null;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? "S";

  return (
    <div className="min-h-screen bg-accent flex">
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
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-primary/5 flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-primary/5">
          <Link href="/student" className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative">
              <Image src={settings?.appIcon || "/icon-image.png"} alt="Special academy" width={32} height={32} className="object-contain" unoptimized />
            </div>
            <div>
              <span className="font-bold text-sm text-primary">Special academy</span>
              <span className="block text-[10px] text-muted">Student Portal</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1.5 rounded-md hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {STUDENT_NAV.map((item) => {
            const Icon = iconMap[item.icon || ""];
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-accent hover:text-primary"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-primary/5">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-accent hover:text-primary transition-all">
            <LogOut className="w-4 h-4" />
            Back to Website
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-primary/5 h-16 flex items-center px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md hover:bg-accent text-primary mr-3">
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden md:flex items-center text-sm text-muted">
            <span className="text-primary font-medium">Student Portal</span>
            {pathname !== "/student" && (
              <>
                <span className="mx-2 text-primary/20">/</span>
                <span className="capitalize">{pathname.split("/").pop()}</span>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-accent text-muted hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {initials}
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
                      <p className="text-sm font-medium text-primary">{user?.name ?? "Student"}</p>
                      <p className="text-xs text-muted">{user?.role ?? ""}</p>
                    </div>
                    <Link href="/student/profile" className="block px-4 py-2 text-sm text-muted hover:bg-accent hover:text-primary transition-colors">Profile</Link>
                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
