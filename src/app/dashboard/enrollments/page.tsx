"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle, X, Mail, School } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import type { Enrollment } from "@/lib/context/students-context";
import { toast } from "sonner";

export default function EnrollmentsPage() {
  const { enrollments, updateEnrollment } = useAppContext();
  const [selected, setSelected] = useState<Enrollment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleAction(id: string, status: "approved" | "rejected" | "pending") {
    setActionLoading(id);
    try {
      updateEnrollment(id, { status });
      toast.success(`Enrollment ${status}`);
    } catch {
      toast.error("Failed to update enrollment");
    } finally {
      setActionLoading(null);
    }
  }

  const pending = enrollments.filter((e) => e.status === "pending");
  const approved = enrollments.filter((e) => e.status === "approved");
  const rejected = enrollments.filter((e) => e.status === "rejected");

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl font-bold text-primary">Enrollments</h1>
        <p className="text-sm text-muted">Manage student enrollment requests.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 lg:mb-6">
        <Card className="border-amber-200">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted">Pending</p>
              <p className="text-xl font-bold text-primary">{pending.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted">Approved</p>
              <p className="text-xl font-bold text-primary">{approved.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted">Rejected</p>
              <p className="text-xl font-bold text-primary">{rejected.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-4">
          <CardTitle className="text-base sm:text-lg">All Enrollment Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {enrollments.length === 0 ? (
            <p className="text-center text-muted py-10 text-sm">No enrollments yet.</p>
          ) : (
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border border-primary/5 hover:border-primary/10 transition-colors bg-white"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary text-sm truncate">{enrollment.fullName}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{enrollment.email}</span>
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="flex items-center gap-1">
                        <School className="w-3 h-3 shrink-0" />
                        <span className="truncate">{enrollment.interestedCourse}</span>
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="shrink-0">{new Date(enrollment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end w-full sm:w-auto">
                    <Badge className={
                      enrollment.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border-0 text-[10px]"
                        : enrollment.status === "rejected"
                        ? "bg-red-50 text-red-700 border-0 text-[10px]"
                        : "bg-amber-50 text-amber-700 border-0 text-[10px]"
                    }>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </Badge>
                    <button
                      onClick={() => setSelected(enrollment)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors text-xs sm:text-sm"
                    >
                      View
                    </button>
                    <div className="flex gap-1">
                      {enrollment.status !== "approved" && (
                        <button
                          onClick={() => handleAction(enrollment.id, "approved")}
                          disabled={actionLoading === enrollment.id}
                          className="p-1.5 rounded-md hover:bg-emerald-50 text-muted hover:text-emerald-600 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {enrollment.status !== "rejected" && (
                        <button
                          onClick={() => handleAction(enrollment.id, "rejected")}
                          disabled={actionLoading === enrollment.id}
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-xl shadow-lg p-5 sm:p-6 w-full max-w-sm sm:max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">Enrollment Details</h3>
            <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm break-words">
              <div>
                <p className="text-muted text-[10px] sm:text-xs">Full Name</p>
                <p className="font-medium text-primary">{selected.fullName}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] sm:text-xs">Email</p>
                <p className="font-medium text-primary">{selected.email}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] sm:text-xs">Interested Course</p>
                <p className="font-medium text-primary">{selected.interestedCourse}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] sm:text-xs">Status</p>
                <Badge className={
                  selected.status === "approved"
                    ? "bg-emerald-50 text-emerald-700 border-0"
                    : selected.status === "rejected"
                    ? "bg-red-50 text-red-700 border-0"
                    : "bg-amber-50 text-amber-700 border-0"
                }>
                  {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-muted text-[10px] sm:text-xs">Date</p>
                <p className="font-medium text-primary">
                  {new Date(selected.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              {selected.rejectionMessage && (
                <div>
                  <p className="text-muted text-[10px] sm:text-xs">Rejection Reason</p>
                  <p className="font-medium text-red-600">{selected.rejectionMessage}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4 sm:mt-5">
              <Button size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
