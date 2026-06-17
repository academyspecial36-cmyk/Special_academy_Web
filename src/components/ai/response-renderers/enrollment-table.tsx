"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Enrollment {
  id?: string;
  name?: string;
  fullName?: string;
  course?: string;
  interestedCourse?: string;
  qualification?: string;
  currentClass?: string;
  status?: string;
  date?: string;
  createdAt?: string;
}

interface EnrollmentTableData {
  enrollments: Enrollment[];
  title?: string;
}

export function EnrollmentTableRenderer({ data }: { data: EnrollmentTableData }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const enrollments = data.enrollments ?? [];

  async function handleAction(enrollmentId: string, action: "approved" | "rejected") {
    setLoadingId(enrollmentId);
    try {
      const res = await fetch(`/api/data/enrollments/${enrollmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `Failed to ${action} enrollment`);
      }
      toast.success(`Enrollment ${action} successfully`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} enrollment`);
    } finally {
      setLoadingId(null);
    }
  }

  if (enrollments.length === 0) {
    return (
      <Card className="border-primary/5">
        <CardContent className="p-6 text-center text-sm text-muted">No enrollments found</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/5">
      <CardHeader>
        <CardTitle className="text-base">{data.title ?? "Enrollments"}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-accent/50">
                <th className="text-left font-medium text-muted px-4 py-2.5">Name</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Course</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Qualification</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Status</th>
                <th className="text-left font-medium text-muted px-4 py-2.5">Date</th>
                <th className="text-right font-medium text-muted px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr, i) => {
                const name = enr.fullName ?? enr.name ?? "—";
                const course = enr.interestedCourse ?? enr.course ?? "—";
                const qual = enr.currentClass ?? enr.qualification ?? "—";
                const date = enr.createdAt ?? enr.date ?? "—";
                const id = enr.id ?? "";
                const isPending = enr.status === "pending" || !enr.status;
                return (
                  <tr key={id || i} className={cn("border-b last:border-0", i % 2 === 0 && "bg-white", i % 2 !== 0 && "bg-accent/30")}>
                    <td className="px-4 py-2.5 font-medium">{name}</td>
                    <td className="px-4 py-2.5 text-muted">{course}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary" className="text-[10px]">{qual}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={enr.status === "approved" ? "success" : enr.status === "rejected" ? "destructive" : "warning"} className="text-[10px]">
                        {enr.status ?? "pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted">{date}</td>
                    <td className="px-4 py-2.5 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleAction(id, "approved")}
                            disabled={loadingId === id}
                          >
                            {loadingId === id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleAction(id, "rejected")}
                            disabled={loadingId === id}
                          >
                            {loadingId === id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
