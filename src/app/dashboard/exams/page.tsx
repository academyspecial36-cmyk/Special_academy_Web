"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardCheck, Plus, Pencil, Trash2, ChevronRight, FileQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useAppContext } from "@/lib/app-context";
import type { ExamCategory } from "@/types";
import { toast } from "sonner";

export default function AdminExamsPage() {
  const { examCategories, addExamCategory, updateExamCategory, deleteExamCategory, questions } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ExamCategory | null>(null);
  const [deleting, setDeleting] = useState<ExamCategory | null>(null);

  const addFields: FieldConfig[] = [
    { name: "name", label: "Category Name", type: "text", required: true, placeholder: "e.g. General Knowledge" },
    { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Brief description of this exam category" },
    { name: "color", label: "Color Style", type: "select", required: true, options: [
      { value: "bg-emerald-100 text-emerald-800", label: "Green" },
      { value: "bg-blue-100 text-blue-800", label: "Blue" },
      { value: "bg-amber-100 text-amber-800", label: "Amber" },
      { value: "bg-rose-100 text-rose-800", label: "Rose" },
      { value: "bg-violet-100 text-violet-800", label: "Violet" },
      { value: "bg-cyan-100 text-cyan-800", label: "Cyan" },
    ] },
  ];

  const editFields: FieldConfig[] = [
    { name: "name", label: "Category Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "color", label: "Color Style", type: "select", required: true, options: [
      { value: "bg-emerald-100 text-emerald-800", label: "Green" },
      { value: "bg-blue-100 text-blue-800", label: "Blue" },
      { value: "bg-amber-100 text-amber-800", label: "Amber" },
      { value: "bg-rose-100 text-rose-800", label: "Rose" },
      { value: "bg-violet-100 text-violet-800", label: "Violet" },
      { value: "bg-cyan-100 text-cyan-800", label: "Cyan" },
    ] },
  ];

  function handleAdd(data: Record<string, string>) {
    addExamCategory({ name: data.name, description: data.description, color: data.color });
    setShowAdd(false);
    toast.success("Exam category added");
  }

  function handleEdit(data: Record<string, string>) {
    if (!editing) return;
    updateExamCategory(editing.id, { name: data.name, description: data.description, color: data.color });
    setEditing(null);
    toast.success("Exam category updated");
  }

  function handleDelete() {
    if (!deleting) return;
    deleteExamCategory(deleting.id);
    setDeleting(null);
    toast.success("Exam category deleted");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Exam Categories</h1>
          <p className="text-sm text-muted">Manage exam categories and questions.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {examCategories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardCheck className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-semibold text-primary mb-1">No exam categories yet</h3>
            <p className="text-sm text-muted">Create your first exam category to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {examCategories.map((cat, i) => {
            const count = questions.filter((q) => q.categoryId === cat.id).length;
            return (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/dashboard/exams/${cat.id}`} className="block group">
                  <Card className="overflow-hidden hover:border-secondary/20 hover:shadow-elevated transition-all">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                          <FileQuestion className="w-6 h-6" />
                        </div>
                        <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
                          <button
                            onClick={() => setEditing(cat)}
                            className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleting(cat)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-primary mb-1 group-hover:text-secondary transition-colors inline-flex items-center gap-1">
                        {cat.name}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-xs text-muted line-clamp-2 mb-3">{cat.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <FileQuestion className="w-3.5 h-3.5 text-muted" />
                        <span className="font-medium text-primary">{count}</span>
                        <span className="text-muted">questions</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <FormModal open={showAdd} onClose={() => setShowAdd(false)} title="Add Exam Category" fields={addFields} onSubmit={handleAdd} />
      <FormModal open={!!editing} onClose={() => setEditing(null)} title="Edit Exam Category" fields={editFields} initialValues={editing ? { name: editing.name, description: editing.description, color: editing.color } : undefined} onSubmit={handleEdit} />
      <DeleteModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Exam Category" message={`Are you sure you want to delete "${deleting?.name}"? All questions in this category will also be deleted.`} onConfirm={handleDelete} />
    </div>
  );
}
