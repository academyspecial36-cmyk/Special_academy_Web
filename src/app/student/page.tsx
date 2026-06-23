"use client";

import { useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen, Bell, Calendar, TrendingUp, FileText,
  ArrowRight, Sparkles, ClipboardCheck, Target, Trophy, BarChart3,
  Video, ExternalLink, Zap, Award, Flame, CheckCircle, ChevronRight,
  Play, GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useAppContext } from "@/lib/app-context";
import { useFetch } from "@/lib/use-fetch";
import { Notice, LiveClass } from "@/types";
import { formatShortDate } from "@/lib/utils";
import { NoticeItem } from "@/components/shared/notice-item";
import { CardHeaderAction } from "@/components/shared/card-header-action";

const ProgressRing = memo(function ProgressRing({ percent, size = 72, strokeWidth = 6 }: { percent: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--primary) / 0.1)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="hsl(var(--primary))" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold text-primary">{percent}%</span>
    </div>
  );
});

const QUICK_ACTIONS = [
  { label: "My Courses", href: "/student/courses", icon: BookOpen, desc: "Continue learning" },
  { label: "Live Classes", href: "/student/live-classes", icon: Video, desc: "Join sessions" },
  { label: "Exams", href: "/student/exams", icon: ClipboardCheck, desc: "Take tests" },
  { label: "Notices", href: "/student/notices", icon: Bell, desc: "View updates" },
];

function getBadges(userAttempts: { score?: number; total?: number; completedAt?: string }[], totalCompleted: number, totalItems: number) {
  const badges: { icon: React.ElementType; label: string; earned: boolean; color: string }[] = [
    { icon: Trophy, label: "First Exam", earned: userAttempts.length > 0, color: "text-amber-500" },
    { icon: Award, label: "Perfect Score", earned: userAttempts.some((a) => a.score === a.total), color: "text-purple-500" },
    { icon: Flame, label: "50% Progress", earned: totalItems > 0 && totalCompleted >= Math.ceil(totalItems * 0.5), color: "text-orange-500" },
    { icon: CheckCircle, label: "100% Done", earned: totalItems > 0 && totalCompleted >= totalItems, color: "text-emerald-500" },
  ];
  return badges;
}

