"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, Printer, HelpCircle, FileQuestion, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal, type FieldConfig } from "@/components/ui/form-modal";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useAppContext } from "@/lib/app-context";
import type { Question } from "@/types";
import { toast } from "sonner";

export default function AdminExamDetailPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const { examCategories, questions, addQuestion, updateQuestion, deleteQuestion } = useAppContext();
  const printRef = useRef<HTMLDivElement>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState<Question | null>(null);

  const category = examCategories.find((c) => c.id === categoryId);
  const categoryQuestions = questions.filter((q) => q.categoryId === categoryId);

  const mcqFields: FieldConfig[] = [
    { name: "type", label: "Type", type: "select", required: true, options: [
      { value: "mcq", label: "Multiple Choice" },
      { value: "subjective", label: "Subjective" },
    ] },
    { name: "question", label: "Question", type: "textarea", required: true, placeholder: "Enter the question..." },
    { name: "option1", label: "Option A", type: "text", required: false, placeholder: "First option (for MCQ)" },
    { name: "option2", label: "Option B", type: "text", required: false, placeholder: "Second option (for MCQ)" },
    { name: "option3", label: "Option C", type: "text", required: false, placeholder: "Third option (for MCQ)" },
    { name: "option4", label: "Option D", type: "text", required: false, placeholder: "Fourth option (for MCQ)" },
    { name: "answer", label: "Correct Answer", type: "text", required: true, placeholder: "Correct answer text" },
    { name: "explanation", label: "Explanation", type: "textarea", required: true, placeholder: "Explain why this answer is correct..." },
  ];

  const editFields: FieldConfig[] = mcqFields;

  function handleAdd(data: Record<string, string>) {
    const isMcq = data.type === "mcq";
    const options = isMcq
      ? [data.option1, data.option2, data.option3, data.option4].filter(Boolean)
      : [];
    addQuestion({
      categoryId,
      type: data.type as "mcq" | "subjective",
      question: data.question,
      options,
      answer: data.answer,
      explanation: data.explanation,
    });
    setShowAdd(false);
    toast.success("Question added");
  }

  function handleEdit(data: Record<string, string>) {
    if (!editing) return;
    const isMcq = data.type === "mcq";
    const options = isMcq
      ? [data.option1, data.option2, data.option3, data.option4].filter(Boolean)
      : [];
    updateQuestion(editing.id, {
      type: data.type as "mcq" | "subjective",
      question: data.question,
      options,
      answer: data.answer,
      explanation: data.explanation,
    });
    setEditing(null);
    toast.success("Question updated");
  }

  function handleDelete() {
    if (!deleting) return;
    deleteQuestion(deleting.id);
    setDeleting(null);
    toast.success("Question deleted");
  }

  function handlePrint() {
    window.print();
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
    <>
      <div ref={printRef} className="space-y-6 print:space-y-4">
        {/* Watermark for print */}
        <div className="hidden print:block fixed inset-0 pointer-events-none z-50">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Ctext x='50%25' y='50%25' font-size='40' font-weight='900' fill='%2307220B' text-anchor='middle' dominant-baseline='central' transform='rotate(-25, 200, 200)'%3ESPECIAL ACADEMY%3C/text%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "300px 300px",
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/exams">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">{category.name}</h1>
              <p className="text-sm text-muted">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/exams/${categoryId}/results`}>
                <BarChart3 className="w-4 h-4 mr-2" /> Results
              </Link>
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Print PDF
            </Button>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Question
            </Button>
          </div>
        </div>

        {/* Print Header (visible only in print) */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">SPECIAL ACADEMY</h1>
          <p className="text-sm">Cadet Preparation Academy, Kathmandu</p>
          <h2 className="text-xl font-bold mt-4">{category.name} - Question Bank</h2>
          <p className="text-xs text-muted">Total Questions: {categoryQuestions.length}</p>
        </div>

        {categoryQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <HelpCircle className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="font-semibold text-primary mb-1">No questions yet</h3>
              <p className="text-sm text-muted">Add your first question to this category.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {categoryQuestions.map((q, i) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="print:break-inside-avoid print:shadow-none print:border print:border-gray-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <CardTitle className="text-sm font-medium">{q.question}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-[9px] ${q.type === "mcq" ? "text-blue-600" : "text-amber-600"}`}>
                              {q.type === "mcq" ? "MCQ" : "Subjective"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 no-print">
                        <button
                          onClick={() => setEditing(q)}
                          className="p-1.5 rounded-md hover:bg-accent text-muted hover:text-primary"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(q)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {q.type === "mcq" && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {q.options.map((opt, oi) => {
                          const isCorrect = opt === q.answer;
                          return (
                            <div
                              key={oi}
                              className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                isCorrect ? "bg-emerald-50 text-emerald-700 font-medium" : "bg-accent text-primary"
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-white border border-primary/10 flex items-center justify-center text-[10px] font-medium shrink-0">
                                {String.fromCharCode(65 + oi)}
                              </span>
                              {opt}
                              {isCorrect && <Badge className="ml-auto text-[8px] bg-emerald-500 text-white border-0">Correct</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {q.type === "subjective" && (
                      <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-medium text-amber-800 mb-1">Model Answer:</p>
                        <p className="text-xs text-amber-700">{q.answer}</p>
                      </div>
                    )}
                    <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-medium text-blue-800 mb-0.5">Explanation:</p>
                      <p className="text-xs text-blue-700">{q.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <FormModal open={showAdd} onClose={() => setShowAdd(false)} title="Add Question" fields={mcqFields} onSubmit={handleAdd} />
      <FormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Question"
        fields={editFields}
        initialValues={editing ? {
          type: editing.type,
          question: editing.question,
          option1: editing.options[0] || "",
          option2: editing.options[1] || "",
          option3: editing.options[2] || "",
          option4: editing.options[3] || "",
          answer: editing.answer,
          explanation: editing.explanation,
        } : undefined}
        onSubmit={handleEdit}
      />
      <DeleteModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Question" message="Are you sure you want to delete this question?" onConfirm={handleDelete} />

      <style jsx global>{`
        @media print {
          @page { margin: 15mm; }
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
}
