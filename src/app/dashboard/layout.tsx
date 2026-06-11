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
  Menu,
  X,
  Search,
  Bell as BellIcon,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { useAppContext } from "@/lib/app-context";
import { LandingLoader } from "@/components/landing/landing-loader";

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
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { loading, settings } = useAppContext();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/");
    else if (user.role !== "admin") router.replace("/login");
  }, [user, isLoading, router]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-accent flex items-center justify-center">
  //       <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  //     </div>
  //   );
  // }

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
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-primary text-white flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative">
              <Image src={settings?.appIcon || "/icon-image.png"} alt="Special academy" width={32} height={32} className="object-contain" unoptimized />
            </div>
            <div>
              <span className="font-bold text-sm">Special academy</span>
              <span className="block text-[10px] text-white/50">Admin Dashboard</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-md hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {DASHBOARD_NAV.map((item) => {
            const Icon = iconMap[item.icon || ""];
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
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
            {/* Search */}
            <div className="hidden sm:flex items-center bg-accent rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-muted mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm outline-none placeholder:text-muted w-40"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-accent text-muted hover:text-primary transition-colors">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
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
                      <p className="text-sm font-medium text-primary">{user?.name ?? "Admin User"}</p>
                      <p className="text-xs text-muted">{user?.email ?? "admin@cadetacademy.edu"}</p>
                    </div>
                    <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-muted hover:bg-accent hover:text-primary transition-colors">
                      Settings
                    </Link>
                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {loading ? <LandingLoader /> : children}
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid hsl(var(--primary) / 0.05)",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          },
        }}
      />
    </div>
  );
}
