"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import dynamicImport from "next/dynamic";
import {
  Users, BookOpen, FileText, Bell, TrendingUp, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Activity, DollarSign, GraduationCap, MessageSquare,
  Newspaper, Star, ImageIcon, Video, File, PlayCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const DashboardCharts = dynamicImport(
  () => import("@/components/dashboard/dashboard-charts").then((m) => m.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 h-[340px] bg-primary/5 rounded-xl" />
        <div className="h-[340px] bg-primary/5 rounded-xl" />
        <div className="lg:col-span-2 h-[320px] bg-primary/5 rounded-xl" />
        <div className="h-[320px] bg-primary/5 rounded-xl" />
      </div>
    ),
  }
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SkeletonCard } from "@/components/shared/skeleton-card";
import { NoticeItem } from "@/components/shared/notice-item";
import { CardHeaderAction } from "@/components/shared/card-header-action";
import { EmptyState } from "@/components/shared/empty-state";

interface AnalyticsData {
  stats: {
    totalStudents: number;
    activeCourses: number;
    totalEnrollments: number;
    pendingNotices: number;
    totalBlogPosts: number;
    publishedPosts: number;
    totalContactSubmissions: number;
    unreadMessages: number;
    totalTestimonials: number;
    totalRevenue: number;
    studentGrowth: { change: string; up: boolean };
    enrollmentGrowth: { change: string; up: boolean };
  };
  studentGrowth: { month: string; count: number }[];
  enrollmentTrends: { month: string; count: number }[];
  coursePopularity: { name: string; count: number }[];
  revenue: { month: string; amount: number }[];
  studentsByClass: { name: string; count: number }[];
  noticesByCategory: Record<string, number>;
  examPerformance: { category: string; averageScore: number; totalAttempts: number }[];
  recentEnrollments: { id: string; fullName: string; email: string; course: string; status: string; createdAt: string }[];
  latestNotices: { id: string; title: string; category: string; date: string; isPinned: boolean }[];
}

// Chart configurations, tooltips, and legends moved to dashboard-charts.tsx

