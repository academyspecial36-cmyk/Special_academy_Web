"use client";

import {
  TrendingUp, PieChart, Activity, DollarSign, GraduationCap, Users, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AnalyticsData {
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BarChart3 className="w-10 h-10 text-muted mb-3" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

interface DashboardChartsProps {
  data: AnalyticsData | null;
  noticesEntries: [string, number][];
}

export function DashboardCharts({ data, noticesEntries }: DashboardChartsProps) {
  return (
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
  );
}
