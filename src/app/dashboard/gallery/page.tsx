"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, Images } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useAppContext } from "@/lib/app-context";
import type { GalleryImage } from "@/types";

const fields: FieldConfig[] = [
  { name: "src", label: "Image URL", type: "url", required: true, placeholder: "https://..." },
  { name: "alt", label: "Alt Text", type: "text", required: true, placeholder: "Description of the image" },
  { name: "category", label: "Category", type: "select", required: true, options: [
    { label: "Campus", value: "campus" },
    { label: "Events", value: "events" },
    { label: "Classroom", value: "classroom" },
    { label: "Sports", value: "sports" },
    { label: "Graduation", value: "graduation" },
  ]},
];

export default function DashboardGalleryPage() {
  const { galleryImages: images, addGalleryImage, updateGalleryImage, deleteGalleryImage } = useAppContext();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  const filtered = images.filter((g) =>
    g.alt.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(data: Record<string, string>) {
    addGalleryImage({
      src: data.src,
      alt: data.alt,
      category: data.category,
    });
    setAddOpen(false);
    toast.success("Image added successfully");
  }

  function handleEdit(data: Record<string, string>) {
    if (!selected) return;
    updateGalleryImage(selected.id, {
      src: data.src,
      alt: data.alt,
      category: data.category,
    });
    setEditOpen(false);
    setSelected(null);
    toast.success("Image updated successfully");
  }

  function handleDelete() {
    if (!selected) return;
    deleteGalleryImage(selected.id);
    setDeleteOpen(false);
    setSelected(null);
    toast.success("Image deleted successfully");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Gallery</h1>
          <p className="text-sm text-muted">Manage academy gallery images.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input placeholder="Search images..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((img, i) => (
          <motion.div key={img.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
            <Card className="overflow-hidden group">
              <div className="relative h-40">
                <Image src={img.src} alt={img.alt} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelected(img); setEditOpen(true); }}
                      className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelected(img); setDeleteOpen(true); }}
                      className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-primary truncate">{img.alt}</p>
                <Badge variant="outline" className="text-[10px] mt-1 capitalize">{img.category}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Images className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">No images found.</p>
        </div>
      )}

      <FormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Upload Image"
        fields={fields}
        onSubmit={handleAdd}
        submitLabel="Upload"
      />

      <FormModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit Image"
        fields={fields}
        initialValues={selected ? { src: selected.src, alt: selected.alt, category: selected.category } : undefined}
        onSubmit={handleEdit}
        submitLabel="Update Image"
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Image?"
        message={`Are you sure you want to delete "${selected?.alt}"? This action cannot be undone.`}
      />
    </div>
  );
}
