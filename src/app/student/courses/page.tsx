"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, CheckCircle2, PlayCircle, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAppContext } from "@/lib/app-context";

export default function StudentCoursesPage() {
  const { subcategories, completedItems, courses } = useAppContext();
  const enrolledCourses = courses.slice(0, 3);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">My Courses</h1>
        <p className="text-sm text-muted">Track your enrolled courses and progress.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrolledCourses.map((course, i) => {
          const progress = getCourseProgress(course.id);
          const completed = getCompletedCount(course.id);
          const total = getTotalCount(course.id);
          return (
            <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/student/courses/${course.id}`} className="block group">
                <Card className="overflow-hidden hover:border-secondary/20 hover:shadow-elevated transition-all">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">{course.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-primary mb-1 group-hover:text-secondary transition-colors inline-flex items-center gap-1">
                      {course.title}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-xs text-muted mb-4">{course.duration} · {course.classLevel}</p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted">Progress</span>
                        <span className="font-medium text-primary">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted flex items-center gap-1.5">
                          <PlayCircle className="w-3.5 h-3.5" />
                          Completed
                        </span>
                        <span className="font-medium text-primary">{completed}/{total}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
