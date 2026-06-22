"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search, Plus, Pencil, Trash2, Video,
  ExternalLink, ChevronRight, Clock, CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useAppContext } from "@/lib/app-context";
import { apiList, apiCreate, apiUpdate, apiDelete } from "@/lib/api-client";
import type { LiveClass } from "@/types";

const STATUS_OPTS = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Live", value: "live" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const PLATFORM_OPTS = [
  { label: "Zoom", value: "zoom" },
  { label: "Google Meet", value: "google_meet" },
  { label: "YouTube Live", value: "youtube_live" },
  { label: "Other", value: "other" },
];

const COLOR_PRESETS = [
  { label: "Blue", value: "#3B82F6" },
  { label: "Green", value: "#22C55E" },
  { label: "Red", value: "#EF4444" },
  { label: "Purple", value: "#A855F7" },
  { label: "Orange", value: "#F97316" },
  { label: "Pink", value: "#EC4899" },
  { label: "Teal", value: "#14B8A6" },
  { label: "Yellow", value: "#EAB308" },
  { label: "Slate", value: "#64748B" },
];

function statusBadgeVariant(status: string) {
  switch (status) {
    case "live": return "success" as const;
    case "scheduled": return "default" as const;
    case "completed": return "secondary" as const;
    case "cancelled": return "destructive" as const;
    default: return "outline" as const;
  }
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function LiveClassesPage() {
  const { courses } = useAppContext();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  const fields: FieldConfig[] = useMemo(() => [
    { name: "title", label: "Class Title", type: "text", required: true, placeholder: "e.g. Cadet Preparation - Math Session 5" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Class description..." },
    { name: "instructor", label: "Instructor", type: "text", required: true, placeholder: "e.g. Mr. Sharma" },
    { name: "platform", label: "Platform", type: "select", required: true, options: PLATFORM_OPTS },
    { name: "joinUrl", label: "Join URL", type: "text", required: true, placeholder: "https://zoom.us/j/..." },
    { name: "recordingUrl", label: "Recording URL (optional)", type: "text", placeholder: "https://..." },
    { name: "startTime", label: "Start Time", type: "datetime", required: true },
    { name: "durationMinutes", label: "Duration (minutes)", type: "number", required: true, placeholder: "60" },
    { name: "courseId", label: "Course (optional)", type: "select", options: courses.map(c => ({ label: c.title, value: c.id })) },
    { name: "status", label: "Status", type: "select", required: true, options: STATUS_OPTS },
    { name: "color", label: "Color Tag", type: "select", options: COLOR_PRESETS },
  ], [courses]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<LiveClass | null>(null);

  async function loadClasses() {
    setLoading(true);
    try {
      const data = await apiList("live_classes");
      setLiveClasses(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load live classes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadClasses(); }, []);

  const filtered = useMemo(() => {
    return [...liveClasses]
      .filter((c) => {
        const q = search.toLowerCase();
        const matchesSearch = c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [liveClasses, search, statusFilter]);

  async function handleAdd(data: Record<string, string>) {
    try {
      await apiCreate("live_classes", {
        title: data.title,
        description: data.description || "",
        instructor: data.instructor,
        platform: data.platform,
        joinUrl: data.joinUrl,
        recordingUrl: data.recordingUrl || null,
        startTime: data.startTime,
        durationMinutes: parseInt(data.durationMinutes, 10) || 60,
        courseId: data.courseId || null,
        status: data.status,
        color: data.color || null,
      });
      toast.success("Live class added");
      setAddOpen(false);
      loadClasses();
    } catch {
      toast.error("Failed to add live class");
    }
  }

  async function handleEdit(data: Record<string, string>) {
    if (!selected) return;
    try {
      await apiUpdate("live_classes", selected.id, {
        title: data.title,
        description: data.description || "",
        instructor: data.instructor,
        platform: data.platform,
        joinUrl: data.joinUrl,
        recordingUrl: data.recordingUrl || null,
        startTime: data.startTime,
        durationMinutes: parseInt(data.durationMinutes, 10) || 60,
        courseId: data.courseId || null,
        status: data.status,
        color: data.color || null,
      });
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
      await apiDelete("live_classes", selected.id);
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
                  <div className="space-y-1.5 mb-3">
                    <p className="text-xs text-muted flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      {formatDateTime(cls.startTime)}
                    </p>
                    <p className="text-xs text-muted flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {cls.durationMinutes} min
                    </p>
                    <p className="text-xs text-muted">
                      Instructor: <span className="font-medium text-primary">{cls.instructor}</span>
                    </p>
                    {course && (
                      <Badge variant="outline" className="text-[10px]">{course.title}</Badge>
                    )}
                    {chunkCount > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{chunkCount} recording{chunkCount > 1 ? "s" : ""}</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                    <a
                      href={cls.joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-secondary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Join
                    </a>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.preventDefault(); setSelected(cls); setEditOpen(true); }}
                        className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); setSelected(cls); setDeleteOpen(true); }}
                        className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
