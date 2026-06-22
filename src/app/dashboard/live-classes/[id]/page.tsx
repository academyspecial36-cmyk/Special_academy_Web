"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Video, ExternalLink, CalendarDays, Clock,
  Pencil, Trash2, Play, CheckCircle2, XCircle,
  Monitor, Download, Film, Trash,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { ScreenRecorder } from "@/components/shared/screen-recorder";
import { useAppContext } from "@/lib/app-context";
import { useBreadcrumbs } from "@/lib/breadcrumb-context";
import { apiList, apiUpdate, apiDelete } from "@/lib/api-client";
import type { LiveClass, RecordingChunk } from "@/types";

const STATUS_OPTS = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Live", value: "live" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
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

function statusColor(s: string) {
  switch (s) {
    case "live": return "bg-green-100 text-green-800 border-green-300";
    case "scheduled": return "bg-blue-100 text-blue-800 border-blue-300";
    case "completed": return "bg-slate-100 text-slate-800 border-slate-300";
    case "cancelled": return "bg-red-100 text-red-800 border-red-300";
    default: return "";
  }
}

function platformLabel(p: string) {
  return p.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateFull(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LiveClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { courses } = useAppContext();
  const { setSegments } = useBreadcrumbs();

  const [cls, setCls] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "", description: "", instructor: "", platform: "",
    joinUrl: "", recordingUrl: "", startTime: "",
    durationMinutes: "", courseId: "", status: "", color: "",
  });

  async function loadClass() {
    setLoading(true);
    try {
      const data = await apiList("live_classes");
      const found = (Array.isArray(data) ? data : []).find((c: LiveClass) => c.id === id);
      if (found) {
        setCls(found);
        setSegments([
          { label: "Live Classes", href: "/dashboard/live-classes" },
          { label: found.title },
        ]);
      } else {
        toast.error("Live class not found");
      }
    } catch {
      toast.error("Failed to load class");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadClass(); return () => setSegments([]); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  function openEdit() {
    if (!cls) return;
    setEditForm({
      title: cls.title,
      description: cls.description,
      instructor: cls.instructor,
      platform: cls.platform,
      joinUrl: cls.joinUrl,
      recordingUrl: cls.recordingUrl || "",
      startTime: cls.startTime,
      durationMinutes: String(cls.durationMinutes),
      courseId: cls.courseId || "",
      status: cls.status,
      color: cls.color || "",
    });
    setEditOpen(true);
  }

  async function handleSaveStatus(newStatus: string) {
    if (!cls) return;
    try {
      await apiUpdate("live_classes", cls.id, { status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
      loadClass();
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleEditSave() {
    if (!cls) return;
    try {
      await apiUpdate("live_classes", cls.id, {
        title: editForm.title,
        description: editForm.description,
        instructor: editForm.instructor,
        platform: editForm.platform,
        joinUrl: editForm.joinUrl,
        recordingUrl: editForm.recordingUrl || null,
        startTime: editForm.startTime,
        durationMinutes: parseInt(editForm.durationMinutes, 10) || 60,
        courseId: editForm.courseId || null,
        status: editForm.status,
        color: editForm.color || null,
      });
      toast.success("Class updated");
      setEditOpen(false);
      loadClass();
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDelete() {
    if (!cls) return;
    try {
      await apiDelete("live_classes", cls.id);
      toast.success("Class deleted");
      router.push("/dashboard/live-classes");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleRecordingChunks(chunks: RecordingChunk[]) {
    if (!cls || chunks.length === 0) return;
    const existing = cls.recordingChunks ?? [];
    const all = [...existing, ...chunks];
    try {
      await apiUpdate("live_classes", cls.id, { recordingChunks: all });
      toast.success(`${chunks.length} recording chunk(s) saved`);
      loadClass();
    } catch {
      toast.error("Failed to save recording chunks");
    }
  }

  async function deleteChunk(index: number) {
    if (!cls?.recordingChunks) return;
    const remaining = cls.recordingChunks.filter((_, i) => i !== index);
    try {
      await apiUpdate("live_classes", cls.id, { recordingChunks: remaining });
      toast.success("Recording chunk removed");
      loadClass();
    } catch {
      toast.error("Failed to remove chunk");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-primary/10 rounded-md animate-pulse" />
        <div className="h-4 w-64 bg-primary/10 rounded-md animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-primary/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-primary/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="text-center py-16">
        <Video className="w-16 h-16 mx-auto text-muted/40 mb-4" />
        <h2 className="text-xl font-bold text-primary mb-2">Class Not Found</h2>
        <Link href="/dashboard/live-classes" className="text-sm text-secondary hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Live Classes
        </Link>
      </div>
    );
  }

  const course = courses.find((c) => c.id === cls.courseId);
  const chunks = cls.recordingChunks ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/live-classes"
          className="p-2 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">{cls.title}</h1>
          <p className="text-sm text-muted">Live class details and management</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Class info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <Badge className={`${statusColor(cls.status)} text-xs capitalize border px-3 py-1`}>
                  {cls.status}
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={openEdit}>
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted mb-1">Date</p>
                  <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-muted" /> {formatDateFull(cls.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Time</p>
                  <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted" /> {formatTime(cls.startTime)} ({cls.durationMinutes} min)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Instructor</p>
                  <p className="text-sm font-medium text-primary">{cls.instructor}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Platform</p>
                  <Badge variant="outline" className="text-xs capitalize">{platformLabel(cls.platform)}</Badge>
                </div>
              </div>

              {cls.description && (
                <div>
                  <p className="text-xs text-muted mb-1">Description</p>
                  <p className="text-sm text-primary whitespace-pre-wrap">{cls.description}</p>
                </div>
              )}

              {course && (
                <div>
                  <p className="text-xs text-muted mb-1">Course</p>
                  <Badge variant="secondary" className="text-xs">{course.title}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-primary mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTS.map((opt) => (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant={cls.status === opt.value ? "default" : "outline"}
                    onClick={() => handleSaveStatus(opt.value)}
                    disabled={cls.status === opt.value}
                  >
                    {opt.value === "live" && <Play className="w-3.5 h-3.5 mr-1.5" />}
                    {opt.value === "completed" && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                    {opt.value === "cancelled" && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                    {opt.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recording */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Browser Recording
              </h3>
              <ScreenRecorder
                onChunksReady={handleRecordingChunks}
                disabled={cls.status === "cancelled"}
              />
              <p className="text-xs text-muted mt-2">
                Record your screen directly from the browser. Chunks are uploaded in 10-second segments.
              </p>
            </CardContent>
          </Card>

          {/* Recordings list */}
          {chunks.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Recordings ({chunks.length} chunk{chunks.length > 1 ? "s" : ""})
                </h3>
                <div className="space-y-2">
                  {chunks.map((chunk, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border border-primary/5 hover:bg-accent/50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">Chunk {i + 1}</p>
                        <p className="text-xs text-muted">
                          {new Date(chunk.createdAt).toLocaleString()} · {formatBytes(chunk.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setPreviewUrl(chunk.url)}
                          className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors"
                          title="Preview"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={chunk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => deleteChunk(i)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                          title="Remove"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Links */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-primary">Links</h3>
              <a
                href={cls.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-3 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Join Class
              </a>
              {cls.recordingUrl ? (
                <a
                  href={cls.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-accent text-primary hover:bg-primary/10 transition-colors text-sm font-medium"
                >
                  <Play className="w-4 h-4" />
                  Legacy Recording
                </a>
              ) : chunks.length === 0 ? (
                <div className="flex items-center gap-3 w-full p-3 rounded-lg bg-accent/50 text-muted text-sm">
                  <Play className="w-4 h-4" />
                  No recording yet
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-primary">Class Info</h3>
              <div className="space-y-2 text-xs text-muted">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge variant={cls.status === "live" ? "success" : cls.status === "cancelled" ? "destructive" : "outline"} className="text-[10px] capitalize">{cls.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="text-primary">{cls.durationMinutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform</span>
                  <span className="text-primary capitalize">{platformLabel(cls.platform)}</span>
                </div>
                {cls.color && (
                  <div className="flex justify-between items-center">
                    <span>Color</span>
                    <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: cls.color }} />
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Chunks</span>
                  <span className="text-primary">{chunks.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video preview modal */}
      <Modal open={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Recording Preview">
        {previewUrl && (
          <video
            controls
            className="w-full rounded-lg"
            src={previewUrl}
            style={{ maxHeight: "70vh" }}
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Live Class">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Title</label>
            <input
              value={editForm.title}
              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Instructor</label>
              <input
                value={editForm.instructor}
                onChange={(e) => setEditForm((f) => ({ ...f, instructor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Platform</label>
              <select
                value={editForm.platform}
                onChange={(e) => setEditForm((f) => ({ ...f, platform: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 bg-white"
              >
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
                <option value="youtube_live">YouTube Live</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Join URL</label>
            <input
              value={editForm.joinUrl}
              onChange={(e) => setEditForm((f) => ({ ...f, joinUrl: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={editForm.startTime ? new Date(editForm.startTime).toISOString().slice(0, 16) : ""}
                onChange={(e) => setEditForm((f) => ({ ...f, startTime: new Date(e.target.value).toISOString() }))}
                className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Duration (min)</label>
              <input
                type="number"
                value={editForm.durationMinutes}
                onChange={(e) => setEditForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Course</label>
              <select
                value={editForm.courseId}
                onChange={(e) => setEditForm((f) => ({ ...f, courseId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 bg-white"
              >
                <option value="">None</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 bg-white"
              >
                {STATUS_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Color Tag</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setEditForm((f) => ({ ...f, color: c.value }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    editForm.color === c.value ? "border-primary scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleEditSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <DeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Live Class?"
        message={`Are you sure you want to delete "${cls.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
