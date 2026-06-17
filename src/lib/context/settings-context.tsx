"use client";

import { useState, useCallback } from "react";
import { apiList, apiCreate, apiUpdate, apiDelete } from "@/lib/api-client";
import {
  defaultSettings, type AppSettings, type Qualification, type NoticeCategory,
} from "./seed-data";
import { NOTICE_CATEGORIES as DEFAULT_NOTICE_CATEGORIES, COURSE_CATEGORIES as DEFAULT_COURSE_CATEGORIES } from "@/constants";

export function useSettingsState() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [courseCategories, setCourseCategories] = useState<string[]>(DEFAULT_COURSE_CATEGORIES.filter((c) => c !== "All"));
  const [noticeCategories, setNoticeCategories] = useState<NoticeCategory[]>(DEFAULT_NOTICE_CATEGORIES);

  const addQualification = useCallback(async (q: Omit<Qualification, "id">) => {
    const id = crypto.randomUUID();
    setQualifications((prev) => [...prev, { ...q, id }].sort((a, b) => a.sortOrder - b.sortOrder));
    try { await apiCreate("qualifications", { id, ...q }); } catch { /* silent */ }
  }, []);

  const updateQualification = useCallback(async (id: string, data: Partial<Qualification>) => {
    setQualifications((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
    try { await apiUpdate("qualifications", id, data); } catch { /* silent */ }
  }, []);

  const deleteQualification = useCallback(async (id: string) => {
    setQualifications((prev) => prev.filter((q) => q.id !== id));
    try { await apiDelete("qualifications", id); } catch { /* silent */ }
  }, []);

  const addCourseCategory = useCallback(async (cat: string) => {
    setCourseCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat]));
    try { await apiCreate("course_categories", { name: cat }); } catch { /* silent */ }
  }, []);

  const deleteCourseCategory = useCallback(async (cat: string) => {
    setCourseCategories((prev) => prev.filter((c) => c !== cat));
    try { const cats = await apiList("course_categories"); const found = cats.find((c: { name: string }) => c.name === cat); if (found) await apiDelete("course_categories", found.id); } catch { /* silent */ }
  }, []);

  const addNoticeCategory = useCallback((cat: Omit<NoticeCategory, "color">) => {
    const colors = [
      "bg-rose-100 text-rose-800", "bg-cyan-100 text-cyan-800",
      "bg-orange-100 text-orange-800", "bg-teal-100 text-teal-800",
      "bg-indigo-100 text-indigo-800", "bg-lime-100 text-lime-800",
    ];
    const color = colors[noticeCategories.length % colors.length];
    setNoticeCategories((prev) => [...prev, { ...cat, color }]);
    try { apiCreate("notice_categories", { ...cat, color }); } catch { /* silent */ }
  }, [noticeCategories.length]);

  const deleteNoticeCategory = useCallback(async (value: string) => {
    setNoticeCategories((prev) => prev.filter((c) => c.value !== value));
    try { const cats = await apiList("notice_categories"); const found = cats.find((c: { value: string }) => c.value === value); if (found) await apiDelete("notice_categories", found.id); } catch { /* silent */ }
  }, []);

  const updateNoticeCategory = useCallback(async (value: string, data: Partial<NoticeCategory>) => {
    setNoticeCategories((prev) => prev.map((c) => (c.value === value ? { ...c, ...data } : c)));
    try { const cats = await apiList("notice_categories"); const found = cats.find((c: { value: string }) => c.value === value); if (found) await apiUpdate("notice_categories", found.id, data); } catch { /* silent */ }
  }, []);

  const updateSettings = useCallback(async (s: Partial<AppSettings>) => {
    const all = await apiList("settings");
    const sorted = (all as { id: string }[]).sort((a, b) => a.id.localeCompare(b.id));
    if (sorted.length) await apiUpdate("settings", sorted[0].id, s);
    setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  return {
    settings, setSettings,
    qualifications, setQualifications,
    courseCategories, setCourseCategories,
    noticeCategories, setNoticeCategories,
    addQualification, updateQualification, deleteQualification,
    addCourseCategory, deleteCourseCategory,
    addNoticeCategory, deleteNoticeCategory, updateNoticeCategory,
    updateSettings,
  };
}
