"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, BookOpen, FileText, Bell, TrendingUp, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Activity, DollarSign, GraduationCap, MessageSquare,
  Newspaper, Star,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatShortDate, cn } from "@/lib/utils";

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

const CHART_COLORS = ["hsl(var(--primary))", "#2563eb", "#d97706", "#059669", "#7c3aed", "#dc2626", "#0891b2", "#db2777"];

function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "Count",
  formatValue,
}: {
  active?: boolean;
  payload?: { value: number; color?: string }[];
  label?: string;
  valueLabel?: string;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-lg px-4 py-3 min-w-[160px]">
      <p className="text-xs font-medium text-muted mb-1">{label}</p>
      <div className="h-px bg-primary/5 my-1.5" />
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color ?? CHART_COLORS[0] }} />
            <span className="text-sm font-medium text-primary">{valueLabel}</span>
          </div>
          <span className="text-sm font-bold text-primary">{formatValue ? formatValue(entry.value) : entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; percent?: number }[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-lg px-4 py-3 min-w-[140px]">
      <p className="text-sm font-medium text-primary">{entry.name}</p>
      <div className="h-px bg-primary/5 my-1.5" />
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted">Count</span>
        <span className="text-sm font-bold text-primary">{entry.value}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted">Share</span>
        <span className="text-sm font-semibold text-primary">{Math.round((entry.percent ?? 0) * 100)}%</span>
      </div>
    </div>
  );
}

