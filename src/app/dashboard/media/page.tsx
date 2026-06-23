"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  File, FileImage, FileVideo, FileAudio,
  Upload, Plus, Search, Trash2, Pencil,
  Grid3X3, List, ChevronRight, X, ImageIcon,
  Download, Crop, Check, Loader2, Home, Play,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { WindowsFolderIcon } from "@/components/shared/windows-folder-icon";
import type { MediaFile, MediaFolder } from "@/types/media";

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

function isImage(mime: string) { return mime.startsWith("image/"); }
function isVideo(mime: string) { return mime.startsWith("video/"); }
function isAudio(mime: string) { return mime.startsWith("audio/"); }
function isPdf(mime: string) { return mime === "application/pdf"; }

function renderThumbnail(file: MediaFile) {
  if (isImage(file.mime_type)) {
    return (
      <Image src={file.url} alt={file.alt_text || file.name} width={200} height={200}
        className="w-full h-full object-cover" />
    );
  }
  if (isVideo(file.mime_type)) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black/5">
        <video src={file.url} className="w-full h-full object-cover" muted preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
            <Play className="w-5 h-5 text-primary ml-0.5" />
          </div>
        </div>
      </div>
    );
  }
  if (isPdf(file.mime_type)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <svg viewBox="0 0 40 48" className="w-10 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="36" height="44" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
          <rect x="6" y="10" width="28" height="3" rx="1.5" fill="#EF4444" />
          <rect x="6" y="16" width="28" height="3" rx="1.5" fill="#EF4444" opacity="0.6" />
          <rect x="6" y="22" width="20" height="3" rx="1.5" fill="#EF4444" opacity="0.4" />
          <rect x="6" y="28" width="24" height="3" rx="1.5" fill="#EF4444" opacity="0.3" />
          <rect x="6" y="34" width="16" height="3" rx="1.5" fill="#EF4444" opacity="0.2" />
        </svg>
      </div>
    );
  }
  const Icon = fileIcon(file.mime_type);
  return (
    <div className="w-full h-full flex items-center justify-center bg-primary/[0.02]">
      <Icon className="w-10 h-10 text-muted" />
    </div>
  );
}

