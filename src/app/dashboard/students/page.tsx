"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { students, courses } from "@/mock";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Students</h1>
          <p className="text-sm text-muted">Manage enrolled students and their details.</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted" />
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    statusFilter === s ? "bg-primary text-white" : "bg-accent text-muted hover:bg-primary/5"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/5 bg-accent/50">
                  <th className="text-left text-xs font-medium text-muted py-3 px-6">Student</th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">Class</th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">Courses</th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">Join Date</th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">Status</th>
                  <th className="text-right text-xs font-medium text-muted py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-primary/5 last:border-0 hover:bg-accent/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">{student.name}</p>
                          <p className="text-xs text-muted">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted">{student.class}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {student.enrolledCourses.slice(0, 2).map((cid) => {
                          const course = courses.find((c) => c.id === cid);
                          return (
                            <Badge key={cid} variant="outline" className="text-[10px]">
                              {course?.title || cid}
                            </Badge>
                          );
                        })}
                        {student.enrolledCourses.length > 2 && (
                          <Badge variant="outline" className="text-[10px]">+{student.enrolledCourses.length - 2}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted">{student.joinDate}</td>
                    <td className="py-4 px-4">
                      <Badge variant={student.status === "active" ? "success" : "destructive"} className="text-[10px] capitalize">
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted text-sm">No students found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
