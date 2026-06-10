"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  BookOpen,
  FileText,
  Bell,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import { formatShortDate } from "@/lib/utils";

const stats = [
  { label: "Total Students", value: "250", change: "+12%", up: true, icon: Users, color: "bg-emerald-50 text-emerald-600" },
  { label: "Active Courses", value: "12", change: "+2", up: true, icon: BookOpen, color: "bg-secondary/10 text-secondary" },
  { label: "New Enrollments", value: "186", change: "+24%", up: true, icon: FileText, color: "bg-amber-50 text-amber-600" },
  { label: "Pending Notices", value: "8", change: "-3", up: false, icon: Bell, color: "bg-violet-50 text-violet-600" },
];

export default function DashboardPage() {
  const { notices, students, courses } = useAppContext();
  return (
    <div className="space-y-8">
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
        <div className="flex gap-2">
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
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
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
                <div className="flex items-center gap-1 mt-3">
                  {stat.up ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className={`text-xs font-medium ${stat.up ? "text-emerald-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/5">
                    <th className="text-left text-xs font-medium text-muted pb-3 pr-4">Student</th>
                    <th className="text-left text-xs font-medium text-muted pb-3 pr-4">Class</th>
                    <th className="text-left text-xs font-medium text-muted pb-3 pr-4">Course</th>
                    <th className="text-left text-xs font-medium text-muted pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 5).map((student) => (
                    <tr key={student.id} className="border-b border-primary/5 last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">{student.name}</p>
                            <p className="text-xs text-muted">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-muted">{student.class}</td>
                      <td className="py-3 pr-4 text-sm text-muted">
                        {courses.find((c) => c.id === student.enrolledCourses[0])?.title || "N/A"}
                      </td>
                      <td className="py-3">
                        <Badge variant={student.status === "active" ? "success" : "destructive"} className="text-[10px]">
                          {student.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notices */}
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
            <div className="space-y-4">
              {notices.slice(0, 4).map((notice) => (
                <div key={notice.id} className="pb-4 border-b border-primary/5 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-primary line-clamp-1 mb-1">{notice.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">{formatShortDate(notice.date)}</span>
                    <Badge variant="outline" className="text-[10px]">{notice.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