const FolderGridItem = memo(function FolderGridItem({ folder, onNavigate, onRename, onDelete }: {
  folder: MediaFolder; onNavigate: (id: string) => void; onRename: (f: MediaFolder) => void; onDelete: (f: MediaFolder) => void;
}) {
  return (
    <div className="group relative">
      <button onClick={() => onNavigate(folder.id)}
        className="w-full flex flex-col items-center gap-2 p-4 rounded-xl border border-primary/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all"
      >
        <WindowsFolderIcon open className="w-10 h-10" />
        <span className="text-xs font-medium text-primary text-center truncate w-full">{folder.name}</span>
      </button>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
        <button onClick={() => onRename(folder)}
          className="w-6 h-6 rounded bg-white shadow-sm border border-primary/5 flex items-center justify-center text-muted hover:text-primary">
          <Pencil className="w-3 h-3" />
        </button>
        <button onClick={() => onDelete(folder)}
          className="w-6 h-6 rounded bg-white shadow-sm border border-primary/5 flex items-center justify-center text-muted hover:text-red-600">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});

const FolderListItem = memo(function FolderListItem({ folder, onNavigate, onRename, onDelete }: {
  folder: MediaFolder; onNavigate: (id: string) => void; onRename: (f: MediaFolder) => void; onDelete: (f: MediaFolder) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors group">
      <WindowsFolderIcon open className="w-5 h-5 shrink-0" />
      <button onClick={() => onNavigate(folder.id)} className="text-sm font-medium text-primary flex-1 text-left truncate hover:underline">
        {folder.name}
      </button>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onRename(folder)}
          className="p-1 rounded text-muted hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => onDelete(folder)}
          className="p-1 rounded text-muted hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
});

const FileGridItem = memo(function FileGridItem({ file, isSelected, onToggle, onDoubleClick, onCrop, onEdit }: {
  file: MediaFile; isSelected: boolean; onToggle: (id: string) => void;
  onDoubleClick: (f: MediaFile) => void; onCrop: (f: MediaFile) => void; onEdit: (f: MediaFile) => void;
}) {
  return (
    <motion.div layout
      className={cn(
        "group relative rounded-xl overflow-hidden border transition-all cursor-pointer",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-primary/5 hover:border-primary/20"
      )}
      onClick={() => onToggle(file.id)}
      onDoubleClick={() => onDoubleClick(file)}
    >
      <div className="aspect-square bg-primary/[0.02] flex items-center justify-center">
        {renderThumbnail(file)}
      </div>
      <div className="p-2">
        <p className="text-[11px] font-medium text-primary truncate">{file.name}</p>
        <p className="text-[10px] text-muted">{formatSize(file.file_size)}</p>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {isImage(file.mime_type) && (
          <button onClick={(e) => { e.stopPropagation(); onCrop(file); }}
            className="w-7 h-7 rounded-lg bg-white shadow-sm border border-primary/5 flex items-center justify-center text-muted hover:text-primary">
            <Crop className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onEdit(file); }}
          className="w-7 h-7 rounded-lg bg-white shadow-sm border border-primary/5 flex items-center justify-center text-muted hover:text-primary">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
});

const FileListItem = memo(function FileListItem({ file, isSelected, onToggle, onDoubleClick, onCrop, onEdit, onDownload }: {
  file: MediaFile; isSelected: boolean; onToggle: (id: string) => void;
  onDoubleClick: (f: MediaFile) => void; onCrop: (f: MediaFile) => void;
  onEdit: (f: MediaFile) => void; onDownload: (f: MediaFile) => void;
}) {
  const Icon = fileIcon(file.mime_type);
  return (
    <div
      className={cn("flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer",
        isSelected && "bg-primary/5 ring-1 ring-primary/20")}
      onClick={() => onToggle(file.id)}
      onDoubleClick={() => onDoubleClick(file)}
    >
      {isImage(file.mime_type) ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-primary/[0.02]">
          <Image src={file.url} alt={file.alt_text || file.name} width={40} height={40} className="w-full h-full object-cover" />
        </div>
      ) : isPdf(file.mime_type) ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-red-50 flex items-center justify-center">
          <svg viewBox="0 0 40 48" className="w-5 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="36" height="44" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
            <rect x="6" y="10" width="28" height="3" rx="1.5" fill="#EF4444" />
            <rect x="6" y="16" width="28" height="3" rx="1.5" fill="#EF4444" opacity="0.6" />
          </svg>
        </div>
      ) : (
        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-muted" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{file.name}</p>
        <p className="text-xs text-muted">
          {formatSize(file.file_size)}
          {file.width && file.height && ` · ${file.width}×${file.height}`}
        </p>
      </div>
      <span className="text-[10px] text-muted uppercase">{file.mime_type.split("/")[1]}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
        {isImage(file.mime_type) && (
          <button onClick={(e) => { e.stopPropagation(); onCrop(file); }}
            className="p-1.5 rounded text-muted hover:text-primary"><Crop className="w-3.5 h-3.5" /></button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onEdit(file); }}
          className="p-1.5 rounded text-muted hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); onDownload(file); }}
          className="p-1.5 rounded text-muted hover:text-primary"><Download className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
});

export default function MediaManagerPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<MediaFolder[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [storageStats, setStorageStats] = useState<{ totalBytes: number; totalFiles: number; limit: number; usedPercent: number } | null>(null);
  const [cleaningOrphans, setCleaningOrphans] = useState(false);
  const [orphanData, setOrphanData] = useState<{ orphans: { name: string; path: string }[]; count: number } | null>(null);
  const [orphanDeleting, setOrphanDeleting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editName, setEditName] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<MediaFile | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<MediaFolder | null>(null);
  const [deletingFiles, setDeletingFiles] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [folderRes, mediaRes, statsRes] = await Promise.all([
        fetch("/api/media/folders"),
        fetch(`/api/media?${new URLSearchParams({
          ...(currentFolderId ? { folder_id: currentFolderId } : { folder_id: "root" }),
          ...(search ? { search } : {}),
        })}`),
        fetch("/api/media/stats"),
      ]);

      if (!folderRes.ok) throw new Error("Failed to load folders");
      if (!mediaRes.ok) {
        const err = await mediaRes.json();
        throw new Error(err.error || "Failed to load media");
      }

      const [foldersData, mediaData, statsData] = await Promise.all([
        folderRes.json(),
        mediaRes.json(),
        statsRes.json(),
      ]);

      if (!Array.isArray(foldersData)) throw new Error("Invalid folders response");
      if (!Array.isArray(mediaData)) throw new Error("Invalid media response");

      setFolders(foldersData);
      setMedia(mediaData);
      if (statsData && typeof statsData.totalBytes === "number") {
        setStorageStats(statsData);
      }
    } catch (e) {
      toast.error((e as Error).message);
      setMedia([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const buildPath = () => {
      if (!currentFolderId) { setFolderPath([]); return; }
      const path: MediaFolder[] = [];
    let current = folders.find((f) => f.id === currentFolderId);
    while (current) {
      path.unshift(current);
      const pid = current.parent_id;
      current = pid ? folders.find((f) => f.id === pid) ?? undefined : undefined;
      }
      setFolderPath(path);
    };
    buildPath();
  }, [currentFolderId, folders]);

  const handleUpload = useCallback(async (files: File[]) => {
    setUploading(true);
    let count = 0;
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolderId) formData.append("folder_id", currentFolderId);
        const res = await fetch("/api/media", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        count++;
      } catch (e) {
        toast.error(`Failed to upload ${file.name}: ${(e as Error).message}`);
      }
    }
    if (count > 0) {
      toast.success(`${count} file${count > 1 ? "s" : ""} uploaded`);
      fetchData();
    }
    setUploading(false);
  }, [currentFolderId, fetchData]);

  // drag-drop
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const drop = async (e: DragEvent) => {
      prevent(e);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length) await handleUpload(files);
    };
    el.addEventListener("dragover", prevent);
    el.addEventListener("dragenter", prevent);
    el.addEventListener("drop", drop);
    return () => {
      el.removeEventListener("dragover", prevent);
      el.removeEventListener("dragenter", prevent);
      el.removeEventListener("drop", drop);
    };
  }, [handleUpload]);

  async function createFolder() {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/media/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), parent_id: currentFolderId }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      setNewFolderName("");
      setShowNewFolder(false);
      toast.success("Folder created");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function renameFolder() {
    if (!editingFolder || !editName.trim()) return;
    try {
      const res = await fetch(`/api/media/folders/${editingFolder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to rename folder");
      setEditingFolder(null);
      setEditName("");
      toast.success("Folder renamed");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function confirmDeleteFolder() {
    if (!deletingFolder) return;
    try {
      const res = await fetch(`/api/media/folders/${deletingFolder.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete folder");
      toast.success("Folder deleted");
      if (currentFolderId === deletingFolder.id) setCurrentFolderId(null);
      setDeletingFolder(null);
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
      setDeletingFolder(null);
    }
  }

  async function confirmDeleteFiles() {
    if (!selected.size) return;
    setDeletingLoading(true);
    try {
      const res = await fetch("/api/media/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error("Failed to delete files");
      setSelected(new Set());
      setDeletingFiles(false);
      toast.success("Deleted");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeletingLoading(false);
    }
  }

  async function updateFile() {
    if (!editingFile) return;
    try {
      const res = await fetch(`/api/media/${editingFile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), alt_text: editAlt.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingFile(null);
      toast.success("File updated");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function moveFiles() {
    if (!selected.size) return;
    try {
      for (const id of selected) {
        await fetch(`/api/media/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder_id: moveTargetId }),
        });
      }
      setSelected(new Set());
      setShowMoveModal(false);
      toast.success("Moved");
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleCleanupOrphans() {
    setCleaningOrphans(true);
    try {
      const res = await fetch("/api/media/cleanup", { method: "POST" });
      if (!res.ok) throw new Error("Failed to scan orphans");
      const data = await res.json();
      setOrphanData(data);
      if (data.count === 0) toast.success("No orphaned files found");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCleaningOrphans(false);
    }
  }

  async function confirmDeleteOrphans() {
    if (!orphanData || orphanData.count === 0) return;
    setOrphanDeleting(true);
    try {
      const res = await fetch("/api/media/cleanup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: orphanData.orphans.map((o) => o.path) }),
      });
      if (!res.ok) throw new Error("Failed to delete orphans");
      toast.success(`Cleaned up ${orphanData.count} orphaned file${orphanData.count > 1 ? "s" : ""}`);
      setOrphanData(null);
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOrphanDeleting(false);
    }
  }

  async function handleBackup() {
    setBackingUp(true);
    try {
      const res = await fetch("/api/media/backup");
      if (!res.ok) throw new Error("Failed to create backup");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `media-backup-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBackingUp(false);
    }
  }

  async function handleCrop() {
    if (!cropFile) return;
    setOptimizing(true);
    try {
      const res = await fetch("/api/media/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cropFile.id, crop: null }),
      });
      if (!res.ok) throw new Error("Optimization failed");
      toast.success("Image optimized");
      setCropFile(null);
      fetchData();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOptimizing(false);
    }
  }

  function navigateToFolder(id: string | null) {
    setCurrentFolderId(id);
    setSelected(new Set());
    setSearch("");
  }

  const currentFolders = folders.filter((f) => f.parent_id === currentFolderId);
  const showSelectedActions = selected.size > 0;

  return (
    <div ref={dropRef}>
      {/* Storage Info */}
      <div className="mb-4 p-3 rounded-xl border border-primary/5 bg-gradient-to-r from-primary/[0.02] to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <HardDrive className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs text-muted">
            {storageStats
              ? `${formatSize(storageStats.totalBytes)} used across ${storageStats.totalFiles} file${storageStats.totalFiles !== 1 ? "s" : ""}`
              : "Loading storage stats..."}
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" className="text-[11px] h-7 px-2" onClick={handleBackup} disabled={backingUp}>
            {backingUp ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Download className="w-3 h-3 mr-1" />}
            Backup
          </Button>
          <Button size="sm" variant="outline" className="text-[11px] h-7 px-2" onClick={handleCleanupOrphans} disabled={cleaningOrphans}>
            {cleaningOrphans ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
            Cleanup
          </Button>
        </div>
        {storageStats && storageStats.limit > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  storageStats.usedPercent > 90 ? "bg-red-500" : storageStats.usedPercent > 70 ? "bg-yellow-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(storageStats.usedPercent, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-muted whitespace-nowrap">{storageStats.usedPercent}% of {formatSize(storageStats.limit)}</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Media Manager</h1>
          <p className="text-sm text-muted">Upload, organize, and manage your media assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload
          </Button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf" className="hidden"
            onChange={(e) => { const files = Array.from(e.target.files ?? []); if (files.length) handleUpload(files); e.target.value = ""; }}
          />
          <Button size="sm" variant="outline" onClick={() => { setShowNewFolder(true); setNewFolderName(""); }}>
            <Plus className="w-4 h-4 mr-2" /> New Folder
          </Button>
          <div className="flex border border-primary/10 rounded-lg overflow-hidden">
            <button onClick={() => setView("grid")} className={cn("p-2", view === "grid" ? "bg-primary text-white" : "text-muted hover:bg-primary/5")}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={cn("p-2", view === "list" ? "bg-primary text-white" : "text-muted hover:bg-primary/5")}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-4 flex-wrap">
        <button onClick={() => navigateToFolder(null)} className="flex items-center gap-1 text-muted hover:text-primary transition-colors">
          <Home className="w-3.5 h-3.5" /> Root
        </button>
        {folderPath.map((f) => (
          <span key={f.id} className="flex items-center gap-1 text-muted">
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => navigateToFolder(f.id)} className="hover:text-primary transition-colors">{f.name}</button>
          </span>
        ))}
      </div>

      {/* Search + Bulk actions */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        {showSelectedActions && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <span className="text-xs text-muted">{selected.size} selected</span>
              <Button size="sm" variant="outline" onClick={() => setShowMoveModal(true)}>
              <WindowsFolderIcon className="w-3.5 h-3.5 mr-1" /> Move
            </Button>
            <Button size="sm" variant="outline" className="text-red-600" onClick={() => setDeletingFiles(true)}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
              <X className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          </div>
        )}
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg">
          <WindowsFolderIcon className="w-4 h-4" />
          <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name" className="flex-1"
            onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
            autoFocus
          />
          <Button size="sm" onClick={createFolder}><Check className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="outline" onClick={() => setShowNewFolder(false)}><X className="w-3.5 h-3.5" /></Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-primary/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Folders */}
          {currentFolders.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Folders</p>
              {view === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {currentFolders.map((folder) => (
                    <FolderGridItem
                      key={folder.id}
                      folder={folder}
                      onNavigate={navigateToFolder}
                      onRename={(f) => { setEditingFolder(f); setEditName(f.name); }}
                      onDelete={setDeletingFolder}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {currentFolders.map((folder) => (
                    <FolderListItem
                      key={folder.id}
                      folder={folder}
                      onNavigate={navigateToFolder}
                      onRename={(f) => { setEditingFolder(f); setEditName(f.name); }}
                      onDelete={setDeletingFolder}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files */}
          {media.length > 0 && (
            <>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
                {currentFolderId ? "Files" : "All Files"}
                <span className="font-normal lowercase ml-1">({media.length})</span>
              </p>
              {view === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {media.map((file) => (
                    <FileGridItem
                      key={file.id}
                      file={file}
                      isSelected={selected.has(file.id)}
                      onToggle={(id) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; })}
                      onDoubleClick={setPreviewFile}
                      onCrop={setCropFile}
                      onEdit={(f) => { setEditingFile(f); setEditName(f.name); setEditAlt(f.alt_text || ""); }}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {media.map((file) => (
                    <FileListItem
                      key={file.id}
                      file={file}
                      isSelected={selected.has(file.id)}
                      onToggle={(id) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; })}
                      onDoubleClick={setPreviewFile}
                      onCrop={setCropFile}
                      onEdit={(f) => { setEditingFile(f); setEditName(f.name); setEditAlt(f.alt_text || ""); }}
                      onDownload={(f) => window.open(f.url, "_blank")}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {currentFolders.length === 0 && media.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-muted" />
              </div>
              <p className="text-muted text-sm mb-1">This folder is empty</p>
              <p className="text-xs text-muted/60 mb-4">Drag & drop files here or use the Upload button</p>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Upload Files
              </Button>
            </div>
          )}
        </>
      )}

      {/* Uploading overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-elevated flex flex-col items-center gap-4">
            <div className="space-y-2 w-48">
              <div className="h-4 bg-primary/10 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse mx-auto" />
              <div className="h-4 w-1/2 bg-primary/10 rounded animate-pulse mx-auto" />
            </div>
            <p className="text-sm font-medium text-primary">Uploading files...</p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-elevated" onClick={(e) => e.stopPropagation()}>
            {isImage(previewFile.mime_type) ? (
              <div className="relative bg-black/5 flex items-center justify-center max-h-[65vh] min-h-[200px]">
                <Image src={previewFile.url} alt={previewFile.alt_text || previewFile.name}
                  width={800} height={600} className="max-w-full max-h-[65vh] object-contain" />
              </div>
            ) : isVideo(previewFile.mime_type) ? (
              <div className="bg-black/5 max-h-[65vh]">
                <video src={previewFile.url} controls className="w-full max-h-[65vh] outline-none" />
              </div>
            ) : isPdf(previewFile.mime_type) ? (
              <div className="bg-primary/[0.02] h-[65vh]">
                <iframe src={previewFile.url} className="w-full h-full border-0" title={previewFile.name} />
              </div>
            ) : isAudio(previewFile.mime_type) ? (
              <div className="h-32 flex items-center justify-center bg-primary/5">
                <div className="text-center">
                  <FileAudio className="w-12 h-12 text-muted mx-auto mb-2" />
                  <audio src={previewFile.url} controls className="mt-2" />
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-primary/5">
                <div className="text-center">
                  <File className="w-12 h-12 text-muted mx-auto mb-2" />
                  <p className="text-sm text-muted">{previewFile.mime_type}</p>
                  <a href={previewFile.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-1 inline-block">
                    Open in new tab
                  </a>
                </div>
              </div>
            )}
            <div className="p-4 flex items-center justify-between border-t border-primary/5">
              <div>
                <p className="text-sm font-medium text-primary">{previewFile.name}</p>
                <p className="text-xs text-muted">
                  {formatSize(previewFile.file_size)}
                  {previewFile.width && previewFile.height && ` · ${previewFile.width}×${previewFile.height}`}
                  {previewFile.alt_text && ` · Alt: "${previewFile.alt_text}"`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(previewFile.url); toast.success("URL copied"); }}>
                  Copy URL
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPreviewFile(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit File Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingFile(null)}>
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-4">Edit File</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Alt Text</label>
                <Input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} placeholder="Describe the image" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setEditingFile(null)}>Cancel</Button>
              <Button onClick={updateFile}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {editingFolder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingFolder(null)}>
          <div className="max-w-sm w-full bg-white rounded-2xl p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-4">Rename Folder</h3>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") renameFolder(); }} autoFocus />
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setEditingFolder(null)}>Cancel</Button>
              <Button onClick={renameFolder}>Rename</Button>
            </div>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMoveModal(false)}>
          <div className="max-w-sm w-full bg-white rounded-2xl p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-4">Move to Folder</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto mb-4">
              <button onClick={() => setMoveTargetId(null)}
                className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  moveTargetId === null ? "bg-primary/10 text-primary font-medium" : "text-muted hover:bg-primary/5"
                )}>Root</button>
              {folders.map((f) => (
                <button key={f.id} onClick={() => setMoveTargetId(f.id)}
                  className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                    moveTargetId === f.id ? "bg-primary/10 text-primary font-medium" : "text-muted hover:bg-primary/5"
                  )}>
                  <WindowsFolderIcon className="w-3.5 h-3.5" /> {f.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMoveModal(false)}>Cancel</Button>
              <Button onClick={moveFiles}>Move</Button>
            </div>
          </div>
        </div>
      )}

      {/* Optimize Modal */}
      {cropFile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCropFile(null)}>
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-2">Optimize Image</h3>
            <p className="text-sm text-muted mb-4">
              This will resize to max 1200px, compress to JPEG quality 80, and re-upload.
            </p>
            {cropFile.url && (
              <div className="relative h-48 rounded-lg overflow-hidden bg-primary/5 mb-4">
                <Image src={cropFile.url} alt={cropFile.name} fill className="object-contain" />
              </div>
            )}
            <p className="text-xs text-muted mb-1">
              Current: {formatSize(cropFile.file_size)}
              {cropFile.width && cropFile.height && ` · ${cropFile.width}×${cropFile.height}`}
            </p>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setCropFile(null)}>Cancel</Button>
              <Button onClick={handleCrop} disabled={optimizing}>
                {optimizing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Optimizing...</> : "Optimize"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        open={!!deletingFolder}
        onClose={() => setDeletingFolder(null)}
        title="Delete Folder"
        message={deletingFolder ? `Delete folder "${deletingFolder.name}" and all its contents?` : ""}
        onConfirm={confirmDeleteFolder}
      />
      <DeleteModal
        open={deletingFiles}
        onClose={() => setDeletingFiles(false)}
        title="Delete Files"
        message={`Delete ${selected.size} file${selected.size > 1 ? "s" : ""}?`}
        onConfirm={confirmDeleteFiles}
        loading={deletingLoading}
      />
      <Modal
        open={!!orphanData && orphanData.count > 0}
        onClose={() => !orphanDeleting && setOrphanData(null)}
        title="Orphaned Files Found"
        maxWidth="max-w-2xl"
      >
        {orphanData && (
          <>
            <p className="text-sm text-muted mb-3">
              {orphanData.count} file{orphanData.count > 1 ? "s" : ""} in storage {orphanData.count > 1 ? "are" : "is"} not tracked in the database.
              {orphanData.count > 0 && " These can be safely deleted."}
            </p>
            <div className="max-h-60 overflow-y-auto border border-primary/5 rounded-lg divide-y divide-primary/5 mb-4">
              {orphanData.orphans.map((o) => (
                <div key={o.path} className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted">
                  <Trash2 className="w-3 h-3 shrink-0 text-red-400" />
                  <span className="truncate flex-1">{o.path}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOrphanData(null)} disabled={orphanDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteOrphans} disabled={orphanDeleting}>
                {orphanDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : `Delete ${orphanData.count} file${orphanData.count > 1 ? "s" : ""}`}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
