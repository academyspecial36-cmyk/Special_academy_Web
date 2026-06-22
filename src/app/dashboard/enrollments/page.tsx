"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppContext } from "@/lib/app-context";
import { Users, CheckCircle, X, Mail, School, Search, Filter, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DeleteModal } from "@/components/ui/delete-modal";
import type { Enrollment } from "@/lib/context/students-context";
import { toast } from "sonner";

export default function EnrollmentsPage() {
  const { enrollments, loadAdminData } = useAppContext();

  useEffect(() => { loadAdminData(); }, [loadAdminData]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selected, setSelected] = useState<Enrollment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "approved" | "rejected" } | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
  }

  async function handleAction(id: string, action: "approved" | "rejected") {
    if (action === "rejected" && !rejectionMessage.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setActionLoading(id);
    setConfirmAction(null);
    try {
      const res = await fetch(`/api/enrollments/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionMessage: rejectionMessage.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Review failed");
      }
      await loadAdminData();
      toast.success(`Enrollment ${action}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update enrollment");
    } finally {
      setActionLoading(null);
      setRejectionMessage("");
    }
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true);
    setShowBulkConfirm(false);
    try {
      const ids = Array.from(selectedIds);
      const res = await fetch("/api/bulk-delete-enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Bulk delete failed");
      }
      await loadAdminData();
      setSelectedIds(new Set());
      toast.success(`${ids.length} enrollment(s) deleted`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete enrollments");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/enrollments/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      await loadAdminData();
      toast.success("Enrollment deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete enrollment");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const filtered = useMemo(() => {
    return [...enrollments]
      .filter((e) => {
        const matchesSearch = e.fullName.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [search, statusFilter, enrollments]);
  const pending = filtered.filter((e) => e.status === "pending");
  const approved = filtered.filter((e) => e.status === "approved");
  const rejected = filtered.filter((e) => e.status === "rejected");

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
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted" />
              {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    statusFilter === s ? "bg-primary text-white" : "bg-accent text-muted hover:bg-primary/5"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base sm:text-lg">All Enrollment Requests</CardTitle>
          {selectedIds.size > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowBulkConfirm(true)}
              disabled={bulkDeleting}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete ({selectedIds.size})
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {filtered.length === 0 ? (
            <p className="text-center text-muted py-10 text-sm">No enrollments yet.</p>
          ) : (
            <div className="space-y-2">
              <label className="flex items-center gap-2 px-1 text-xs text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-primary/30 accent-primary"
                />
                Select all {filtered.length > 0 && `(${filtered.length})`}
              </label>
              {filtered.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border border-primary/5 hover:border-primary/10 transition-colors bg-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(enrollment.id)}
                    onChange={() => toggleSelect(enrollment.id)}
                    className="w-4 h-4 rounded border-primary/30 accent-primary shrink-0"
                  />
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmAction({ id: enrollment.id, action: "approved" })}
                          disabled={actionLoading === enrollment.id}
                          className="hover:bg-emerald-50 hover:text-emerald-600"
                        >
                     
                          <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                        </Button>
                      )}
                      {enrollment.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setConfirmAction({ id: enrollment.id, action: "rejected" }); setRejectionMessage(""); }}
                          disabled={actionLoading === enrollment.id}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(enrollment.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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

      <DeleteModal
        open={!!deleteId}
        onClose={() => { setDeleteId(null); }}
        onConfirm={handleDelete}
        title="Delete Enrollment?"
        message="Are you sure you want to delete this enrollment? This action cannot be undone."
        loading={deleting}
      />

      <DeleteModal
        open={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedIds.size} enrollment(s)?`}
        message={`Are you sure you want to delete ${selectedIds.size} enrollment(s)? This action cannot be undone.`}
        loading={bulkDeleting}
      />

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => { setConfirmAction(null); setRejectionMessage(""); }} />
          <div className="relative bg-white rounded-xl shadow-lg p-5 sm:p-6 w-full max-w-sm sm:max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">
              {confirmAction.action === "approved" ? "Approve Enrollment" : "Reject Enrollment"}
            </h3>
            <p className="text-sm text-muted mb-4">
              {confirmAction.action === "approved"
                ? "This will approve the enrollment, create a student account, and send an approval email."
                : "This will reject the enrollment and notify the applicant."}
            </p>
            {confirmAction.action === "rejected" && (
              <div className="mb-4">
                <label className="text-sm font-medium text-primary mb-1.5 block">Rejection Reason</label>
                <textarea
                  value={rejectionMessage}
                  onChange={(e) => setRejectionMessage(e.target.value)}
                  className="w-full rounded-lg border border-primary/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                  placeholder="Explain why the enrollment was rejected..."
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => { setConfirmAction(null); setRejectionMessage(""); }}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={confirmAction.action === "approved" ? "default" : "destructive"}
                onClick={() => handleAction(confirmAction.id, confirmAction.action)}
                disabled={actionLoading === confirmAction.id}
              >
                {actionLoading === confirmAction.id ? "Processing..." : confirmAction.action === "approved" ? "Confirm Approve" : "Confirm Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
