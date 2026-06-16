"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Star, Pencil, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useAppContext } from "@/lib/app-context";
import type { Testimonial } from "@/types";
import { QUALIFICATIONS } from "@/constants";

const fields: FieldConfig[] = [
  { name: "name", label: "Full Name", type: "text", required: true, placeholder: "e.g. John Doe" },
  { name: "role", label: "Role", type: "select", required: true, options: [
    { label: "Student", value: "student" },
    { label: "Parent", value: "parent" },
    { label: "Cadet", value: "cadet" },
  ]},
  { name: "content", label: "Testimonial Content", type: "textarea", required: true, placeholder: "Write the testimonial..." },
  { name: "rating", label: "Rating (1-5)", type: "number", required: true, placeholder: "5" },
  { name: "achievement", label: "Achievement (optional)", type: "text", placeholder: "e.g. Secured top rank in XYZ" },
  { name: "qualification", label: "Qualification (optional)", type: "select", options: QUALIFICATIONS.map(q => ({ label: q, value: q })) },
  { name: "image", label: "Image", type: "image" as const, placeholder: "https://..." },
];

export default function DashboardTestimonialsPage() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useAppContext();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Testimonial | null>(null);

  const filtered = testimonials.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(data: Record<string, string>) {
    addTestimonial({
      name: data.name,
      role: data.role as Testimonial["role"],
      content: data.content,
      rating: Math.min(5, Math.max(1, parseInt(data.rating) || 5)),
      achievement: data.achievement || undefined,
      qualification: data.qualification || undefined,
      image: data.image || undefined,
    });
    setAddOpen(false);
    toast.success("Testimonial added successfully");
  }

  function handleEdit(data: Record<string, string>) {
    if (!selected) return;
    updateTestimonial(selected.id, {
      name: data.name,
      role: data.role as Testimonial["role"],
      content: data.content,
      rating: Math.min(5, Math.max(1, parseInt(data.rating) || 5)),
      achievement: data.achievement || undefined,
      qualification: data.qualification || undefined,
      image: data.image || undefined,
    });
    setEditOpen(false);
    setSelected(null);
    toast.success("Testimonial updated successfully");
  }

  function handleDelete() {
    if (!selected) return;
    deleteTestimonial(selected.id);
    setDeleteOpen(false);
    setSelected(null);
    toast.success("Testimonial deleted successfully");
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Testimonials</h1>
          <p className="text-sm text-muted">Manage student and parent testimonials.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="mb-4 lg:mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input placeholder="Search testimonials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setSelected(t); setEditOpen(true); }}
                      className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelected(t); setDeleteOpen(true); }}
                      className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{t.name}</p>
                    <p className="text-xs text-muted capitalize">{t.role} {t.qualification && `· ${t.qualification}`}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">{t.role}</Badge>
                </div>
                {t.achievement && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-800 font-medium flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> {t.achievement}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted text-sm">No testimonials found.</p>
        </div>
      )}

      <FormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Testimonial"
        fields={fields}
        onSubmit={handleAdd}
        submitLabel="Add Testimonial"
      />

      <FormModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit Testimonial"
        fields={fields}
        initialValues={selected ? {
          name: selected.name,
          role: selected.role,
          content: selected.content,
          rating: String(selected.rating),
          achievement: selected.achievement || "",
          qualification: selected.qualification || "",
          image: selected.image || "",
        } : undefined}
        onSubmit={handleEdit}
        submitLabel="Update Testimonial"
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Testimonial?"
        message={`Are you sure you want to delete the testimonial from "${selected?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
