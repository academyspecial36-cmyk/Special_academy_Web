"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardCheck, CheckCircle, XCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";

export default function StudentResultsPage() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const { examCategories, examSubcategories, attempts, dataLoading } = useAppContext();

  const filteredAttempts = useMemo(() => {
    const sorted = [...attempts].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return categoryFilter ? sorted.filter((a) => a.categoryId === categoryFilter) : sorted;
  }, [attempts, categoryFilter]);

  const totalAttempts = filteredAttempts.length;
  const totalScore = filteredAttempts.reduce((s, a) => s + a.score, 0);
  const totalQuestions = filteredAttempts.reduce((s, a) => s + a.total, 0);
  const overallPct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  function getCategoryName(id: string) {
    return examCategories.find((c) => c.id === id)?.name ?? id;
  }

  function getSubName(id?: string) {
    if (!id) return "";
    return examSubcategories.find((s) => s.id === id)?.name ?? "";
  }

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg animate-pulse" />
          <div><div className="h-8 w-36 bg-primary/10 rounded-md animate-pulse" /><div className="h-4 w-48 bg-primary/10 rounded-md animate-pulse mt-1" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />)}
        </div>
        <div className="h-64 bg-primary/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={categoryFilter ? `/student/exams/${categoryFilter}` : "/student/exams"}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">My Results</h1>
          <p className="text-sm text-muted">View all your exam attempts and scores.</p>
        </div>
      </div>

      {filteredAttempts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardCheck className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-semibold text-primary mb-1">No attempts yet</h3>
            <p className="text-sm text-muted">Take an exam to see your results here.</p>
            <Button className="mt-4" asChild><Link href="/student/exams">Browse Exams</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{totalAttempts}</p><p className="text-xs text-muted">Total Attempts</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{totalScore}/{totalQuestions}</p><p className="text-xs text-muted">Correct Answers</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-secondary">{overallPct}%</p><p className="text-xs text-muted">Overall Score</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{filteredAttempts.filter((a) => (a.score / a.total) * 100 >= 40).length}</p><p className="text-xs text-muted">Passed</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Attempt History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/5 bg-accent/50">
                      <th className="text-left text-xs font-medium text-muted py-3 px-6">Exam</th>
                      <th className="text-left text-xs font-medium text-muted py-3 px-4 hidden sm:table-cell">Set</th>
                      <th className="text-left text-xs font-medium text-muted py-3 px-4">Score</th>
                      <th className="text-left text-xs font-medium text-muted py-3 px-4">%</th>
                      <th className="text-left text-xs font-medium text-muted py-3 px-4">Status</th>
                      <th className="text-left text-xs font-medium text-muted py-3 px-4 hidden sm:table-cell">Date</th>
                      <th className="text-right text-xs font-medium text-muted py-3 px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttempts.map((attempt, i) => {
                      const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
                      const passed = pct >= 40;
                      return (
                        <motion.tr key={attempt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          className="border-b border-primary/5 last:border-0 hover:bg-accent/30 transition-colors">
                          <td className="py-4 px-6"><p className="text-sm font-medium text-primary">{getCategoryName(attempt.categoryId)}</p></td>
                          <td className="py-4 px-4 hidden sm:table-cell"><span className="text-sm text-muted">{getSubName(attempt.subcategoryId)}</span></td>
                          <td className="py-4 px-4"><span className="text-sm font-semibold text-primary">{attempt.score}/{attempt.total}</span></td>
                          <td className="py-4 px-4"><span className={`text-sm font-semibold ${passed ? "text-emerald-600" : "text-red-500"}`}>{pct}%</span></td>
                          <td className="py-4 px-4">
                            <Badge variant={passed ? "success" : "destructive"} className="text-[10px]">{passed ? "Pass" : "Fail"}</Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted hidden sm:table-cell">{new Date(attempt.completedAt).toLocaleDateString()}</td>
                          <td className="py-4 px-6 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/student/exams/result/${attempt.id}`}>View <ChevronRight className="w-3 h-3 ml-1" /></Link>
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
