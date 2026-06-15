"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pin, PinOff, Trash2, Palette, Tag,
  StickyNote, X, Loader2, Clock, Hash, Check,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatShortDate } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const NOTE_COLORS = [
  "#FFFFFF", "#FEF3C7", "#FED7AA", "#FECACA",
  "#FDE68A", "#D9F99D", "#A7F3D0", "#99F6E4",
  "#BFDBFE", "#C7D2FE", "#DDD6FE", "#FBCFE8",
];

const MAX_TAG_SUGGESTIONS = 8;

function getWordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function getCharCount(text: string) {
  return text.length;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState("");
  const [formColor, setFormColor] = useState("#FFFFFF");
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (activeTag) params.set("tag", activeTag);
      const res = await fetch(`/api/notes?${params}`);
      if (!res.ok) throw new Error("Failed to load notes");
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [search, activeTag]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const allTags = [...new Set(notes.flatMap((n) => n.tags))].slice(0, MAX_TAG_SUGGESTIONS);

  function resetForm() {
    setFormTitle("");
    setFormContent("");
    setFormTags([]);
    setFormTagInput("");
    setFormColor("#FFFFFF");
    setEditNote(null);
  }

  function openCompose() {
    resetForm();
    setComposing(true);
  }

  function openEdit(note: Note) {
    setEditNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormTags([...note.tags]);
    setFormTagInput("");
    setFormColor(note.color);
    setComposing(true);
  }

  function addTag() {
    const t = formTagInput.trim().toLowerCase();
    if (t && !formTags.includes(t)) {
      setFormTags([...formTags, t]);
    }
    setFormTagInput("");
  }

  function removeTag(t: string) {
    setFormTags(formTags.filter((x) => x !== t));
  }

  async function handleSave() {
    if (!formTitle.trim() && !formContent.trim()) {
      toast.error("Add a title or some content");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: formTitle.trim(),
        content: formContent.trim(),
        tags: formTags,
        color: formColor,
      };

      let res;
      if (editNote) {
        res = await fetch(`/api/notes/${editNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast.success(editNote ? "Note updated" : "Note created");
      setComposing(false);
      resetForm();
      fetchNotes();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePin(note: Note) {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: !note.is_pinned }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(note.is_pinned ? "Unpinned" : "Pinned");
      fetchNotes();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Note deleted");
      fetchNotes();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const unpinnedNotes = notes.filter((n) => !n.is_pinned);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Notes</h1>
          <p className="text-sm text-muted">Capture and organize your thoughts.</p>
        </div>
        <Button size="sm" onClick={openCompose}>
          <Plus className="w-4 h-4 mr-2" /> New Note
        </Button>
      </div>

      {/* Search + Tag Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input placeholder="Search notes..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Hash className="w-3.5 h-3.5 text-muted shrink-0" />
            <button onClick={() => setActiveTag("")}
              className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                !activeTag ? "bg-primary text-white" : "bg-primary/5 text-muted hover:bg-primary/10"
              )}>All</button>
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all capitalize",
                  activeTag === tag ? "bg-primary text-white" : "bg-primary/5 text-muted hover:bg-primary/10"
                )}>#{tag}</button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-primary/5 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
            <StickyNote className="w-8 h-8 text-muted" />
          </div>
          <p className="text-muted text-sm mb-1">{search || activeTag ? "No notes match your search" : "No notes yet"}</p>
          <p className="text-xs text-muted/60 mb-4">
            {search || activeTag ? "Try a different search or filter" : "Click New Note to create your first one"}
          </p>
          {!search && !activeTag && (
            <Button size="sm" onClick={openCompose}>
              <Plus className="w-4 h-4 mr-2" /> Create Note
            </Button>
          )}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {pinnedNotes.length > 0 && (
            <div className="break-inside-avoid mb-1">
              <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                <Pin className="w-3 h-3" /> Pinned ({pinnedNotes.length})
              </div>
            </div>
          )}
          {pinnedNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={openEdit} onPin={handlePin} onDelete={handleDelete} />
          ))}
          {unpinnedNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={openEdit} onPin={handlePin} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Compose / Edit Modal */}
      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 md:pt-24 overflow-y-auto"
            onClick={() => { if (!saving) setComposing(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-elevated overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-primary">
                    {editNote ? "Edit Note" : "New Note"}
                  </h3>
                  <button onClick={() => { if (!saving) { setComposing(false); resetForm(); } }}
                    className="p-1.5 rounded-lg hover:bg-primary/5 text-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <Input placeholder="Title" value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 placeholder:text-muted/40" />

                {/* Content */}
                <Textarea placeholder="Start writing..." value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8} className="border-0 px-0 focus-visible:ring-0 resize-none placeholder:text-muted/40" />

                {/* Word/Char Count */}
                <div className="flex items-center gap-3 text-[11px] text-muted">
                  <span>{getWordCount(formContent)} words</span>
                  <span>{getCharCount(formContent)} characters</span>
                  {formTitle && <span>{Math.ceil(getWordCount(formContent) * 0.3 + getWordCount(formTitle) * 0.5)} min read</span>}
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Tags</label>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {formTags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                        #{t}
                        <button onClick={() => removeTag(t)} className="hover:text-red-500 ml-0.5"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add a tag..." value={formTagInput}
                      onChange={(e) => setFormTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      className="text-xs h-8 flex-1" />
                    <Button size="sm" variant="outline" onClick={addTag} disabled={!formTagInput.trim()}>
                      <Tag className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="text-xs font-medium text-muted block mb-1.5">Color</label>
                  <div className="flex items-center gap-2">
                    {NOTE_COLORS.map((c) => (
                      <button key={c} onClick={() => setFormColor(c)}
                        className={cn("w-7 h-7 rounded-lg border-2 transition-all",
                          formColor === c ? "border-primary scale-110" : "border-transparent hover:scale-110"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <div className="w-7 h-7 rounded-lg overflow-hidden border">
                      <input type="color" value={formColor}
                        onChange={(e) => setFormColor(e.target.value)}
                        className="w-8 h-8 -m-0.5 cursor-pointer border-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-4 bg-primary/[0.02] border-t border-primary/5">
                <span className="text-[11px] text-muted">
                  {editNote ? `Last edited ${formatShortDate(editNote.updated_at)}` : "New note"}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setComposing(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...</> : (editNote ? "Update" : "Create")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoteCard({ note, onEdit, onPin, onDelete }: {
  note: Note;
  onEdit: (n: Note) => void;
  onPin: (n: Note) => void;
  onDelete: (id: string) => void;
}) {
  const hasColor = note.color !== "#FFFFFF";

  return (
    <motion.div layout className="break-inside-avoid">
      <div
        onClick={() => onEdit(note)}
        className={cn(
          "group relative rounded-2xl border cursor-pointer transition-all hover:shadow-md",
          hasColor ? "border-transparent" : "border-primary/5 hover:border-primary/20"
        )}
        style={{ backgroundColor: note.color }}
      >
        {/* Pin badge */}
        {note.is_pinned && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <span className="text-[10px] text-primary/40"><Pin className="w-3 h-3 inline" /> Pinned</span>
          </div>
        )}

        <div className="p-4">
          {/* Title */}
          {note.title && (
            <h3 className="text-sm font-semibold text-primary mb-1.5 leading-snug pr-6">{note.title}</h3>
          )}

          {/* Content preview */}
          {note.content && (
            <p className={cn("text-xs leading-relaxed whitespace-pre-wrap",
              hasColor ? "text-primary/80" : "text-muted"
            )}>
              {note.content.length > 300 ? note.content.slice(0, 300) + "..." : note.content}
            </p>
          )}

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-3">
              {note.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-medium text-primary capitalize">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-primary/5">
            <span className="text-[10px] text-muted flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {formatShortDate(note.updated_at)}
            </span>
          </div>
        </div>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onPin(note); }}
            className="w-7 h-7 rounded-lg bg-white/90 shadow-sm border border-primary/5 flex items-center justify-center text-muted hover:text-primary transition-colors">
            {note.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="w-7 h-7 rounded-lg bg-white/90 shadow-sm border border-primary/5 flex items-center justify-center text-muted hover:text-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
