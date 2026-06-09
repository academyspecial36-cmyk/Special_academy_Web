"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  faqs as initialFaqs,
  facultyMembers as initialFaculty,
} from "@/mock";
import { NOTICE_CATEGORIES as initialNoticeCats, COURSE_CATEGORIES as initialCourseCats } from "@/constants";
import { FacultyMember, Subcategory, Item, Course, ExamCategory, Question, ExamAttempt } from "@/types";
import { courses } from "@/mock";

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
  subcategories: Subcategory[];
  completedItems: string[];
  toggleItemComplete: (itemId: string) => void;
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
  addSubcategory: (sub: Omit<Subcategory, "id" | "items" | "createdAt">) => void;
  updateSubcategory: (id: string, data: Partial<Subcategory>) => void;
  deleteSubcategory: (id: string) => void;
  addItem: (subcategoryId: string, item: Omit<Item, "id" | "createdAt">) => void;
  updateItem: (subcategoryId: string, itemId: string, data: Partial<Item>) => void;
  deleteItem: (subcategoryId: string, itemId: string) => void;
  examCategories: ExamCategory[];
  questions: Question[];
  attempts: ExamAttempt[];
  addExamCategory: (cat: Omit<ExamCategory, "id" | "createdAt">) => void;
  updateExamCategory: (id: string, data: Partial<ExamCategory>) => void;
  deleteExamCategory: (id: string) => void;
  addQuestion: (q: Omit<Question, "id" | "createdAt">) => void;
  updateQuestion: (id: string, data: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addAttempt: (a: Omit<ExamAttempt, "id" | "completedAt">) => void;
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

function createSeedSubcategories(): Subcategory[] {
  const now = new Date().toISOString();
  return [
    {
      id: "sub-1", courseId: "1", title: "General Knowledge",
      thumbnail: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=80",
      shortDescription: "Comprehensive GK covering history, geography, science and current affairs.",
      createdAt: now, status: "free", hidden: false,
      items: [
        { id: "item-1", subcategoryId: "sub-1", type: "video", title: "GK - Introduction to World Geography", description: "Overview of continents and oceans.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "12:30", createdAt: now, status: "free", hidden: false },
        { id: "item-2", subcategoryId: "sub-1", type: "pdf", title: "GK Study Notes - Chapter 1", description: "Complete study notes with diagrams.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "paid", hidden: false },
        { id: "item-3", subcategoryId: "sub-1", type: "video", title: "Current Affairs - Monthly Review", description: "Important current events summarized.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18:45", createdAt: now, status: "free", hidden: false },
      ],
    },
    {
      id: "sub-2", courseId: "1", title: "English Language",
      thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80",
      shortDescription: "Grammar, vocabulary, comprehension and essay writing skills.",
      createdAt: now, status: "free", hidden: false,
      items: [
        { id: "item-4", subcategoryId: "sub-2", type: "video", title: "English Grammar - Tenses", description: "Complete guide to English tenses.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "15:20", createdAt: now, status: "free", hidden: false },
        { id: "item-5", subcategoryId: "sub-2", type: "pdf", title: "Vocabulary Builder - 500 Words", description: "Essential vocabulary for cadet exams.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "free", hidden: false },
      ],
    },
    {
      id: "sub-3", courseId: "1", title: "Mathematics",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&q=80",
      shortDescription: "Arithmetic, algebra, geometry and data interpretation.",
      createdAt: now, status: "paid", hidden: false,
      items: [
        { id: "item-6", subcategoryId: "sub-3", type: "video", title: "Algebra Basics", description: "Linear equations and quadratic formulas.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "22:10", createdAt: now, status: "paid", hidden: false },
        { id: "item-7", subcategoryId: "sub-3", type: "pdf", title: "Math Formula Sheet", description: "All important formulas in one place.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "paid", hidden: false },
      ],
    },
    {
      id: "sub-4", courseId: "1", title: "Intelligence (IQ)",
      thumbnail: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      shortDescription: "Logical reasoning, pattern recognition and mental ability.",
      createdAt: now, status: "free", hidden: false,
      items: [
        { id: "item-8", subcategoryId: "sub-4", type: "video", title: "IQ Test Strategies", description: "Tips and tricks for IQ tests.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "10:15", createdAt: now, status: "free", hidden: false },
      ],
    },
    {
      id: "sub-5", courseId: "2", title: "Advanced Mathematics",
      thumbnail: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=200&q=80",
      shortDescription: "Advanced topics for scholarship exams.",
      createdAt: now, status: "free", hidden: false,
      items: [
        { id: "item-9", subcategoryId: "sub-5", type: "video", title: "Number Systems", description: "Understanding number theory.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "14:30", createdAt: now, status: "free", hidden: false },
        { id: "item-10", subcategoryId: "sub-5", type: "pdf", title: "Practice Problems Set 1", description: "100 practice problems with solutions.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "paid", hidden: false },
      ],
    },
    {
      id: "sub-6", courseId: "2", title: "English Literature",
      thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&q=80",
      shortDescription: "Literary analysis and advanced comprehension.",
      createdAt: now, status: "free", hidden: false,
      items: [
        { id: "item-11", subcategoryId: "sub-6", type: "video", title: "Poetry Analysis", description: "How to analyze poems effectively.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "20:00", createdAt: now, status: "free", hidden: false },
      ],
    },
    {
      id: "sub-7", courseId: "3", title: "Science Fundamentals",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&q=80",
      shortDescription: "Physics, chemistry and biology fundamentals.",
      createdAt: now, status: "free", hidden: false,
      items: [
        { id: "item-12", subcategoryId: "sub-7", type: "video", title: "Introduction to Physics", description: "Basic concepts of motion and force.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "16:40", createdAt: now, status: "free", hidden: false },
        { id: "item-13", subcategoryId: "sub-7", type: "pdf", title: "Science Lab Manual", description: "Lab experiments and procedures.", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", createdAt: now, status: "free", hidden: false },
      ],
    },
  ];
}

function createSeedExamCategories(): ExamCategory[] {
  return [
    { id: "exam-cat-1", name: "General Knowledge", description: "Test your knowledge of history, geography, science and current affairs.", color: "bg-emerald-100 text-emerald-800", createdAt: new Date().toISOString() },
    { id: "exam-cat-2", name: "Mathematics", description: "Arithmetic, algebra, geometry and data interpretation.", color: "bg-blue-100 text-blue-800", createdAt: new Date().toISOString() },
    { id: "exam-cat-3", name: "English", description: "Grammar, vocabulary, comprehension and writing skills.", color: "bg-amber-100 text-amber-800", createdAt: new Date().toISOString() },
  ];
}

function createSeedQuestions(): Question[] {
  const now = new Date().toISOString();
  return [
    { id: "q-1", categoryId: "exam-cat-1", type: "mcq", question: "What is the capital of Nepal?", options: ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur"], answer: "Kathmandu", explanation: "Kathmandu is the capital and largest city of Nepal.", createdAt: now },
    { id: "q-2", categoryId: "exam-cat-1", type: "mcq", question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars", explanation: "Mars appears reddish due to iron oxide on its surface.", createdAt: now },
    { id: "q-3", categoryId: "exam-cat-1", type: "subjective", question: "Explain the importance of discipline in a cadet's life.", options: [], answer: "Discipline is crucial for cadets as it builds character, instills punctuality, and develops leadership qualities necessary for military service.", explanation: "Discipline forms the foundation of cadet training.", createdAt: now },
    { id: "q-4", categoryId: "exam-cat-2", type: "mcq", question: "What is 15% of 200?", options: ["25", "30", "35", "40"], answer: "30", explanation: "15% of 200 = (15/100) × 200 = 30.", createdAt: now },
    { id: "q-5", categoryId: "exam-cat-2", type: "mcq", question: "What is the square root of 144?", options: ["10", "11", "12", "13"], answer: "12", explanation: "12 × 12 = 144.", createdAt: now },
    { id: "q-6", categoryId: "exam-cat-2", type: "subjective", question: "Solve: 5x + 3 = 18. Find x.", options: [], answer: "x = 3", explanation: "5x + 3 = 18 → 5x = 15 → x = 3.", createdAt: now },
    { id: "q-7", categoryId: "exam-cat-3", type: "mcq", question: "What is the synonym of 'Brave'?", options: ["Cowardly", "Courageous", "Timid", "Weak"], answer: "Courageous", explanation: "Brave and courageous are synonyms.", createdAt: now },
    { id: "q-8", categoryId: "exam-cat-3", type: "mcq", question: "Which of the following is a noun?", options: ["Run", "Beautiful", "Happiness", "Quickly"], answer: "Happiness", explanation: "Happiness is a noun representing a state of being.", createdAt: now },
    { id: "q-9", categoryId: "exam-cat-3", type: "subjective", question: "Write a short paragraph about your aspirations to join the cadet academy.", options: [], answer: "Model answer: I aspire to join the cadet academy to develop leadership skills, build character, and serve my nation with honor and discipline.", explanation: "Answers should reflect genuine motivation and understanding of cadet life.", createdAt: now },
  ];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [faqs, setFaqs] = useState<FAQ[]>(() =>
    initialFaqs.map((f, i) => ({ ...f, id: `faq-${i}` }))
  );
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>(initialFaculty);
  const [courseCategories, setCourseCategories] = useState<string[]>(initialCourseCats.filter((c) => c !== "All"));
  const [noticeCategories, setNoticeCategories] = useState<NoticeCategory[]>(initialNoticeCats);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(createSeedSubcategories);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [examCategories, setExamCategories] = useState<ExamCategory[]>(createSeedExamCategories);
  const [questions, setQuestions] = useState<Question[]>(createSeedQuestions);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);

  const toggleItemComplete = useCallback((itemId: string) => {
    setCompletedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

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

  const addSubcategory = useCallback((sub: Omit<Subcategory, "id" | "items" | "createdAt">) => {
    const newSub: Subcategory = {
      ...sub,
      id: generateId(),
      items: [],
      createdAt: new Date().toISOString(),
    };
    setSubcategories((prev) => [...prev, newSub]);
  }, []);

  const updateSubcategory = useCallback((id: string, data: Partial<Subcategory>) => {
    setSubcategories((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const deleteSubcategory = useCallback((id: string) => {
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addItem = useCallback((subcategoryId: string, item: Omit<Item, "id" | "createdAt">) => {
    const newItem: Item = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setSubcategories((prev) =>
      prev.map((s) =>
        s.id === subcategoryId ? { ...s, items: [...s.items, newItem] } : s
      )
    );
  }, []);

  const updateItem = useCallback((subcategoryId: string, itemId: string, data: Partial<Item>) => {
    setSubcategories((prev) =>
      prev.map((s) =>
        s.id === subcategoryId
          ? { ...s, items: s.items.map((item) => (item.id === itemId ? { ...item, ...data } : item)) }
          : s
      )
    );
  }, []);

  const deleteItem = useCallback((subcategoryId: string, itemId: string) => {
    setSubcategories((prev) =>
      prev.map((s) =>
        s.id === subcategoryId
          ? { ...s, items: s.items.filter((item) => item.id !== itemId) }
          : s
      )
    );
  }, []);

  const addExamCategory = useCallback((cat: Omit<ExamCategory, "id" | "createdAt">) => {
    setExamCategories((prev) => [...prev, { ...cat, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateExamCategory = useCallback((id: string, data: Partial<ExamCategory>) => {
    setExamCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteExamCategory = useCallback((id: string) => {
    setExamCategories((prev) => prev.filter((c) => c.id !== id));
    setQuestions((prev) => prev.filter((q) => q.categoryId !== id));
  }, []);

  const addQuestion = useCallback((q: Omit<Question, "id" | "createdAt">) => {
    setQuestions((prev) => [...prev, { ...q, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateQuestion = useCallback((id: string, data: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const addAttempt = useCallback((a: Omit<ExamAttempt, "id" | "completedAt">) => {
    setAttempts((prev) => [...prev, { ...a, id: generateId(), completedAt: new Date().toISOString() }]);
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
        subcategories,
        completedItems,
        toggleItemComplete,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        addItem,
        updateItem,
        deleteItem,
        examCategories,
        questions,
        attempts,
        addExamCategory,
        updateExamCategory,
        deleteExamCategory,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addAttempt,
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
