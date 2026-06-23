"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Bell, User, ClipboardCheck, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDENT_NAV } from "@/constants";
import { useAuth } from "@/lib/auth-context";
import { useAppContext } from "@/lib/app-context";
import { BreadcrumbProvider } from "@/lib/breadcrumb-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { CommandPalette, type CommandItem } from "@/components/ai/command-palette";

const StudentSidebar = dynamic(() => import("@/components/student/student-sidebar"), { ssr: false });
const StudentHeader = dynamic(() => import("@/components/student/student-header"), { ssr: false });

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  BookOpen,
  Bell,
  User,
  ClipboardCheck,
  Video,
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { settings } = useAppContext();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "student") router.replace("/");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const commandItems: CommandItem[] = useMemo(() => {
    return STUDENT_NAV.map((item) => ({
      id: item.href,
      label: item.label,
      href: item.href,
      icon: item.icon,
      section: "Pages",
    }));
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent flex">
        <aside className="hidden lg:flex w-64 flex-col border-r border-primary/5 bg-white p-4 gap-4">
          <div className="h-8 w-32 bg-primary/10 rounded-md animate-pulse" />
          <div className="space-y-2 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-primary/10 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-primary/5 bg-white flex items-center gap-4 px-6">
            <div className="w-8 h-8 bg-primary/10 rounded-lg animate-pulse" />
            <div className="flex-1" />
            <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse" />
          </header>
          <main className="flex-1 p-6">
            <div className="space-y-4">
              <div className="h-8 w-48 bg-primary/10 rounded-md animate-pulse" />
              <div className="h-4 w-72 bg-primary/10 rounded-md animate-pulse" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-primary/10 rounded-xl animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "student") return null;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.charAt(0).toUpperCase() ?? "S");

  return (
    <div className="min-h-screen bg-accent flex">
      <StudentSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        pathname={pathname}
        user={user}
        settings={settings}
        logout={logout}
      />

      <div className="flex-1 min-w-0">
        <BreadcrumbProvider>
          <NotificationsProvider>
            <StudentHeader
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              profileOpen={profileOpen}
              setProfileOpen={setProfileOpen}
              user={user}
              initials={initials}
              logout={logout}
            />
            <main className="p-4 lg:p-8 pb-16 lg:pb-8">{children}</main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-primary/10 flex items-center justify-around px-2 py-1 safe-area-bottom">
              {STUDENT_NAV.filter((item) => {
                const excludedLabels = ["Guide", "Live Classes"];
                return !excludedLabels.includes(item.label);
              }).map((item) => {
                const Icon = iconMap[item.icon || ""];
                const isActive =
                  item.href === "/student"
                    ? pathname === "/student"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 ${
                      isActive
                        ? "text-primary"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-5 h-5 ${isActive ? "fill-primary/10" : ""}`}
                      />
                    )}
                    <span
                      className={`text-[10px] font-medium truncate max-w-full ${
                        isActive ? "font-semibold" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </NotificationsProvider>
        </BreadcrumbProvider>
      </div>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onSelect={(item) => {
          if (item.href) router.push(item.href);
        }}
        items={commandItems}
      />
    </div>
  );
}
