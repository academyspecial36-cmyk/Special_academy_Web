"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Eye, EyeOff, Plus, X, Trash2, Copy, GripVertical,
  CheckCircle, Circle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";
import { toast } from "sonner";

interface QuestionDraft {
  id: string;
  type: "mcq" | "subjective" | "checkbox" | "dropdown" | "short" | "paragraph";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  required: boolean;
}

const STORAGE_KEY_PREFIX = "gf_draft_";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "short", label: "Short answer" },
  { value: "paragraph", label: "Paragraph" },
  { value: "subjective", label: "Subjective" },
] as const;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function GoogleFormAddQuestions() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const { examCategories, addQuestion } = useAppContext();
  const category = examCategories.find((c) => c.id === categoryId);

  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const storageKey = STORAGE_KEY_PREFIX + categoryId;

  // Auto-save to localStorage on every change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ questions }));
    } catch { /* quota exceeded */ }
  }, [questions, loaded, storageKey]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.questions?.length) setQuestions(data.questions);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  }, [storageKey]);

  const hasErrors = questions.some((q) => !q.question.trim());

  function addQuestionDraft(type: QuestionDraft["type"] = "mcq") {
    const newQ: QuestionDraft = {
      id: generateId(),
      type,
      question: "",
      options: ["", ""],
      answer: "",
      explanation: "",
      required: false,
    };
    setQuestions((prev) => [...prev, newQ]);
    setFocusId(newQ.id);
  }

  function duplicateQuestion(id: string) {
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return;
    const original = questions[idx];
    const clone: QuestionDraft = { ...original, id: generateId(), question: original.question };
    setQuestions((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    setFocusId(clone.id);
  }

  function removeQuestion(id: string) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, data: Partial<QuestionDraft>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
  }

  function addOption(questionId: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, options: [...q.options, ""] } : q))
    );
  }

  function addOtherOption(questionId: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, options: [...q.options, "Other:"] } : q))
    );
  }

  function removeOption(questionId: string, index: number) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = q.options.filter((_, i) => i !== index);
        return {
          ...q,
          options: newOptions,
          answer: q.answer === q.options[index] ? "" : q.answer,
        };
      })
    );
  }

  function updateOption(questionId: string, index: number, value: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = q.options.map((o, i) => (i === index ? value : o));
        return {
          ...q,
          options: newOptions,
          answer: q.answer === q.options[index] ? value : q.answer,
        };
      })
    );
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  async function saveAll() {
    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }
    if (hasErrors) {
      toast.error("Fill in all required fields");
      return;
    }

    setSaving(true);
    let saved = 0;
    for (const q of questions) {
      try {
        addQuestion({
          categoryId,
          type: q.type === "checkbox" || q.type === "dropdown" || q.type === "short" || q.type === "paragraph" ? "mcq" : q.type,
          question: q.question.trim(),
          options: ["mcq", "checkbox", "dropdown"].includes(q.type) ? q.options.filter((o) => o.trim()) : [],
          answer: q.answer.trim(),
          explanation: q.explanation.trim(),
        });
        saved++;
      } catch {
        toast.error(`Failed to save: ${q.question.slice(0, 40)}`);
      }
    }
    if (saved > 0) {
      toast.success(`${saved} question${saved > 1 ? "s" : ""} saved`);
      clearDraft();
      router.push(`/dashboard/exams/${categoryId}`);
    }
    setSaving(false);
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#202124] mb-2">Category not found</h2>
          <Button variant="outline" asChild>
            <Link href="/dashboard/exams">Back to Exams</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ebf8]">
      {/* Google Forms Header */}
      <div className="bg-white border-b border-[#dadce0]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/dashboard/exams/${categoryId}`} className="text-[#5f6368] hover:text-[#202124] transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPreview(!preview)}
              className={`p-2 rounded-full hover:bg-[#f1f3f4] transition-colors ${preview ? "text-[#1a73e8]" : "text-[#5f6368]"}`}
              title={preview ? "Edit" : "Preview"}
            >
              {preview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              onClick={saveAll}
              disabled={questions.length === 0 || hasErrors || saving}
              className="ml-2 px-4 py-2 bg-[#673AB7] text-white text-sm font-medium rounded hover:bg-[#5e35b1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : `Save`}
            </button>
          </div>
        </div>
      </div>

      {/* Purple accent header */}
      <div className="bg-[#673AB7] h-2" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Form Title Card */}
        <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] mb-4 overflow-hidden">
          <div className="h-2 bg-[#673AB7]" />
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-normal text-[#202124] mb-1">{category.name}</h1>
            {category.description && (
              <p className="text-sm text-[#5f6368]">{category.description}</p>
            )}
          </div>
        </div>

        {/* Question Cards */}
        {questions.length === 0 && !preview ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#e8e0f0] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-[#673AB7]" />
            </div>
            <h3 className="text-lg font-medium text-[#202124] mb-2">No questions yet</h3>
            <p className="text-sm text-[#5f6368] mb-6">Start adding questions to your form</p>
            <button
              onClick={() => addQuestionDraft("mcq")}
              className="px-6 py-2.5 bg-[#673AB7] text-white text-sm font-medium rounded hover:bg-[#5e35b1] transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Add Question
            </button>
          </div>
        ) : preview ? (
          /* Preview Mode */
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] p-6 sm:p-8">
              <h2 className="text-2xl font-normal text-[#202124] mb-1">{category.name}</h2>
              {category.description && <p className="text-sm text-[#5f6368] mb-6">{category.description}</p>}
              {questions.map((q, idx) => (
                <div key={q.id} className="mb-6 last:mb-0">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-sm font-medium text-[#202124]">{idx + 1}. {q.question || <span className="text-[#5f6368] italic">(untitled)</span>}</span>
                    {q.required && <span className="text-[#d93025] text-lg leading-none">*</span>}
                  </div>
                  {["mcq", "checkbox"].includes(q.type) ? (
                    <div className="space-y-2">
                      {q.options.filter((o) => o.trim()).map((opt, oi) => (
                        <label key={oi} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-full border-2 border-[#5f6368] flex items-center justify-center shrink-0`} />
                          <span className="text-sm text-[#202124]">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === "dropdown" ? (
                    <div className="relative">
                      <div className="w-full h-10 px-3 bg-white border border-[#dadce0] rounded text-sm text-[#5f6368] flex items-center gap-2">
                        Choose
                        <ChevronDown className="w-4 h-4 ml-auto text-[#5f6368]" />
                      </div>
                    </div>
                  ) : (
                    <div className="border-b border-dashed border-[#dadce0] pb-1">
                      <span className="text-sm text-[#5f6368]">{q.type === "short" ? "Short answer text" : "Long answer text"}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Editor Mode - Question Cards */
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={() => setDragIndex(null)}
                className={`bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] overflow-hidden border-l-[6px] border-l-[#673AB7] transition-opacity ${dragIndex === idx ? "opacity-50" : ""}`}
              >
                {/* Question Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <div className="hidden sm:flex flex-col gap-[2px] mt-2 cursor-grab text-[#dadce0] hover:text-[#5f6368] transition-colors shrink-0"
                      onMouseDown={() => handleDragStart(idx)}>
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Question Input + Type */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <input
                          autoFocus={focusId === q.id}
                          value={q.question}
                          onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                          placeholder="Question"
                          className="flex-1 text-base font-medium text-[#202124] outline-none border-none bg-transparent placeholder:text-[#5f6368] py-1 border-b-2 border-transparent focus:border-b-[#673AB7] transition-colors"
                        />
                        <div className="relative shrink-0">
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const newType = e.target.value as QuestionDraft["type"];
                              updateQuestion(q.id, {
                                type: newType,
                                options: ["mcq", "checkbox", "dropdown"].includes(newType)
                                  ? (q.options.length >= 2 ? q.options : ["", ""])
                                  : [],
                              });
                            }}
                            className="appearance-none h-9 px-3 pr-8 bg-[#f8f9fa] border border-[#dadce0] rounded text-sm text-[#202124] outline-none cursor-pointer hover:bg-[#f1f3f4] transition-colors"
                          >
                            {QUESTION_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368] pointer-events-none" />
                        </div>
                      </div>

                      {/* Options / Answer Area */}
                      {["mcq", "checkbox", "dropdown"].includes(q.type) ? (
                        <div className="mt-4 space-y-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-3 group">
                              {q.type === "checkbox" ? (
                                <div className="w-4 h-4 rounded-sm border-2 border-[#5f6368] shrink-0" />
                              ) : q.type === "dropdown" ? (
                                <span className="text-xs font-medium text-[#5f6368] w-4 shrink-0">{oi + 1}.</span>
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-[#5f6368] shrink-0" />
                              )}
                              <input
                                value={opt}
                                onChange={(e) => updateOption(q.id, oi, e.target.value)}
                                placeholder={`Option ${oi + 1}`}
                                className="flex-1 h-9 px-2 text-sm text-[#202124] outline-none border-none bg-transparent border-b border-dashed border-[#dadce0] focus:border-b-[#673AB7] focus:border-solid placeholder:text-[#5f6368] transition-colors"
                              />
                              {q.options.length > 1 && (
                                <button
                                  onClick={() => removeOption(q.id, oi)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              {q.type === "mcq" && (
                                <button
                                  onClick={() => updateQuestion(q.id, { answer: opt })}
                                  className={`p-1 rounded transition-colors ${
                                    q.answer === opt ? "text-[#673AB7]" : "text-[#dadce0] hover:text-[#5f6368]"
                                  }`}
                                  title="Mark as correct answer"
                                >
                                  {q.answer === opt ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(q.id)}
                            className="flex items-center gap-3 text-sm text-[#1a73e8] hover:text-[#1557b0] transition-colors py-1"
                          >
                            <span className="w-4 shrink-0" />
                            Add option
                          </button>
                          {(q.type === "mcq" || q.type === "checkbox") && (
                            <button
                              onClick={() => addOtherOption(q.id)}
                              className="flex items-center gap-3 text-sm text-[#1a73e8] hover:text-[#1557b0] transition-colors py-1"
                            >
                              <span className="w-4 shrink-0" />
                              Add &quot;Other&quot;
                            </button>
                          )}
                        </div>
                      ) : q.type === "subjective" ? (
                        <div className="mt-4">
                          <input
                            value={q.answer}
                            onChange={(e) => updateQuestion(q.id, { answer: e.target.value })}
                            placeholder="Model answer"
                            className="w-full h-9 px-2 text-sm text-[#202124] outline-none border-b border-dashed border-[#dadce0] focus:border-b-[#673AB7] focus:border-solid placeholder:text-[#5f6368] transition-colors bg-transparent"
                          />
                          <div className="mt-2 p-3 bg-[#f8f9fa] border border-[#dadce0] rounded text-sm text-[#5f6368] italic">
                            Long answer text
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <div className="border-b border-dashed border-[#dadce0] pb-1">
                            <span className="text-sm text-[#5f6368]">
                              {q.type === "short" ? "Short answer text" : "Long answer text"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Explanation (collapsible) */}
                      <details className="mt-3 group">
                        <summary className="text-xs text-[#5f6368] cursor-pointer hover:text-[#202124] transition-colors list-none flex items-center gap-1">
                          <span className="text-[#1a73e8] text-xs">+</span> Explanation
                        </summary>
                        <input
                          value={q.explanation}
                          onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                          placeholder="Add an explanation for the correct answer..."
                          className="mt-2 w-full h-8 px-2 text-sm text-[#202124] outline-none border-b border-dashed border-[#dadce0] focus:border-b-[#673AB7] focus:border-solid placeholder:text-[#5f6368] transition-colors bg-transparent"
                        />
                      </details>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-[#dadce0] bg-[#f8f9fa]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5f6368]">Required</span>
                    <button
                      onClick={() => updateQuestion(q.id, { required: !q.required })}
                      className={`relative w-8 h-4 rounded-full transition-colors ${
                        q.required ? "bg-[#673AB7]" : "bg-[#bdbdbd]"
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${
                        q.required ? "translate-x-[18px]" : "translate-x-[2px]"
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateQuestion(q.id)}
                      className="p-2 rounded text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="p-2 rounded text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Question Button */}
            <div className="flex justify-center py-4">
              <button
                onClick={() => addQuestionDraft("mcq")}
                className="w-14 h-14 rounded-full bg-[#673AB7] text-white shadow-lg hover:shadow-xl hover:bg-[#5e35b1] transition-all flex items-center justify-center"
                title="Add question"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Draft indicator */}
        {loaded && questions.length > 0 && !preview && (
          <div className="mt-4 text-center">
            <span className="text-xs text-[#5f6368]">
              Draft auto-saved · {questions.length} question{questions.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {questions.length > 0 && !preview && (
        <div className="sticky bottom-0 bg-white border-t border-[#dadce0] shadow-[0_-2px_6px_rgba(0,0,0,0.1)]">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-[#5f6368]">{questions.length} question{questions.length > 1 ? "s" : ""}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearDraft();
                  router.push(`/dashboard/exams/${categoryId}`);
                }}
                className="text-[#5f6368] border-[#dadce0]"
              >
                Cancel
              </Button>
              <button
                onClick={saveAll}
                disabled={questions.length === 0 || hasErrors || saving}
                className="px-5 py-2 bg-[#673AB7] text-white text-sm font-medium rounded hover:bg-[#5e35b1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : `Save All`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
