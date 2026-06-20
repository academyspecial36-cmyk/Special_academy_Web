"use client";

import { useState, useCallback } from "react";
import type { ExamCategory, ExamSubcategory, Question, ExamAttempt } from "@/types";
import { apiCreate, apiUpdate, apiDelete } from "@/lib/api-client";
import { generateId, createSeedExamCategories, createSeedExamSubcategories, createSeedQuestions, createSeedAttempts } from "./seed-data";

export function useExamsState() {
  const [examCategories, setExamCategories] = useState<ExamCategory[]>(createSeedExamCategories);
  const [examSubcategories, setExamSubcategories] = useState<ExamSubcategory[]>(createSeedExamSubcategories);
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
    setExamSubcategories((prev) => prev.filter((s) => s.categoryId !== id));
    setQuestions((prev) => prev.filter((q) => q.categoryId !== id));
    try { apiDelete("exam_categories", id); } catch { /* silent */ }
  }, []);

  const addExamSubcategory = useCallback((sub: Omit<ExamSubcategory, "id" | "createdAt">) => {
    const id = generateId();
    setExamSubcategories((prev) => [...prev, { ...sub, id, createdAt: new Date().toISOString() }]);
    try { apiCreate("exam_subcategories", { id, ...sub }); } catch { /* silent */ }
  }, []);

  const updateExamSubcategory = useCallback((id: string, data: Partial<ExamSubcategory>) => {
    setExamSubcategories((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    try { apiUpdate("exam_subcategories", id, data); } catch { /* silent */ }
  }, []);

  const deleteExamSubcategory = useCallback((id: string) => {
    setExamSubcategories((prev) => prev.filter((s) => s.id !== id));
    setQuestions((prev) => prev.filter((q) => q.subcategoryId !== id));
    try { apiDelete("exam_subcategories", id); } catch { /* silent */ }
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

  const addAttempt = useCallback((a: Omit<ExamAttempt, "id" | "completedAt">): string => {
    const id = generateId();
    const attempt: ExamAttempt = { ...a, id, completedAt: new Date().toISOString() };
    setAttempts((prev) => [...prev, attempt]);
    try { apiCreate("exam_attempts", attempt); } catch { /* silent */ }
    return id;
  }, []);

  return {
    examCategories, setExamCategories,
    examSubcategories, setExamSubcategories,
    questions, setQuestions,
    attempts, setAttempts,
    addExamCategory, updateExamCategory, deleteExamCategory,
    addExamSubcategory, updateExamSubcategory, deleteExamSubcategory,
    addQuestion, updateQuestion, deleteQuestion,
    addAttempt,
  };
}
