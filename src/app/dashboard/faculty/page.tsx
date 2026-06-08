"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/app-context";
import type { FacultyMember } from "@/types";

const emptyMember = {
  name: "",
  role: "",
  qualification: "",
  experience: "",
  image: "",
  subjects: [],
};

export default function DashboardFacultyPage() {
  const { facultyMembers, addFacultyMember, updateFacultyMember, deleteFacultyMember } = useAppContext();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FacultyMember>({ id: "", ...emptyMember });
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState<Omit<FacultyMember, "id">>(emptyMember);

  const filtered = facultyMembers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(m: FacultyMember) {
    setEditingId(m.id);
    setEditForm({ ...m });
  }

  function saveEdit() {
    if (editForm.name.trim()) {
      updateFacultyMember(editForm.id, editForm);
      setEditingId(null);
    }
  }

  function handleAdd() {
    if (newForm.name.trim()) {
      addFacultyMember(newForm);
      setNewForm(emptyMember);
      setShowAdd(false);
    }
  }

  function updateEditField(field: string, value: string | string[]) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateNewField(field: string, value: string | string[]) {
    setNewForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Faculty Members</h1>
          <p className="text-sm text-muted">Manage academy faculty and staff.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-2" />
          {showAdd ? "Cancel" : "Add Faculty"}
        </Button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-secondary/20">
            <CardContent className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input placeholder="Full Name" value={newForm.name} onChange={(e) => updateNewField("name", e.target.value)} />
                <Input placeholder="Role (e.g. Head of Academics)" value={newForm.role} onChange={(e) => updateNewField("role", e.target.value)} />
                <Input placeholder="Qualification" value={newForm.qualification} onChange={(e) => updateNewField("qualification", e.target.value)} />
                <Input placeholder="Experience (e.g. 12 Years)" value={newForm.experience} onChange={(e) => updateNewField("experience", e.target.value)} />
                <Input placeholder="Image URL" value={newForm.image} onChange={(e) => updateNewField("image", e.target.value)} className="sm:col-span-2" />
                <Input placeholder="Subjects (comma separated)" onChange={(e) => updateNewField("subjects", e.target.value.split(",").map((s) => s.trim()))} className="sm:col-span-2" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setShowAdd(false); setNewForm(emptyMember); }}>Cancel</Button>
                <Button size="sm" onClick={handleAdd}>Save Faculty</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card>
              <CardContent className="p-5">
                {editingId === m.id ? (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input value={editForm.name} onChange={(e) => updateEditField("name", e.target.value)} />
                      <Input value={editForm.role} onChange={(e) => updateEditField("role", e.target.value)} />
                      <Input value={editForm.qualification} onChange={(e) => updateEditField("qualification", e.target.value)} />
                      <Input value={editForm.experience} onChange={(e) => updateEditField("experience", e.target.value)} />
                      <Input value={editForm.image} onChange={(e) => updateEditField("image", e.target.value)} className="sm:col-span-2" />
                      <Input value={editForm.subjects.join(", ")} onChange={(e) => updateEditField("subjects", e.target.value.split(",").map((s) => s.trim()))} className="sm:col-span-2" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                    </div>
                  </div>
                ) : (
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
                          <button onClick={() => startEdit(m)} className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteFacultyMember(m.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
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
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted text-center py-8 col-span-full">No faculty members found.</p>
        )}
      </div>
    </div>
  );
}
