"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, CheckCircle2, XCircle, Clock, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useAppContext } from "@/lib/app-context";

interface Enrollment {
  id: string;
  fullName: string;
  email: string;
  interestedCourse: string;
  currentClass: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function EnrollmentsPage() {
  const { enrollments, deleteEnrollment } = useAppContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Enrollment | null>(null);

  const filtered = enrollments.filter((e) => {
    const matchesSearch = e.fullName.toLowerCase().includes(search.toLowerCase()) || e.interestedCourse.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    pending: { label: "Pending", variant: "warning" as const, icon: Clock },
    approved: { label: "Approved", variant: "success" as const, icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
  };

  function handleDelete() {
    if (!selected) return;
    deleteEnrollment(selected.id);
    setDeleteOpen(false);
    setSelected(null);
    toast.success("Enrollment deleted successfully");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Enrollments</h1>
          <p className="text-sm text-muted">Review and manage student enrollment applications.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input placeholder="Search enrollments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted" />
              {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusFilter === s ? "bg-primary text-white" : "bg-accent text-muted hover:bg-primary/5"}`}>
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
                  <th className="text-left text-xs font-medium text-muted py-3 px-6">Student</th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">Course</th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">Class</th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">Date</th>
                  <th className="text-left text-xs font-medium text-muted py-3 px-4">Status</th>
                  <th className="text-right text-xs font-medium text-muted py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((enrollment) => {
                  const config = statusConfig[enrollment.status];
                  const StatusIcon = config.icon;
                  return (
                    <motion.tr key={enrollment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-primary/5 last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                            {enrollment.fullName.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">{enrollment.fullName}</p>
                            <p className="text-xs text-muted">{enrollment.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted">{enrollment.interestedCourse}</td>
                      <td className="py-4 px-4 text-sm text-muted">{enrollment.currentClass}</td>
                      <td className="py-4 px-4 text-sm text-muted">{enrollment.createdAt}</td>
                      <td className="py-4 px-4">
                        <Badge variant={config.variant} className="text-[10px] capitalize">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelected(enrollment); setViewOpen(true); }}
                            className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setSelected(enrollment); setDeleteOpen(true); }}
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
        </CardContent>
      </Card>

      <Modal open={viewOpen} onClose={() => { setViewOpen(false); setSelected(null); }} title="Enrollment Details">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted">Full Name</label>
                <p className="text-sm text-primary font-medium">{selected.fullName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Email</label>
                <p className="text-sm text-primary">{selected.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Course</label>
                <p className="text-sm text-primary">{selected.interestedCourse}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Class</label>
                <p className="text-sm text-primary">{selected.currentClass}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Date</label>
                <p className="text-sm text-primary">{selected.createdAt}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Status</label>
                <div className="mt-1">
                  <Badge variant={statusConfig[selected.status].variant} className="text-[10px] capitalize">
                    {statusConfig[selected.status].label}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => { setViewOpen(false); setSelected(null); }}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Enrollment?"
        message={`Are you sure you want to delete the enrollment for "${selected?.fullName}"? This action cannot be undone.`}
      />
    </div>
  );
}
