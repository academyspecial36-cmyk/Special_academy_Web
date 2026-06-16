"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/app-context";

interface Enrollment {
  id: string;
  fullName: string;
  email: string;
  interestedCourse: string;
  qualificationId: string;
  createdAt: string;
  status: "unverified" | "pending" | "approved" | "rejected";
  rejectionMessage?: string;
}

export default function EnrollmentsPage() {
  const {
    enrollments,
    deleteEnrollment,
    updateEnrollment,
    setEnrollments,
    loadAdminData,
    qualifications,
  } = useAppContext();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "unverified" | "pending" | "approved" | "rejected"
  >("pending");
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [approveSubmitting, setApproveSubmitting] = useState(false);
  const [selected, setSelected] = useState<Enrollment | null>(null);

  const filtered = enrollments.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.interestedCourse.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig: Record<
    string,
    {
      label: string;
      variant: "warning" | "success" | "destructive" | "default";
      icon: React.ElementType;
    }
  > = {
    unverified: { label: "Unverified", variant: "default", icon: Clock },
    pending: { label: "Pending", variant: "warning", icon: Clock },
    approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  };

  function handleDelete() {
    if (!selected) return;
    deleteEnrollment(selected.id);
    setDeleteOpen(false);
    setSelected(null);
    toast.success("Enrollment deleted successfully");
  }

  async function handleApprove() {
    if (!selected) return;
    setApproveSubmitting(true);
    try {
      const res = await fetch(`/api/enrollments/${selected.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approved" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === selected.id ? { ...e, status: "approved" as const } : e,
        ),
      );
      setApproveOpen(false);
      setSelected(null);
      loadAdminData();
      toast.success("Enrollment approved! Student record created.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setApproveSubmitting(false);
    }
  }

  async function handleReject() {
    if (!selected || !rejectMessage.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setRejectSubmitting(true);
    try {
      const res = await fetch(`/api/enrollments/${selected.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rejected",
          rejectionMessage: rejectMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === selected.id
            ? {
                ...e,
                status: "rejected" as const,
                rejectionMessage: rejectMessage.trim(),
              }
            : e,
        ),
      );
      setRejectOpen(false);
      setSelected(null);
      setRejectMessage("");
      loadAdminData();
      toast.success("Enrollment rejected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setRejectSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Enrollments</h1>
          <p className="text-sm text-muted">
            Review and manage student enrollment applications.
          </p>
        </div>
      </div>

      <Card className="mb-4 lg:mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input
                placeholder="Search enrollments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted" />
              {(
                [
                  "all",
                  "unverified",
                  "pending",
                  "approved",
                  "rejected",
                ] as const
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusFilter === s ? "bg-primary text-white" : "bg-accent text-muted hover:bg-primary/5"}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/5 bg-accent/50">
                  <th className="text-left text-xs font-medium text-muted py-3 px-6">
                    Student
                  </th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">
                    Course
                  </th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">
                    Qualification
                  </th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-muted py-3 px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((enrollment) => {
                  const config =
                    statusConfig[enrollment.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <motion.tr
                      key={enrollment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-primary/5 last:border-0 hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                            {enrollment.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">
                              {enrollment.fullName}
                            </p>
                            <p className="text-xs text-muted">
                              {enrollment.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted">
                        {enrollment.interestedCourse}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted">
                        {qualifications.find((q) => q.id === enrollment.qualificationId)?.name ?? "—"}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted">
                        {enrollment.createdAt}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={config.variant}
                          className="text-[10px] capitalize"
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {enrollment.status === "pending" && (
                            <div className="flex items-center gap-2 text-xs">
                              <button
                                onClick={() => {
                                  setSelected(enrollment);
                                  setApproveOpen(true);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all duration-200 hover:shadow-sm font-medium"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelected(enrollment);
                                  setRejectMessage("");
                                  setRejectOpen(true);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all duration-200 hover:shadow-sm font-medium"
                              >
                                <ThumbsDown className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setSelected(enrollment);
                              setViewOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(enrollment);
                              setDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted text-sm">No enrollments found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelected(null);
        }}
        title="Enrollment Details"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted">
                  Full Name
                </label>
                <p className="text-sm text-primary font-medium">
                  {selected.fullName}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Email</label>
                <p className="text-sm text-primary">{selected.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Course</label>
                <p className="text-sm text-primary">
                  {selected.interestedCourse}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Class</label>
                <p className="text-sm text-primary">{qualifications.find((q) => q.id === selected.qualificationId)?.name ?? "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Date</label>
                <p className="text-sm text-primary">{selected.createdAt}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Status</label>
                <div className="mt-1">
                  <Badge
                    variant={
                      statusConfig[selected.status]?.variant || "warning"
                    }
                    className="text-[10px] capitalize"
                  >
                    {statusConfig[selected.status]?.label || selected.status}
                  </Badge>
                </div>
              </div>
            </div>
            {selected.status === "rejected" && selected.rejectionMessage && (
              <div>
                <label className="text-xs font-medium text-muted">
                  Rejection Reason
                </label>
                <div className="mt-1 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  {selected.rejectionMessage}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewOpen(false);
                  setSelected(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={approveOpen}
        onClose={() => {
          setApproveOpen(false);
          setSelected(null);
        }}
        title="Approve Enrollment"
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              This will approve <strong>{selected.fullName}</strong>&apos;s
              enrollment and create a student record. They will receive a
              confirmation email.
            </p>
            <div className="bg-emerald-50 rounded-lg p-3 space-y-1">
              <p className="text-sm">
                <strong>Name:</strong> {selected.fullName}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {selected.email}
              </p>
              <p className="text-sm">
                <strong>Qualification:</strong> {qualifications.find((q) => q.id === selected.qualificationId)?.name ?? "—"}
              </p>
              <p className="text-sm">
                <strong>Course:</strong> {selected.interestedCourse}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setApproveOpen(false);
                  setSelected(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleApprove}
                disabled={approveSubmitting}
              >
                {approveSubmitting
                  ? "Approving..."
                  : "Approve & Create Student"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setSelected(null);
          setRejectMessage("");
        }}
        title="Reject Enrollment"
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Provide a reason for rejecting{" "}
              <strong>{selected.fullName}</strong>&apos;s enrollment. This
              message will be sent to their email.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              rows={4}
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectOpen(false);
                  setSelected(null);
                  setRejectMessage("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
                disabled={rejectSubmitting}
              >
                {rejectSubmitting ? "Rejecting..." : "Reject & Send Email"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <DeleteModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={handleDelete}
        title="Delete Enrollment?"
        message={`Are you sure you want to delete the enrollment for "${selected?.fullName}"? This action cannot be undone.`}
      />
    </div>
  );
}
