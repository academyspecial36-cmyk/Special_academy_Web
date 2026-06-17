"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardCheck, FileQuestion, ChevronRight, CheckCircle, Clock, RotateCcw, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";

export default function StudentExamsPage() {
  const { examCategories, questions, attempts } = useAppContext();

  function getAttempts(categoryId: string) {
    return attempts.filter((a) => a.categoryId === categoryId);
  }

  function getLastAttempt(categoryId: string) {
    const sorted = [...getAttempts(categoryId)].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    return sorted[0] || null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Exam Center</h1>
        <p className="text-sm text-muted">Take exams and test your knowledge across different subjects.</p>
      </div>
      <div className="flex justify-end -mt-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/student/exams/results">
            <BarChart3 className="w-4 h-4 mr-2" />
            My Results
          </Link>
        </Button>
      </div>

      {examCategories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardCheck className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-semibold text-primary mb-1">No exams available</h3>
            <p className="text-sm text-muted">Check back later for available exams.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {examCategories.map((cat, i) => {
            const count = questions.filter((q) => q.categoryId === cat.id).length;
            const allAttempts = getAttempts(cat.id);
            const lastAttempt = getLastAttempt(cat.id);
            const mcqCount = questions.filter((q) => q.categoryId === cat.id && q.type === "mcq").length;
            const attempted = allAttempts.length > 0;
            return (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={attempted ? `/student/exams/${cat.id}/result` : `/student/exams/${cat.id}`} className="block group">
                  <Card className={`overflow-hidden hover:shadow-elevated transition-all h-full ${attempted ? "hover:border-emerald-200" : "hover:border-secondary/20"}`}>
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <FileQuestion className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {attempted && (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                              <RotateCcw className="w-3 h-3 mr-1" />
                              {allAttempts.length} attempt{allAttempts.length > 1 ? "s" : ""}
                            </Badge>
                          )}
                          {lastAttempt && (
                            <Badge variant="secondary" className="text-[10px]">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {lastAttempt.score}/{lastAttempt.total}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold text-primary mb-1 group-hover:text-secondary transition-colors inline-flex items-center gap-1">
                        {cat.name}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-xs text-muted line-clamp-2 mb-4 flex-1">{cat.description}</p>
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-primary/5">
                        <span className="text-muted flex items-center gap-1">
                          <FileQuestion className="w-3.5 h-3.5" />
                          {count} questions
                        </span>
                        <span className="text-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {mcqCount} MCQ · {count - mcqCount} Subjective
                        </span>
                      </div>
                      {attempted && (
                        <div className="mt-3">
                          <span className="text-xs font-medium text-emerald-600">View Results →</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
