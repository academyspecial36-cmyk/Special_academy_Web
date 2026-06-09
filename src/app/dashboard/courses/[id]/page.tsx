"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff,
  Lock, Unlock, Video, FileText, Play,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { PreviewModal } from "@/components/ui/preview-modal";
import { useAppContext } from "@/lib/app-context";
import { formatShortDate } from "@/lib/utils";

const subFields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. General Knowledge" },
  { name: "shortDescription", label: "Short Description", type: "textarea", required: true, placeholder: "Brief description of this subcategory" },
  { name: "thumbnail", label: "Thumbnail URL", type: "url", placeholder: "https://..." },
  { name: "status", label: "Status", type: "select", required: true, options: [
    { label: "Free", value: "free" },
    { label: "Paid", value: "paid" },
  ]},
  { name: "hidden", label: "Visibility", type: "select", required: true, options: [
    { label: "Visible", value: "false" },
    { label: "Hidden", value: "true" },
  ]},
];

const itemFields: FieldConfig[] = [
  { name: "type", label: "Type", type: "select", required: true, options: [
    { label: "Video", value: "video" },
    { label: "PDF", value: "pdf" },
  ]},
  { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. GK Chapter 1 - Introduction" },
  { name: "description", label: "Description", type: "textarea", placeholder: "Brief description of this item" },
  { name: "url", label: "Video URL / PDF URL", type: "url", required: true, placeholder: "https://..." },
  { name: "duration", label: "Duration (for video)", type: "text", placeholder: "e.g. 15:30" },
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

interface ItemForm {
  id: string;
  subcategoryId: string;
  type: "video" | "pdf";
  title: string;
  description: string;
  url: string;
  duration: string;
  status: "paid" | "free";
  hidden: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  const [subAddOpen, setSubAddOpen] = useState(false);
  const [subEditOpen, setSubEditOpen] = useState(false);
  const [subDeleteOpen, setSubDeleteOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubcategoryForm | null>(null);

  const [itemAddOpen, setItemAddOpen] = useState(false);
  const [itemEditOpen, setItemEditOpen] = useState(false);
  const [itemDeleteOpen, setItemDeleteOpen] = useState(false);
  const [itemParentId, setItemParentId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemForm | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: "video" | "pdf"; title: string; url: string } | null>(null);

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
    console.log("Subcategory added:", data);
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
    console.log("Subcategory updated:", data);
    toast.success("Subcategory updated successfully");
  }

  function handleDeleteSub() {
    if (!selectedSub) return;
    deleteSubcategory(selectedSub.id);
    setSubDeleteOpen(false);
    setSelectedSub(null);
    console.log("Subcategory deleted:", selectedSub.id);
    toast.success("Subcategory deleted successfully");
  }

  function handleAddItem(data: Record<string, string>) {
    if (!itemParentId) return;
    addItem(itemParentId, {
      subcategoryId: itemParentId,
      type: data.type as "video" | "pdf",
      title: data.title,
      description: data.description || "",
      url: data.url,
      duration: data.duration || undefined,
      status: data.status as "paid" | "free",
      hidden: data.hidden === "true",
    });
    setItemAddOpen(false);
    setItemParentId(null);
    console.log("Item added:", data);
    toast.success("Item added successfully");
  }

  function handleEditItem(data: Record<string, string>) {
    if (!selectedItem || !selectedItem.subcategoryId) return;
    updateItem(selectedItem.subcategoryId, selectedItem.id, {
      type: data.type as "video" | "pdf",
      title: data.title,
      description: data.description || "",
      url: data.url,
      duration: data.duration || undefined,
      status: data.status as "paid" | "free",
      hidden: data.hidden === "true",
    });
    setItemEditOpen(false);
    setSelectedItem(null);
    console.log("Item updated:", data);
    toast.success("Item updated successfully");
  }

  function handleDeleteItem() {
    if (!selectedItem || !selectedItem.subcategoryId) return;
    deleteItem(selectedItem.subcategoryId, selectedItem.id);
    setItemDeleteOpen(false);
    setSelectedItem(null);
    console.log("Item deleted:", selectedItem.id);
    toast.success("Item deleted successfully");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/courses">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">{course.title}</h1>
            <p className="text-sm text-muted">
              {course.category} · {course.duration} · {course.classLevel}
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
        <div className="space-y-4">
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
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {sub.thumbnail ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                          <Image src={sub.thumbnail} alt={sub.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-accent flex items-center justify-center shrink-0">
                          <Video className="w-6 h-6 text-muted" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-primary">{sub.title}</h3>
                              {sub.hidden && <EyeOff className="w-3.5 h-3.5 text-muted" />}
                              <Badge variant={sub.status === "free" ? "secondary" : "default"} className="text-[10px] capitalize">
                                {sub.status === "free" ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                                {sub.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted line-clamp-2">{sub.shortDescription}</p>
                            <p className="text-xs text-muted/60 mt-1">{formatShortDate(sub.createdAt)}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setExpandedSub(expandedSub === sub.id ? null : sub.id);
                              }}
                              className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                            >
                              <Play className="w-3.5 h-3.5" />
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
                              className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
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
                              className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
                                  onClick={() => {
                                    setItemParentId(sub.id);
                                    setItemAddOpen(true);
                                  }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Item
                                </Button>
                              </div>

                              {subItems.length === 0 ? (
                                <p className="text-xs text-muted py-2">No items yet. Add videos or PDFs.</p>
                              ) : (
                                <div className="space-y-2">
                                  {subItems.map((item) => (
                                    <div
                                      key={item.id}
                                      className={`flex items-center gap-3 p-3 rounded-lg border border-primary/5 ${
                                        item.hidden ? "opacity-50" : ""
                                      }`}
                                    >
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        item.type === "video" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                                      }`}>
                                        <button
                                          onClick={() => {
                                            setPreviewItem({ type: item.type, title: item.title, url: item.url });
                                            setPreviewOpen(true);
                                          }}
                                        >
                                          {item.type === "video" ? (
                                            <Play className="w-4 h-4" />
                                          ) : (
                                            <FileText className="w-4 h-4" />
                                          )}
                                        </button>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-primary truncate">{item.title}</span>
                                          <Badge variant="outline" className="text-[9px] uppercase">{item.type}</Badge>
                                          <Badge variant={item.status === "free" ? "secondary" : "default"} className="text-[9px]">
                                            {item.status}
                                          </Badge>
                                          {item.hidden && <EyeOff className="w-3 h-3 text-muted" />}
                                        </div>
                                        <p className="text-xs text-muted truncate">{item.description || item.url}</p>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <button
                                          onClick={() => {
                                            setSelectedItem({
                                              id: item.id,
                                              subcategoryId: sub.id,
                                              type: item.type,
                                              title: item.title,
                                              description: item.description,
                                              url: item.url,
                                              duration: item.duration || "",
                                              status: item.status,
                                              hidden: item.hidden,
                                            });
                                            setItemEditOpen(true);
                                          }}
                                          className="p-1 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                                        >
                                          <Pencil className="w-3 h-3" />
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
                                              duration: item.duration || "",
                                              status: item.status,
                                              hidden: item.hidden,
                                            });
                                            setItemDeleteOpen(true);
                                          }}
                                          className="p-1 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
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

      {/* Item Modals */}
      <FormModal
        open={itemAddOpen}
        onClose={() => { setItemAddOpen(false); setItemParentId(null); }}
        title="Add Item"
        fields={itemFields}
        onSubmit={handleAddItem}
        submitLabel="Add Item"
      />

      <FormModal
        open={itemEditOpen}
        onClose={() => { setItemEditOpen(false); setSelectedItem(null); }}
        title="Edit Item"
        fields={itemFields}
        initialValues={selectedItem ? {
          type: selectedItem.type,
          title: selectedItem.title,
          description: selectedItem.description,
          url: selectedItem.url,
          duration: selectedItem.duration,
          status: selectedItem.status,
          hidden: selectedItem.hidden ? "true" : "false",
        } : undefined}
        onSubmit={handleEditItem}
        submitLabel="Update Item"
      />

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
      />
    </div>
  );
}
