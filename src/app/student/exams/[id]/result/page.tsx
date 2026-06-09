"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";

export default function StudentExamResultPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const { examCategories, questions, attempts } = useAppContext();

  const category = examCategories.find((c) => c.id === categoryId);
  const categoryQuestions = questions.filter((q) => q.categoryId === categoryId);
  const latestAttempt = [...attempts]
    .filter((a) => a.categoryId === categoryId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

  if (!category || !latestAttempt) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-primary mb-2">Result not found</h2>
        <Button variant="outline" asChild>
          <Link href="/student/exams">Back to Exams</Link>
        </Button>
      </div>
    );
  }

  const { score, total, answers } = latestAttempt;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 40;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student/exams">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">{category.name} - Result</h1>
          <p className="text-sm text-muted">Completed {new Date(latestAttempt.completedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <Card className={`border-2 ${passed ? "border-emerald-200" : "border-red-200"}`}>
        <CardContent className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? "bg-emerald-50" : "bg-red-50"}`}>
            {passed ? (
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            ) : (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            {passed ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted mb-6">
            {passed ? "You passed the exam." : "You need 40% to pass. Review the answers below."}
          </p>
          <div className="flex items-center justify-center gap-8 mb-8">
            <div>
              <p className="text-4xl font-bold text-primary">{score}</p>
              <p className="text-sm text-muted">Correct</p>
            </div>
            <div className="w-px h-12 bg-primary/10" />
            <div>
              <p className="text-4xl font-bold text-muted">{total - score}</p>
              <p className="text-sm text-muted">Incorrect</p>
            </div>
            <div className="w-px h-12 bg-primary/10" />
            <div>
              <p className="text-4xl font-bold text-secondary">{percentage}%</p>
              <p className="text-sm text-muted">Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {categoryQuestions.map((q, i) => {
          const detail = answers.find((a) => a.questionId === q.id);
          const isCorrect = detail?.correct ?? false;
          const userAnswer = detail?.answer || "";
          const isUnanswered = !userAnswer.trim();

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
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {q.options.map((opt, oi) => {
                            const isSelected = userAnswer === opt;
                            const isRight = opt === q.answer;
                            let borderClass = "border-primary/10";
                            if (isSelected && isRight) borderClass = "border-emerald-500 bg-emerald-50";
                            else if (isSelected && !isRight) borderClass = "border-red-500 bg-red-50";
                            else if (!isSelected && isRight) borderClass = "border-emerald-500 bg-emerald-50/50";
                            return (
                              <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${borderClass}`}>
                                <span className={`w-5 h-5 rounded-full bg-white border flex items-center justify-center text-[10px] font-medium shrink-0 ${isRight ? "border-emerald-500" : "border-primary/10"}`}>
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                <span className={isRight ? "font-medium" : ""}>{opt}</span>
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
          <Link href="/student/exams">Back to Exam List</Link>
        </Button>
      </div>
    </div>
  );
}