function PieLegend({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-xs mt-2">
      {data.map((entry, i) => (
        <div key={entry.name} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
          <span className="text-muted">{entry.name}</span>
          <span className="font-medium text-primary">{Math.round((entry.value / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-5">
        <div className="h-4 bg-primary/5 rounded w-24 mb-3" />
        <div className="h-8 bg-primary/5 rounded w-16 mb-3" />
        <div className="h-3 bg-primary/5 rounded w-32" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader><div className="h-5 bg-primary/5 rounded w-40" /></CardHeader>
      <CardContent>
        <div className="h-[250px] bg-primary/5 rounded" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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

  const s = data?.stats;
  const noData = !data || (s && s.totalStudents === 0 && s.activeCourses === 0 && s.totalEnrollments === 0);

  const statCards = [
    {
      label: "Total Students",
      value: s?.totalStudents ?? 0,
      change: s?.studentGrowth?.change,
      up: s?.studentGrowth?.up,
      changeLabel: "vs last month",
      icon: Users,
      accent: "border-l-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active Courses",
      value: s?.activeCourses ?? 0,
      change: `${s?.publishedPosts ?? 0}`,
      up: true,
      changeLabel: "published posts",
      icon: BookOpen,
      accent: "border-l-secondary",
      iconBg: "bg-secondary/10 text-secondary",
    },
    {
      label: "Enrollments",
      value: s?.totalEnrollments ?? 0,
      change: s?.enrollmentGrowth?.change,
      up: s?.enrollmentGrowth?.up,
      changeLabel: "vs last month",
      icon: FileText,
      accent: "border-l-amber-500",
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Unread Messages",
      value: s?.unreadMessages ?? 0,
      change: `${s?.totalContactSubmissions ?? 0}`,
      up: false,
      changeLabel: "total submissions",
      icon: MessageSquare,
      accent: "border-l-violet-500",
      iconBg: "bg-violet-50 text-violet-600",
    },
  ];

  const noticesEntries = Object.entries(data?.noticesByCategory ?? {});

  function EmptyState({ message }: { message: string }) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="w-10 h-10 text-muted mb-3" />
        <p className="text-sm text-muted">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/enrollments">View Enrollments</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/notices">Publish Notice</Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`border-l-4 ${stat.accent} overflow-hidden`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg} shrink-0`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">{stat.label}</p>
                      <p className="text-2xl font-bold text-primary mt-0.5">
                        {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-1",
                      stat.up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    )}
                  >
                    {stat.up ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs text-muted mt-2 ml-[52px]">{stat.changeLabel}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional mini stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Testimonials", value: s?.totalTestimonials ?? 0, icon: Star },
          { label: "Blog Posts", value: s?.publishedPosts ?? 0, icon: Newspaper },
          { label: "Messages", value: s?.totalContactSubmissions ?? 0, icon: MessageSquare },
          { label: "Revenue", value: `$${(s?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign },
        ].map((stat) => (
          <Card key={stat.label} className="border-t-2 border-t-primary/10">
            <CardContent className="p-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-muted uppercase tracking-wider">{stat.label}</p>
                <p className="text-base font-bold text-primary mt-0.5">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {noData ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No Data Yet</h3>
              <p className="text-sm text-muted max-w-md mx-auto">
                Start adding students, courses, and enrollments to see analytics and charts here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Chart Row 1: Student Growth + Notices Pie */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  <CardTitle>Student Growth</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {data?.studentGrowth && data.studentGrowth.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.studentGrowth} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--primary) / 0.4)" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--primary) / 0.4)" }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip valueLabel="Students" />} />
                        <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#sg)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState message="No student growth data yet" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-secondary" />
                  <CardTitle>Notices by Category</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {noticesEntries.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={noticesEntries.map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {noticesEntries.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <PieLegend data={noticesEntries.map(([name, value]) => ({ name, value }))} colors={CHART_COLORS} />
                  </div>
                ) : (
                  <EmptyState message="No notices yet" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart Row 2: Enrollment Trends + Revenue */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-secondary" />
                  <CardTitle>Enrollment Trends</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {data?.enrollmentTrends && data.enrollmentTrends.length > 0 ? (
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.enrollmentTrends} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--primary) / 0.4)" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--primary) / 0.4)" }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip valueLabel="Enrollments" />} />
                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState message="No enrollment data yet" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-secondary" />
                  <CardTitle>Revenue Overview</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {data?.revenue && data.revenue.length > 0 ? (
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.revenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.06)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--primary) / 0.4)" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--primary) / 0.4)" }} tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip valueLabel="Revenue" formatValue={(v) => `$${v.toLocaleString()}`} />} />
                        <Area type="monotone" dataKey="amount" stroke="#059669" strokeWidth={2} fill="url(#rev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState message="No revenue data yet" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart Row 3: Course Popularity + Students by Class */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-secondary" />
                  <CardTitle>Course Popularity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {data?.coursePopularity && data.coursePopularity.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.coursePopularity} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.06)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--primary) / 0.4)" }} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--primary))" }} tickLine={false} axisLine={false} width={140} />
                        <Tooltip content={<ChartTooltip valueLabel="Enrollments" />} />
                        <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState message="No enrollment data by course" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-secondary" />
                  <CardTitle>Students by Class</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {data?.studentsByClass && data.studentsByClass.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.studentsByClass} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.06)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--primary) / 0.4)" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--primary) / 0.4)" }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip valueLabel="Students" />} />
                        <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState message="No student class data" />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Enrollments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/enrollments">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data?.recentEnrollments && data.recentEnrollments.length > 0 ? (
              <>
                <div className="space-y-3 sm:hidden">
                  {data.recentEnrollments.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 p-3 bg-accent rounded-xl border border-primary/5">
                      <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {e.fullName.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{e.fullName}</p>
                        <p className="text-xs text-muted truncate">{e.course}</p>
                      </div>
                      <Badge
                        variant={e.status === "approved" ? "success" : e.status === "rejected" ? "destructive" : "outline"}
                        className="text-[10px] shrink-0"
                      >
                        {e.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/5">
                        <th className="text-left text-xs font-medium text-muted pb-3 pr-4">Name</th>
                        <th className="text-left text-xs font-medium text-muted pb-3 pr-4">Course</th>
                        <th className="text-left text-xs font-medium text-muted pb-3 pr-4">Date</th>
                        <th className="text-left text-xs font-medium text-muted pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentEnrollments.map((e) => (
                        <tr key={e.id} className="border-b border-primary/5 last:border-0">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                {e.fullName.split(" ").map((n: string) => n[0]).join("")}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-primary truncate">{e.fullName}</p>
                                <p className="text-xs text-muted truncate">{e.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-sm text-muted truncate max-w-[180px]">{e.course}</td>
                          <td className="py-3 pr-4 text-sm text-muted whitespace-nowrap">{formatShortDate(e.createdAt)}</td>
                          <td className="py-3">
                            <Badge
                              variant={e.status === "approved" ? "success" : e.status === "rejected" ? "destructive" : "outline"}
                              className="text-[10px]"
                            >
                              {e.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted text-center py-4">No enrollments yet</p>
            )}
          </CardContent>
        </Card>

        {/* Latest Notices */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Latest Notices</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/notices">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data?.latestNotices && data.latestNotices.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {data.latestNotices.map((notice) => (
                  <div key={notice.id} className="pb-3 sm:pb-4 border-b border-primary/5 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-primary line-clamp-2 mb-1.5">{notice.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted">{formatShortDate(notice.date)}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{notice.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">No notices yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
