"use client";

import { useState, useCallback, useEffect } from "react";
import type { Course, Subcategory, Item } from "@/types";
import { apiCreate, apiUpdate, apiDelete } from "@/lib/api-client";
import { generateId, createSeedSubcategories } from "./seed-data";
import { logger } from "@/lib/logger";

function useRollback<T>() {
  const [snapshots, setSnapshots] = useState<Map<string, T>>(new Map());

  const save = useCallback((key: string, data: T) => {
    setSnapshots((prev) => {
      const next = new Map(prev);
      next.set(key, data);
      return next;
    });
  }, []);

  const restore = useCallback((key: string, setter: (data: T) => void) => {
    setSnapshots((prev) => {
      const snapshot = prev.get(key);
      if (snapshot) {
        setter(snapshot);
        const next = new Map(prev);
        next.delete(key);
        return next;
      }
      return prev;
    });
  }, []);

  return { save, restore };
}

export function useCoursesState() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(createSeedSubcategories);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const rollbackCourses = useRollback<Course[]>();
  const rollbackSubs = useRollback<Subcategory[]>();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cadet_completed_items");
      if (stored) {
        setCompletedItems(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const toggleItemComplete = useCallback((itemId: string) => {
    setCompletedItems((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      try {
        localStorage.setItem("cadet_completed_items", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const addCourse = useCallback(async (course: Omit<Course, "id">) => {
    const id = generateId();
    rollbackCourses.save("courses", courses);
    const optimistic = { ...course, id } as Course;
    setCourses((prev) => [optimistic, ...prev]);
    try { await apiCreate("courses", { id, ...course }); } catch {
      rollbackCourses.restore("courses", setCourses);
    }
  }, [courses, rollbackCourses]);

  const updateCourse = useCallback(async (id: string, data: Partial<Course>) => {
    rollbackCourses.save("courses", courses);
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    try { await apiUpdate("courses", id, data); } catch {
      rollbackCourses.restore("courses", setCourses);
    }
  }, [courses, rollbackCourses]);

  const deleteCourse = useCallback(async (id: string) => {
    rollbackCourses.save("courses", courses);
    const deleted = courses.find((c) => c.id === id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    try { await apiDelete("courses", id); } catch {
      if (deleted) setCourses((prev) => [...prev, deleted]);
    }
  }, [courses, rollbackCourses]);

  const addSubcategory = useCallback((sub: Omit<Subcategory, "id" | "items" | "createdAt">) => {
    rollbackSubs.save("subcategories", subcategories);
    const newSub: Subcategory = { ...sub, id: generateId(), items: [], createdAt: new Date().toISOString() };
    setSubcategories((prev) => [...prev, newSub]);
    const { items: _, ...dbBody } = newSub;
    apiCreate("subcategories", dbBody).catch(() => {
      rollbackSubs.restore("subcategories", setSubcategories);
    });
  }, [subcategories, rollbackSubs]);

  const updateSubcategory = useCallback((id: string, data: Partial<Subcategory>) => {
    rollbackSubs.save("subcategories", subcategories);
    setSubcategories((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    apiUpdate("subcategories", id, data).catch(() => {
      rollbackSubs.restore("subcategories", setSubcategories);
    });
  }, [subcategories, rollbackSubs]);

  const deleteSubcategory = useCallback((id: string) => {
    rollbackSubs.save("subcategories", subcategories);
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
    apiDelete("subcategories", id).catch(() => {
      rollbackSubs.restore("subcategories", setSubcategories);
    });
  }, [subcategories, rollbackSubs]);

  const addItem = useCallback((subcategoryId: string, item: Omit<Item, "id" | "createdAt">) => {
    rollbackSubs.save("items", subcategories);
    const newItem: Item = { ...item, id: generateId(), createdAt: new Date().toISOString() };
    setSubcategories((prev) =>
      prev.map((s) => s.id === subcategoryId ? { ...s, items: [...s.items, newItem] } : s)
    );
    apiCreate("items", { ...newItem, subcategoryId }).catch(() => {
      rollbackSubs.restore("items", setSubcategories);
    });
  }, [subcategories, rollbackSubs]);

  const updateItem = useCallback((subcategoryId: string, itemId: string, data: Partial<Item>) => {
    rollbackSubs.save("items-update", subcategories);
    setSubcategories((prev) =>
      prev.map((s) =>
        s.id === subcategoryId
          ? { ...s, items: s.items.map((item) => (item.id === itemId ? { ...item, ...data } : item)) }
          : s
      )
    );
    apiUpdate("items", itemId, data).catch(() => {
      rollbackSubs.restore("items-update", setSubcategories);
    });
  }, [subcategories, rollbackSubs]);

  const deleteItem = useCallback((subcategoryId: string, itemId: string) => {
    rollbackSubs.save("items-delete", subcategories);
    setSubcategories((prev) =>
      prev.map((s) =>
        s.id === subcategoryId ? { ...s, items: s.items.filter((item) => item.id !== itemId) } : s
      )
    );
    apiDelete("items", itemId).catch(() => {
      rollbackSubs.restore("items-delete", setSubcategories);
    });
  }, [subcategories, rollbackSubs]);

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
