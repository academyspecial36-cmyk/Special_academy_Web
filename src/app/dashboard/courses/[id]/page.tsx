"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Plus, Pencil, Trash2, EyeOff,
  Lock, Unlock, Video, FileText, Play,
  Image as ImageIcon, Upload, Loader2, X,
  FolderOpen, Search, LayoutGrid, List,
  BookOpen, ChevronRight, GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Modal } from "@/components/ui/modal";
import { PreviewModal } from "@/components/ui/preview-modal";
import { AssetPicker } from "@/components/shared/asset-picker";
import { useAppContext } from "@/lib/app-context";
import { useBreadcrumbs } from "@/lib/breadcrumb-context";
import { formatShortDate } from "@/lib/utils";
import { apiUpload, apiUploadMultiple } from "@/lib/api-client";

interface SubcategoryForm {
  id: string;
  title: string;
  thumbnail: string;
  shortDescription: string;
  status: "paid" | "free";
  hidden: boolean;
}

interface ItemFormState {
  id?: string;
  subcategoryId: string;
  type: "video" | "pdf" | "image";
  title: string;
  description: string;
  url: string;
  images: string[];
  duration: string;
  status: "paid" | "free";
  hidden: boolean;
}

function defaultItemForm(subcategoryId: string): ItemFormState {
  return { subcategoryId, type: "video", title: "", description: "", url: "", images: [], duration: "", status: "free", hidden: false };
}

