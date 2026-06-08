"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, Users, CheckCircle2, PlayCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { courses } from "@/mock";

const enrolledCourses = courses.slice(0, 3).map((c, i) => ({ ...c, progress: [75, 45, 30][i] }));

export default function StudentCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">My Courses</h1>
        <p className="text-sm text-muted">Track your enrolled courses and progress.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrolledCourses.map((course, i) => (
          <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">{course.category}</Badge>
                </div>
                <h3 className="font-semibold text-primary mb-1">{course.title}</h3>
                <p className="text-xs text-muted mb-4">{course.duration} · {course.classLevel}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted">Progress</span>
                    <span className="font-medium text-primary">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Lectures", icon: PlayCircle, count: "24/32" },
                    { label: "Assignments", icon: FileText, count: "8/12" },
                    { label: "Tests", icon: CheckCircle2, count: "4/6" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted flex items-center gap-1.5">
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </span>
                      <span className="font-medium text-primary">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
