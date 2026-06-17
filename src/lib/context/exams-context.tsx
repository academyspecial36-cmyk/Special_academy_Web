"use client";

import { useState, useCallback } from "react";
import type { ExamCategory, Question, ExamAttempt } from "@/types";
import { apiCreate, apiUpdate, apiDelete } from "@/lib/api-client";
import { generateId, createSeedExamCategories, createSeedQuestions, createSeedAttempts } from "./seed-data";

export function useExamsState() {
  const [examCategories, setExamCategories] = useState<ExamCategory[]>(createSeedExamCategories);
  const [questions, setQuestions] = useState<Question[]>(createSeedQuestions);
  const [attempts, setAttempts] = useState<ExamAttempt[]>(createSeedAttempts);

  const addExamCategory = useCallback((cat: Omit<ExamCategory, "id" | "createdAt">) => {
    const id = generateId();
    setExamCategories((prev) => [...prev, { ...cat, id, createdAt: new Date().toISOString() }]);
    try { apiCreate("exam_categories", { id, ...cat }); } catch { /* silent */ }
  }, []);

  const updateExamCategory = useCallback((id: string, data: Partial<ExamCategory>) => {
    setExamCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    try { apiUpdate("exam_categories", id, data); } catch { /* silent */ }
  }, []);

  const deleteExamCategory = useCallback((id: string) => {
    setExamCategories((prev) => prev.filter((c) => c.id !== id));
    setQuestions((prev) => prev.filter((q) => q.categoryId !== id));
    try { apiDelete("exam_categories", id); } catch { /* silent */ }
  }, []);

  const addQuestion = useCallback((q: Omit<Question, "id" | "createdAt">) => {
    const id = generateId();
    setQuestions((prev) => [...prev, { ...q, id, createdAt: new Date().toISOString() }]);
    try { apiCreate("questions", { id, ...q }); } catch { /* silent */ }
  }, []);

  const updateQuestion = useCallback((id: string, data: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
    try { apiUpdate("questions", id, data); } catch { /* silent */ }
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    try { apiDelete("questions", id); } catch { /* silent */ }
  }, []);

  const addAttempt = useCallback((a: Omit<ExamAttempt, "id" | "completedAt">) => {
    const attempt: ExamAttempt = { ...a, id: generateId(), completedAt: new Date().toISOString() };
    setAttempts((prev) => [...prev, attempt]);
    try { apiCreate("exam_attempts", attempt); } catch { /* silent */ }
  }, []);

  return {
    examCategories, setExamCategories,
    questions, setQuestions,
    attempts, setAttempts,
    addExamCategory, updateExamCategory, deleteExamCategory,
    addQuestion, updateQuestion, deleteQuestion,
    addAttempt,
  };
}