function SubcategoryModal({ open, onClose, onSubmit, initialValues }: {
  open: boolean; onClose: () => void;
  onSubmit: (data: { title: string; shortDescription: string; thumbnail: string; status: "paid" | "free"; hidden: boolean }) => void;
  initialValues?: SubcategoryForm | null;
}) {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [status, setStatus] = useState<"paid" | "free">("free");
  const [hidden, setHidden] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setTitle(initialValues.title); setShortDescription(initialValues.shortDescription);
        setThumbnail(initialValues.thumbnail); setStatus(initialValues.status); setHidden(initialValues.hidden);
      } else {
        setTitle(""); setShortDescription(""); setThumbnail(""); setStatus("free"); setHidden(false);
      }
    }
  }, [open, initialValues]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!shortDescription.trim()) { toast.error("Short description is required"); return; }
    onSubmit({ title: title.trim(), shortDescription: shortDescription.trim(), thumbnail, status, hidden });
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbUploading(true);
    try {
      const { url } = await apiUpload(file, "images");
      setThumbnail(url);
    } catch {
      toast.error("Failed to upload thumbnail");
    } finally {
      setThumbUploading(false);
      if (thumbFileRef.current) thumbFileRef.current.value = "";
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initialValues ? "Edit Subcategory" : "Add Subcategory"} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input ref={thumbFileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
        <div>
          <label className="text-sm font-medium text-primary mb-1 block">Title <span className="text-red-500">*</span></label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. General Knowledge" />
        </div>
        <div>
          <label className="text-sm font-medium text-primary mb-1 block">Short Description <span className="text-red-500">*</span></label>
          <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} placeholder="Brief description of this subcategory" />
        </div>
        <div>
          <label className="text-sm font-medium text-primary mb-1 block">Thumbnail</label>
          <div className="flex items-center gap-2">
            <Input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://..." className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={() => thumbFileRef.current?.click()} disabled={thumbUploading}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> {thumbUploading ? "Uploading..." : "Upload"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setAssetPickerOpen(true)}>
              <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Media
            </Button>
          </div>
          {thumbnail && (
            <div className="mt-2 relative w-full h-28 rounded-lg overflow-hidden bg-accent">
              <Image src={thumbnail} alt="Thumbnail preview" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as "paid" | "free")}
              className="flex h-10 w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30 focus:ring-0">
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Visibility</label>
            <select value={hidden ? "true" : "false"} onChange={(e) => setHidden(e.target.value === "true")}
              className="flex h-10 w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30 focus:ring-0">
              <option value="false">Visible</option>
              <option value="true">Hidden</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initialValues ? "Update Subcategory" : "Add Subcategory"}</Button>
        </div>
      </form>
      <AssetPicker open={assetPickerOpen} onClose={() => setAssetPickerOpen(false)} onSelect={(file) => { setThumbnail(file.url); setAssetPickerOpen(false); }} filterMime="image/" />
    </Modal>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { courses, subcategories, addSubcategory, updateSubcategory, deleteSubcategory, addItem, updateItem, deleteItem } = useAppContext();
  const course = courses.find((c) => c.id === courseId);
  const courseSubs = subcategories.filter((s) => s.courseId === courseId);
  const { setSegments } = useBreadcrumbs();

  useEffect(() => {
    setSegments([
      { label: "Courses", href: "/dashboard/courses" },
      { label: course?.title ?? "Course" },
    ]);
    return () => setSegments([]);
  }, [course?.title, setSegments]);

  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [subAddOpen, setSubAddOpen] = useState(false);
  const [subEditOpen, setSubEditOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubcategoryForm | null>(null);
  const [subDeleteOpen, setSubDeleteOpen] = useState(false);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState<ItemFormState>(defaultItemForm(""));
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDeleteOpen, setItemDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemFormState | null>(null);
  const [uploading, setUploading] = useState(false);

  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const imageFilesRef = useRef<HTMLInputElement>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: "video" | "pdf" | "image"; title: string; url: string; images?: string[] } | null>(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [itemView, setItemView] = useState<"list" | "grid">("list");

  useEffect(() => {
    return () => { pendingImagePreviews.forEach((p) => URL.revokeObjectURL(p)); };
  }, [pendingImagePreviews]);

  useEffect(() => {
    if (courseSubs.length > 0 && !activeSubId) setActiveSubId(courseSubs[0].id);
  }, [courseSubs, activeSubId]);

  const activeSub = useMemo(
    () => courseSubs.find((s) => s.id === activeSubId),
    [courseSubs, activeSubId]
  );

  const activeItems = useMemo(() => {
    if (!activeSub) return [];
    const items = activeSub.items || [];
    const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (!itemSearch.trim()) return sorted;
    const q = itemSearch.toLowerCase();
    return sorted.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }, [activeSub, itemSearch]);

  const isNewItem = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  };

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-primary mb-2">Course not found</h2>
        <Button variant="outline" asChild>
          <Link href="/dashboard/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  function handleAddSub(data: { title: string; shortDescription: string; thumbnail: string; status: "paid" | "free"; hidden: boolean }) {
    addSubcategory({ courseId, ...data });
    setSubAddOpen(false);
    toast.success("Subcategory added successfully");
  }

  function handleEditSub(data: { title: string; shortDescription: string; thumbnail: string; status: "paid" | "free"; hidden: boolean }) {
    if (!selectedSub) return;
    updateSubcategory(selectedSub.id, data);
    setSubEditOpen(false); setSelectedSub(null);
    toast.success("Subcategory updated successfully");
  }

  function handleDeleteSub() {
    if (!selectedSub) return;
    deleteSubcategory(selectedSub.id);
    if (activeSubId === selectedSub.id) setActiveSubId(null);
    setSubDeleteOpen(false); setSelectedSub(null);
    toast.success("Subcategory deleted successfully");
  }

  function openAddItem(subcategoryId: string) {
    setItemForm(defaultItemForm(subcategoryId));
    setEditingItemId(null);
    setPendingImageFiles([]); setPendingImagePreviews([]); setPendingPdfFile(null);
    setItemModalOpen(true);
  }

  function openEditItem(item: ItemFormState) {
    setItemForm({ ...item });
    setEditingItemId(item.id ?? null);
    setPendingImageFiles([]); setPendingImagePreviews([]); setPendingPdfFile(null);
    setItemModalOpen(true);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setPendingImageFiles((prev) => [...prev, ...files]);
    setPendingImagePreviews((prev) => [...prev, ...previews]);
    if (imageFilesRef.current) imageFilesRef.current.value = "";
  }

  function removePendingImage(index: number) {
    setPendingImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingImagePreviews((prev) => { URL.revokeObjectURL(prev[index]); return prev.filter((_, i) => i !== index); });
  }

  function handlePdfSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPdfFile(file);
    if (pdfFileRef.current) pdfFileRef.current.value = "";
  }

  async function handleSaveItem() {
    if (!itemForm.title.trim()) { toast.error("Title is required"); return; }
    if (itemForm.type === "video" && !itemForm.url.trim()) { toast.error("Video URL is required"); return; }
    setUploading(true);
    try {
      let url = itemForm.url;
      let images = itemForm.images;
      if (pendingImageFiles.length > 0) {
        const { urls } = await apiUploadMultiple(pendingImageFiles, "images");
        images = [...images, ...urls];
        if (!url) url = urls[0];
      }
      if (itemForm.type === "image" && images.length === 0) { toast.error("Please select at least one image"); setUploading(false); return; }
      if (pendingPdfFile) { const { url: pdfUrl } = await apiUpload(pendingPdfFile, "pdfs"); url = pdfUrl; }
      const payload = { subcategoryId: itemForm.subcategoryId, type: itemForm.type, title: itemForm.title, description: itemForm.description, url, images: images.length > 0 ? images : undefined, duration: itemForm.duration || undefined, status: itemForm.status, hidden: itemForm.hidden } as Record<string, unknown>;
      if (editingItemId) { updateItem(itemForm.subcategoryId, editingItemId, payload); toast.success("Item updated successfully"); }
      else { addItem(itemForm.subcategoryId, payload as any); toast.success("Item added successfully"); }
      setItemModalOpen(false);
    } catch { toast.error("Failed to save item"); }
    finally { setUploading(false); }
  }

  function handleDeleteItem() {
    if (!selectedItem || !selectedItem.subcategoryId) return;
    deleteItem(selectedItem.subcategoryId, selectedItem.id!);
    setItemDeleteOpen(false); setSelectedItem(null);
    toast.success("Item deleted successfully");
  }

  const itemTypeIcon = (type: string) => {
    if (type === "video") return <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    if (type === "image") return <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    return <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
  };

  const itemTypeColor = (type: string) => {
    if (type === "video") return "bg-blue-50 text-blue-600";
    if (type === "image") return "bg-purple-50 text-purple-600";
    return "bg-amber-50 text-amber-600";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/courses"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">{course.title}</h1>
            <p className="text-sm text-muted">{course.category} · {course.duration} · {course.qualification}</p>
          </div>
        </div>
      </div>

      {courseSubs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-6 h-6 text-muted" />
          </div>
          <h3 className="font-semibold text-primary mb-1">No subcategories yet</h3>
          <p className="text-sm text-muted mb-4">Add subjects like GK, Nepali, English, IQ to this course.</p>
          <Button size="sm" onClick={() => setSubAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add First Subcategory
          </Button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
          {/* Mobile subcategory selector */}
          <div className="lg:hidden">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Chapter</label>
            <div className="flex gap-2">
              <select
                value={activeSubId || ""}
                onChange={(e) => setActiveSubId(e.target.value)}
                className="flex-1 h-10 rounded-xl border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30"
              >
                {courseSubs.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title} ({(sub.items || []).length} items)
                  </option>
                ))}
              </select>
              <Button size="sm" variant="outline" className="h-10 shrink-0" onClick={() => setSubAddOpen(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar — Subcategory List */}
          <div className="hidden lg:flex w-64 shrink-0 flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Chapters</span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSubAddOpen(true)}>
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
              {courseSubs.map((sub) => {
                const subItems = sub.items || [];
                const visibleCount = subItems.filter((i) => !i.hidden).length;
                const isActive = activeSubId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubId(sub.id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:bg-accent hover:text-primary"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-primary/5 text-primary"
                    }`}>
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{sub.title}</div>
                      <div className={`text-[10px] mt-0.5 ${isActive ? "text-white/70" : "text-muted"}`}>
                        {visibleCount} visible · {subItems.length - visibleCount > 0 ? `${subItems.length - visibleCount} hidden` : "all visible"}
                      </div>
                    </div>
                    {sub.hidden && <EyeOff className="w-3 h-3 shrink-0 opacity-60" />}
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? "rotate-90" : ""}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content — Items Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeSub ? (
                <motion.div
                  key={activeSub.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {/* Subcategory Header */}
                  <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-primary/[0.02] to-transparent">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        {activeSub.thumbnail ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 relative shadow-sm">
                            <Image src={activeSub.thumbnail} alt={activeSub.title} fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-primary/40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-bold text-primary">{activeSub.title}</h2>
                                {activeSub.hidden && (
                                  <Badge variant="outline" className="text-[9px] text-muted border-dashed">
                                    <EyeOff className="w-2.5 h-2.5 mr-1" /> Hidden
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted mt-0.5">{activeSub.shortDescription}</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <Button size="sm" variant="outline" className="h-8 w-8 sm:w-auto sm:px-3 text-xs"
                                onClick={() => { setSelectedSub({ id: activeSub.id, title: activeSub.title, thumbnail: activeSub.thumbnail, shortDescription: activeSub.shortDescription, status: activeSub.status, hidden: activeSub.hidden }); setSubEditOpen(true); }}>
                                <Pencil className="w-3 h-3 sm:mr-1" /> <span className="hidden sm:inline">Edit</span>
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 w-8 sm:w-auto sm:px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => { setSelectedSub({ id: activeSub.id, title: activeSub.title, thumbnail: activeSub.thumbnail, shortDescription: activeSub.shortDescription, status: activeSub.status, hidden: activeSub.hidden }); setSubDeleteOpen(true); }}>
                                <Trash2 className="w-3 h-3 sm:mr-1" /> <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                            <span>{activeItems.length} item{activeItems.length !== 1 ? "s" : ""}</span>
                            <span className="text-muted/30">·</span>
                            <span>{activeSub.status === "free" ? "Free" : "Paid"}</span>
                            <span className="text-muted/30">·</span>
                            <span>{formatShortDate(activeSub.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-none sm:max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                      <Input
                        placeholder="Search items..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <div className="flex bg-accent rounded-lg p-0.5">
                        <button onClick={() => setItemView("list")} className={`p-1.5 rounded-md transition-colors ${itemView === "list" ? "bg-white shadow-sm text-primary" : "text-muted hover:text-primary"}`}>
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setItemView("grid")} className={`p-1.5 rounded-md transition-colors ${itemView === "grid" ? "bg-white shadow-sm text-primary" : "text-muted hover:text-primary"}`}>
                          <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Button size="sm" className="h-9" onClick={() => openAddItem(activeSub.id)}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                      </Button>
                    </div>
                  </div>

                  {/* Item List/Grid */}
                  {activeItems.length === 0 ? (
                    <div className="text-center py-16 bg-accent/30 rounded-xl border border-dashed border-primary/10">
                      {itemSearch ? (
                        <>
                          <Search className="w-10 h-10 text-muted mx-auto mb-3" />
                          <h3 className="font-semibold text-primary mb-1">No results</h3>
                          <p className="text-sm text-muted">Try a different search term.</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
                            <Plus className="w-5 h-5 text-muted" />
                          </div>
                          <h3 className="font-semibold text-primary mb-1">No items yet</h3>
                          <p className="text-sm text-muted mb-4">Add videos, PDFs, or images to this chapter.</p>
                          <Button size="sm" onClick={() => openAddItem(activeSub.id)}>
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add First Item
                          </Button>
                        </>
                      )}
                    </div>
                  ) : itemView === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {activeItems.map((item) => (
                        <div key={item.id} className={`group relative rounded-xl border overflow-hidden transition-all hover:shadow-md ${item.hidden ? "opacity-60 border-dashed" : "border-primary/5 hover:border-primary/20"}`}>
                          <div className={`aspect-video flex items-center justify-center ${itemTypeColor(item.type)}`}>
                            {item.type === "image" && item.images?.[0] ? (
                              <Image src={item.images[0]} alt={item.title} fill className="object-cover" unoptimized />
                            ) : item.type === "image" && item.url ? (
                              <Image src={item.url} alt={item.title} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                {itemTypeIcon(item.type)}
                                <span className="text-[9px] uppercase font-medium opacity-60">{item.type}</span>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1">
                              <Badge className="text-[8px] uppercase bg-white/90 text-primary border-0">{item.type}</Badge>
                              {isNewItem(item.createdAt) && <Badge className="text-[8px] bg-emerald-500 text-white border-0">New</Badge>}
                            </div>
                            {item.hidden && <Badge className="absolute top-2 right-2 text-[8px] bg-muted text-muted-foreground border-0"><EyeOff className="w-2.5 h-2.5" /></Badge>}
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs font-medium text-primary truncate">{item.title}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant={item.status === "free" ? "secondary" : "default"} className="text-[7px]">{item.status}</Badge>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setPreviewItem({ type: item.type, title: item.title, url: item.url, images: item.images }); setPreviewOpen(true); }}
                              className="w-6 h-6 rounded-md bg-white/90 shadow-sm flex items-center justify-center text-muted hover:text-primary transition-colors">
                              <Play className="w-3 h-3" />
                            </button>
                            <button onClick={() => openEditItem({ id: item.id, subcategoryId: activeSub.id, type: item.type, title: item.title, description: item.description, url: item.url, images: item.images || [], duration: item.duration || "", status: item.status, hidden: item.hidden })}
                              className="w-6 h-6 rounded-md bg-white/90 shadow-sm flex items-center justify-center text-muted hover:text-primary transition-colors">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => { setSelectedItem({ id: item.id, subcategoryId: activeSub.id, type: item.type, title: item.title, description: item.description, url: item.url, images: item.images || [], duration: item.duration || "", status: item.status, hidden: item.hidden }); setItemDeleteOpen(true); }}
                              className="w-6 h-6 rounded-md bg-white/90 shadow-sm flex items-center justify-center text-muted hover:text-red-600 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {activeItems.map((item) => (
                        <div key={item.id} className={`group flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${item.hidden ? "opacity-60 border-dashed border-primary/10" : "border-primary/5 hover:border-primary/20 hover:bg-primary/[0.02]"}`}>
                          <button
                            onClick={() => { setPreviewItem({ type: item.type, title: item.title, url: item.url, images: item.images }); setPreviewOpen(true); }}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${itemTypeColor(item.type)}`}
                          >
                            {itemTypeIcon(item.type)}
                          </button>
                          {item.type === "image" && (item.images?.[0] || item.url) && (
                            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 relative hidden sm:block">
                              <Image src={item.images?.[0] || item.url} alt="" fill className="object-cover" unoptimized />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="text-sm font-medium text-primary truncate">{item.title}</span>
                              <Badge variant="outline" className="text-[8px] uppercase shrink-0 leading-none px-1.5 py-0.5">{item.type}</Badge>
                              {item.images && item.images.length > 1 && (
                                <Badge variant="secondary" className="text-[8px] shrink-0 leading-none px-1.5 py-0.5">{item.images.length} photos</Badge>
                              )}
                              <Badge variant={item.status === "free" ? "secondary" : "default"} className="text-[8px] shrink-0 leading-none px-1.5 py-0.5 capitalize">{item.status}</Badge>
                              {isNewItem(item.createdAt) && <Badge variant="default" className="text-[8px] shrink-0 leading-none px-1.5 py-0.5 bg-emerald-500">New</Badge>}
                              {item.hidden && <Badge variant="outline" className="text-[8px] shrink-0 leading-none px-1.5 py-0.5 border-dashed"><EyeOff className="w-2 h-2 mr-0.5" /> Hidden</Badge>}
                            </div>
                            <p className="text-xs text-muted truncate mt-0.5">{item.description || item.url}</p>
                          </div>
                          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditItem({ id: item.id, subcategoryId: activeSub.id, type: item.type, title: item.title, description: item.description, url: item.url, images: item.images || [], duration: item.duration || "", status: item.status, hidden: item.hidden })}
                              className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { setSelectedItem({ id: item.id, subcategoryId: activeSub.id, type: item.type, title: item.title, description: item.description, url: item.url, images: item.images || [], duration: item.duration || "", status: item.status, hidden: item.hidden }); setItemDeleteOpen(true); }}
                              className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
                  <h3 className="font-semibold text-primary mb-1">Select a chapter</h3>
                  <p className="text-sm text-muted">Choose a subcategory from the sidebar to view and manage its items.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <SubcategoryModal open={subAddOpen} onClose={() => setSubAddOpen(false)} onSubmit={handleAddSub} />
      <SubcategoryModal open={subEditOpen} onClose={() => { setSubEditOpen(false); setSelectedSub(null); }} onSubmit={handleEditSub} initialValues={selectedSub} />

      <DeleteModal open={subDeleteOpen} onClose={() => { setSubDeleteOpen(false); setSelectedSub(null); }} onConfirm={handleDeleteSub}
        title="Delete Subcategory?" message={`Are you sure you want to delete "${selectedSub?.title}"? All items inside will also be removed.`} />

      <Modal open={itemModalOpen} onClose={() => setItemModalOpen(false)} title={editingItemId ? "Edit Item" : "Add Item"} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {(["video", "pdf", "image"] as const).map((t) => (
              <button key={t} type="button" onClick={() => { setItemForm((prev) => ({ ...prev, type: t })); setPendingImageFiles([]); setPendingImagePreviews([]); setPendingPdfFile(null); }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                  itemForm.type === t
                    ? t === "video" ? "bg-blue-50 border-blue-200 text-blue-700" : t === "image" ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-white border-primary/10 text-muted hover:border-primary/30"
                }`}
              >
                {t === "video" ? <Play className="w-5 h-5" /> : t === "image" ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                <span className="text-[10px] uppercase">{t}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Title <span className="text-red-500">*</span></label>
            <Input value={itemForm.title} onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. GK Chapter 1 - Introduction" />
          </div>

          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Description</label>
            <Textarea value={itemForm.description} onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} placeholder="Brief description of this item" />
          </div>

          {itemForm.type === "video" && (
            <>
              <div>
                <label className="text-sm font-medium text-primary mb-1 block">Video URL <span className="text-red-500">*</span></label>
                <Input value={itemForm.url} onChange={(e) => setItemForm((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://youtube.com/watch?v=... or https://..." />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1 block">Duration</label>
                <Input value={itemForm.duration} onChange={(e) => setItemForm((prev) => ({ ...prev, duration: e.target.value }))} placeholder="e.g. 15:30" />
              </div>
            </>
          )}

          {itemForm.type === "pdf" && (
            <div>
              <label className="text-sm font-medium text-primary mb-1 block">PDF File</label>
              <input ref={pdfFileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfSelect} />
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => pdfFileRef.current?.click()} disabled={uploading}>
                  <Upload className="w-3.5 h-3.5 mr-2" /> Select PDF
                </Button>
                {pendingPdfFile && <span className="text-xs text-muted truncate flex-1">{pendingPdfFile.name}</span>}
              </div>
              <div className="mt-2">
                <label className="text-sm font-medium text-primary mb-1 block">Or enter PDF URL</label>
                <Input value={itemForm.url} onChange={(e) => setItemForm((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
          )}

          {itemForm.type === "image" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-primary">Images</label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => imageFilesRef.current?.click()} disabled={uploading}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Files
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setAssetPickerOpen(true)}>
                    <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> From Media
                  </Button>
                </div>
              </div>
              <input ref={imageFilesRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              <div className="mt-2">
                <label className="text-sm font-medium text-primary mb-1 block">Or paste image URL</label>
                <Input value={itemForm.url} onChange={(e) => setItemForm((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://..." />
              </div>

              {pendingImagePreviews.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted mb-1.5">New uploads:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {pendingImagePreviews.map((preview, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-accent group">
                        <Image src={preview} alt={`Preview ${i + 1}`} fill className="object-cover" unoptimized />
                        <button onClick={() => removePendingImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {itemForm.images.filter((img) => !img.startsWith("blob:")).length > 0 && (
                <div>
                  <p className="text-[10px] text-muted mb-1.5">Saved images:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {itemForm.images.filter((img) => !img.startsWith("blob:")).map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-accent group">
                        <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                        <button onClick={() => setItemForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-primary mb-1 block">Status</label>
              <select value={itemForm.status} onChange={(e) => setItemForm((prev) => ({ ...prev, status: e.target.value as "paid" | "free" }))}
                className="flex h-10 w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30 focus:ring-0">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-primary mb-1 block">Visibility</label>
              <select value={itemForm.hidden ? "true" : "false"} onChange={(e) => setItemForm((prev) => ({ ...prev, hidden: e.target.value === "true" }))}
                className="flex h-10 w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30 focus:ring-0">
                <option value="false">Visible</option>
                <option value="true">Hidden</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setItemModalOpen(false)} disabled={uploading}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={uploading}>
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading & Saving...</> : editingItemId ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </div>
      </Modal>

      <DeleteModal open={itemDeleteOpen} onClose={() => { setItemDeleteOpen(false); setSelectedItem(null); }} onConfirm={handleDeleteItem}
        title="Delete Item?" message={`Are you sure you want to delete "${selectedItem?.title}"?`} />

      <AssetPicker open={assetPickerOpen} onClose={() => setAssetPickerOpen(false)}
        onSelect={(file) => { setItemForm((prev) => { if (prev.type === "image") return { ...prev, url: prev.url || file.url, images: [...prev.images.filter((img) => !img.startsWith("blob:")), file.url] }; return { ...prev, url: file.url }; }); }}
        filterMime={itemForm.type === "image" ? "image/" : undefined} multiple={itemForm.type === "image"} />

      <PreviewModal open={previewOpen} onClose={() => { setPreviewOpen(false); setPreviewItem(null); }}
        type={previewItem?.type || "video"} title={previewItem?.title || ""} url={previewItem?.url || ""} images={previewItem?.images} />
    </div>
  );
}
