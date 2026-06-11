"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";

export default function StudentTakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const { examCategories, questions, addAttempt } = useAppContext();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const category = examCategories.find((c) => c.id === categoryId);
  const categoryQuestions = questions.filter((q) => q.categoryId === categoryId);

  if (!category) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-primary mb-2">Exam not found</h2>
        <Button variant="outline" asChild>
          <Link href="/student/exams">Back to Exams</Link>
        </Button>
      </div>
    );
  }

  function handleSubmit() {
    let score = 0;
    const answerDetails = categoryQuestions.map((q) => {
      const userAnswer = answers[q.id] || "";
      let correct = false;
      if (q.type === "mcq") {
        correct = userAnswer === q.answer;
      }
      if (correct) score++;
      return { questionId: q.id, answer: userAnswer, correct };
    });

    addAttempt({
      categoryId,
      studentName: "Student",
      answers: answerDetails,
      score,
      total: categoryQuestions.length,
    });
    router.push(`/student/exams/${categoryId}/result`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/student/exams">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">{category.name}</h1>
          <p className="text-sm text-muted">{categoryQuestions.length} questions</p>
        </div>
      </div>

      {categoryQuestions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <HelpCircle className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-semibold text-primary mb-1">No questions available</h3>
            <p className="text-sm text-muted">This exam has no questions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Before you start</p>
                <p className="text-xs text-amber-700">Answer all questions then click Submit. Your result will be shown immediately. MCQ answers are auto-graded; subjective answers are compared with model answers.</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {categoryQuestions.map((q, i) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-sm font-medium">{q.question}</CardTitle>
                          <Badge variant="outline" className={`text-[9px] ${q.type === "mcq" ? "text-blue-600" : "text-amber-600"}`}>
                            {q.type === "mcq" ? "MCQ" : "Subjective"}
                          </Badge>
                        </div>

                        {q.type === "mcq" ? (
                          <div className="grid sm:grid-cols-2 gap-2 mt-2">
                            {q.options.map((opt, oi) => (
                              <label
                                key={oi}
                                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  answers[q.id] === opt
                                    ? "border-secondary bg-secondary/5"
                                    : "border-primary/10 hover:border-primary/20 bg-accent"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  value={opt}
                                  checked={answers[q.id] === opt}
                                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                  className="accent-secondary shrink-0"
                                />
                                <span className="break-words">{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={answers[q.id] || ""}
                            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Write your answer here..."
                            className="w-full mt-2 p-3 bg-accent rounded-lg border border-primary/10 text-sm outline-none focus:border-secondary/50 resize-none min-h-[80px]"
                          />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center pt-4 no-print">
            <Button size="lg" onClick={handleSubmit}>
              Submit Exam
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
