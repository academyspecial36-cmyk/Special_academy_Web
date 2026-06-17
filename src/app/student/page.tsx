"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Bell,
  Calendar,
  TrendingUp,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useAppContext } from "@/lib/app-context";
import { formatShortDate } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { subcategories, completedItems, notices } = useAppContext();
  const [enrolledCourses, setEnrolledCourses] = useState<{ id: string; title: string; duration: string; qualification: string; category: string }[]>([]);

  useEffect(() => {
    fetch("/api/student-courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.courses)) setEnrolledCourses(data.courses);
      })
      .catch(() => {});
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-primary">Welcome back, {user?.name?.split(" ")[0] ?? "Mr.Onboarding"}!</h1>
        <p className="text-sm text-muted">Here&apos;s your academic overview for today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>My Courses</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/courses">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrolledCourses.map((course) => {
                const progress = getCourseProgress(course.id);
                const completed = getCompletedCount(course.id);
                const total = getTotalCount(course.id);
                return (
                  <Link key={course.id} href={`/student/courses/${course.id}`} className="block group">
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-accent rounded-xl border border-primary/5 group-hover:border-secondary/20 transition-colors">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start sm:items-center gap-2">
                          <p className="font-medium text-primary text-sm truncate">{course.title}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0 sm:hidden">{progress}%</Badge>
                        </div>
                        <p className="text-xs text-muted">{course.duration} · {course.qualification}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[10px] text-muted">{completed}/{total}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:block">{progress}%</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notices */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Notices</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/notices">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notices.slice(0, 4).map((notice) => (
                <div key={notice.id} className="pb-4 border-b border-primary/5 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-primary line-clamp-1 mb-1">{notice.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatShortDate(notice.date)}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{notice.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Mathematics Mock Test", date: "Jan 20, 2026", time: "10:00 AM", type: "Exam" },
              { title: "Physical Training", date: "Jan 21, 2026", time: "12:30 PM", type: "Training" },
              { title: "Leadership Workshop", date: "Jan 22, 2026", time: "2:00 PM", type: "Workshop" },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-accent rounded-xl border border-primary/5">
                <Badge variant="outline" className="text-[10px] mb-2">{item.type}</Badge>
                <p className="font-medium text-primary text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted">{item.date} · {item.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
