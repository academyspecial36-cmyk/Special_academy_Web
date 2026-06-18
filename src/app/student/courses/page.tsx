"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, CheckCircle2, PlayCircle, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAppContext } from "@/lib/app-context";
import { useFetch } from "@/lib/use-fetch";

export default function StudentCoursesPage() {
  const { courses, subcategories, completedItems, dataLoading } = useAppContext();
  const coursesFetch = useFetch<{ courses: { id: string; title: string; duration: string; qualification: string; category: string }[] }>("/api/student-courses");
  const enrolledCourses = coursesFetch.data?.courses ?? [];
  const coursesLoading = coursesFetch.loading;

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

  if (dataLoading || coursesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-36 bg-primary/10 rounded-md animate-pulse" />
        <div className="h-4 w-56 bg-primary/10 rounded-md animate-pulse" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      </div>
    );
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
                    {/* Course Image */}
                    <div className="relative h-40 bg-accent overflow-hidden">
                      {(() => {
                        const fullCourse = courses.find((c) => c.id === course.id);
                        return fullCourse?.image ? (
                          <Image
                            src={fullCourse.image}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-muted/40" />
                          </div>
                        );
                      })()}
                      <Badge variant="outline" className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] border-0 shadow-sm">
                        {course.category}
                      </Badge>
                    </div>
                    <div className="p-5">
                    <h3 className="font-semibold text-primary mb-1 group-hover:text-secondary transition-colors inline-flex items-center gap-1">
                      {course.title}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-xs text-muted mb-4">{course.duration} · {course.qualification}</p>

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