const ChartSkeleton = memo(function ChartSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader><div className="h-5 bg-primary/5 rounded w-40" /></CardHeader>
      <CardContent>
        <div className="h-[250px] bg-primary/5 rounded" />
      </CardContent>
    </Card>
  );
});

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaFiles, setMediaFiles] = useState<{ id: string; url: string; thumbnail_url: string | null; name: string; mime_type: string }[]>([]);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setMediaFiles(d.slice(0, 6));
        else if (d.files) setMediaFiles(d.files.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const s = data?.stats;

  const noData = useMemo(
    () => !data || (s && s.totalStudents === 0 && s.activeCourses === 0 && s.totalEnrollments === 0),
    [data, s]
  );

  const statCards = useMemo(() => [
    {
      label: "Total Students",
      value: s?.totalStudents ?? 0,
      change: s?.studentGrowth?.change,
      up: s?.studentGrowth?.up,
      changeLabel: "vs last month",
      icon: <Users className="w-full h-full" />,
      accentBorder: "border-l-emerald-500",
      iconVariant: "emerald" as const,
    },
    {
      label: "Active Courses",
      value: s?.activeCourses ?? 0,
      change: `${s?.publishedPosts ?? 0}`,
      up: true,
      changeLabel: "published posts",
      icon: <BookOpen className="w-full h-full" />,
      accentBorder: "border-l-secondary",
      iconVariant: "secondary" as const,
    },
    {
      label: "Enrollments",
      value: s?.totalEnrollments ?? 0,
      change: s?.enrollmentGrowth?.change,
      up: s?.enrollmentGrowth?.up,
      changeLabel: "vs last month",
      icon: <FileText className="w-full h-full" />,
      accentBorder: "border-l-amber-500",
      iconVariant: "amber" as const,
    },
    {
      label: "Unread Messages",
      value: s?.unreadMessages ?? 0,
      change: `${s?.totalContactSubmissions ?? 0}`,
      up: false,
      changeLabel: "total submissions",
      icon: <MessageSquare className="w-full h-full" />,
      accentBorder: "border-l-violet-500",
      iconVariant: "violet" as const,
    },
  ], [s]);

  const noticesEntries = useMemo(
    () => Object.entries(data?.noticesByCategory ?? {}),
    [data?.noticesByCategory]
  );

  const miniStats = useMemo(() => [
    { label: "Testimonials", value: s?.totalTestimonials ?? 0, icon: <Star className="w-full h-full" /> },
    { label: "Blog Posts", value: s?.publishedPosts ?? 0, icon: <Newspaper className="w-full h-full" /> },
    { label: "Messages", value: s?.totalContactSubmissions ?? 0, icon: <MessageSquare className="w-full h-full" /> },
    { label: "Revenue", value: `$${(s?.totalRevenue ?? 0).toLocaleString()}`, icon: <DollarSign className="w-full h-full" /> },
  ], [s]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-primary/5 rounded w-48 animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <ChartSkeleton />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Welcome back, Admin. Here&apos;s what&apos;s happening today.">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/enrollments">View Enrollments</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/dashboard/notices">Publish Notice</Link>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <StatCard icon={stat.icon} label={stat.label} value={stat.value} change={stat.change} up={stat.up} changeLabel={stat.changeLabel} accentBorder={stat.accentBorder} iconVariant={stat.iconVariant} />
          </motion.div>
        ))}
      </div>

      {/* Additional mini stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {miniStats.map((stat) => (
            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} variant="mini" />
        ))}
      </div>

      {noData ? (
        <EmptyState
          icon={<BarChart3 className="w-full h-full" />}
          title="No Data Yet"
          description="Start adding students, courses, and enrollments to see analytics and charts here."
          size="lg"
        />
      ) : (
        <DashboardCharts data={data} noticesEntries={noticesEntries} />
      )}

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
       <Card className="lg:col-span-2 overflow-hidden">
  <CardHeader className="pb-3">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <CardTitle>Recent Enrollments</CardTitle>

      <Button
        variant="ghost"
        size="sm"
        asChild
        className="w-full sm:w-auto"
      >
        <Link href="/dashboard/enrollments">
          View All
        </Link>
      </Button>
    </div>
  </CardHeader>

  <CardContent className="px-4 sm:px-6">
    {data?.recentEnrollments && data.recentEnrollments.length > 0 ? (
      <>
        {/* Mobile & Tablet Cards */}
        <div className="space-y-3 md:hidden">
          {data.recentEnrollments.map((e) => (
            <EnrollmentCard key={e.id} enrollment={e} />
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/5">
                <th className="pb-3 pr-4 text-left text-xs font-medium text-muted">
                  Name
                </th>
                <th className="pb-3 pr-4 text-left text-xs font-medium text-muted">
                  Course
                </th>
                <th className="pb-3 pr-4 text-left text-xs font-medium text-muted">
                  Date
                </th>
                <th className="pb-3 text-left text-xs font-medium text-muted">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {data.recentEnrollments.map((e) => (
                <EnrollmentRow key={e.id} enrollment={e} />
              ))}
            </tbody>
          </table>
        </div>
      </>
    ) : (
      <div className="py-8 text-center">
        <p className="text-sm text-muted">
          No enrollments yet
        </p>
      </div>
    )}
  </CardContent>
</Card>
        {/* Latest Notices */}
        <Card>
          <CardHeader className="pb-3">
            <CardHeaderAction title="Latest Notices" actionHref="/dashboard/notices" />
          </CardHeader>
          <CardContent>
            {data?.latestNotices && data.latestNotices.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {data.latestNotices.map((notice) => (
                  <NoticeItem key={notice.id} title={notice.title} date={formatShortDate(notice.date)} category={notice.category} variant="compact" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">No notices yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardHeaderAction title="Media Preview" icon={<ImageIcon className="w-full h-full" />} actionHref="/dashboard/media" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {mediaFiles.map((file) => (
                <MediaFileCard key={file.id} file={file} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const EnrollmentCard = memo(function EnrollmentCard({ enrollment }: {
  enrollment: { id: string; fullName: string; email: string; course: string; status: string; createdAt: string };
}) {
  return (
    <div key={enrollment.id} className="rounded-xl border border-primary/5 bg-accent p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-xs font-bold text-primary">
          {enrollment.fullName.split(" ").map((n: string) => n[0]).join("")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold text-primary">{enrollment.fullName}</p>
          <p className="mt-0.5 break-words text-xs text-muted">{enrollment.email}</p>
          <p className="mt-2 break-words text-xs text-muted">{enrollment.course}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-primary/5 pt-3">
        <span className="text-xs text-muted">{formatShortDate(enrollment.createdAt)}</span>
        <Badge
          variant={enrollment.status === "approved" ? "success" : enrollment.status === "rejected" ? "destructive" : "outline"}
          className="text-[10px]"
        >
          {enrollment.status}
        </Badge>
      </div>
    </div>
  );
});

const EnrollmentRow = memo(function EnrollmentRow({ enrollment }: {
  enrollment: { id: string; fullName: string; email: string; course: string; status: string; createdAt: string };
}) {
  return (
    <tr key={enrollment.id} className="border-b border-primary/5 last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/5 text-xs font-bold text-primary">
            {enrollment.fullName.split(" ").map((n: string) => n[0]).join("")}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-primary">{enrollment.fullName}</p>
            <p className="truncate text-xs text-muted">{enrollment.email}</p>
          </div>
        </div>
      </td>
      <td className="max-w-[220px] truncate py-3 pr-4 text-sm text-muted">{enrollment.course}</td>
      <td className="whitespace-nowrap py-3 pr-4 text-sm text-muted">{formatShortDate(enrollment.createdAt)}</td>
      <td className="py-3">
        <Badge
          variant={enrollment.status === "approved" ? "success" : enrollment.status === "rejected" ? "destructive" : "outline"}
          className="text-[10px]"
        >
          {enrollment.status}
        </Badge>
      </td>
    </tr>
  );
});

const MediaFileCard = memo(function MediaFileCard({ file }: {
  file: { id: string; url: string; thumbnail_url: string | null; name: string; mime_type: string };
}) {
  const isVideo = file.mime_type?.startsWith("video/");
  const isImage = file.mime_type?.startsWith("image/");
  const isPdf = file.mime_type === "application/pdf";
  return (
    <Link
      href="/dashboard/media"
      className="group relative aspect-square rounded-xl overflow-hidden border border-primary/5 bg-accent hover:border-secondary/30 hover:shadow-soft transition-all"
    >
      {isImage ? (
        <Image
          src={file.thumbnail_url || file.url}
          alt={file.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : isVideo ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black/5">
          <Video className="w-8 h-8 text-muted" />
          {file.thumbnail_url && (
            <Image
              src={file.thumbnail_url}
              alt={file.name}
              fill
              className="object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ) : isPdf ? (
        <div className="w-full h-full flex items-center justify-center bg-red-50">
          <File className="w-8 h-8 text-red-500" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <File className="w-8 h-8 text-muted" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
        <p className="text-[10px] text-white truncate font-medium">{file.name}</p>
      </div>
    </Link>
  );
});
