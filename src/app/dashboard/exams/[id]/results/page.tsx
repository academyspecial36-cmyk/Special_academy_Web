"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, BarChart3, CheckCircle, XCircle, Facebook, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import { toast } from "sonner";

export default function AdminExamResultsPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const { examCategories, questions, attempts, loadAdminData } = useAppContext();

  useEffect(() => { loadAdminData(); }, [loadAdminData]);

  const category = examCategories.find((c) => c.id === categoryId);
  const categoryQuestions = questions.filter((q) => q.categoryId === categoryId);
  const categoryAttempts = attempts
    .filter((a) => a.categoryId === categoryId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (!category) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-primary mb-2">Category not found</h2>
        <Button variant="outline" asChild>
          <Link href="/dashboard/exams">Back to Exams</Link>
        </Button>
      </div>
    );
  }

  function generateCSV() {
    const headers = ["Student Name", "Score", "Total", "Percentage", "Pass/Fail", "Date"];
    const rows = categoryAttempts.map((a) => {
      const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
      return [a.studentName, a.score.toString(), a.total.toString(), `${pct}%`, pct >= 40 ? "Pass" : "Fail", new Date(a.completedAt).toLocaleDateString()];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${category!.name}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  }

  function shareToFacebook() {
    const text = `Check out the exam results for ${category!.name} at SPECIAL ACADEMY!`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=600,height=400");
  }

  function shareToWhatsApp() {
    const totalAttempts = categoryAttempts.length;
    const avgScore = totalAttempts > 0
      ? Math.round(categoryAttempts.reduce((s, a) => s + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0) / totalAttempts)
      : 0;
    const passed = categoryAttempts.filter((a) => a.total > 0 && (a.score / a.total) * 100 >= 40).length;

    const summary = categoryAttempts
      .map((a) => {
        const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
        return `  ${a.studentName}: ${a.score}/${a.total} (${pct}%) ${pct >= 40 ? "✅" : "❌"}`;
      })
      .join("\n");

    const text = [
      `📊 *${category!.name} - Exam Results*`,
      `🏫 SPECIAL ACADEMY`,
      ``,
      `📝 Total Students: ${totalAttempts}`,
      `📈 Average Score: ${avgScore}%`,
      `✅ Passed: ${passed}/${totalAttempts}`,
      ``,
      `*Individual Results:*`,
      summary,
      ``,
      `View details: ${window.location.href}`,
    ].join("\n");

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/exams/${categoryId}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-primary">{category.name} - Results</h1>
            <p className="text-xs sm:text-sm text-muted">{categoryAttempts.length} attempts · {categoryQuestions.length} questions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={generateCSV}>
            <Download className="w-3.5 h-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={shareToFacebook}>
            <Facebook className="w-3.5 h-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Facebook</span>
          </Button>
          <Button variant="outline" size="sm" onClick={shareToWhatsApp}>
            <MessageCircle className="w-3.5 h-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        </div>
      </div>

      {categoryAttempts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-semibold text-primary mb-1">No results yet</h3>
            <p className="text-sm text-muted">Students haven&apos;t taken this exam yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-muted mb-1">Total Attempts</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">{categoryAttempts.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-muted mb-1">Average Score</p>
                <p className="text-xl sm:text-2xl font-bold text-secondary">
                  {categoryAttempts.length > 0
                    ? `${Math.round(categoryAttempts.reduce((s, a) => s + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0) / categoryAttempts.length)}%`
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-muted mb-1">Passed</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {categoryAttempts.filter((a) => a.total > 0 && (a.score / a.total) * 100 >= 40).length}
                  <span className="text-xs sm:text-sm text-muted font-normal"> / {categoryAttempts.length}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4">
              <CardTitle className="text-base sm:text-lg">Student Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-primary/5">
                      <th className="text-left p-2 sm:p-4 font-medium text-muted">#</th>
                      <th className="text-left p-2 sm:p-4 font-medium text-muted">Student</th>
                      <th className="text-center p-2 sm:p-4 font-medium text-muted hidden sm:table-cell">Score</th>
                      <th className="text-center p-2 sm:p-4 font-medium text-muted hidden sm:table-cell">Total</th>
                      <th className="text-center p-2 sm:p-4 font-medium text-muted">%</th>
                      <th className="text-center p-2 sm:p-4 font-medium text-muted hidden sm:table-cell">Status</th>
                      <th className="text-right p-2 sm:p-4 font-medium text-muted hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryAttempts.map((attempt, i) => {
                      const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
                      const passed = pct >= 40;
                      return (
                        <tr key={attempt.id} className="border-b border-primary/5 hover:bg-accent/50 transition-colors">
                          <td className="p-2 sm:p-4 text-muted text-center sm:text-left">{i + 1}</td>
                          <td className="p-2 sm:p-4 font-medium text-primary">
                            <div className="flex items-center gap-2">
                              <span className={passed ? "text-emerald-600 sm:hidden" : "text-red-500 sm:hidden"}>
                                {passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              </span>
                              <span className="truncate max-w-[120px] sm:max-w-none">{attempt.studentName}</span>
                            </div>
                            <div className="sm:hidden text-[10px] text-muted mt-0.5">
                              {attempt.score}/{attempt.total} · {new Date(attempt.completedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-2 sm:p-4 text-center font-semibold text-primary hidden sm:table-cell">{attempt.score}</td>
                          <td className="p-2 sm:p-4 text-center text-muted hidden sm:table-cell">{attempt.total}</td>
                          <td className="p-2 sm:p-4 text-center">
                            <span className={`font-semibold text-xs sm:text-sm ${passed ? "text-emerald-600" : "text-red-500"}`}>
                              {pct}%
                            </span>
                          </td>
                          <td className="p-2 sm:p-4 text-center hidden sm:table-cell">
                            {passed ? (
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 text-[10px]">
                                <CheckCircle className="w-3 h-3 mr-1" /> Pass
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-0 text-[10px]">
                                <XCircle className="w-3 h-3 mr-1" /> Fail
                              </Badge>
                            )}
                          </td>
                          <td className="p-2 sm:p-4 text-right text-muted text-[10px] hidden sm:table-cell">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Per-Attempt Detail */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4">
              <CardTitle className="text-base sm:text-lg">Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2">
                {categoryAttempts.map((attempt, i) => {
                  const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
                  const passed = pct >= 40;
                  return (
                    <details key={attempt.id} className="group">
                      <summary className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-accent rounded-lg cursor-pointer hover:bg-primary/5 transition-colors list-none">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/5 flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium text-primary text-xs sm:text-sm flex-1 truncate">{attempt.studentName}</span>
                        <span className="text-xs sm:text-sm font-semibold">{attempt.score}/{attempt.total}</span>
                        <span className={`text-xs sm:text-sm font-semibold hidden sm:inline ${passed ? "text-emerald-600" : "text-red-500"}`}>{pct}%</span>
                        {passed ? (
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                        )}
                      </summary>
                      <div className="mt-2 space-y-1.5 sm:space-y-2 pl-2 sm:pl-4">
                        {(attempt.answers || []).map((ans, ai) => {
                          const question = categoryQuestions.find((q) => q.id === ans.questionId);
                          if (!question) return null;
                          return (
                            <div key={ai} className={`p-2 sm:p-3 rounded-lg border text-[10px] sm:text-xs ${
                              ans.correct ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                            }`}>
                              <div className="flex items-start gap-1.5 sm:gap-2 mb-1">
                                <span className="font-medium text-primary shrink-0">Q{ai + 1}:</span>
                                <span className="text-primary break-words">{question.question}</span>
                                {ans.correct ? (
                                  <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-500 ml-auto shrink-0 mt-0.5" />
                                )}
                              </div>
                              {question.type === "mcq" ? (
                                <div className="text-muted mt-1">
                                  Student: <span className={ans.correct ? "text-emerald-700 font-medium" : "text-red-700 font-medium"}>{ans.answer || "No answer"}</span>
                                  {!ans.correct && (
                                    <> · Correct: <span className="text-emerald-700 font-medium">{question.answer}</span></>
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted mt-1 space-y-0.5">
                                  <div>Student: <span className="text-primary">{ans.answer || "No answer"}</span></div>
                                  <div>Model: <span className="text-amber-700">{question.answer}</span></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
