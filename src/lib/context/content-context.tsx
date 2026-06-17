"use client";

import { useState, useCallback } from "react";
import type { FacultyMember, Notice, Testimonial, GalleryImage } from "@/types";
import { apiCreate, apiUpdate, apiDelete } from "@/lib/api-client";
import { generateId, createSeedNotices, type FAQ } from "./seed-data";

export function useContentState() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [notices, setNotices] = useState<Notice[]>(createSeedNotices);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const addFaq = useCallback(async (faq: Omit<FAQ, "id" | "sortOrder">) => {
    const id = generateId();
    const sortOrder = faqs.length;
    setFaqs((prev) => [...prev, { id, sortOrder, ...faq }]);
    try { await apiCreate("faqs", { id, sortOrder, ...faq }); } catch { /* silent */ }
  }, [faqs.length]);

  const updateFaq = useCallback(async (id: string, data: Partial<FAQ>) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
    try { await apiUpdate("faqs", id, data); } catch { /* silent */ }
  }, []);

  const deleteFaq = useCallback(async (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    try { await apiDelete("faqs", id); } catch { /* silent */ }
  }, []);

  const addFacultyMember = useCallback(async (member: Omit<FacultyMember, "id">) => {
    const id = generateId();
    setFacultyMembers((prev) => [...prev, { id, ...member }]);
    try { await apiCreate("faculty_members", { id, ...member }); } catch { /* silent */ }
  }, []);

  const updateFacultyMember = useCallback(async (id: string, data: Partial<FacultyMember>) => {
    setFacultyMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    try { await apiUpdate("faculty_members", id, data); } catch { /* silent */ }
  }, []);

  const deleteFacultyMember = useCallback(async (id: string) => {
    setFacultyMembers((prev) => prev.filter((m) => m.id !== id));
    try { await apiDelete("faculty_members", id); } catch { /* silent */ }
  }, []);

  const addNotice = useCallback(async (notice: Omit<Notice, "id">) => {
    const id = generateId();
    setNotices((prev) => [{ ...notice, id }, ...prev]);
    try { await apiCreate("notices", { id, ...notice }); } catch { /* silent */ }
  }, []);

  const updateNotice = useCallback(async (id: string, data: Partial<Notice>) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
    try { await apiUpdate("notices", id, data); } catch { /* silent */ }
  }, []);

  const deleteNotice = useCallback(async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    try { await apiDelete("notices", id); } catch { /* silent */ }
  }, []);

  const addTestimonial = useCallback(async (t: Omit<Testimonial, "id">) => {
    const id = generateId();
    setTestimonials((prev) => [{ ...t, id }, ...prev]);
    try { await apiCreate("testimonials", { id, ...t }); } catch { /* silent */ }
  }, []);

  const updateTestimonial = useCallback(async (id: string, data: Partial<Testimonial>) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    try { await apiUpdate("testimonials", id, data); } catch { /* silent */ }
  }, []);

  const deleteTestimonial = useCallback(async (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    try { await apiDelete("testimonials", id); } catch { /* silent */ }
  }, []);

  const addGalleryImage = useCallback(async (img: Omit<GalleryImage, "id">) => {
    const id = generateId();
    setGalleryImages((prev) => [{ ...img, id }, ...prev]);
    try { await apiCreate("gallery_images", { id, ...img }); } catch { /* silent */ }
  }, []);

  const updateGalleryImage = useCallback(async (id: string, data: Partial<GalleryImage>) => {
    setGalleryImages((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
    try { await apiUpdate("gallery_images", id, data); } catch { /* silent */ }
  }, []);

  const deleteGalleryImage = useCallback(async (id: string) => {
    setGalleryImages((prev) => prev.filter((g) => g.id !== id));
    try { await apiDelete("gallery_images", id); } catch { /* silent */ }
  }, []);

  return {
    faqs, setFaqs,
    facultyMembers, setFacultyMembers,
    notices, setNotices,
    testimonials, setTestimonials,
    galleryImages, setGalleryImages,
    addFaq, updateFaq, deleteFaq,
    addFacultyMember, updateFacultyMember, deleteFacultyMember,
    addNotice, updateNotice, deleteNotice,
    addTestimonial, updateTestimonial, deleteTestimonial,
    addGalleryImage, updateGalleryImage, deleteGalleryImage,
  };
}
