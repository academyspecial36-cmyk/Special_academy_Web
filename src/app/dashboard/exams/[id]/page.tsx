"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, BarChart3, Layers, FileQuestion, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useAppContext } from "@/lib/app-context";
import { useBreadcrumbs } from "@/lib/breadcrumb-context";
import type { ExamSubcategory } from "@/types";
import { toast } from "sonner";

export default function AdminExamCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const { examCategories, examSubcategories, questions, addExamSubcategory, updateExamSubcategory, deleteExamSubcategory } = useAppContext();
  const { setSegments } = useBreadcrumbs();

  const category = examCategories.find((c) => c.id === categoryId);

  useEffect(() => {
    setSegments([
      { label: "Exams", href: "/dashboard/exams" },
      { label: category?.name ?? "Category" },
    ]);
    return () => setSegments([]);
  }, [category?.name, setSegments]);

  const [showAddSub, setShowAddSub] = useState(false);
  const [editingSub, setEditingSub] = useState<ExamSubcategory | null>(null);
  const [deletingSub, setDeletingSub] = useState<ExamSubcategory | null>(null);
  const [subForm, setSubForm] = useState({ name: "", description: "", color: "bg-purple-100 text-purple-800" });

  const subcategories = examSubcategories.filter((s) => s.categoryId === categoryId);

  function getQuestionCount(subId: string) {
    return questions.filter((q) => q.subcategoryId === subId).length;
  }

  function resetForm() { setSubForm({ name: "", description: "", color: "bg-purple-100 text-purple-800" }); }

  function handleAddSub() {
    if (!subForm.name.trim()) return;
    addExamSubcategory({ categoryId, ...subForm });
    resetForm();
    setShowAddSub(false);
    toast.success("Set added");
  }

  function handleEditSub() {
    if (!editingSub || !subForm.name.trim()) return;
    updateExamSubcategory(editingSub.id, subForm);
    setEditingSub(null);
    resetForm();
    toast.success("Set updated");
  }

  function handleDeleteSub() {
    if (!deletingSub) return;
    deleteExamSubcategory(deletingSub.id);
    setDeletingSub(null);
    toast.success("Set deleted");
  }

  function openEdit(sub: ExamSubcategory) {
    setEditingSub(sub);
    setSubForm({ name: sub.name, description: sub.description, color: sub.color });
  }

  if (!category) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-primary mb-2">Category not found</h2>
        <Button variant="outline" asChild>
          <Link href="/dashboard/exams">Back to Exams</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/exams">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">{category.name}</h1>
            <p className="text-xs sm:text-sm text-muted truncate">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/exams/${categoryId}/results`}>
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Results
            </Link>
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setShowAddSub(true); }}>
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Add Set
          </Button>
        </div>
      </div>

      {subcategories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-semibold text-primary mb-1">No sets yet</h3>
            <p className="text-sm text-muted">Add sets (subcategories) to organize questions under {category.name}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subcategories.map((sub, i) => (
            <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full hover:shadow-elevated transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sub.color}`}>
                        <FileQuestion className="w-4 h-4" />
                      </div>
                      <CardTitle className="text-sm font-medium">{sub.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(sub)} className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingSub(sub)} className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted mb-4 line-clamp-2">{sub.description}</p>
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="text-muted">{getQuestionCount(sub.id)} questions</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
                      <Link href={`/dashboard/exams/${categoryId}/${sub.id}`}>
                        <FileQuestion className="w-3 h-3 mr-1" /> Questions
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
                      <Link href={`/dashboard/exams/${categoryId}/${sub.id}/add`}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Subcategory Modal */}
      {(showAddSub || editingSub) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowAddSub(false); setEditingSub(null); resetForm(); }}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-primary mb-4">{editingSub ? "Edit Set" : "Add Set"}</h3>
            <div className="space-y-3">
              <input
                value={subForm.name}
                onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Set name (e.g. GK Set 1)"
                className="w-full h-10 px-3 rounded-lg border border-primary/10 text-sm outline-none focus:border-primary/30"
              />
              <textarea
                value={subForm.description}
                onChange={(e) => setSubForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-primary/10 text-sm outline-none focus:border-primary/30 resize-none"
              />
              <div>
                <label className="text-xs text-muted block mb-1">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "bg-purple-100 text-purple-800", label: "Purple" },
                    { value: "bg-emerald-100 text-emerald-800", label: "Green" },
                    { value: "bg-blue-100 text-blue-800", label: "Blue" },
                    { value: "bg-amber-100 text-amber-800", label: "Amber" },
                    { value: "bg-rose-100 text-rose-800", label: "Rose" },
                    { value: "bg-cyan-100 text-cyan-800", label: "Cyan" },
                  ].map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setSubForm((p) => ({ ...p, color: c.value }))}
                      className={`w-8 h-8 rounded-lg ${c.value} text-[10px] font-medium border-2 ${subForm.color === c.value ? "border-primary" : "border-transparent"}`}
                      title={c.label}
                    >
                      A
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowAddSub(false); setEditingSub(null); resetForm(); }}>Cancel</Button>
              <Button size="sm" onClick={editingSub ? handleEditSub : handleAddSub} disabled={!subForm.name.trim()}>
                {editingSub ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal open={!!deletingSub} onClose={() => setDeletingSub(null)} title="Delete Set" message="Are you sure? Questions in this set will be unlinked." onConfirm={handleDeleteSub} />
    </div>
  );
}
