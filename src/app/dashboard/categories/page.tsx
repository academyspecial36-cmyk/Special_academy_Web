"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext, type Qualification } from "@/lib/app-context";

export default function DashboardCategoriesPage() {
  const {
    courseCategories,
    noticeCategories,
    addCourseCategory,
    deleteCourseCategory,
    addNoticeCategory,
    deleteNoticeCategory,
    updateNoticeCategory,
    qualifications,
    addQualification,
    deleteQualification,
    updateQualification,
  } = useAppContext();

  const [newCourseCat, setNewCourseCat] = useState("");
  const [newNoticeValue, setNewNoticeValue] = useState("");
  const [newNoticeLabel, setNewNoticeLabel] = useState("");
  const [editingNotice, setEditingNotice] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [newQualName, setNewQualName] = useState("");
  const [editingQual, setEditingQual] = useState<string | null>(null);
  const [editQualName, setEditQualName] = useState("");

  function handleAddCourseCat() {
    if (newCourseCat.trim()) {
      addCourseCategory(newCourseCat.trim());
      setNewCourseCat("");
      toast.success("Course category added");
    }
  }

  function handleAddNoticeCat() {
    if (newNoticeValue.trim() && newNoticeLabel.trim()) {
      addNoticeCategory({ value: newNoticeValue.trim().toLowerCase().replace(/\s+/g, "-"), label: newNoticeLabel.trim() });
      setNewNoticeValue("");
      setNewNoticeLabel("");
      toast.success("Notice category added");
    }
  }

  function handleAddQual() {
    if (newQualName.trim()) {
      addQualification({ name: newQualName.trim(), sortOrder: qualifications.length + 1 });
      setNewQualName("");
      toast.success("Qualification added");
    }
  }

  function startEditQual(id: string, name: string) {
    setEditingQual(id);
    setEditQualName(name);
  }

  function saveEditQual(id: string) {
    if (editQualName.trim()) {
      updateQualification(id, { name: editQualName.trim() });
      setEditingQual(null);
      toast.success("Qualification updated");
    }
  }

  function startEditNotice(value: string, label: string) {
    setEditingNotice(value);
    setEditLabel(label);
  }

  function saveEditNotice(value: string) {
    if (editLabel.trim()) {
      updateNoticeCategory(value, { label: editLabel.trim() });
      setEditingNotice(null);
      toast.success("Notice category updated");
    }
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl font-bold text-primary">Categories</h1>
        <p className="text-sm text-muted">Manage course and notice categories.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Course Categories */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New category name"
                  value={newCourseCat}
                  onChange={(e) => setNewCourseCat(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCourseCat()}
                />
                <Button size="sm" onClick={handleAddCourseCat}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {courseCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-2 px-3 py-1.5">
                    {cat}
                    <button onClick={() => { deleteCourseCategory(cat); toast.success("Course category deleted"); }} className="hover:text-red-600 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {courseCategories.length === 0 && (
                  <p className="text-xs text-muted">No course categories yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notice Categories */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notice Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input placeholder="Value (e.g. scholarship)" value={newNoticeValue} onChange={(e) => setNewNoticeValue(e.target.value)} />
                  <Input placeholder="Label (e.g. Scholarship)" value={newNoticeLabel} onChange={(e) => setNewNoticeLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddNoticeCat()} />
                </div>
                <Button size="sm" onClick={handleAddNoticeCat} className="mt-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {noticeCategories.map((cat) => (
                  <div key={cat.value} className="flex items-center justify-between p-2 rounded-lg border border-primary/5">
                    {editingNotice === cat.value ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} size={1} className="h-8 text-sm" />
                        <button onClick={() => saveEditNotice(cat.value)} className="p-1 rounded hover:text-green-600 transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingNotice(null)} className="p-1 rounded hover:text-red-600 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Badge className={cat.color}>{cat.label}</Badge>
                          <span className="text-xs text-muted">({cat.value})</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEditNotice(cat.value, cat.label)} className="p-1 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { deleteNoticeCategory(cat.value); toast.success("Notice category deleted"); }} className="p-1 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {noticeCategories.length === 0 && (
                  <p className="text-xs text-muted">No notice categories yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Qualifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Qualifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New qualification"
                  value={newQualName}
                  onChange={(e) => setNewQualName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddQual()}
                />
                <Button size="sm" onClick={handleAddQual}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {qualifications.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-2 rounded-lg border border-primary/5">
                    {editingQual === q.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input value={editQualName} onChange={(e) => setEditQualName(e.target.value)} className="h-8 text-sm" />
                        <button onClick={() => saveEditQual(q.id)} className="p-1 rounded hover:text-green-600 transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingQual(null)} className="p-1 rounded hover:text-red-600 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Badge variant="secondary">{q.name}</Badge>
                        <div className="flex gap-1">
                          <button onClick={() => startEditQual(q.id, q.name)} className="p-1 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { deleteQualification(q.id); toast.success("Qualification deleted"); }} className="p-1 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {qualifications.length === 0 && (
                  <p className="text-xs text-muted">No qualifications yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
