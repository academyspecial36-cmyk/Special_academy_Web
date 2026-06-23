"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, Video, Search, Pencil, Trash2, User, Calendar, Clock,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { formatShortDate } from "@/lib/utils";
import type { LiveClass } from "@/types";

const statusBadgeVariant = (s: string): "success" | "default" | "secondary" | "destructive" | "outline" => {
  switch (s) {
    case "live": return "success";
    case "scheduled": return "default";
    case "completed": return "secondary";
    case "cancelled": return "destructive";
    default: return "outline";
  }
};

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<LiveClass | null>(null);

  const fields: FieldConfig[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "instructor", label: "Instructor", type: "text", required: true },
    { name: "platform", label: "Platform", type: "select", options: ["zoom", "google_meet", "microsoft_teams", "other"].map(v => ({ label: v.replace("_", " "), value: v })) },
    { name: "joinUrl", label: "Join URL", type: "url" },
    { name: "recordingUrl", label: "Recording URL", type: "url" },
    { name: "startTime", label: "Start Time", type: "datetime", required: true },
    { name: "durationMinutes", label: "Duration (minutes)", type: "number", required: true },
    { name: "courseId", label: "Course ID", type: "text" },
    { name: "status", label: "Status", type: "select", options: ["scheduled", "live", "completed", "cancelled"].map(v => ({ label: v, value: v })) },
    { name: "color", label: "Color (hex)", type: "text", placeholder: "#3B82F6" },
  ];

  async function loadClasses() {
    try {
      const res = await fetch("/api/live-classes");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setClasses(data.classes ?? []);
    } catch {
      toast.error("Failed to load live classes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadClasses(); }, []);

  useEffect(() => {
    fetch("/api/courses?limit=100")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses ?? []))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch = c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [classes, search, statusFilter]);

  async function handleAdd(data: Record<string, unknown>) {
    try {
      const res = await fetch("/api/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("Live class created");
      setAddOpen(false);
      loadClasses();
    } catch {
      toast.error("Failed to create live class");
    }
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!selected) return;
    try {
      const res = await fetch(`/api/live-classes/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Live class updated");
      setEditOpen(false);
      setSelected(null);
      loadClasses();
    } catch {
      toast.error("Failed to update live class");
    }
  }

  async function handleDelete() {
    if (!selected) return;
    try {
      const res = await fetch(`/api/live-classes/${selected.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Live class deleted");
      setDeleteOpen(false);
      setSelected(null);
      loadClasses();
    } catch {
      toast.error("Failed to delete live class");
    }
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Live Classes</h1>
          <p className="text-sm text-muted">Schedule and manage live classes for students.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </div>

      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            placeholder="Search by title or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "scheduled", "live", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                statusFilter === s ? "bg-primary text-white" : "bg-accent text-muted hover:bg-primary/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((cls, i) => {
          const course = courses.find((c) => c.id === cls.courseId);
          const isLive = cls.status === "live";
          const chunkCount = cls.recordingChunks?.length ?? 0;
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <LiveClassCard
                cls={cls}
                course={course}
                isLive={isLive}
                chunkCount={chunkCount}
                onEdit={(c) => { setSelected(c); setEditOpen(true); }}
                onDelete={(c) => { setSelected(c); setDeleteOpen(true); }}
                statusBadgeVariant={statusBadgeVariant}
              />
            </motion.div>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-12 h-12 mx-auto text-muted/40 mb-3" />
          <p className="text-muted text-sm">No live classes found.</p>
        </div>
      )}

      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-primary/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      )}

      <FormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Live Class"
        fields={fields}
        onSubmit={handleAdd}
        submitLabel="Add Class"
      />

      <FormModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit Live Class"
        fields={fields}
        initialValues={selected ? {
          title: selected.title,
          description: selected.description,
          instructor: selected.instructor,
          platform: selected.platform,
          joinUrl: selected.joinUrl,
          recordingUrl: selected.recordingUrl || "",
          startTime: selected.startTime,
          durationMinutes: String(selected.durationMinutes),
          courseId: selected.courseId || "",
          status: selected.status,
          color: selected.color || "",
        } : undefined}
        onSubmit={handleEdit}
        submitLabel="Update Class"
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Live Class?"
        message={`Are you sure you want to delete "${selected?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}

const LiveClassCard = memo(function LiveClassCard({ cls, course, isLive, chunkCount, onEdit, onDelete, statusBadgeVariant }: {
  cls: LiveClass; course?: { id: string; title: string } | null; isLive: boolean;
  chunkCount: number; onEdit: (c: LiveClass) => void; onDelete: (c: LiveClass) => void;
  statusBadgeVariant: (s: string) => "success" | "default" | "secondary" | "destructive" | "outline";
}) {
  return (
    <Card className={`overflow-hidden group hover:shadow-elevated transition-all ${isLive ? "ring-2 ring-green-400" : ""}`}>
      <Link href={`/dashboard/live-classes/${cls.id}`}>
        <div
          className="relative h-36 flex items-center justify-center"
          style={{ backgroundColor: cls.color || "hsl(var(--primary) / 0.08)" }}
        >
          <div className="text-center">
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-2 ${isLive ? "bg-green-500 animate-pulse" : "bg-primary/10"}`}>
              <Video className={`w-6 h-6 ${isLive ? "text-white" : "text-primary"}`} />
            </div>
            {isLive && (
              <Badge className="bg-green-500 text-white border-0 text-[10px] animate-pulse">LIVE</Badge>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Badge className="bg-white/90 text-primary border-0 text-[10px] capitalize">
              {cls.platform.replace("_", " ")}
            </Badge>
            <Badge variant={statusBadgeVariant(cls.status)} className="text-[10px] capitalize border-0">
              {cls.status}
            </Badge>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/dashboard/live-classes/${cls.id}`} className="group/title">
          <h3 className="font-semibold text-primary text-sm mb-1 group-hover/title:text-secondary transition-colors inline-flex items-center gap-1">
            {cls.title}
            <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all" />
          </h3>
        </Link>
        {course && (
          <Badge variant="outline" className="text-[10px] mb-3">
            {course.title}
          </Badge>
        )}
        <div className="flex items-center gap-3 text-xs text-muted mb-3">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {cls.instructor}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatShortDate(cls.startTime)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {cls.durationMinutes} min
          </span>
        </div>
        {isLive && chunkCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Badge variant="secondary" className="text-[10px]">{chunkCount} recording chunk{chunkCount !== 1 ? "s" : ""}</Badge>
          </div>
        )}
        {chunkCount > 0 && !isLive && (
          <div className="flex items-center gap-1.5 mb-3">
            <Badge variant="outline" className="text-[10px]">{chunkCount} recording{chunkCount !== 1 ? "s" : ""}</Badge>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={(e) => { e.preventDefault(); onEdit(cls); }}>
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-8 text-red-600 hover:text-red-700" onClick={(e) => { e.preventDefault(); onDelete(cls); }}>
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
