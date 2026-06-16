"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface Student {
  id?: string;
  name?: string;
  email?: string;
  qualification?: string;
  status?: string;
}

interface StudentTableData {
  students: Student[];
  title?: string;
}

export function StudentTableRenderer({ data }: { data: StudentTableData }) {
  const students = data.students ?? [];

  if (students.length === 0) {
    return (
      <Card className="border-primary/5">
        <CardContent className="p-6 text-center text-sm text-muted">No students found</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">{data.title ?? "Students"}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-accent/50">
                <th className="text-left font-medium text-muted px-4 py-2.5">Name</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Email</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Qualification</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Status</th>
                <th className="text-right font-medium text-muted px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <tr key={student.id ?? i} className={cn("border-b last:border-0", i % 2 === 0 && "bg-white", i % 2 !== 0 && "bg-accent/30")}>
                  <td className="px-4 py-2.5 font-medium">{student.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted">{student.email ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    {student.qualification && (
                      <Badge variant="secondary" className="text-[10px]">{student.qualification}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {student.status ? (
                      <Badge variant={student.status === "active" ? "success" : "warning"} className="text-[10px]">
                        {student.status}
                      </Badge>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/dashboard/students/${student.id}`} className="gap-1">
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    </Button>
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
