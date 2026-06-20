"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExamResult {
  studentName?: string;
  email?: string;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  status?: string;
}

interface ExamResultsTableData {
  title?: string;
  examTitle?: string;
  results: ExamResult[];
}

export function ExamResultsTableRenderer({ data }: { data: ExamResultsTableData }) {
  const results = data.results ?? [];

  if (results.length === 0) {
    return (
      <Card className="border-primary/5">
        <CardContent className="p-6 text-center text-sm text-muted">No results found</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">{data.title ?? "Exam Results"}</CardTitle>
        {data.examTitle && (
          <p className="text-xs text-muted">{data.examTitle}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-accent/50">
                <th className="text-left font-medium text-muted px-4 py-2.5">Student</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Score</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Percentage</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={cn("border-b last:border-0", i % 2 === 0 && "bg-white", i % 2 !== 0 && "bg-accent/30")}>
                  <td className="px-4 py-2.5 font-medium">{r.studentName ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    {r.score !== undefined ? `${r.score}/${r.totalMarks ?? "?"}` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.percentage !== undefined ? (
                      <span className={cn("font-medium", r.percentage >= 40 ? "text-emerald-600" : "text-red-600")}>
                        {r.percentage.toFixed(1)}%
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.status ? (
                      <Badge variant={r.status === "passed" ? "success" : "destructive"} className="text-[10px]">
                        {r.status}
                      </Badge>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
