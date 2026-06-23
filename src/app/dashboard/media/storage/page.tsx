"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  File, FileImage, FileVideo, FileAudio,
  Search, Trash2, Download, Loader2, HardDrive,
  X, Eye, Grid3X3, List,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteModal } from "@/components/ui/delete-modal";
import { cn } from "@/lib/utils";
import type { StorageFileItem, StorageStats } from "@/app/api/media/storage-files/route";

const FILE_ICONS: Record<string, React.ElementType> = {
  "image/jpeg": FileImage,
  "image/png": FileImage,
  "image/gif": FileImage,
  "image/webp": FileImage,
  "video/mp4": FileVideo,
  "video/webm": FileVideo,
  "audio/mpeg": FileAudio,
  "audio/wav": FileAudio,
  "application/pdf": File,
};

function fileIcon(mime: string): React.ElementType {
  return FILE_ICONS[mime] || File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatGB(bytes: number): string {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

const STORAGE_LIMIT = Number(process.env.NEXT_PUBLIC_STORAGE_LIMIT_BYTES) || 1_073_741_824; // 1GB default

export default function MyStoragePage() {
  const [files, setFiles] = useState<StorageFileItem[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_use" | "orphaned">("all");
  const [bucketFilter, setBucketFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<StorageFileItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewFile, setPreviewFile] = useState<StorageFileItem | null>(null);

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await fetch("/api/media/storage-files");
      if (!res.ok) throw new Error("Failed to load storage files");
      const data = await res.json();
      setFiles(data.files ?? []);
      setStats(data.stats ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load storage files");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchFiles(); }, []);

  const buckets = useMemo(() => {
    const set = new Set(files.map((f) => f.bucket));
    return Array.from(set).sort();
  }, [files]);

  const filtered = useMemo(() => {
    return files.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.path.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "in_use" && f.in_use) ||
        (statusFilter === "orphaned" && !f.in_use);
      const matchesBucket = bucketFilter === "all" || f.bucket === bucketFilter;
      return matchesSearch && matchesStatus && matchesBucket;
    });
  }, [files, search, statusFilter, bucketFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/media/cleanup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: [deleteTarget.path], bucket: deleteTarget.bucket }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      toast.success("File deleted");
      setDeleteTarget(null);
      await fetchFiles();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete file");
    } finally {
      setDeleting(false);
    }
  }

  const inUseCount = files.filter((f) => f.in_use).length;
  const orphanedCount = files.filter((f) => !f.in_use).length;
  const usedPercent = stats ? Math.min((stats.totalBytes / STORAGE_LIMIT) * 100, 100) : 0;

  function isPreviewable(file: StorageFileItem): boolean {
    return file.mime_type.startsWith("image/") ||
      file.mime_type.startsWith("video/") ||
      file.mime_type.startsWith("audio/") ||
      file.mime_type === "application/pdf";
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl font-bold text-primary">My Storage</h1>
        <p className="text-sm text-muted">Browse all files across Supabase storage buckets.</p>
      </div>

      {stats && (
        <Card className="mb-4 lg:mb-6">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Storage Usage</span>
              </div>
              <span className="text-xs text-muted">
                {formatGB(stats.totalBytes)} GB used of {formatGB(STORAGE_LIMIT)} GB
                ({stats.totalFiles} files)
              </span>
            </div>
            <div className="w-full bg-accent rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usedPercent, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${usedPercent > 90 ? "bg-red-500" : usedPercent > 70 ? "bg-amber-500" : "bg-primary"}`}
              />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-muted">
              {stats.buckets.map((b) => (
                <BucketStatItem key={b.name} name={b.name} bytes={b.bytes} files={b.files} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4 lg:mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted font-medium">Status:</span>
              {(["all", "in_use", "orphaned"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    statusFilter === s ? "bg-primary text-white" : "bg-accent text-muted hover:bg-primary/5"
                  }`}
                >
                  {s === "all" ? "All" : s === "in_use" ? "In Use" : "Orphaned"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-medium">Bucket:</span>
              <select
                value={bucketFilter}
                onChange={(e) => setBucketFilter(e.target.value)}
                className="text-xs rounded-lg border border-primary/20 bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All</option>
                {buckets.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base sm:text-lg">Files</CardTitle>
          <div className="flex items-center gap-1 rounded-lg border border-primary/10 overflow-hidden">
            <button onClick={() => setView("grid")} className={cn("p-2 transition-colors", view === "grid" ? "bg-primary text-white" : "text-muted hover:bg-primary/5")}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={cn("p-2 transition-colors", view === "list" ? "bg-primary text-white" : "text-muted hover:bg-primary/5")}><List className="w-4 h-4" /></button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <HardDrive className="w-12 h-12 text-muted/40 mx-auto mb-3" />
              <p className="text-muted text-sm">No files found.</p>
            </div>
          ) : view === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/5 bg-accent/50">
                    <th className="text-left text-xs font-medium text-muted py-3 px-6">File</th>
                    <th className="text-left text-xs font-medium text-muted py-3 px-4">Bucket</th>
                    <th className="text-left text-xs font-medium text-muted py-3 px-4">Size</th>
                    <th className="text-left text-xs font-medium text-muted py-3 px-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted py-3 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((file) => (
                    <StorageFileTableRow
                      key={`${file.bucket}:${file.path}`}
                      file={file}
                      isPreviewable={isPreviewable}
                      onPreview={setPreviewFile}
                      onDownload={(f) => window.open(f.url, "_blank")}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filtered.map((file) => (
                  <StorageFileGridCard
                    key={`${file.bucket}:${file.path}`}
                    file={file}
                    isPreviewable={isPreviewable}
                    onPreview={setPreviewFile}
                    onDownload={(f) => window.open(f.url, "_blank")}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete File?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleting}
      />

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setPreviewFile(null)} />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-primary/10">
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary truncate">{previewFile.name}</p>
                <p className="text-xs text-muted truncate">{previewFile.path}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setPreviewFile(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-black/5 min-h-[300px]">
              {previewFile.mime_type.startsWith("image/") ? (
                <Image
                  src={previewFile.url}
                  alt={previewFile.name}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  style={{ width: "auto", height: "auto" }}
                />
              ) : previewFile.mime_type.startsWith("video/") ? (
                <video controls className="max-w-full max-h-[70vh] rounded-lg" src={previewFile.url}>
                  Your browser does not support video playback.
                </video>
              ) : previewFile.mime_type.startsWith("audio/") ? (
                <audio controls className="w-full max-w-md" src={previewFile.url}>
                  Your browser does not support audio playback.
                </audio>
              ) : previewFile.mime_type === "application/pdf" ? (
                <iframe src={previewFile.url} className="w-full h-[70vh] rounded-lg" title={previewFile.name} />
              ) : (
                <p className="text-muted text-sm">Preview not available for this file type.</p>
              )}
            </div>
            <div className="px-5 py-3 border-t border-primary/10 flex items-center justify-between">
              <span className="text-xs text-muted">{formatSize(previewFile.file_size)}</span>
              <Button
                size="sm"
                onClick={() => window.open(previewFile.url, "_blank")}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const BucketStatItem = memo(function BucketStatItem({ name, bytes, files }: { name: string; bytes: number; files: number }) {
  return (
    <span>
      <span className="font-medium text-primary">{name}</span>: {formatSize(bytes)} ({files} files)
    </span>
  );
});

const StorageFileTableRow = memo(function StorageFileTableRow({ file, isPreviewable, onPreview, onDownload, onDelete }: {
  file: StorageFileItem; isPreviewable: (f: StorageFileItem) => boolean;
  onPreview: (f: StorageFileItem) => void; onDownload: (f: StorageFileItem) => void; onDelete: (f: StorageFileItem) => void;
}) {
  const Icon = fileIcon(file.mime_type);
  return (
    <motion.tr
      key={`${file.bucket}:${file.path}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-primary/5 last:border-0 hover:bg-accent/30 transition-colors"
    >
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary truncate max-w-[220px]">{file.name}</p>
            <p className="text-xs text-muted truncate max-w-[220px]">{file.path}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <Badge variant="outline" className="text-[10px] font-mono">{file.bucket}</Badge>
      </td>
      <td className="py-4 px-4 text-sm text-muted whitespace-nowrap">{formatSize(file.file_size)}</td>
      <td className="py-4 px-4">
        <Badge variant={file.in_use ? "success" : "destructive"} className="text-[10px]">{file.in_use ? "In Use" : "Orphaned"}</Badge>
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-1">
          {isPreviewable(file) && (
            <Button size="sm" variant="ghost" onClick={() => onPreview(file)} className="hover:bg-primary/5" title="Preview">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onDownload(file)} title="Download" className="hover:bg-primary/5">
            <Download className="w-3.5 h-3.5" />
          </Button>
          {!file.in_use && (
            <Button size="sm" variant="ghost" onClick={() => onDelete(file)} className="hover:bg-red-50 hover:text-red-600" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </td>
    </motion.tr>
  );
});

const StorageFileGridCard = memo(function StorageFileGridCard({ file, isPreviewable, onPreview, onDownload, onDelete }: {
  file: StorageFileItem; isPreviewable: (f: StorageFileItem) => boolean;
  onPreview: (f: StorageFileItem) => void; onDownload: (f: StorageFileItem) => void; onDelete: (f: StorageFileItem) => void;
}) {
  const Icon = fileIcon(file.mime_type);
  return (
    <motion.div
      key={`${file.bucket}:${file.path}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative rounded-xl border border-primary/5 bg-white hover:border-primary/10 hover:shadow-sm transition-all overflow-hidden"
    >
      <div className="aspect-square bg-accent/30 flex items-center justify-center relative overflow-hidden">
        {file.mime_type.startsWith("image/") ? (
          <Image src={file.url} alt={file.name} width={200} height={200} className="w-full h-full object-cover" />
        ) : (
          <Icon className="w-10 h-10 text-muted/60" />
        )}
        {!file.in_use && (
          <button
            onClick={() => onDelete(file)}
            className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-primary truncate">{file.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted">{formatSize(file.file_size)}</span>
          <Badge variant={file.in_use ? "success" : "destructive"} className="text-[9px] px-1.5 py-0">{file.in_use ? "In Use" : "Orphaned"}</Badge>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          {isPreviewable(file) && (
            <button onClick={() => onPreview(file)} className="text-[10px] text-primary hover:underline" title="Preview">Preview</button>
          )}
          <button onClick={() => onDownload(file)} className="text-[10px] text-primary hover:underline ml-auto" title="Download">Download</button>
        </div>
      </div>
    </motion.div>
  );
});
