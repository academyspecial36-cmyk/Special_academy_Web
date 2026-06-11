"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useAppContext } from "@/lib/app-context";

const fields: FieldConfig[] = [
  { name: "question", label: "Question", type: "text", required: true, placeholder: "Enter the FAQ question" },
  { name: "answer", label: "Answer", type: "textarea", required: true, placeholder: "Enter the FAQ answer" },
];

export default function DashboardFaqsPage() {
  const { faqs, setFaqs, addFaq, updateFaq, deleteFaq } = useAppContext();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: string; question: string; answer: string } | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragNode = useRef<HTMLElement | null>(null);
  const pendingOrder = useRef<typeof faqs | null>(null);

  const filtered = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  function getActualIndex(faqId: string) {
    return faqs.findIndex((f) => f.id === faqId);
  }

  function handleDragStart(e: React.DragEvent, faqId: string) {
    if (search.trim()) return;
    const actualIndex = getActualIndex(faqId);
    dragNode.current = e.currentTarget as HTMLElement;
    dragNode.current.classList.add("opacity-50", "ring-2", "ring-secondary", "ring-offset-2");
    setDragIndex(actualIndex);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, faqId: string) {
    e.preventDefault();
    if (search.trim() || dragIndex === null) return;
    const targetIndex = getActualIndex(faqId);
    if (targetIndex === dragIndex) return;
    const reordered = [...faqs];
    const [removed] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    setFaqs(reordered);
    pendingOrder.current = reordered;
    setDragIndex(targetIndex);
  }

  async function handleDragEnd() {
    const item = dragNode.current;
    if (item) {
      item.classList.remove("opacity-50", "ring-2", "ring-secondary", "ring-offset-2");
    }
    setDragIndex(null);
    dragNode.current = null;

    const order = pendingOrder.current;
    pendingOrder.current = null;
    if (!order) return;

    const changed: { id: string; sortOrder: number }[] = [];
    for (let i = 0; i < order.length; i++) {
      if (order[i].sortOrder !== i) {
        changed.push({ id: order[i].id, sortOrder: i });
      }
    }

    if (changed.length === 0) return;

    await Promise.all(changed.map((faq) => updateFaq(faq.id, { sortOrder: faq.sortOrder })));
    toast.success("FAQ order updated");
  }

  function handleAdd(data: Record<string, string>) {
    addFaq({ question: data.question, answer: data.answer });
    setAddOpen(false);
    console.log("FAQ added:", data);
    toast.success("FAQ added successfully");
  }

  function handleEdit(data: Record<string, string>) {
    if (!selected) return;
    updateFaq(selected.id, { question: data.question, answer: data.answer });
    setEditOpen(false);
    setSelected(null);
    console.log("FAQ updated:", data);
    toast.success("FAQ updated successfully");
  }

  function handleDelete() {
    if (!selected) return;
    deleteFaq(selected.id);
    setDeleteOpen(false);
    setSelected(null);
    console.log("FAQ deleted:", selected.id);
    toast.success("FAQ deleted successfully");
  }

  return (
    <div>
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">FAQs</h1>
          <p className="text-sm text-muted">Manage frequently asked questions. Drag the grip icon to reorder.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <div className="mb-4 lg:mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map((faq, i) => (
          <motion.div
            key={faq.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card
              draggable={!search.trim()}
              onDragStart={(e) => handleDragStart(e, faq.id)}
              onDragOver={(e) => handleDragOver(e, faq.id)}
              onDragEnd={handleDragEnd}
              className={`cursor-default transition-shadow ${dragIndex === getActualIndex(faq.id) ? "shadow-lg" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <button
                    className={`mt-1 shrink-0 text-muted hover:text-primary transition-colors ${search.trim() ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary text-sm mb-1">{faq.question}</h3>
                    <p className="text-xs text-muted leading-relaxed">{faq.answer}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { setSelected(faq); setEditOpen(true); }}
                      className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setSelected(faq); setDeleteOpen(true); }}
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
        {filtered.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No FAQs found.</p>
        )}
      </div>

      <FormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add FAQ"
        fields={fields}
        onSubmit={handleAdd}
        submitLabel="Add FAQ"
      />

      <FormModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setSelected(null); }}
        title="Edit FAQ"
        fields={fields}
        initialValues={selected ? { question: selected.question, answer: selected.answer } : undefined}
        onSubmit={handleEdit}
        submitLabel="Update FAQ"
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete FAQ?"
        message={`Are you sure you want to delete this FAQ? This action cannot be undone.`}
      />
    </div>
  );
}
