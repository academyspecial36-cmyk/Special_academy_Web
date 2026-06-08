"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";

export default function DashboardFaqsPage() {
  const { faqs, addFaq, updateFaq, deleteFaq } = useAppContext();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const filtered = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(faq: (typeof faqs)[0]) {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  }

  function saveEdit(id: string) {
    if (editQuestion.trim() && editAnswer.trim()) {
      updateFaq(id, { question: editQuestion, answer: editAnswer });
      setEditingId(null);
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleAdd() {
    if (newQuestion.trim() && newAnswer.trim()) {
      addFaq({ question: newQuestion, answer: newAnswer });
      setNewQuestion("");
      setNewAnswer("");
      setShowAdd(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">FAQs</h1>
          <p className="text-sm text-muted">Manage frequently asked questions.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-2" />
          {showAdd ? "Cancel" : "Add FAQ"}
        </Button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-secondary/20">
            <CardContent className="p-5 space-y-4">
              <Input
                placeholder="Question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <Textarea
                placeholder="Answer"
                rows={3}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setShowAdd(false); setNewQuestion(""); setNewAnswer(""); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAdd}>Save FAQ</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map((faq, i) => (
          <motion.div key={faq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card>
              <CardContent className="p-5">
                {editingId === faq.id ? (
                  <div className="space-y-3">
                    <Input value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} />
                    <Textarea rows={3} value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                      <Button size="sm" onClick={() => saveEdit(faq.id)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-4 h-4 text-muted mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary text-sm mb-1">{faq.question}</h3>
                      <p className="text-xs text-muted leading-relaxed">{faq.answer}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEdit(faq)} className="p-1.5 rounded-md hover:bg-primary/5 text-muted hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteFaq(faq.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No FAQs found.</p>
        )}
      </div>
    </div>
  );
}
