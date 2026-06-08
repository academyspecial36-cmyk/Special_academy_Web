"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  faqs as initialFaqs,
  facultyMembers as initialFaculty,
} from "@/mock";
import { NOTICE_CATEGORIES as initialNoticeCats, COURSE_CATEGORIES as initialCourseCats } from "@/constants";
import { FacultyMember } from "@/types";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface NoticeCategory {
  value: string;
  label: string;
  color: string;
}

interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
}

interface AppSettings {
  academyName: string;
  tagline: string;
  description: string;
  address: string;
  email: string;
  admissionEmail: string;
  phone: string;
  secondaryPhone: string;
  website: string;
  officeHours: string;
  holiday: string;
  appIcon: string;
  socialLinks: SocialLinks;
}

interface AppContextValue {
  faqs: FAQ[];
  facultyMembers: FacultyMember[];
  courseCategories: string[];
  noticeCategories: NoticeCategory[];
  settings: AppSettings;
  setFaqs: (faqs: FAQ[]) => void;
  addFaq: (faq: Omit<FAQ, "id">) => void;
  updateFaq: (id: string, faq: Partial<FAQ>) => void;
  deleteFaq: (id: string) => void;
  addFacultyMember: (member: Omit<FacultyMember, "id">) => void;
  updateFacultyMember: (id: string, member: Partial<FacultyMember>) => void;
  deleteFacultyMember: (id: string) => void;
  setCourseCategories: (cats: string[]) => void;
  addCourseCategory: (cat: string) => void;
  deleteCourseCategory: (cat: string) => void;
  addNoticeCategory: (cat: Omit<NoticeCategory, "color">) => void;
  deleteNoticeCategory: (value: string) => void;
  updateNoticeCategory: (value: string, cat: Partial<NoticeCategory>) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const defaultSettings: AppSettings = {
  academyName: "Special academy",
  tagline: "Preparing Future Leaders Through Discipline & Excellence",
  description: "Nepal's premier cadet preparation academy since 2010.",
  address: "M8RP+363 New baneshwor, Devkota Sadak, Kathmandu 44600",
  email: "info@cadetacademy.edu",
  admissionEmail: "admission@cadetacademy.edu",
  phone: "986-0302036",
  secondaryPhone: "986-0302036",
  website: "https://cadetacademy.edu",
  officeHours: "Sun–Thu: 9:00 AM – 5:00 PM",
  holiday: "Friday & Public Holidays",
  appIcon: "/icon-image.png",
  socialLinks: {
    facebook: "https://facebook.com/specialacademy",
    instagram: "https://instagram.com/specialacademy",
    tiktok: "https://tiktok.com/@specialacademy",
    youtube: "https://youtube.com/@specialacademy",
  },
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [faqs, setFaqs] = useState<FAQ[]>(() =>
    initialFaqs.map((f, i) => ({ ...f, id: `faq-${i}` }))
  );
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>(initialFaculty);
  const [courseCategories, setCourseCategories] = useState<string[]>(initialCourseCats.filter((c) => c !== "All"));
  const [noticeCategories, setNoticeCategories] = useState<NoticeCategory[]>(initialNoticeCats);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const addFaq = useCallback((faq: Omit<FAQ, "id">) => {
    setFaqs((prev) => [...prev, { id: generateId(), ...faq }]);
  }, []);

  const updateFaq = useCallback((id: string, data: Partial<FAQ>) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  }, []);

  const deleteFaq = useCallback((id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addFacultyMember = useCallback((member: Omit<FacultyMember, "id">) => {
    setFacultyMembers((prev) => [...prev, { id: generateId(), ...member }]);
  }, []);

  const updateFacultyMember = useCallback((id: string, data: Partial<FacultyMember>) => {
    setFacultyMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  }, []);

  const deleteFacultyMember = useCallback((id: string) => {
    setFacultyMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addCourseCategory = useCallback((cat: string) => {
    setCourseCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat]));
  }, []);

  const deleteCourseCategory = useCallback((cat: string) => {
    setCourseCategories((prev) => prev.filter((c) => c !== cat));
  }, []);

  const addNoticeCategory = useCallback((cat: Omit<NoticeCategory, "color">) => {
    const colors = [
      "bg-rose-100 text-rose-800",
      "bg-cyan-100 text-cyan-800",
      "bg-orange-100 text-orange-800",
      "bg-teal-100 text-teal-800",
      "bg-indigo-100 text-indigo-800",
      "bg-lime-100 text-lime-800",
    ];
    const color = colors[noticeCategories.length % colors.length];
    setNoticeCategories((prev) => [...prev, { ...cat, color }]);
  }, [noticeCategories.length]);

  const deleteNoticeCategory = useCallback((value: string) => {
    setNoticeCategories((prev) => prev.filter((c) => c.value !== value));
  }, []);

  const updateNoticeCategory = useCallback((value: string, data: Partial<NoticeCategory>) => {
    setNoticeCategories((prev) => prev.map((c) => (c.value === value ? { ...c, ...data } : c)));
  }, []);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        faqs,
        facultyMembers,
        courseCategories,
        noticeCategories,
        settings,
        setFaqs,
        addFaq,
        updateFaq,
        deleteFaq,
        addFacultyMember,
        updateFacultyMember,
        deleteFacultyMember,
        setCourseCategories,
        addCourseCategory,
        deleteCourseCategory,
        addNoticeCategory,
        deleteNoticeCategory,
        updateNoticeCategory,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
