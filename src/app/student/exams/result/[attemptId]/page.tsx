"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";

export default function StudentAttemptResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const { examCategories, examSubcategories, questions, attempts, dataLoading } = useAppContext();

  const attempt = attempts.find((a) => a.id === attemptId);
  const category = attempt ? examCategories.find((c) => c.id === attempt.categoryId) : null;
  const subcategory = attempt?.subcategoryId ? examSubcategories.find((s) => s.id === attempt.subcategoryId) : null;
  const categoryQuestions = attempt ? questions.filter((q) => q.categoryId === attempt.categoryId) : [];

  if (dataLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg animate-pulse" />
          <div><div className="h-8 w-48 bg-primary/10 rounded-md animate-pulse" /><div className="h-4 w-32 bg-primary/10 rounded-md animate-pulse mt-1" /></div>
        </div>
        <div className="h-64 bg-primary/5 rounded-xl animate-pulse" />
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />)}</div>
      </div>
    );
  }

  if (!attempt || !category) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-primary mb-2">Result not found</h2>
        <Button variant="outline" asChild><Link href="/student/exams">Back to Exams</Link></Button>
      </div>
    );
  }

  const { score, total, answers } = attempt;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 40;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/student/exams/${category.id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {category.name}{subcategory ? ` - ${subcategory.name}` : ""} - Result
          </h1>
          <p className="text-sm text-muted">Completed {new Date(attempt.completedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <Card className={`border-2 ${passed ? "border-emerald-200" : "border-red-200"}`}>
        <CardContent className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? "bg-emerald-50" : "bg-red-50"}`}>
            {passed ? <CheckCircle className="w-10 h-10 text-emerald-500" /> : <XCircle className="w-10 h-10 text-red-500" />}
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">{passed ? "Congratulations!" : "Keep Practicing!"}</h2>
          <p className="text-muted mb-6">{passed ? "You passed the exam." : "You need 40% to pass. Review the answers below."}</p>
          <div className="flex items-center justify-center gap-6 sm:gap-8 mb-8 flex-wrap">
            <div><p className="text-2xl sm:text-4xl font-bold text-primary">{score}</p><p className="text-sm text-muted">Correct</p></div>
            <div className="w-px h-12 bg-primary/10" />
            <div><p className="text-2xl sm:text-4xl font-bold text-muted">{total - score}</p><p className="text-sm text-muted">Incorrect</p></div>
            <div className="w-px h-12 bg-primary/10" />
            <div><p className="text-2xl sm:text-4xl font-bold text-secondary">{percentage}%</p><p className="text-sm text-muted">Score</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {categoryQuestions.map((q, i) => {
          const detail = answers.find((a) => a.questionId === q.id);
          const isCorrect = detail?.correct ?? false;
          const userAnswer = detail?.answer || "";
          const isUnanswered = !userAnswer.trim();
          if (!detail) return null;

          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`border-l-4 ${isCorrect ? "border-l-emerald-500" : "border-l-red-500"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-sm font-medium">{q.question}</CardTitle>
                        <Badge variant="outline" className={`text-[9px] ${q.type === "mcq" ? "text-blue-600" : "text-amber-600"}`}>
                          {q.type === "mcq" ? "MCQ" : "Subjective"}
                        </Badge>
                      </div>

                      {q.type === "mcq" && (
                        <div className="grid sm:grid-cols-2 gap-2 mt-2">
                          {q.options.map((opt, oi) => {
                            const optText = typeof opt === "string" ? opt : opt.text;
                            const optImage = typeof opt === "string" ? undefined : opt.image;
                            const optValue = optText || optImage || "";
                            const isSelected = userAnswer === optValue;
                            const isRight = optValue === q.answer;
                            let borderClass = "border-primary/10";
                            if (isSelected && isRight) borderClass = "border-emerald-500 bg-emerald-50";
                            else if (isSelected && !isRight) borderClass = "border-red-500 bg-red-50";
                            else if (!isSelected && isRight) borderClass = "border-emerald-500 bg-emerald-50/50";
                            return (
                              <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${borderClass}`}>
                                <span className={`w-5 h-5 rounded-full bg-white border flex items-center justify-center text-[10px] font-medium shrink-0 ${isRight ? "border-emerald-500" : "border-primary/10"}`}>
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                <span className={`break-words ${isRight ? "font-medium" : ""}`}>{optText}</span>
                                {optImage && <div className="relative w-8 h-8 rounded overflow-hidden shrink-0"><Image src={optImage} alt="" fill className="object-cover" unoptimized /></div>}
                                {isRight && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />}
                                {isSelected && !isRight && <XCircle className="w-3.5 h-3.5 text-red-500 ml-auto shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.type === "subjective" && (
                        <div className="mt-2 space-y-2">
                          <div className="p-2.5 bg-accent rounded-lg text-xs">
                            <span className="font-medium text-primary">Your answer: </span>
                            <span className={isUnanswered ? "text-red-500 italic" : "text-primary"}>
                              {isUnanswered ? "No answer provided" : userAnswer}
                            </span>
                          </div>
                          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                            <span className="font-medium text-amber-800">Model answer: </span>
                            <span className="text-amber-700">{q.answer}</span>
                          </div>
                        </div>
                      )}

                      {!isCorrect && q.explanation && (
                        <div className="mt-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100 text-xs">
                          <span className="font-medium text-blue-800">Explanation: </span>
                          <span className="text-blue-700">{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button size="lg" asChild>
          <Link href={`/student/exams/${category.id}`}>Back to Sets</Link>
        </Button>
      </div>
    </div>
  );
}
