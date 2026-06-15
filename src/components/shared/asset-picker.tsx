"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Search, ImageIcon, File, FileImage, FileVideo, FileAudio,
  Check, Loader2, Home, ChevronRight, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WindowsFolderIcon } from "@/components/shared/windows-folder-icon";
import type { MediaFile, MediaFolder } from "@/types/media";

interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  filterMime?: string;
  multiple?: boolean;
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return FileImage;
  if (mime.startsWith("video/")) return FileVideo;
  if (mime.startsWith("audio/")) return FileAudio;
  return File;
}

export function AssetPicker({ open, onClose, onSelect, filterMime, multiple }: AssetPickerProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<MediaFolder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [folderRes, mediaRes] = await Promise.all([
        fetch("/api/media/folders"),
        fetch(`/api/media?${new URLSearchParams({
          ...(currentFolderId ? { folder_id: currentFolderId } : { folder_id: "root" }),
          ...(search ? { search } : {}),
          ...(filterMime ? { mime_type: filterMime } : {}),
        })}`),
      ]);
      setFolders(await folderRes.json());
      setMedia(await mediaRes.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, search, filterMime]);

  useEffect(() => { if (open) { fetchData(); setSelected(new Set()); setSelectedFiles([]); } }, [open, fetchData]);

  useEffect(() => {
    if (!currentFolderId) { setFolderPath([]); return; }
    const path: MediaFolder[] = [];
    let current = folders.find((f) => f.id === currentFolderId);
    while (current) {
      path.unshift(current);
      const pid = current.parent_id;
      current = pid ? folders.find((f) => f.id === pid) ?? undefined : undefined;
    }
    setFolderPath(path);
  }, [currentFolderId, folders]);

  const currentFolders = folders.filter((f) => f.parent_id === currentFolderId);

  function toggleSelect(file: MediaFile) {
    if (multiple) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(file.id)) next.delete(file.id); else next.add(file.id);
        return next;
      });
      setSelectedFiles((prev) => {
        const exists = prev.find((f) => f.id === file.id);
        if (exists) return prev.filter((f) => f.id !== file.id);
        return [...prev, file];
      });
    } else {
      onSelect(file);
      onClose();
    }
  }

  function handleConfirm() {
    if (multiple) {
      selectedFiles.forEach((f) => onSelect(f));
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-elevated overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/5">
          <h3 className="text-lg font-bold text-primary">Select Media</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary/5 text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Breadcrumb + Search */}
        <div className="p-4 pb-0 space-y-3">
          <div className="flex items-center gap-1 text-xs flex-wrap">
            <button onClick={() => setCurrentFolderId(null)} className="flex items-center gap-1 text-muted hover:text-primary">
              <Home className="w-3 h-3" /> Root
            </button>
            {folderPath.map((f) => (
              <span key={f.id} className="flex items-center gap-1 text-muted">
                <ChevronRight className="w-2.5 h-2.5" />
                <button onClick={() => setCurrentFolderId(f.id)} className="hover:text-primary">{f.name}</button>
              </span>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 text-sm" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-primary/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {currentFolders.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-2">Folders</p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {currentFolders.map((folder) => (
                      <button key={folder.id} onClick={() => { setCurrentFolderId(folder.id); setSearch(""); }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-primary/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all"
                      >
                        <WindowsFolderIcon open className="w-6 h-6" />
                        <span className="text-[10px] font-medium text-primary text-center truncate w-full">{folder.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {media.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {media.map((file) => {
                    const isSelected = selected.has(file.id);
                    const Icon = fileIcon(file.mime_type);
                    return (
                      <button key={file.id} onClick={() => toggleSelect(file)}
                        className={cn(
                          "relative rounded-lg overflow-hidden border transition-all text-left group",
                          isSelected ? "border-primary ring-2 ring-primary/20" : "border-primary/5 hover:border-primary/20"
                        )}
                      >
                        <div className="aspect-square bg-primary/[0.02] flex items-center justify-center">
                          {file.mime_type.startsWith("image/") ? (
                            <Image src={file.url} alt={file.alt_text || file.name}
                              width={150} height={150} className="w-full h-full object-cover" unoptimized />
                          ) : (
                            <Icon className="w-6 h-6 text-muted" />
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="p-1.5">
                          <p className="text-[10px] font-medium text-primary truncate">{file.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentFolders.length === 0 && media.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-sm text-muted">No media found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-primary/5 flex items-center justify-between">
          <span className="text-xs text-muted">
            {multiple && selectedFiles.length > 0 ? `${selectedFiles.length} selected` : "Click to select"}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            {multiple && (
              <Button size="sm" onClick={handleConfirm} disabled={selectedFiles.length === 0}>
                Insert {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
