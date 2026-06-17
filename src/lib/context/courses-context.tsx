"use client";

import { useState, useCallback } from "react";
import type { Course, Subcategory, Item } from "@/types";
import { apiCreate, apiUpdate, apiDelete } from "@/lib/api-client";
import { generateId, createSeedSubcategories } from "./seed-data";

export function useCoursesState() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(createSeedSubcategories);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleItemComplete = useCallback((itemId: string) => {
    setCompletedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const addCourse = useCallback(async (course: Omit<Course, "id">) => {
    const id = generateId();
    setCourses((prev) => [{ ...course, id }, ...prev]);
    try { await apiCreate("courses", { id, ...course }); } catch { /* silent */ }
  }, []);

  const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    try { await apiUpdate("courses", id, data); } catch { /* silent */ }
  }, []);

  const deleteCourse = useCallback(async (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    try { await apiDelete("courses", id); } catch { /* silent */ }
  }, []);

  const addSubcategory = useCallback((sub: Omit<Subcategory, "id" | "items" | "createdAt">) => {
    const newSub: Subcategory = { ...sub, id: generateId(), items: [], createdAt: new Date().toISOString() };
    setSubcategories((prev) => [...prev, newSub]);
    const { items: _, ...dbBody } = newSub;
    try { apiCreate("subcategories", dbBody); } catch { /* silent */ }
  }, []);

  const updateSubcategory = useCallback((id: string, data: Partial<Subcategory>) => {
    setSubcategories((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    try { apiUpdate("subcategories", id, data); } catch { /* silent */ }
  }, []);

  const deleteSubcategory = useCallback((id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
    try { apiDelete("subcategories", id); } catch { /* silent */ }
  }, []);

  const addItem = useCallback((subcategoryId: string, item: Omit<Item, "id" | "createdAt">) => {
    const newItem: Item = { ...item, id: generateId(), createdAt: new Date().toISOString() };
    setSubcategories((prev) =>
      prev.map((s) => s.id === subcategoryId ? { ...s, items: [...s.items, newItem] } : s)
    );
    try { apiCreate("items", { ...newItem, subcategoryId }); } catch { /* silent */ }
  }, []);

  const updateItem = useCallback((subcategoryId: string, itemId: string, data: Partial<Item>) => {
    setSubcategories((prev) =>
      prev.map((s) =>
        s.id === subcategoryId
          ? { ...s, items: s.items.map((item) => (item.id === itemId ? { ...item, ...data } : item)) }
          : s
      )
    );
    try { apiUpdate("items", itemId, data); } catch { /* silent */ }
  }, []);

  const deleteItem = useCallback((subcategoryId: string, itemId: string) => {
    setSubcategories((prev) =>
      prev.map((s) =>
        s.id === subcategoryId ? { ...s, items: s.items.filter((item) => item.id !== itemId) } : s
      )
    );
    try { apiDelete("items", itemId); } catch { /* silent */ }
  }, []);

  return {
    courses, setCourses,
    subcategories, setSubcategories,
    completedItems, setCompletedItems,
    toggleItemComplete,
    addCourse, updateCourse, deleteCourse,
    addSubcategory, updateSubcategory, deleteSubcategory,
    addItem, updateItem, deleteItem,
  };
}
