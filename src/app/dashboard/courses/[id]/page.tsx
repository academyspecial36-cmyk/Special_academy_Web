"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff,
  Lock, Unlock, Video, FileText, Play, ChevronUp,
  ChevronDown, Image as ImageIcon, Upload, Loader2, X
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { Modal } from "@/components/ui/modal";
import { PreviewModal } from "@/components/ui/preview-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/lib/app-context";
import { formatShortDate } from "@/lib/utils";
import { apiUpload, apiUploadMultiple } from "@/lib/api-client";

const subFields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. General Knowledge" },
  { name: "shortDescription", label: "Short Description", type: "textarea", required: true, placeholder: "Brief description of this subcategory" },
  { name: "thumbnail", label: "Thumbnail", type: "image" as const, placeholder: "https://..." },
  { name: "status", label: "Status", type: "select", required: true, options: [
    { label: "Free", value: "free" },
    { label: "Paid", value: "paid" },
  ]},
  { name: "hidden", label: "Visibility", type: "select", required: true, options: [
    { label: "Visible", value: "false" },
    { label: "Hidden", value: "true" },
  ]},
];

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
  return {
    subcategoryId,
    type: "video",
    title: "",
    description: "",
    url: "",
    images: [],
    duration: "",
    status: "free",
    hidden: false,
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const {
    courses,
    subcategories,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    addItem,
    updateItem,
    deleteItem,
  } = useAppContext();

  const course = courses.find((c) => c.id === courseId);
  const courseSubs = subcategories.filter((s) => s.courseId === courseId);

  // Subcategory modals
  const [subAddOpen, setSubAddOpen] = useState(false);
  const [subEditOpen, setSubEditOpen] = useState(false);
  const [subDeleteOpen, setSubDeleteOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubcategoryForm | null>(null);

  // Item modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState<ItemFormState>(defaultItemForm(""));
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDeleteOpen, setItemDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemFormState | null>(null);
  const [uploading, setUploading] = useState(false);

  // Pending file uploads (not yet saved to bucket)
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);

  const pdfFileRef = useRef<HTMLInputElement>(null);
  const imageFilesRef = useRef<HTMLInputElement>(null);

  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: "video" | "pdf" | "image"; title: string; url: string; images?: string[] } | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      pendingImagePreviews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [pendingImagePreviews]);

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

  // Subcategory handlers
  function handleAddSub(data: Record<string, string>) {
    addSubcategory({
      courseId,
      title: data.title,
      shortDescription: data.shortDescription,
      thumbnail: data.thumbnail || "",
      status: data.status as "paid" | "free",
      hidden: data.hidden === "true",
    });
    setSubAddOpen(false);
    toast.success("Subcategory added successfully");
  }

  function handleEditSub(data: Record<string, string>) {
    if (!selectedSub) return;
    updateSubcategory(selectedSub.id, {
      title: data.title,
      shortDescription: data.shortDescription,
      thumbnail: data.thumbnail || "",
      status: data.status as "paid" | "free",
      hidden: data.hidden === "true",
    });
    setSubEditOpen(false);
    setSelectedSub(null);
    toast.success("Subcategory updated successfully");
  }

  function handleDeleteSub() {
    if (!selectedSub) return;
    deleteSubcategory(selectedSub.id);
    setSubDeleteOpen(false);
    setSelectedSub(null);
    toast.success("Subcategory deleted successfully");
  }

  // Item handlers
  function openAddItem(subcategoryId: string) {
    setItemForm(defaultItemForm(subcategoryId));
    setEditingItemId(null);
    setPendingImageFiles([]);
    setPendingImagePreviews([]);
    setPendingPdfFile(null);
    setItemModalOpen(true);
  }

  function openEditItem(item: ItemFormState) {
    setItemForm({ ...item });
    setEditingItemId(item.id ?? null);
    setPendingImageFiles([]);
    setPendingImagePreviews([]);
    setPendingPdfFile(null);
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
    setPendingImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handlePdfSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPdfFile(file);
    if (pdfFileRef.current) pdfFileRef.current.value = "";
  }

  async function handleSaveItem() {
    if (!itemForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (itemForm.type === "video" && !itemForm.url.trim()) {
      toast.error("Video URL is required");
      return;
    }

    setUploading(true);
    try {
      let url = itemForm.url;
      let images = itemForm.images;

      // Upload pending files on save
      if (pendingImageFiles.length > 0) {
        const { urls } = await apiUploadMultiple(pendingImageFiles, "images");
        images = [...images, ...urls];
        if (!url) url = urls[0];
      }

      if (itemForm.type === "image" && images.length === 0) {
        toast.error("Please select at least one image");
        setUploading(false);
        return;
      }

      if (pendingPdfFile) {
        const { url: pdfUrl } = await apiUpload(pendingPdfFile, "pdfs");
        url = pdfUrl;
      }

      const payload = {
        subcategoryId: itemForm.subcategoryId,
        type: itemForm.type,
        title: itemForm.title,
        description: itemForm.description,
        url,
        images: images.length > 0 ? images : undefined,
        duration: itemForm.duration || undefined,
        status: itemForm.status,
        hidden: itemForm.hidden,
      } as Record<string, unknown>;

      if (editingItemId) {
        updateItem(itemForm.subcategoryId, editingItemId, payload);
        toast.success("Item updated successfully");
      } else {
        addItem(itemForm.subcategoryId, payload as any);
        toast.success("Item added successfully");
      }

      setItemModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save item");
    } finally {
      setUploading(false);
    }
  }

  function handleDeleteItem() {
    if (!selectedItem || !selectedItem.subcategoryId) return;
    deleteItem(selectedItem.subcategoryId, selectedItem.id!);
    setItemDeleteOpen(false);
    setSelectedItem(null);
    toast.success("Item deleted successfully");
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/courses">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">{course.title}</h1>
            <p className="text-sm text-muted">
              {course.category} · {course.duration} · {course.qualification}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setSubAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subcategory
        </Button>
      </div>

      {/* Subcategories */}
      {courseSubs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-muted" />
          </div>
          <h3 className="font-semibold text-primary mb-1">No subcategories yet</h3>
          <p className="text-sm text-muted mb-4">Add subjects like GK, Nepali, English, IQ to this course.</p>
          <Button size="sm" onClick={() => setSubAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Subcategory
          </Button>
        </div>
      ) : (
        <div>
          {courseSubs.map((sub, i) => {
            const subItems = sub.items || [];
            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`overflow-hidden ${sub.hidden ? "opacity-60" : ""}`}>
                    <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {sub.thumbnail ? (
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 relative">
                          <Image src={sub.thumbnail} alt={sub.title} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-accent flex items-center justify-center shrink-0">
                          <Video className="w-5 h-5 sm:w-6 sm:h-6 text-muted" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-primary text-sm sm:text-base truncate">{sub.title}</h3>
                              {sub.hidden && <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted shrink-0" />}
                              <Badge variant={sub.status === "free" ? "secondary" : "default"} className="text-[9px] sm:text-[10px] capitalize shrink-0">
                                {sub.status === "free" ? <Unlock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> : <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />}
                                {sub.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted line-clamp-2">{sub.shortDescription}</p>
                            <p className="text-xs text-muted/60 mt-1">{formatShortDate(sub.createdAt)}</p>
                          </div>
                          <div className="flex gap-0.5 sm:gap-1 shrink-0">
                            <button
                              onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}
                              className="p-1 sm:p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                            >
                             {expandedSub !== null ? <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />:<ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />} 
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSub({
                                  id: sub.id,
                                  title: sub.title,
                                  thumbnail: sub.thumbnail,
                                  shortDescription: sub.shortDescription,
                                  status: sub.status,
                                  hidden: sub.hidden,
                                });
                                setSubEditOpen(true);
                              }}
                              className="p-1 sm:p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                            >
                              <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSub({
                                  id: sub.id,
                                  title: sub.title,
                                  thumbnail: sub.thumbnail,
                                  shortDescription: sub.shortDescription,
                                  status: sub.status,
                                  hidden: sub.hidden,
                                });
                                setSubDeleteOpen(true);
                              }}
                              className="p-1 sm:p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Items section */}
                        <div className="mt-3">
                          <button
                            onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}
                            className="flex items-center gap-2 text-xs text-muted hover:text-primary transition-colors"
                          >
                            <div className={`w-2 h-2 rounded-full ${subItems.length > 0 ? "bg-secondary" : "bg-muted"}`} />
                            {subItems.length} item{subItems.length !== 1 ? "s" : ""}
                            <span className="text-muted/40">·</span>
                            <span className="text-secondary">Manage Items</span>
                          </button>

                          {expandedSub === sub.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              className="mt-3 space-y-2 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-primary">Items</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => openAddItem(sub.id)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Item
                                </Button>
                              </div>

                              {subItems.length === 0 ? (
                                <p className="text-xs text-muted py-2">No items yet. Add videos, PDFs, or images.</p>
                              ) : (
                                <div className="space-y-2">
                                  {subItems.map((item) => (
                                      <div
                                        key={item.id}
                                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-primary/5 ${
                                          item.hidden ? "opacity-50" : ""
                                        }`}
                                      >
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                          item.type === "video" ? "bg-blue-50 text-blue-600"
                                          : item.type === "image" ? "bg-purple-50 text-purple-600"
                                          : "bg-amber-50 text-amber-600"
                                        }`}>
                                          <button
                                            onClick={() => {
                                              setPreviewItem({
                                                type: item.type,
                                                title: item.title,
                                                url: item.url,
                                                images: item.images,
                                              });
                                              setPreviewOpen(true);
                                            }}
                                          >
                                            {item.type === "video" ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                              : item.type === "image" ? <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                              : <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                          </button>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                            <span className="text-xs sm:text-sm font-medium text-primary truncate max-w-full">{item.title}</span>
                                            <Badge variant="outline" className="text-[7px] sm:text-[9px] uppercase shrink-0">{item.type}</Badge>
                                            {item.images && item.images.length > 1 && (
                                              <Badge variant="secondary" className="text-[7px] sm:text-[9px]">{item.images.length} photos</Badge>
                                            )}
                                            <Badge variant={item.status === "free" ? "secondary" : "default"} className="text-[7px] sm:text-[9px]">
                                              {item.status}
                                            </Badge>
                                            {item.hidden && <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted shrink-0" />}
                                          </div>
                                          <p className="text-xs text-muted truncate">{item.description || item.url}</p>
                                        </div>
                                        <div className="flex gap-0.5 sm:gap-1 shrink-0">
                                          <button
                                            onClick={() => {
                                              openEditItem({
                                                id: item.id,
                                                subcategoryId: sub.id,
                                                type: item.type,
                                                title: item.title,
                                                description: item.description,
                                                url: item.url,
                                                images: item.images || [],
                                                duration: item.duration || "",
                                                status: item.status,
                                                hidden: item.hidden,
                                              });
                                            }}
                                            className="p-0.5 sm:p-1 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                                          >
                                            <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setSelectedItem({
                                                id: item.id,
                                                subcategoryId: sub.id,
                                                type: item.type,
                                                title: item.title,
                                                description: item.description,
                                                url: item.url,
                                                images: item.images || [],
                                                duration: item.duration || "",
                                                status: item.status,
                                                hidden: item.hidden,
                                              });
                                              setItemDeleteOpen(true);
                                            }}
                                            className="p-0.5 sm:p-1 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                                          >
                                            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                          </button>
                                        </div>
                                      </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Subcategory Modals */}
      <FormModal
        open={subAddOpen}
        onClose={() => setSubAddOpen(false)}
        title="Add Subcategory"
        fields={subFields}
        onSubmit={handleAddSub}
        submitLabel="Add Subcategory"
      />

      <FormModal
        open={subEditOpen}
        onClose={() => { setSubEditOpen(false); setSelectedSub(null); }}
        title="Edit Subcategory"
        fields={subFields}
        initialValues={selectedSub ? {
          title: selectedSub.title,
          shortDescription: selectedSub.shortDescription,
          thumbnail: selectedSub.thumbnail,
          status: selectedSub.status,
          hidden: selectedSub.hidden ? "true" : "false",
        } : undefined}
        onSubmit={handleEditSub}
        submitLabel="Update Subcategory"
      />

      <DeleteModal
        open={subDeleteOpen}
        onClose={() => { setSubDeleteOpen(false); setSelectedSub(null); }}
        onConfirm={handleDeleteSub}
        title="Delete Subcategory?"
        message={`Are you sure you want to delete "${selectedSub?.title}"? All items inside will also be removed.`}
      />

      {/* Item Add/Edit Modal */}
      <Modal
        open={itemModalOpen}
        onClose={() => { setItemModalOpen(false); }}
        title={editingItemId ? "Edit Item" : "Add Item"}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Type <span className="text-red-500">*</span></label>
            <select
              value={itemForm.type}
              onChange={(e) => {
                setItemForm((prev) => ({ ...prev, type: e.target.value as "video" | "pdf" | "image" }));
                setPendingImageFiles([]);
                setPendingImagePreviews([]);
                setPendingPdfFile(null);
              }}
              className="flex h-10 w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30 focus:ring-0"
            >
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Title <span className="text-red-500">*</span></label>
            <Input
              value={itemForm.title}
              onChange={(e) => setItemForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. GK Chapter 1 - Introduction"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Description</label>
            <Textarea
              value={itemForm.description}
              onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
              placeholder="Brief description of this item"
            />
          </div>

          {/* Video URL */}
          {itemForm.type === "video" && (
            <div>
              <label className="text-sm font-medium text-primary mb-1 block">Video URL <span className="text-red-500">*</span></label>
              <Input
                value={itemForm.url}
                onChange={(e) => setItemForm((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... or https://..."
              />
            </div>
          )}

          {/* Duration (video only) */}
          {itemForm.type === "video" && (
            <div>
              <label className="text-sm font-medium text-primary mb-1 block">Duration</label>
              <Input
                value={itemForm.duration}
                onChange={(e) => setItemForm((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g. 15:30"
              />
            </div>
          )}

          {/* PDF upload */}
          {itemForm.type === "pdf" && (
            <div>
              <label className="text-sm font-medium text-primary mb-1 block">PDF File</label>
              <input
                ref={pdfFileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlePdfSelect}
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => pdfFileRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-3.5 h-3.5 mr-2" />
                  Select PDF
                </Button>
                {pendingPdfFile && (
                  <span className="text-xs text-muted truncate flex-1">{pendingPdfFile.name}</span>
                )}
              </div>
              <div className="mt-2">
                <label className="text-sm font-medium text-primary mb-1 block">Or enter PDF URL</label>
                <Input
                  value={itemForm.url}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {/* Image upload */}
          {itemForm.type === "image" && (
            <div>
              <label className="text-sm font-medium text-primary mb-1 block">Images</label>
              <input
                ref={imageFilesRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageFilesRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-3.5 h-3.5 mr-2" />
                Select Images
              </Button>

              {/* Local previews of pending images */}
              {pendingImagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {pendingImagePreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-accent group">
                      <Image src={preview} alt={`Preview ${i + 1}`} fill className="object-cover" unoptimized />
                      <button
                        onClick={() => removePendingImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Already-saved images (when editing) */}
              {itemForm.images.filter((img) => !pendingImagePreviews.includes(img)).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted mb-2">Saved images:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {itemForm.images
                      .filter((img) => !pendingImagePreviews.some((p) => img.startsWith("blob:")))
                      .map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-accent">
                          <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Status <span className="text-red-500">*</span></label>
            <select
              value={itemForm.status}
              onChange={(e) => setItemForm((prev) => ({ ...prev, status: e.target.value as "paid" | "free" }))}
              className="flex h-10 w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30 focus:ring-0"
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Visibility <span className="text-red-500">*</span></label>
            <select
              value={itemForm.hidden ? "true" : "false"}
              onChange={(e) => setItemForm((prev) => ({ ...prev, hidden: e.target.value === "true" }))}
              className="flex h-10 w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30 focus:ring-0"
            >
              <option value="false">Visible</option>
              <option value="true">Hidden</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setItemModalOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={uploading}>
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading & Saving...</>
              ) : (
                editingItemId ? "Update Item" : "Add Item"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Item Delete Modal */}
      <DeleteModal
        open={itemDeleteOpen}
        onClose={() => { setItemDeleteOpen(false); setSelectedItem(null); }}
        onConfirm={handleDeleteItem}
        title="Delete Item?"
        message={`Are you sure you want to delete "${selectedItem?.title}"?`}
      />

      <PreviewModal
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setPreviewItem(null); }}
        type={previewItem?.type || "video"}
        title={previewItem?.title || ""}
        url={previewItem?.url || ""}
        images={previewItem?.images}
      />
    </div>
  );
}