const ExamMiniChart = memo(function ExamMiniChart({ scores }: { scores: number[] }) {
  const max = Math.max(...scores, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {scores.map((s, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <span className="text-[8px] text-muted font-medium leading-none">{s}</span>
          <div
            className="w-full rounded-sm bg-primary/70"
            style={{ height: `${(s / max) * 100}%`, minHeight: 4 }}
          />
        </div>
      ))}
    </div>
  );
});

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const {
    subcategories, completedItems, notices: contextNotices, dataLoading,
    attempts, examCategories, examSubcategories,
  } = useAppContext();
  const coursesFetch = useFetch<{ courses: { id: string; title: string; duration: string; qualification: string; category: string }[] }>("/api/student-courses");
  const noticesFetch = useFetch<Notice[]>("/api/student/notices");
  const liveFetch = useFetch<LiveClass[]>("/api/student/live-classes");

  const enrolledCourses = useMemo(() => coursesFetch.data?.courses ?? [], [coursesFetch.data]);
  const realNotices = noticesFetch.data ?? null;
  const dashboardLoading = coursesFetch.loading || noticesFetch.loading || liveFetch.loading;
  const notices = realNotices ?? contextNotices;
  const allLiveClasses = useMemo(() => (Array.isArray(liveFetch.data) ? liveFetch.data : []), [liveFetch.data]);

  const upcomingLive = useMemo(
    () => allLiveClasses
      .filter((c) => c.status === "scheduled" || c.status === "live")
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3),
    [allLiveClasses]
  );

  function getCourseProgress(courseId: string) {
    const courseSubs = subcategories.filter((s) => s.courseId === courseId && !s.hidden);
    const allItems = courseSubs.flatMap((s) => s.items.filter((item) => !item.hidden));
    const completed = allItems.filter((item) => completedItems.includes(item.id)).length;
    return allItems.length > 0 ? Math.round((completed / allItems.length) * 100) : 0;
  }

  function getCompletedCount(courseId: string) {
    const courseSubs = subcategories.filter((s) => s.courseId === courseId && !s.hidden);
    return courseSubs.flatMap((s) => s.items.filter((item) => !item.hidden && completedItems.includes(item.id))).length;
  }

  function getTotalCount(courseId: string) {
    const courseSubs = subcategories.filter((s) => s.courseId === courseId && !s.hidden);
    return courseSubs.flatMap((s) => s.items.filter((item) => !item.hidden)).length;
  }

  const totalCompleted = enrolledCourses.reduce((sum, c) => sum + getCompletedCount(c.id), 0);
  const totalItems = enrolledCourses.reduce((sum, c) => sum + getTotalCount(c.id), 0);
  const avgProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const userAttempts = attempts.filter((a) => a.studentName === (user?.name || user?.email?.split("@")[0]));
  const examStarted = userAttempts.length;
  const examCompleted = userAttempts.filter((a) => a.completedAt).length;
  const examRate = examStarted > 0 ? Math.round((examCompleted / examStarted) * 100) : 0;
  const avgScore = examCompleted > 0 ? Math.round(userAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / examCompleted) : 0;
  const recentExams = [...userAttempts].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, 5);
  const examScores = [...userAttempts].filter((a) => a.score != null).reverse().slice(-5).map((a) => a.score || 0);

  const badges = getBadges(userAttempts, totalCompleted, totalItems);

  // Recent activity: latest completed items + exam attempts
  const recentActivity = useMemo(() => {
    const activities: { id: string; type: "material" | "exam"; title: string; date: string; href: string }[] = [];

    for (const sub of subcategories) {
      if (sub.hidden) continue;
      for (const item of sub.items) {
        if (item.hidden || !completedItems.includes(item.id)) continue;
        activities.push({
          id: `mat-${item.id}`,
          type: "material",
          title: item.title,
          date: item.createdAt || sub.createdAt || new Date().toISOString(),
          href: `/student/courses/${sub.courseId}?itemId=${item.id}`,
        });
      }
    }

    for (const a of userAttempts) {
      if (!a.completedAt) continue;
      const sub = examSubcategories.find((s) => s.id === a.subcategoryId);
      activities.push({
        id: `exam-${a.id}`,
        type: "exam",
        title: `Exam: ${sub?.name || "Unknown"}`,
        date: a.completedAt,
        href: `/student/exams/result/${a.id}`,
      });
    }

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [subcategories, completedItems, userAttempts, examSubcategories]);

  // Latest materials
  const latestMaterials = useMemo(() => {
    const enrolledIds = new Set(enrolledCourses.map((c) => c.id));
    const items: { id: string; title: string; image?: string; chapterName: string; chapterId: string; courseId: string; createdAt: string }[] = [];
    for (const sub of subcategories) {
      if (!enrolledIds.has(sub.courseId) || sub.hidden) continue;
      for (const item of sub.items) {
        if (item.hidden) continue;
        items.push({
          id: item.id, title: item.title, image: item.images?.[0],
          chapterName: sub.title, chapterId: sub.id, courseId: sub.courseId,
          createdAt: item.createdAt || sub.createdAt || new Date().toISOString(),
        });
      }
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  }, [subcategories, enrolledCourses]);

  if (dataLoading || dashboardLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div><div className="h-8 w-48 bg-primary/10 rounded-md animate-pulse" /><div className="h-4 w-64 bg-primary/10 rounded-md animate-pulse mt-1" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-primary/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-primary/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome */}
      <div style={{ animation: "fadeInUp 0.3s ease-out both" }}>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">
          Welcome back, {user?.name?.split(" ")[0] ?? "Student"}!
        </h1>
        <p className="text-xs sm:text-sm text-muted">Here&apos;s your academic overview.</p>
      </div>

      {/* Quick Actions */}
      <div
        style={{ animation: "fadeInUp 0.3s ease-out 0.05s both" }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
      >
        {QUICK_ACTIONS.map((action) => (
          <QuickActionLink key={action.href} href={action.href} icon={action.icon} label={action.label} desc={action.desc} />
        ))}
      </div>

        {/* Latest Materials */}
      {latestMaterials.length > 0 && (
        <div style={{ animation: "fadeInUp 0.3s ease-out 0.4s both" }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Latest Materials
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/courses">View All <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {latestMaterials.map((mat) => (
              <LatestMaterialCard key={mat.id} mat={mat} />
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Progress Ring card */}
        <div style={{ animation: "fadeInUp 0.3s ease-out 0.1s both" }}>
          <Card className="h-full">
            <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center text-center h-full">
              <ProgressRing percent={avgProgress} />
              <p className="text-[10px] sm:text-xs text-muted mt-2 font-medium">Overall Progress</p>
              <p className="text-[9px] sm:text-[10px] text-muted">{totalCompleted}/{totalItems} items</p>
            </CardContent>
          </Card>
        </div>
        {[
          { label: "Enrolled Courses", value: enrolledCourses.length.toString(), icon: BookOpen },
          { label: "Exams Completed", value: examCompleted.toString(), icon: ClipboardCheck },
          { label: "Avg Score", value: `${avgScore}%`, icon: Trophy },
        ].map((stat, i) => (
          <div key={stat.label} style={{ animation: `fadeInUp 0.3s ease-out ${0.1 + i * 0.05}s both` }}>
            <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
          </div>
        ))}
      </div>

      {/* Badges + Live Classes row */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Achievement Badges */}
        <div style={{ animation: "fadeInUp 0.3s ease-out 0.25s both" }}>
          <Card className="h-full">
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-2 gap-2">
                {badges.map((b) => (
                  <BadgeCard key={b.label} icon={b.icon} label={b.label} earned={b.earned} color={b.color} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Live Classes */}
        <div style={{ animation: "fadeInUp 0.3s ease-out 0.3s both" }}>
          <Card className="h-full">
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Video className="w-4 h-4 text-secondary" />
                  Live Classes
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="h-auto p-0 text-xs">
                  <Link href="/student/live-classes">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {upcomingLive.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No upcoming live classes.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingLive.map((cls) => {
                    const isSoon = new Date(cls.startTime).getTime() - Date.now() < 3600000;
                    return <LiveClassLink key={cls.id} cls={cls} isSoon={isSoon} />;
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exam Mini Chart */}
        <div style={{ animation: "fadeInUp 0.3s ease-out 0.35s both" }}>
          <Card className="h-full">
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-secondary" />
                Recent Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {examScores.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No scores yet.</p>
              ) : (
                <div>
                  <ExamMiniChart scores={examScores} />
                  <div className="flex items-center justify-between mt-2 text-[10px] text-muted">
                    <span>Last {examScores.length} exams</span>
                    <span className="font-medium text-primary">Avg: {avgScore}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Main grid: Courses + Notices */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* My Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardHeaderAction title="My Courses" icon={<GraduationCap className="w-full h-full" />} actionHref="/student/courses" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-3 sm:space-y-4">
              {enrolledCourses.length === 0 ? (
                <p className="text-sm text-muted text-center py-6">You are not enrolled in any courses yet.</p>
              ) : (
                enrolledCourses.map((course) => {
                  const progress = getCourseProgress(course.id);
                  const completed = getCompletedCount(course.id);
                  const total = getTotalCount(course.id);
                  return <CourseCard key={course.id} course={course} progress={progress} completed={completed} total={total} />;
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notices */}
        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardHeaderAction title="Notices" icon={<Bell className="w-full h-full" />} actionHref="/student/notices" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {notices.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">No notices yet.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {notices.slice(0, 4).map((notice) => (
                  <NoticeItem key={notice.id} title={notice.title} date={formatShortDate(notice.date)} category={notice.category} variant="compact" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exam Activity + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Exam Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-secondary shrink-0" />
              My Exam Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: "Started", value: examStarted },
                  { label: "Completed", value: examCompleted },
                  { label: "Rate", value: `${examRate}%` },
                  { label: "Avg Score", value: avgScore },
                ].map((s) => (
                  <div key={s.label} className="py-2.5 px-2 bg-primary/5 rounded-lg text-center">
                    <p className="text-base sm:text-lg font-bold text-primary">{s.value}</p>
                    <p className="text-[10px] text-muted truncate">{s.label}</p>
                  </div>
                ))}
              </div>
              {recentExams.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted">Recent Attempts</p>
                  <div className="space-y-2">
                    {recentExams.map((a) => {
                      const sub = examSubcategories.find((s) => s.id === a.subcategoryId);
                      const cat = examCategories.find((c) => c.id === a.categoryId);
                      return <ExamActivityItem key={a.id} a={a} sub={sub} cat={cat} />;
                    })}
                  </div>
                </div>
              )}
              {examStarted === 0 && <p className="text-sm text-muted text-center py-4">No exam activity yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
       <Card className="w-full overflow-hidden">
  <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
    <CardTitle className="flex items-center gap-2 text-sm sm:text-base min-w-0">
      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
      <span className="truncate">Recent Activity</span>
    </CardTitle>
  </CardHeader>

  <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6 overflow-hidden">
    {recentActivity.length === 0 ? (
      <p className="text-sm text-muted text-center py-4">
        No recent activity.
      </p>
    ) : (
      <div className="space-y-2 w-full min-w-0">
        {recentActivity.map((act) => (
          <div
            key={act.id}
            className="w-full min-w-0 overflow-hidden"
          >
            <RecentActivityItem act={act} />
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
      </div>

      {/* Upcoming Schedule */}
      <Card>
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            Upcoming Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: "Mathematics Mock Test", date: "Jan 20, 2026", time: "10:00 AM", type: "Exam" },
              { title: "Physical Training", date: "Jan 21, 2026", time: "12:30 PM", type: "Training" },
              { title: "Leadership Workshop", date: "Jan 22, 2026", time: "2:00 PM", type: "Workshop" },
            ].map((item, i) => (
              <ScheduleCard key={i} title={item.title} date={item.date} time={item.time} type={item.type} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const QuickActionLink = memo(function QuickActionLink({ href, icon: Icon, label, desc }: {
  href: string; icon: React.ElementType; label: string; desc: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/5 hover:border-primary/20 transition-all group">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-primary truncate">{label}</p>
        <p className="text-[10px] sm:text-xs text-muted truncate">{desc}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
});

const StatCard = memo(function StatCard({ label, value, icon: Icon }: {
  label: string; value: string; icon: React.ElementType;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
        <p className="text-[10px] sm:text-xs text-muted mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <p className="text-lg sm:text-2xl font-bold text-primary">{value}</p>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const BadgeCard = memo(function BadgeCard({ icon: Icon, label, earned, color }: {
  icon: React.ElementType; label: string; earned: boolean; color: string;
}) {
  return (
    <div className={`p-2.5 rounded-lg border text-center transition-all ${
      earned
        ? "bg-primary/5 border-primary/10"
        : "bg-accent/50 border-dashed border-primary/10 opacity-50"
    }`}>
      <Icon className={`w-4 h-4 mx-auto mb-1 ${earned ? color : "text-muted"}`} />
      <p className={`text-[9px] font-medium ${earned ? "text-primary" : "text-muted"}`}>{label}</p>
      {earned && <span className="text-[8px] text-emerald-600 font-medium">Unlocked</span>}
    </div>
  );
});

const LiveClassLink = memo(function LiveClassLink({ cls, isSoon }: {
  cls: LiveClass; isSoon: boolean;
}) {
  return (
    <Link
      key={cls.id}
      href={cls.joinUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors ${
        cls.status === "live"
          ? "bg-green-50 border-green-200"
          : isSoon
          ? "bg-amber-50 border-amber-200"
          : "bg-accent border-primary/5 hover:border-primary/20"
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        cls.status === "live" ? "bg-green-500 animate-pulse" : "bg-primary/10"
      }`}>
        <Video className={`w-4 h-4 ${cls.status === "live" ? "text-white" : "text-primary"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary truncate">{cls.title}</p>
        <p className="text-[10px] text-muted">
          {cls.status === "live" ? "Live now" : formatShortDate(cls.startTime)}
        </p>
      </div>
      <ExternalLink className="w-3 h-3 text-muted shrink-0" />
    </Link>
  );
});

const LatestMaterialCard = memo(function LatestMaterialCard({ mat }: {
  mat: { id: string; title: string; image?: string; chapterName: string; courseId: string; createdAt: string };
}) {
  return (
    <Link key={mat.id} href={`/student/courses/${mat.courseId}?itemId=${mat.id}`} className="group">
      <Card className="h-full overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="relative h-28 sm:h-32 overflow-hidden">
          <Image
            src={mat.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&q=80"}
            alt={mat.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <Badge className="absolute top-2 left-2 bg-white/90 text-primary border-0 text-[9px] shadow-sm">
            <Sparkles className="w-2.5 h-2.5 mr-1" />
            New
          </Badge>
        </div>
        <CardContent className="p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium text-muted line-clamp-1 mb-0.5">{mat.chapterName}</p>
          <p className="text-xs sm:text-sm font-semibold text-primary line-clamp-2 group-hover:text-secondary transition-colors">{mat.title}</p>
          <p className="text-[9px] sm:text-[10px] text-muted mt-1.5">{formatShortDate(mat.createdAt)}</p>
        </CardContent>
      </Card>
    </Link>
  );
});

const CourseCard = memo(function CourseCard({ course, progress, completed, total }: {
  course: { id: string; title: string; duration: string; qualification: string };
  progress: number; completed: number; total: number;
}) {
  return (
    <Link key={course.id} href={`/student/courses/${course.id}`} className="block group">
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-accent rounded-xl border border-primary/5 group-hover:border-secondary/20 transition-all">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center gap-2">
            <p className="font-medium text-primary text-xs sm:text-sm truncate">{course.title}</p>
            <Badge variant="outline" className="text-[9px] sm:text-[10px] shrink-0 sm:hidden">{progress}%</Badge>
          </div>
          <p className="text-[10px] sm:text-xs text-muted truncate">{course.duration} · {course.qualification}</p>
          <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[9px] sm:text-[10px] text-muted shrink-0">{completed}/{total}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] sm:text-[10px] shrink-0 hidden sm:block">{progress}%</Badge>
      </div>
    </Link>
  );
});

const ExamActivityItem = memo(function ExamActivityItem({ a, sub, cat }: {
  a: { id: string; completedAt?: string; score?: number; total?: number; subcategoryId?: string; categoryId?: string };
  sub?: { id: string; name: string }; cat?: { id: string; name: string };
}) {
  return (
    <Link key={a.id} href={`/student/exams/result/${a.id}`} className="block">
      <div className="flex items-center justify-between gap-2 p-2.5 bg-accent rounded-lg border border-primary/5 hover:border-secondary/20 transition-colors">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-primary truncate">{sub?.name || cat?.name || "Exam"}</p>
          <p className="text-[10px] text-muted">{a.completedAt ? formatShortDate(a.completedAt) : "N/A"}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className="text-[10px] whitespace-nowrap">{a.score}/{a.total}</Badge>
          <Play className="w-3 h-3 text-muted shrink-0" />
        </div>
      </div>
    </Link>
  );
});

const RecentActivityItem = memo(function RecentActivityItem({ act }: {
  act: { id: string; type: "material" | "exam"; title: string; date: string; href: string };
}) {
  return (
    <Link key={act.id} href={act.href} className="block">
      <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-accent transition-colors group">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          act.type === "exam" ? "bg-purple-50 text-purple-600" : "bg-primary/5 text-primary"
        }`}>
          {act.type === "exam" ? (
            <ClipboardCheck className="w-3 h-3" />
          ) : (
            <FileText className="w-3 h-3" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-primary truncate group-hover:text-secondary transition-colors">{act.title}</p>
          <p className="text-[10px] text-muted">{formatShortDate(act.date)}</p>
        </div>
        <ChevronRight className="w-3 h-3 text-muted shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
});

const ScheduleCard = memo(function ScheduleCard({ title, date, time, type }: {
  title: string; date: string; time: string; type: string;
}) {
  return (
    <div className="p-3 sm:p-4 bg-accent rounded-xl border border-primary/5 hover:border-primary/20 transition-colors">
      <Badge variant="outline" className="text-[8px] sm:text-[10px] mb-1.5 sm:mb-2 bg-primary/5">{type}</Badge>
      <p className="font-medium text-primary text-xs sm:text-sm mb-1">{title}</p>
      <p className="text-[10px] sm:text-xs text-muted">{date} · {time}</p>
    </div>
  );
});
