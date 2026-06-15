"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search, Plus, Pin, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useAppContext } from "@/lib/app-context";
import { formatShortDate } from "@/lib/utils";
import type { Notice } from "@/types";

export default function DashboardNoticesPage() {
  const { notices, addNotice, updateNotice, deleteNotice, noticeCategories } = useAppContext();
  const [search, setSearch] = useState("");

  const fields: FieldConfig[] = [
    { name: "title", label: "Title", type: "text", required: true, placeholder: "Notice title" },
    { name: "content", label: "Content", type: "textarea", required: true, placeholder: "Notice content..." },
    { name: "category", label: "Category", type: "select", required: true, options: noticeCategories.map((c) => ({ label: c.label, value: c.value })) },
    { name: "author", label: "Author", type: "text", required: true, placeholder: "e.g. Admin" },
    { name: "image", label: "Image", type: "image", placeholder: "https://..." },
  ];

  const editFields: FieldConfig[] = [
    { name: "title", label: "Title", type: "text", required: true, placeholder: "Notice title" },
    { name: "content", label: "Content", type: "textarea", required: true, placeholder: "Notice content..." },
    { name: "category", label: "Category", type: "select", required: true, options: noticeCategories.map((c) => ({ label: c.label, value: c.value })) },
    { name: "author", label: "Author", type: "text", required: true, placeholder: "e.g. Admin" },
    { name: "isPinned", label: "Pinned", type: "select", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
    { name: "image", label: "Image", type: "image", placeholder: "https://..." },
  ];
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Notice | null>(null);

  const filtered = [...notices]
    .filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const getCategoryStyle = (category: string) => {
    const cat = noticeCategories.find((c) => c.value === category);
    return cat?.color || "bg-slate-100 text-slate-800";
  };

  function handleAdd(data: Record<string, string>) {
    addNotice({
      title: data.title,
      content: data.content,
      category: data.category as Notice["category"],
      author: data.author,
      date: new Date().toISOString(),
      isPinned: false,
      image: data.image || undefined,
    });
    setAddOpen(false);
    toast.success("Notice published successfully");
  }

  function handleEdit(data: Record<string, string>) {
    if (!selected) return;
    updateNotice(selected.id, {
      title: data.title,
      content: data.content,
      category: data.category as Notice["category"],
      author: data.author,
      isPinned: data.isPinned === "true",
      image: data.image || undefined,
    });
    setEditOpen(false);
    setSelected(null);
    toast.success("Notice updated successfully");
  }

  function handleDelete() {
    if (!selected) return;
    deleteNotice(selected.id);
    setDeleteOpen(false);
    setSelected(null);
    toast.success("Notice deleted successfully");
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Notices</h1>
          <p className="text-sm text-muted">Publish and manage academy notices.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Publish Notice
        </Button>
      </div>

      <div className="mb-4 lg:mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input
          placeholder="Search notices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((notice, i) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                  {notice.image && (
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-accent">
                      <Image src={notice.image} alt="" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryStyle(notice.category)}>
                        {noticeCategories.find((c) => c.value === notice.category)?.label}
                      </Badge>
                      {notice.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-secondary fill-secondary" />
                      )}
                    </div>
                    <h3 className="font-semibold text-primary text-sm mb-1">{notice.title}</h3>
                    <p className="text-xs text-muted line-clamp-2 mb-2">{notice.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(notice.date)}
                      </span>
                      <span>By {notice.author}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { setSelected(notice); setEditOpen(true); }}
                      className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelected(notice); setDeleteOpen(true); }}
                      className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <FormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Publish Notice"
        fields={fields}
        onSubmit={handleAdd}
        submitLabel="Publish"
      />

      <FormModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit Notice"
        fields={editFields}
        initialValues={selected ? {
          title: selected.title,
          content: selected.content,
          category: selected.category,
          author: selected.author,
          isPinned: selected.isPinned ? "true" : "false",
          image: selected.image || "",
        } : undefined}
        onSubmit={handleEdit}
        submitLabel="Update Notice"
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Notice?"
        message={`Are you sure you want to delete "${selected?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
