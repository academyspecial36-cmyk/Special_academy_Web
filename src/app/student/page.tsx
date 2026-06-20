"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Bell,
  Calendar,
  TrendingUp,
  Clock,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useAppContext } from "@/lib/app-context";
import { useFetch } from "@/lib/use-fetch";
import { Notice } from "@/types";
import { formatShortDate } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { subcategories, completedItems, notices: contextNotices, dataLoading } = useAppContext();
  const coursesFetch = useFetch<{ courses: { id: string; title: string; duration: string; qualification: string; category: string }[] }>("/api/student-courses");
  const noticesFetch = useFetch<Notice[]>("/api/student/notices");

  const enrolledCourses = useMemo(() => coursesFetch.data?.courses ?? [], [coursesFetch.data]);
  const realNotices = noticesFetch.data ?? null;
  const dashboardLoading = coursesFetch.loading || noticesFetch.loading;
  const notices = realNotices ?? contextNotices;

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

  const stats = [
    { label: "Enrolled Courses", value: enrolledCourses.length.toString(), icon: BookOpen, color: "bg-secondary/10 text-secondary" },
    { label: "Overall Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
    { label: "Items Completed", value: totalCompleted.toString(), icon: FileText, color: "bg-amber-50 text-amber-600" },
    { label: "Total Items", value: totalItems.toString(), icon: BookOpen, color: "bg-violet-50 text-violet-600" },
  ];

  // Latest materials: newest 4 items across all enrolled courses
  const latestMaterials = useMemo(() => {
    const enrolledIds = new Set(enrolledCourses.map((c) => c.id));
    const items: { id: string; title: string; image?: string; chapterName: string; chapterId: string; courseId: string; createdAt: string }[] = [];

    for (const sub of subcategories) {
      if (!enrolledIds.has(sub.courseId) || sub.hidden) continue;
      for (const item of sub.items) {
        if (item.hidden) continue;
        items.push({
          id: item.id,
          title: item.title,
          image: item.images?.[0],
          chapterName: sub.title,
          chapterId: sub.id,
          courseId: sub.courseId,
          createdAt: item.createdAt || sub.createdAt || new Date().toISOString(),
        });
      }
    }

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [subcategories, enrolledCourses]);

  if (dataLoading || dashboardLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <div className="h-8 w-48 bg-primary/10 rounded-md animate-pulse" />
          <div className="h-4 w-64 bg-primary/10 rounded-md animate-pulse mt-1" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
        <div>
          <div className="h-6 w-36 bg-primary/10 rounded-md animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 h-64 bg-primary/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-primary/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Welcome back, {user?.name?.split(" ")[0] ?? "Student"}!</h1>
        <p className="text-xs sm:text-sm text-muted">Here&apos;s your academic overview for today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] sm:text-sm text-muted mb-1">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-primary">{stat.value}</p>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Latest Materials */}
      {latestMaterials.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-primary">Latest Materials</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/courses">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {latestMaterials.map((mat) => (
              <Link
                key={mat.id}
                href={`/student/courses/${mat.courseId}?itemId=${mat.id}`}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-28 sm:h-32 overflow-hidden">
                    <Image
                      src={mat.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&q=80"}
                      alt={mat.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <Badge className="absolute top-2 left-2 bg-white/90 text-primary border-0 text-[9px]">
                      <Sparkles className="w-2.5 h-2.5 mr-1" />
                      New
                    </Badge>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs font-medium text-muted line-clamp-1 mb-0.5">{mat.chapterName}</p>
                    <p className="text-sm font-semibold text-primary line-clamp-2 group-hover:text-secondary transition-colors">{mat.title}</p>
                    <p className="text-[10px] text-muted mt-1.5">{formatShortDate(mat.createdAt)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* My Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base">My Courses</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/courses">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {enrolledCourses.length === 0 ? (
                <p className="text-sm text-muted text-center py-6">You are not enrolled in any courses yet.</p>
              ) : (
                enrolledCourses.map((course) => {
                  const progress = getCourseProgress(course.id);
                  const completed = getCompletedCount(course.id);
                  const total = getTotalCount(course.id);
                  return (
                    <Link key={course.id} href={`/student/courses/${course.id}`} className="block group">
                      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-accent rounded-xl border border-primary/5 group-hover:border-secondary/20 transition-colors">
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
                              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-muted shrink-0">{completed}/{total}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] shrink-0 hidden sm:block">{progress}%</Badge>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notices */}
        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base">Notices</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/notices">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {notices.length === 0 ? (
                <p className="text-sm text-muted text-center py-6">No notices yet.</p>
              ) : (
                notices.slice(0, 4).map((notice) => (
                  <div key={notice.id} className="pb-3 sm:pb-4 border-b border-primary/5 last:border-0 last:pb-0">
                    <p className="text-xs sm:text-sm font-medium text-primary line-clamp-1 mb-1">{notice.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatShortDate(notice.date)}
                      </span>
                      <Badge variant="outline" className="text-[8px] sm:text-[10px]">{notice.category}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming */}
      <Card>
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-sm sm:text-base">Upcoming Schedule</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: "Mathematics Mock Test", date: "Jan 20, 2026", time: "10:00 AM", type: "Exam" },
              { title: "Physical Training", date: "Jan 21, 2026", time: "12:30 PM", type: "Training" },
              { title: "Leadership Workshop", date: "Jan 22, 2026", time: "2:00 PM", type: "Workshop" },
            ].map((item, i) => (
              <div key={i} className="p-3 sm:p-4 bg-accent rounded-xl border border-primary/5">
                <Badge variant="outline" className="text-[8px] sm:text-[10px] mb-1.5 sm:mb-2">{item.type}</Badge>
                <p className="font-medium text-primary text-xs sm:text-sm mb-1">{item.title}</p>
                <p className="text-[10px] sm:text-xs text-muted">{item.date} · {item.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
