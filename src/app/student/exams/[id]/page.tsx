"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileQuestion,
  ChevronRight,
  Layers,
  Clock,
  BarChart3,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";

export default function StudentExamCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const {
    examCategories,
    examSubcategories,
    questions,
    attempts,
    dataLoading,
  } = useAppContext();

  const category = examCategories.find((c) => c.id === categoryId);

  const subcategories = examSubcategories.filter(
    (s) => s.categoryId === categoryId
  );

  function getAttempts(subId: string) {
    return attempts.filter((a) => a.subcategoryId === subId);
  }

  function getLastAttempt(subId: string) {
    const sorted = [...getAttempts(subId)].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() -
        new Date(a.completedAt).getTime()
    );

    return sorted[0] || null;
  }

  if (dataLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 animate-pulse shrink-0" />

          <div className="flex-1">
            <div className="h-7 w-48 bg-primary/10 rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-primary/10 rounded-md animate-pulse mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-xl bg-primary/5 animate-pulse"
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-primary mb-2">
          Exam not found
        </h2>
        <Button variant="outline" asChild>
          <Link href="/student/exams">Back to Exams</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0"
          >
            <Link href="/student/exams">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-primary break-words">
              {category.name}
            </h1>

            <p className="text-sm text-muted mt-1 break-words max-w-3xl">
              {category.description}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full sm:w-auto shrink-0"
        >
          <Link href={`/student/exams/results?category=${categoryId}`}>
            <BarChart3 className="w-4 h-4 mr-2" />
            My Results
          </Link>
        </Button>
      </div>

      {/* Empty State */}
      {subcategories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="w-12 h-12 text-muted mx-auto mb-3" />

            <h3 className="font-semibold text-primary mb-1">
              No sets available
            </h3>

            <p className="text-sm text-muted">
              No exam sets are available for this category yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {subcategories.map((sub, index) => {
            const totalQuestions = questions.filter(
              (q) => q.subcategoryId === sub.id
            ).length;

            const mcqCount = questions.filter(
              (q) =>
                q.subcategoryId === sub.id &&
                q.type === "mcq"
            ).length;

            const subjectiveCount = totalQuestions - mcqCount;

            const attempt = getLastAttempt(sub.id);
            const attempted = Boolean(attempt);

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={
                    attempted
                      ? `/student/exams/result/${attempt!.id}`
                      : `/student/exams/take/${sub.id}`
                  }
                  className="block h-full group"
                >
                  <Card
                    className={`h-full overflow-hidden transition-all hover:shadow-elevated ${
                      attempted
                        ? "hover:border-emerald-200"
                        : "hover:border-secondary/20"
                    }`}
                  >
                    <div className="p-4 sm:p-5 lg:p-6 flex flex-col h-full">
                      {/* Top */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${sub.color}`}
                        >
                          <FileQuestion className="w-6 h-6" />
                        </div>

                        {attempted && (
                          <div className="flex flex-wrap gap-1.5">
                            <Badge
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {attempt!.score}/{attempt!.total}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-primary mb-1 break-words group-hover:text-secondary transition-colors inline-flex items-center gap-1">
                        {sub.name}

                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted line-clamp-3 mb-4 flex-1">
                        {sub.description}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs pt-3 border-t border-primary/5">
                        <span className="text-muted flex items-center gap-1 flex-wrap">
                          <FileQuestion className="w-3.5 h-3.5 shrink-0" />
                          {totalQuestions} questions
                        </span>

                        <span className="text-muted flex items-center gap-1 flex-wrap">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {mcqCount} MCQ · {subjectiveCount} Subjective
                        </span>
                      </div>

                      {/* CTA */}
                      <div className="mt-3">
                        {attempted ? (
                          <span className="text-xs font-medium text-emerald-600">
                            View Results →
                          </span>
                        ) : totalQuestions > 0 ? (
                          <span className="text-xs font-medium text-secondary">
                            Take Exam →
                          </span>
                        ) : (
                          <span className="text-xs text-muted">
                            No questions yet
                          </span>
                        )}
                      </div>
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