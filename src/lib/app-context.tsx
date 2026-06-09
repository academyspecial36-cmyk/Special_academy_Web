"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { NOTICE_CATEGORIES, COURSE_CATEGORIES } from "@/constants";
import type { FacultyMember, Subcategory, Item, ExamCategory, Question, ExamAttempt, Notice, Testimonial, GalleryImage, Course, Student } from "@/types";
import { apiList, apiCreate, apiUpdate, apiDelete } from "./api-client";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
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

interface Enrollment {
  id: string;
  fullName: string;
  email: string;
  interestedCourse: string;
  currentClass: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

interface AppContextValue {
  loading: boolean;
  faqs: FAQ[];
  facultyMembers: FacultyMember[];
  courses: Course[];
  notices: Notice[];
  testimonials: Testimonial[];
  galleryImages: GalleryImage[];
  students: Student[];
  enrollments: Enrollment[];
  courseCategories: string[];
  noticeCategories: NoticeCategory[];
  settings: AppSettings;
  subcategories: Subcategory[];
  completedItems: string[];
  toggleItemComplete: (itemId: string) => void;
  setFaqs: (faqs: FAQ[]) => void;
  addFaq: (faq: Omit<FAQ, "id" | "sortOrder">) => void;
  updateFaq: (id: string, faq: Partial<FAQ>) => void;
  deleteFaq: (id: string) => void;
  addFacultyMember: (member: Omit<FacultyMember, "id">) => void;
  updateFacultyMember: (id: string, member: Partial<FacultyMember>) => void;
  deleteFacultyMember: (id: string) => void;
  addCourse: (course: Omit<Course, "id">) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addNotice: (notice: Omit<Notice, "id">) => void;
  updateNotice: (id: string, data: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  addTestimonial: (t: Omit<Testimonial, "id">) => void;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  addGalleryImage: (img: Omit<GalleryImage, "id">) => void;
  updateGalleryImage: (id: string, data: Partial<GalleryImage>) => void;
  deleteGalleryImage: (id: string) => void;
  addStudent: (s: Omit<Student, "id">) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addEnrollment: (e: Omit<Enrollment, "id">) => void;
  updateEnrollment: (id: string, data: Partial<Enrollment>) => void;
  deleteEnrollment: (id: string) => void;
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
  return crypto.randomUUID();
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

const initialEnrollments: Enrollment[] = [
  { id: "1", fullName: "Arafat Hossain", email: "arafat@example.com", interestedCourse: "Cadet Entrance Preparation", currentClass: "Class 8", createdAt: "2025-12-01", status: "pending" },
  { id: "2", fullName: "Tasnim Rahman", email: "tasnim@example.com", interestedCourse: "Scholarship Preparation", currentClass: "Class 6", createdAt: "2025-12-02", status: "approved" },
  { id: "3", fullName: "Sadia Islam", email: "sadia@example.com", interestedCourse: "Leadership Development", currentClass: "Class 7", createdAt: "2025-12-03", status: "pending" },
  { id: "4", fullName: "Rafiq Ahmed", email: "rafiq@example.com", interestedCourse: "Foundation Classes", currentClass: "Class 9", createdAt: "2025-12-04", status: "rejected" },
  { id: "5", fullName: "Nusrat Jahan", email: "nusrat@example.com", interestedCourse: "Spoken English", currentClass: "Class 10", createdAt: "2025-12-05", status: "approved" },
];

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
      thumbnail: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&q=80",
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

function createSeedAttempts(): ExamAttempt[] {
  const now = new Date();
  return [
    {
      id: "att-1", categoryId: "exam-cat-1", studentName: "Arafat Hossain",
      answers: [
        { questionId: "q-1", answer: "Kathmandu", correct: true },
        { questionId: "q-2", answer: "Mars", correct: true },
        { questionId: "q-3", answer: "Discipline helps cadets build character and leadership.", correct: false },
      ],
      score: 2, total: 3,
      completedAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: "att-2", categoryId: "exam-cat-1", studentName: "Rahul Sharma",
      answers: [
        { questionId: "q-1", answer: "Pokhara", correct: false },
        { questionId: "q-2", answer: "Mars", correct: true },
        { questionId: "q-3", answer: "Discipline is important for cadets to be successful in life and to follow rules and regulations properly.", correct: true },
      ],
      score: 2, total: 3,
      completedAt: new Date(now.getTime() - 172800000).toISOString(),
    },
    {
      id: "att-3", categoryId: "exam-cat-1", studentName: "Priya Thapa",
      answers: [
        { questionId: "q-1", answer: "Kathmandu", correct: true },
        { questionId: "q-2", answer: "Venus", correct: false },
        { questionId: "q-3", answer: "", correct: false },
      ],
      score: 1, total: 3,
      completedAt: new Date(now.getTime() - 259200000).toISOString(),
    },
    {
      id: "att-4", categoryId: "exam-cat-2", studentName: "Arafat Hossain",
      answers: [
        { questionId: "q-4", answer: "30", correct: true },
        { questionId: "q-5", answer: "12", correct: true },
        { questionId: "q-6", answer: "x = 3", correct: true },
      ],
      score: 3, total: 3,
      completedAt: new Date(now.getTime() - 43200000).toISOString(),
    },
    {
      id: "att-5", categoryId: "exam-cat-2", studentName: "Sneha KC",
      answers: [
        { questionId: "q-4", answer: "25", correct: false },
        { questionId: "q-5", answer: "12", correct: true },
        { questionId: "q-6", answer: "x = 5", correct: false },
      ],
      score: 1, total: 3,
      completedAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: "att-6", categoryId: "exam-cat-3", studentName: "Bikram Adhikari",
      answers: [
        { questionId: "q-7", answer: "Courageous", correct: true },
        { questionId: "q-8", answer: "Happiness", correct: true },
        { questionId: "q-9", answer: "I want to join cadet academy to become a strong leader and serve my country with pride and dedication.", correct: true },
      ],
      score: 3, total: 3,
      completedAt: new Date(now.getTime() - 7200000).toISOString(),
    },
  ];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseCategories, setCourseCategories] = useState<string[]>(COURSE_CATEGORIES.filter((c) => c !== "All"));
  const [noticeCategories, setNoticeCategories] = useState<NoticeCategory[]>(NOTICE_CATEGORIES);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(createSeedSubcategories);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [examCategories, setExamCategories] = useState<ExamCategory[]>(createSeedExamCategories);
  const [questions, setQuestions] = useState<Question[]>(createSeedQuestions);
  const [attempts, setAttempts] = useState<ExamAttempt[]>(createSeedAttempts);

  useEffect(() => {
    const hasApi = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!hasApi) {
      setLoading(false);
      return;
    }

    async function loadAll() {
      try {
        const [faqData, facultyData, courseData, noticeData, testimonialData, galleryData, studentData, catData, noticeCatData, subData, itemsData, examCatData, qData, attData, settingsData, enrollmentData] = await Promise.all([
          apiList("faqs"),
          apiList("faculty_members"),
          apiList("courses"),
          apiList("notices"),
          apiList("testimonials"),
          apiList("gallery_images"),
          apiList("students"),
          apiList("course_categories"),
          apiList("notice_categories"),
          apiList("subcategories"),
          apiList("items"),
          apiList("exam_categories"),
          apiList("questions"),
          apiList("exam_attempts"),
          apiList("settings"),
          apiList("enrollments"),
        ]);

        if (Array.isArray(faqData) && faqData.length) setFaqs(faqData);
        if (Array.isArray(facultyData) && facultyData.length) setFacultyMembers(facultyData);
        if (Array.isArray(courseData) && courseData.length) setCourses(courseData);
        if (Array.isArray(noticeData) && noticeData.length) setNotices(noticeData);
        if (Array.isArray(testimonialData) && testimonialData.length) setTestimonials(testimonialData);
        if (Array.isArray(galleryData) && galleryData.length) setGalleryImages(galleryData);
        if (Array.isArray(studentData) && studentData.length) setStudents(studentData);
        if (Array.isArray(enrollmentData) && enrollmentData.length) setEnrollments(enrollmentData);
        if (Array.isArray(catData) && catData.length) setCourseCategories(catData.map((c: { name: string }) => c.name));
        if (Array.isArray(noticeCatData) && noticeCatData.length) setNoticeCategories(noticeCatData);
        if (Array.isArray(subData) && subData.length) {
          const items = Array.isArray(itemsData) ? itemsData : [];
          setSubcategories(subData.map((s: Subcategory) => ({
            ...s,
            items: items.filter((i: Item) => i.subcategoryId === s.id),
          })));
        }
        if (Array.isArray(examCatData) && examCatData.length) setExamCategories(examCatData);
        if (Array.isArray(qData) && qData.length) setQuestions(qData);
        if (Array.isArray(attData) && attData.length) setAttempts(attData);
        if (Array.isArray(settingsData) && settingsData.length) {
          const s = settingsData[0] as Record<string, unknown>;
          setSettings({
            academyName: String(s.academy_name ?? s.academyName ?? defaultSettings.academyName),
            tagline: String(s.tagline ?? defaultSettings.tagline),
            description: String(s.description ?? defaultSettings.description),
            address: String(s.address ?? defaultSettings.address),
            email: String(s.email ?? defaultSettings.email),
            admissionEmail: String(s.admission_email ?? s.admissionEmail ?? defaultSettings.admissionEmail),
            phone: String(s.phone ?? defaultSettings.phone),
            secondaryPhone: String(s.secondary_phone ?? s.secondaryPhone ?? defaultSettings.secondaryPhone),
            website: String(s.website ?? defaultSettings.website),
            officeHours: String(s.office_hours ?? s.officeHours ?? defaultSettings.officeHours),
            holiday: String(s.holiday ?? defaultSettings.holiday),
            appIcon: String(s.app_icon ?? s.appIcon ?? defaultSettings.appIcon),
            socialLinks: (s.social_links ?? s.socialLinks ?? defaultSettings.socialLinks) as SocialLinks,
          });
        }
      } catch (err) {
        console.log("API load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  const toggleItemComplete = useCallback((itemId: string) => {
    setCompletedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

  // ----- FAQs -----
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

  // ----- Faculty -----
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

  // ----- Courses -----
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

  // ----- Notices -----
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

  // ----- Testimonials -----
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

  // ----- Gallery -----
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

  // ----- Students -----
  const addStudent = useCallback(async (s: Omit<Student, "id">) => {
    const id = generateId();
    setStudents((prev) => [{ ...s, id }, ...prev]);
    try { await apiCreate("students", { id, ...s }); } catch { /* silent */ }
  }, []);

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    try { await apiUpdate("students", id, data); } catch { /* silent */ }
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    try { await apiDelete("students", id); } catch { /* silent */ }
  }, []);

  // ----- Enrollments -----
  const addEnrollment = useCallback(async (e: Omit<Enrollment, "id">) => {
    const id = generateId();
    setEnrollments((prev) => [{ ...e, id }, ...prev]);
    try { await apiCreate("enrollments", { id, ...e }); } catch { /* silent */ }
  }, []);

  const updateEnrollment = useCallback(async (id: string, data: Partial<Enrollment>) => {
    setEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    try { await apiUpdate("enrollments", id, data); } catch { /* silent */ }
  }, []);

  const deleteEnrollment = useCallback(async (id: string) => {
    setEnrollments((prev) => prev.filter((e) => e.id !== id));
    try { await apiDelete("enrollments", id); } catch { /* silent */ }
  }, []);

  // ----- Course Categories -----
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
    setSettings((prev) => ({ ...prev, ...s }));
    try { const all = await apiList("settings"); if (all.length) await apiUpdate("settings", all[0].id, s); } catch { /* silent */ }
  }, []);

  // ----- Subcategories -----
  const addSubcategory = useCallback((sub: Omit<Subcategory, "id" | "items" | "createdAt">) => {
    const newSub: Subcategory = { ...sub, id: generateId(), items: [], createdAt: new Date().toISOString() };
    setSubcategories((prev) => [...prev, newSub]);
    try { apiCreate("subcategories", newSub); } catch { /* silent */ }
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

  // ----- Exams -----
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

  return (
    <AppContext.Provider
      value={{
        loading,
        faqs, facultyMembers,
        courses, notices, testimonials, galleryImages, students, enrollments,
        courseCategories, noticeCategories, settings,
        subcategories, completedItems, toggleItemComplete,
        setFaqs, addFaq, updateFaq, deleteFaq,
        addFacultyMember, updateFacultyMember, deleteFacultyMember,
        addCourse, updateCourse, deleteCourse,
        addNotice, updateNotice, deleteNotice,
        addTestimonial, updateTestimonial, deleteTestimonial,
        addGalleryImage, updateGalleryImage, deleteGalleryImage,
        addStudent, updateStudent, deleteStudent,
        addEnrollment, updateEnrollment, deleteEnrollment,
        setCourseCategories, addCourseCategory, deleteCourseCategory,
        addNoticeCategory, deleteNoticeCategory, updateNoticeCategory,
        updateSettings,
        addSubcategory, updateSubcategory, deleteSubcategory,
        addItem, updateItem, deleteItem,
        examCategories, questions, attempts,
        addExamCategory, updateExamCategory, deleteExamCategory,
        addQuestion, updateQuestion, deleteQuestion,
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
