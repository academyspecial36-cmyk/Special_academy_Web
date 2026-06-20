"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { AssetPicker } from "@/components/shared/asset-picker";
import { useAppContext } from "@/lib/app-context";
import type { FacultyMember } from "@/types";
import type { MediaFile } from "@/types/media";

const fields: FieldConfig[] = [
  { name: "name", label: "Full Name", type: "text", required: true, placeholder: "e.g. John Doe" },
  { name: "role", label: "Role", type: "text", required: true, placeholder: "e.g. Head of Academics" },
  { name: "qualification", label: "Qualification", type: "text", required: true, placeholder: "e.g. M.Sc. in Mathematics" },
  { name: "experience", label: "Experience", type: "text", required: true, placeholder: "e.g. 12 Years" },
  { name: "image", label: "Image", type: "image" as const, placeholder: "https://...", browseMedia: true },
  { name: "subjects", label: "Subjects (comma separated)", type: "text", placeholder: "e.g. Math, Science, English" },
];

export default function DashboardFacultyPage() {
  const { facultyMembers, addFacultyMember, updateFacultyMember, deleteFacultyMember } = useAppContext();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<FacultyMember | null>(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetPickerField, setAssetPickerField] = useState<string | null>(null);
  const [externalFieldValues, setExternalFieldValues] = useState<Record<string, string> | undefined>(undefined);

  const filtered = facultyMembers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(data: Record<string, string>) {
    addFacultyMember({
      name: data.name,
      role: data.role,
      qualification: data.qualification,
      experience: data.experience,
      image: data.image || "",
      subjects: data.subjects ? data.subjects.split(",").map((s) => s.trim()) : [],
    });
    setAddOpen(false);
    console.log("Faculty added:", data);
    toast.success("Faculty member added successfully");
  }

  function handleEdit(data: Record<string, string>) {
    if (!selected) return;
    updateFacultyMember(selected.id, {
      name: data.name,
      role: data.role,
      qualification: data.qualification,
      experience: data.experience,
      image: data.image || "",
      subjects: data.subjects ? data.subjects.split(",").map((s) => s.trim()) : [],
    });
    setEditOpen(false);
    setSelected(null);
    console.log("Faculty updated:", data);
    toast.success("Faculty member updated successfully");
  }

  function handleDelete() {
    if (!selected) return;
    deleteFacultyMember(selected.id);
    setDeleteOpen(false);
    setSelected(null);
    console.log("Faculty deleted:", selected.id);
    toast.success("Faculty member deleted successfully");
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Faculty Members</h1>
          <p className="text-sm text-muted">Manage academy faculty and staff.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      <div className="mb-4 lg:mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 shrink-0 overflow-hidden">
                    {m.image ? (
                      <Image src={m.image} alt={m.name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-primary text-sm">{m.name}</h3>
                        <p className="text-xs text-secondary font-medium">{m.role}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { setSelected(m); setEditOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelected(m); setDeleteOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted mt-1">{m.qualification} · {m.experience}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.subjects.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted text-center py-8 col-span-full">No faculty members found.</p>
        )}
      </div>

      <FormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Faculty Member"
        fields={fields}
        onSubmit={handleAdd}
        submitLabel="Add Faculty"
        externalFieldValues={externalFieldValues}
        onBrowseMedia={(fieldName) => { setAssetPickerField(fieldName); setAssetPickerOpen(true); }}
      />

      <FormModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit Faculty Member"
        fields={fields}
        initialValues={selected ? {
          name: selected.name,
          role: selected.role,
          qualification: selected.qualification,
          experience: selected.experience,
          image: selected.image,
          subjects: selected.subjects.join(", "),
        } : undefined}
        onSubmit={handleEdit}
        submitLabel="Update Faculty"
        externalFieldValues={externalFieldValues}
        onBrowseMedia={(fieldName) => { setAssetPickerField(fieldName); setAssetPickerOpen(true); }}
      />

      <AssetPicker
        open={assetPickerOpen}
        onClose={() => { setAssetPickerOpen(false); setAssetPickerField(null); setExternalFieldValues(undefined); }}
        onSelect={(file: MediaFile) => {
          if (assetPickerField) {
            setExternalFieldValues({ [assetPickerField]: file.url });
          }
          setAssetPickerOpen(false);
          setAssetPickerField(null);
          setTimeout(() => setExternalFieldValues(undefined), 100);
        }}
        filterMime="image/"
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Faculty Member?"
        message={`Are you sure you want to delete "${selected?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
