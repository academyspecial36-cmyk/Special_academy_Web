"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Circle,
  Send,
  ChevronUp,
  AlertCircle,
  Check,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

// ─── Main Component ────────────────────────────────────────────────

export default function StudentTakeSubcategoryExamPage() {
  const params = useParams();
  const router = useRouter();
  const subId = params.subId as string;
  const { user } = useAuth();
  const {
    examCategories,
    examSubcategories,
    questions,
    attempts,
    addAttempt,
    dataLoading,
  } = useAppContext();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // ─── Derived Data ────────────────────────────────────────────────

  const subcategory = useMemo(
    () => examSubcategories.find((s) => s.id === subId),
    [examSubcategories, subId]
  );

  const category = useMemo(
    () =>
      subcategory
        ? examCategories.find((c) => c.id === subcategory.categoryId)
        : null,
    [examCategories, subcategory]
  );

  const subQuestions = useMemo(
    () => questions.filter((q) => q.subcategoryId === subId),
    [questions, subId]
  );

  const alreadyAttempted = useMemo(
    () => attempts.some((a) => a.subcategoryId === subId),
    [attempts, subId]
  );

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.trim().length > 0).length,
    [answers]
  );

  const progressPercent = useMemo(
    () =>
      subQuestions.length > 0
        ? Math.round((answeredCount / subQuestions.length) * 100)
        : 0,
    [answeredCount, subQuestions.length]
  );

  const unansweredQuestions = useMemo(
    () => subQuestions.filter((q) => !answers[q.id] || answers[q.id].trim() === ""),
    [subQuestions, answers]
  );

  // ─── Effects ─────────────────────────────────────────────────────

  useEffect(() => {
    if (alreadyAttempted) {
      const lastAttempt = [...attempts]
        .filter((a) => a.subcategoryId === subId)
        .sort(
          (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime()
        )[0];
      if (lastAttempt) router.replace(`/student/exams/result/${lastAttempt.id}`);
    }
  }, [alreadyAttempted, subId, router, attempts]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (subQuestions.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-question-id");
            if (id) setActiveQuestionId(id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    subQuestions.forEach((q) => {
      const el = document.getElementById(`question-${q.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [subQuestions]);

  // ─── Handlers ────────────────────────────────────────────────────

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  const scrollToQuestion = useCallback((questionId: string) => {
    const el = document.getElementById(`question-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmitClick = useCallback(() => {
    if (unansweredQuestions.length > 0) {
      setShowValidationModal(true);
    } else {
      setShowConfirmModal(true);
    }
  }, [unansweredQuestions.length]);

  const handleForceSubmit = useCallback(() => {
    setShowValidationModal(false);
    setShowConfirmModal(true);
  }, []);

  const handleConfirmSubmit = useCallback(async () => {
    if (!category) return;

    setIsSubmitting(true);
    setShowConfirmModal(false);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const total = subQuestions.length;
    let score = 0;
    const answerDetails = subQuestions.map((q) => {
      const userAnswer = answers[q.id] || "";
      let correct = false;
      if (q.type === "mcq") correct = userAnswer === q.answer;
      if (correct) score++;
      return { questionId: q.id, answer: userAnswer, correct };
    });

    const attempt = {
      categoryId: category.id,
      subcategoryId: subId,
      studentId: user?.id,
      studentName: user?.name || user?.email?.split("@")[0] || "Student",
      answers: answerDetails,
      score,
      total,
    };

    const attemptId = addAttempt(attempt);
    toast.success("Exam submitted successfully!", {
      description: `You scored ${score} out of ${total}`,
    });
    router.push(`/student/exams/result/${attemptId}`);
  }, [category, subQuestions, answers, user, subId, addAttempt, router]);

  // ─── Loading State ───────────────────────────────────────────────

  if (dataLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-56 bg-primary/10 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-primary/10 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="h-16 bg-primary/5 rounded-xl animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 bg-primary/5 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error States ────────────────────────────────────────────────

  if (!subcategory || !category) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8 text-muted" />
          </div>
          <h2 className="text-xl font-bold text-primary">
            Exam set not found
          </h2>
          <p className="text-sm text-muted">
            The exam you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/student/exams">Back to Exams</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (alreadyAttempted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-4">
        <div className="h-8 w-48 bg-primary/10 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-primary/10 rounded-md animate-pulse" />
        <div className="h-64 bg-primary/5 rounded-xl animate-pulse" />
        <p className="text-center text-sm text-muted">
          Loading your results...
        </p>
      </div>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
      {/* ─── Header ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="shrink-0 rounded-lg hover:bg-primary/5"
        >
          <Link href={`/student/exams/${category.id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">
            {category.name} — {subcategory.name}
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {subQuestions.length} question{subQuestions.length !== 1 ? "s" : ""} 
            {" "}• {answeredCount} answered
          </p>
        </div>
      </motion.div>

      {/* ─── Empty State ───────────────────────────────────────── */}
      {subQuestions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8 text-muted" />
            </div>
            <h3 className="font-semibold text-primary">
              No questions available
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              This exam set doesn&apos;t have any questions yet. Check back later or
              contact your instructor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ─── Progress Bar ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="sticky top-0 z-30 bg-white border rounded-xl p-4 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <CheckCircle className="w-4 h-4 text-muted" />
                <span>Progress</span>
              </div>
              <span className="text-sm font-semibold text-primary tabular-nums">
                {answeredCount}/{subQuestions.length}
              </span>
            </div>
            <div className="w-full h-2.5 bg-primary/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
              {subQuestions.map((q, i) => {
                const isAnswered = !!answers[q.id]?.trim();
                const isActive = activeQuestionId === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => scrollToQuestion(q.id)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold shrink-0 transition-all duration-200 flex items-center justify-center border-2 ${
                      isAnswered
                        ? "bg-primary text-white border-primary"
                        : "bg-primary/10 text-primary border-transparent"
                    } ${
                      isActive && !isAnswered ? "border-primary/50 bg-primary/10 text-primary" : ""
                    }`}
                    title={`Question ${i + 1}${isAnswered ? " — Answered" : ""}`}
                  >
                    {isAnswered ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      i + 1
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ─── Info Alert ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-amber-50 border-amber-200 mb-6">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-800">
                    Before you start
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Answer all questions then click Submit. Your result will be
                    shown immediately. MCQ answers are auto-graded; subjective
                    answers are compared with model answers. You can navigate
                    using the numbered buttons above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Questions ─────────────────────────────────────── */}
          <div className="space-y-4">
            {subQuestions.map((q, i) => (
              <motion.div
                id={`question-${q.id}`}
                data-question-id={q.id}
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card
                  className={`overflow-hidden transition-all duration-300 border-2 ${
                    activeQuestionId === q.id
                      ? "border-primary/30 shadow-md"
                      : "border-transparent hover:border-primary/10"
                  }`}
                >
                  <CardHeader className="pb-3 pt-5 px-5 sm:px-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 transition-colors ${
                          answers[q.id]?.trim()
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {answers[q.id]?.trim() ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CardTitle className="text-sm sm:text-base font-semibold text-primary leading-relaxed">
                            {q.question}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-semibold uppercase tracking-wider shrink-0 ${
                              q.type === "mcq"
                                ? "text-blue-600 border-blue-600"
                                : "text-amber-600 border-amber-600"
                            }`}
                          >
                            {q.type === "mcq" ? "MCQ" : "Subjective"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 sm:px-6 pb-6 pt-0">
                    {q.type === "mcq" && q.options ? (
                      <div className="grid sm:grid-cols-2 gap-2.5 ml-11 sm:ml-12">
                        {q.options.map((opt, oi) => (
                          <label
                            key={oi}
                            className={`group relative flex items-center gap-3 p-2.5 rounded-lg border-2 text-sm cursor-pointer transition-all duration-200 ${
                              answers[q.id] === opt
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-primary/10 hover:border-primary/20 bg-accent"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                answers[q.id] === opt
                                  ? "border-primary bg-primary"
                                  : "border-primary/30 group-hover:border-primary/50"
                              }`}
                            >
                              {answers[q.id] === opt && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                  }}
                                >
                                  <Circle className="w-2.5 h-2.5 text-white fill-white" />
                                </motion.div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={() => handleAnswerChange(q.id, opt)}
                              className="sr-only"
                            />
                            <span className="break-words text-primary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="ml-11 sm:ml-12">
                        <textarea
                          value={answers[q.id] || ""}
                          onChange={(e) =>
                            handleAnswerChange(q.id, e.target.value)
                          }
                          placeholder="Write your answer here..."
                          rows={4}
                          className="w-full p-3 rounded-lg border-2 border-primary/10 bg-accent text-sm text-primary outline-none transition-all duration-200 resize-y min-h-[80px] focus:border-primary/30"
                        />
                        <div className="flex justify-end mt-1.5">
                          <span
                            className={`text-xs tabular-nums ${
                              (answers[q.id]?.length || 0) > 500
                                ? "text-amber-600"
                                : "text-muted"
                            }`}
                          >
                            {answers[q.id]?.length || 0} chars
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ─── Sticky Submit Bar ───────────────────────────── */}
          <AnimatePresence>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="fixed bottom-12 lg:bottom-0 left-0 right-0 z-40 bg-white border-t p-4 sm:px-6"
            >
              <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary">
                      {answeredCount}/{subQuestions.length} answered
                    </span>
                  </div>
                  {unansweredQuestions.length > 0 && (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {unansweredQuestions.length} unanswered
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  size="lg"
                  onClick={handleSubmitClick}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[160px] gap-2 rounded-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Exam
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ─── Scroll to Top Button ──────────────────────────── */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToTop}
                className="fixed bottom-24 right-4 sm:right-8 z-50 w-10 h-10 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ─── Validation Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showValidationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowValidationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl border shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-lg text-primary">Unanswered Questions</h3>
                </div>
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-primary" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-muted">
                  You have <strong className="text-amber-600">{unansweredQuestions.length} unanswered question{unansweredQuestions.length !== 1 ? "s" : ""}</strong>. 
                  Review them before submitting, or proceed anyway.
                </p>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {unansweredQuestions.map((q) => {
                    const idx = subQuestions.findIndex((sq) => sq.id === q.id) + 1;
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setShowValidationModal(false);
                          scrollToQuestion(q.id);
                        }}
                        className="w-full text-left p-3 rounded-lg text-sm hover:bg-accent transition-colors flex items-center gap-3 group"
                      >
                        <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx}
                        </span>
                        <span className="truncate flex-1 text-primary">{q.question}</span>
                        <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-5 border-t bg-primary/5 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowValidationModal(false)}
                  className="w-full sm:w-auto"
                >
                  Go Back & Answer
                </Button>
                <Button
                  onClick={handleForceSubmit}
                  className="w-full sm:w-auto"
                >
                  Submit Anyway
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Confirm Submit Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl border shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg text-primary">Confirm Submission</h3>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-primary" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-muted">
                  You are about to submit your exam. This action <strong className="text-primary">cannot be undone</strong>.
                </p>
                <div className="bg-primary/5 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Total Questions</span>
                    <span className="font-semibold text-primary">{subQuestions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Answered</span>
                    <span className="font-semibold text-primary">{answeredCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Unanswered</span>
                    <span
                      className={`font-semibold ${
                        unansweredQuestions.length > 0
                          ? "text-amber-600"
                          : "text-muted"
                      }`}
                    >
                      {unansweredQuestions.length}
                    </span>
                  </div>
                  <div className="h-px bg-primary/10" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Progress</span>
                    <span className="font-semibold text-primary">{progressPercent}%</span>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t bg-primary/5 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Yes, Submit Exam
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}