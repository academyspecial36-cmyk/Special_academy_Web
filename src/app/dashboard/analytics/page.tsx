"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import {
  Eye, Users, Activity, ClipboardCheck, Target, Trophy, TrendingUp,
  BarChart3, FileText, GraduationCap,
  BookOpen, HelpCircle, AlertCircle, LogIn, Download,
  CheckSquare, LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SkeletonCard } from "@/components/shared/skeleton-card";



interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  viewsGrowth: number;
  newRegistrations: number;
  logins: number;
  examStarts: number;
  examSubmits: number;
  completionRate: number;
  pdfImports: number;
  questionsSaved: number;
  landingViews: number;
  examPageViews: number;
  chartDays: { date: string; views: number }[];
  topPages: { path: string; views: number }[];
  topExams: { id: string; title: string; started: number; submitted: number; rate: number }[];
  totalStudents: number;
  totalCourses: number;
  totalExams: number;
  totalQuestions: number;
  totalEnrollments: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState("7");

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/analytics/data?range=${range}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [range]);

  const ranges = [
    { value: "today", label: "Today" },
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
    { value: "90", label: "90 Days" },
  ];

  const chartDays = data?.chartDays ?? [];

  const barWidth = useMemo(() => {
    const count = chartDays.length;
    if (count <= 14) return "flex-1 min-w-0";
    if (count <= 30) return "min-w-[28px]";
    if (count <= 60) return "min-w-[20px]";
    return "min-w-[14px]";
  }, [chartDays.length]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-primary/5 rounded w-48 animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[300px] bg-primary/5 rounded-xl animate-pulse" />
          <div className="h-[300px] bg-primary/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Analytics</h1>
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">Failed to Load</h3>
            <p className="text-sm text-muted max-w-md">
              Could not fetch analytics data. Make sure the analytics migration has been run.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const mainStats = [
    {
      icon: <Eye className="w-full h-full" />, label: "Total Page Views", value: data.totalPageViews,
      change: `${data.viewsGrowth > 0 ? "+" : ""}${data.viewsGrowth}%`,
      up: data.viewsGrowth >= 0, changeLabel: "vs previous period",
      accentBorder: "border-l-primary-500", iconVariant: "primary" as const,
    },
    {
      icon: <Users className="w-full h-full" />, label: "Unique Visitors", value: data.uniqueVisitors,
      accentBorder: "border-l-primary-600", iconVariant: "primary" as const,
    },
    {
      icon: <Activity className="w-full h-full" />, label: "Views Today", value: data.viewsToday,
      accentBorder: "border-l-primary-400", iconVariant: "primary" as const,
    },
    {
      icon: <ClipboardCheck className="w-full h-full" />, label: "New Registrations", value: data.newRegistrations,
      change: `${data.totalEnrollments}`,
      up: true, changeLabel: "total enrollments",
      accentBorder: "border-l-primary-700", iconVariant: "primary" as const,
    },
  ];

  const engagementStats = [
    { icon: <LogIn className="w-full h-full" />, label: "Logins", value: data.logins, accentBorder: "border-l-primary-500", iconVariant: "primary" as const },
    { icon: <Target className="w-full h-full" />, label: "Exam Starts", value: data.examStarts, accentBorder: "border-l-primary-300", iconVariant: "primary" as const },
    { icon: <Trophy className="w-full h-full" />, label: "Exam Submissions", value: data.examSubmits, accentBorder: "border-l-primary-600", iconVariant: "primary" as const },
    {
      icon: <TrendingUp className="w-full h-full" />, label: "Completion Rate", value: `${data.completionRate}%`,
      change: `${data.examStarts} started`,
      up: true, changeLabel: `${data.examSubmits} submitted`,
      accentBorder: "border-l-primary-400", iconVariant: "primary" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Track platform engagement, exams, and content performance.">
        <div className="flex gap-1.5 bg-primary/5 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors font-medium shrink-0",
                range === r.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted border-primary/10 hover:border-primary/30"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Main Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard icon={s.icon} label={s.label} value={s.value} change={s.change} up={s.up} changeLabel={s.changeLabel} accentBorder={s.accentBorder} iconVariant={s.iconVariant} />
          </motion.div>
        ))}
      </div>

      {/* Engagement Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {engagementStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard icon={s.icon} label={s.label} value={s.value} change={s.change} up={s.up} changeLabel={s.changeLabel} accentBorder={s.accentBorder} iconVariant={s.iconVariant} />
          </motion.div>
        ))}
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<LayoutDashboard className="w-full h-full" />} label="Landing Views" value={data.landingViews} variant="mini" />
        <StatCard icon={<HelpCircle className="w-full h-full" />} label="Exam Page Views" value={data.examPageViews} variant="mini" />
        <StatCard icon={<Download className="w-full h-full" />} label="PDF Imports" value={data.pdfImports} variant="mini" />
        <StatCard icon={<CheckSquare className="w-full h-full" />} label="Questions Saved" value={data.questionsSaved} variant="mini" />
      </div>

      {/* Chart + Top Pages side by side */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Page Views Chart */}
        <Card className="lg:col-span-2 min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-secondary" />
              Page Views {range === "today" ? "Today" : `Last ${range === "90" ? "90" : range} Days`}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {chartDays.length === 0 ? (
              <div className="py-12 text-center">
                <BarChart3 className="w-8 h-8 text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">No page view data for this period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className={`flex items-end gap-0.5 sm:gap-1 ${chartDays.length > 14 ? "min-w-[max(100%,480px)]" : ""}`} style={{ height: "160px" }}>
                  {chartDays.map((day) => {
                    const max = Math.max(...chartDays.map((d) => d.views), 1);
                    const height = (day.views / max) * 100;
                    return (
                      <div key={day.date} className={`flex flex-col items-center gap-0.5 justify-end h-full ${barWidth}`}>
                        <span className="text-[9px] sm:text-xs text-muted font-medium leading-none">
                          {chartDays.length <= 60 ? (day.views > 0 ? day.views : "") : ""}
                        </span>
                        <div
                          className="w-full rounded-t-sm bg-secondary/70 hover:bg-secondary transition-colors"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        />
                        <span className="text-[7px] sm:text-[9px] text-muted truncate w-full text-center leading-none">
                          {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: chartDays.length <= 31 ? "short" : "numeric",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-secondary" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPages.length === 0 ? (
              <div className="py-8 text-center">
                <Eye className="w-6 h-6 text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">No data yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.topPages.map((page, i) => (
                  <TopPageRow key={page.path} index={i} path={page.path} views={page.views} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Exams + Totals */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Exams */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-secondary" />
              Top Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topExams.length === 0 ? (
              <div className="py-8 text-center">
                <Trophy className="w-6 h-6 text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">No exam activity yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/5">
                      <th className="text-left pb-2 pr-4 text-xs font-medium text-muted">Exam</th>
                      <th className="text-center pb-2 pr-4 text-xs font-medium text-muted">Started</th>
                      <th className="text-center pb-2 pr-4 text-xs font-medium text-muted">Submitted</th>
                      <th className="text-right pb-2 text-xs font-medium text-muted">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topExams.map((exam) => (
                      <TopExamRow key={exam.id} title={exam.title} started={exam.started} submitted={exam.submitted} rate={exam.rate} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-secondary" />
              Platform Totals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Users, label: "Students", value: data.totalStudents, accent: "bg-primary-50 text-primary-600" },
              { icon: BookOpen, label: "Courses", value: data.totalCourses, accent: "bg-primary-100 text-primary-700" },
              { icon: FileText, label: "Enrollments", value: data.totalEnrollments, accent: "bg-primary-50 text-primary-500" },
              { icon: GraduationCap, label: "Exams", value: data.totalExams, accent: "bg-primary-200 text-primary-800" },
              { icon: HelpCircle, label: "Questions", value: data.totalQuestions, accent: "bg-primary-50 text-primary-400" },
            ].map((s) => (
              <PlatformTotalStat key={s.label} icon={s.icon} label={s.label} value={s.value} accent={s.accent} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const TopPageRow = memo(function TopPageRow({ index, path, views }: { index: number; path: string; views: number }) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-primary/5 last:border-0">
      <span className="text-xs text-muted w-5 shrink-0 font-medium">{index + 1}.</span>
      <span className="text-xs sm:text-sm truncate flex-1">{path}</span>
      <Badge variant="outline" className="text-[10px] shrink-0 font-mono">{views}</Badge>
    </div>
  );
});

const TopExamRow = memo(function TopExamRow({ title, started, submitted, rate }: { title: string; started: number; submitted: number; rate: number }) {
  return (
    <tr className="border-b border-primary/5 last:border-0">
      <td className="py-2.5 pr-4">
        <span className="text-sm font-medium text-primary truncate block max-w-[200px]">{title}</span>
      </td>
      <td className="py-2.5 pr-4 text-center text-sm">{started}</td>
      <td className="py-2.5 pr-4 text-center text-sm">{submitted}</td>
      <td className="py-2.5 text-right">
        <Badge variant={rate >= 70 ? "success" : rate >= 40 ? "outline" : "destructive"} className="text-[10px]">
          {rate}%
        </Badge>
      </td>
    </tr>
  );
});

const PlatformTotalStat = memo(function PlatformTotalStat({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: number; accent: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-muted">{label}</span>
      </div>
      <span className="text-sm font-bold text-primary">{value.toLocaleString()}</span>
    </div>
  );
});
