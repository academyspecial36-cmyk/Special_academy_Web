"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Eye, Users, Activity, ClipboardCheck, Target, Trophy, TrendingUp,
  ArrowUpRight, ArrowDownRight, BarChart3, FileText, GraduationCap,
  BookOpen, HelpCircle, AlertCircle, LogIn, Download,
  CheckSquare, LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const ACCENT_BORDERS = [
  "border-l-primary-500", "border-l-primary-600", "border-l-primary-400", "border-l-primary-700",
  "border-l-primary-500", "border-l-primary-300", "border-l-primary-600", "border-l-primary-400",
];
const ACCENT_ICONS = [
  "bg-primary-50 text-primary-600", "bg-primary-100 text-primary-700",
  "bg-primary-50 text-primary-500", "bg-primary-200 text-primary-800",
  "bg-primary-50 text-primary-600", "bg-primary-50 text-primary-400",
  "bg-primary-100 text-primary-700", "bg-primary-50 text-primary-500",
];

function StatCard({
  icon: Icon, label, value, change, changeLabel, up, accentIdx,
}: {
  icon: React.ElementType; label: string; value: string | number;
  change?: string; changeLabel?: string; up?: boolean; accentIdx: number;
}) {
  const i = accentIdx % ACCENT_BORDERS.length;
  return (
    <Card className={`border-l-4 ${ACCENT_BORDERS[i]} overflow-hidden`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ACCENT_ICONS[i]} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">{label}</p>
              <p className="text-xl sm:text-2xl font-bold text-primary mt-0.5">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
            </div>
          </div>
          {change !== undefined && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-1 ${
              up ? "bg-primary-50 text-primary-700" : "bg-red-50 text-red-700"
            }`}>
              {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}
            </span>
          )}
        </div>
        {changeLabel && <p className="text-xs text-muted mt-2 ml-[52px]">{changeLabel}</p>}
      </CardContent>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <Card className="border-t-2 border-t-primary/10">
      <CardContent className="p-3.5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-muted uppercase tracking-wider">{label}</p>
          <p className="text-base font-bold text-primary mt-0.5">{typeof value === "number" ? value.toLocaleString() : value}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
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
      icon: Eye, label: "Total Page Views", value: data.totalPageViews,
      change: `${data.viewsGrowth > 0 ? "+" : ""}${data.viewsGrowth}%`,
      up: data.viewsGrowth >= 0, changeLabel: "vs previous period",
    },
    {
      icon: Users, label: "Unique Visitors", value: data.uniqueVisitors,
    },
    {
      icon: Activity, label: "Views Today", value: data.viewsToday,
    },
    {
      icon: ClipboardCheck, label: "New Registrations", value: data.newRegistrations,
      change: `${data.totalEnrollments}`,
      up: true, changeLabel: "total enrollments",
    },
  ];

  const engagementStats = [
    { icon: LogIn, label: "Logins", value: data.logins },
    { icon: Target, label: "Exam Starts", value: data.examStarts },
    { icon: Trophy, label: "Exam Submissions", value: data.examSubmits },
    {
      icon: TrendingUp, label: "Completion Rate", value: `${data.completionRate}%`,
      change: `${data.examStarts} started`,
      up: true, changeLabel: `${data.examSubmits} submitted`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Analytics</h1>
          <p className="text-xs sm:text-sm text-muted">Track platform engagement, exams, and content performance.</p>
        </div>
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
      </motion.div>

      {/* Main Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard {...s} accentIdx={i} />
          </motion.div>
        ))}
      </div>

      {/* Engagement Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {engagementStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard {...s} accentIdx={i + 4} />
          </motion.div>
        ))}
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={LayoutDashboard} label="Landing Views" value={data.landingViews} />
        <MiniStat icon={HelpCircle} label="Exam Page Views" value={data.examPageViews} />
        <MiniStat icon={Download} label="PDF Imports" value={data.pdfImports} />
        <MiniStat icon={CheckSquare} label="Questions Saved" value={data.questionsSaved} />
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
                  <div key={page.path} className="flex items-center gap-3 py-1.5 border-b border-primary/5 last:border-0">
                    <span className="text-xs text-muted w-5 shrink-0 font-medium">{i + 1}.</span>
                    <span className="text-xs sm:text-sm truncate flex-1">{page.path}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0 font-mono">{page.views}</Badge>
                  </div>
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
                      <tr key={exam.id} className="border-b border-primary/5 last:border-0">
                        <td className="py-2.5 pr-4">
                          <span className="text-sm font-medium text-primary truncate block max-w-[200px]">{exam.title}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-center text-sm">{exam.started}</td>
                        <td className="py-2.5 pr-4 text-center text-sm">{exam.submitted}</td>
                        <td className="py-2.5 text-right">
                          <Badge variant={exam.rate >= 70 ? "success" : exam.rate >= 40 ? "outline" : "destructive"} className="text-[10px]">
                            {exam.rate}%
                          </Badge>
                        </td>
                      </tr>
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
              { icon: Users, label: "Students", value: data.totalStudents },
              { icon: BookOpen, label: "Courses", value: data.totalCourses },
              { icon: FileText, label: "Enrollments", value: data.totalEnrollments },
              { icon: GraduationCap, label: "Exams", value: data.totalExams },
              { icon: HelpCircle, label: "Questions", value: data.totalQuestions },
            ].map((s, i) => {
              const variants = ["bg-primary-50 text-primary-600", "bg-primary-100 text-primary-700", "bg-primary-50 text-primary-500", "bg-primary-200 text-primary-800", "bg-primary-50 text-primary-400"];
              return (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${variants[i % variants.length]}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-muted">{s.label}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{s.value.toLocaleString()}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
