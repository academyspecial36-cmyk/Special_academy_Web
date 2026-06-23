"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { apiList, clearCache } from "@/lib/api-client";
import { useCoursesState } from "./courses-context";
import { useExamsState } from "./exams-context";
import { useStudentsState, type Enrollment } from "./students-context";
import { useContentState } from "./content-context";
import { useSettingsState } from "./settings-context";
import {
  generateId, defaultSettings, createSeedExamCategories, createSeedQuestions, createSeedAttempts,
  type FAQ, type AppSettings, type Qualification, type NoticeCategory,
} from "./seed-data";
import { NOTICE_CATEGORIES as DEFAULT_NOTICE_CATEGORIES } from "@/constants";
import type { FacultyMember, Subcategory, Item, ExamCategory, ExamSubcategory, Question, ExamAttempt, Notice, Testimonial, GalleryImage, Course, Student } from "@/types";

export interface AppContextValue {
  loading: boolean;
  dataLoading: boolean;
  loadAdminData: () => Promise<void>;
  faqs: FAQ[]; facultyMembers: FacultyMember[]; courses: Course[]; notices: Notice[];
  testimonials: Testimonial[]; galleryImages: GalleryImage[]; students: Student[]; enrollments: Enrollment[];
  courseCategories: string[]; noticeCategories: NoticeCategory[]; settings: AppSettings;
  subcategories: Subcategory[]; completedItems: string[]; qualifications: Qualification[];
  setQualifications: (q: Qualification[]) => void;
  addQualification: (q: Omit<Qualification, "id">) => void;
  updateQualification: (id: string, data: Partial<Qualification>) => void;
  deleteQualification: (id: string) => void;
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
  setEnrollments: React.Dispatch<React.SetStateAction<Enrollment[]>>;
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
  examSubcategories: ExamSubcategory[];
  questions: Question[];
  attempts: ExamAttempt[];
  addExamCategory: (cat: Omit<ExamCategory, "id" | "createdAt">) => void;
  updateExamCategory: (id: string, data: Partial<ExamCategory>) => void;
  deleteExamCategory: (id: string) => void;
  addExamSubcategory: (sub: Omit<ExamSubcategory, "id" | "createdAt">) => void;
  updateExamSubcategory: (id: string, data: Partial<ExamSubcategory>) => void;
  deleteExamSubcategory: (id: string) => void;
  addQuestion: (q: Omit<Question, "id" | "createdAt">) => void;
  updateQuestion: (id: string, data: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addAttempt: (a: Omit<ExamAttempt, "id" | "completedAt">) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  const courses = useCoursesState();
  const exams = useExamsState();
  const students = useStudentsState();
  const content = useContentState();
  const settings = useSettingsState();

  // Merge nested state setters into the proper shape
  const setEnrollments = students.setEnrollments;
  const setCourseCategories = settings.setCourseCategories as (cats: string[]) => void;

  useEffect(() => {
    const hasApi = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!hasApi) {
      setLoading(false);
      setDataLoading(false);
      return;
    }

    async function loadBootstrap() {
      try {
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const { settings: merged } = await settingsRes.json();
          settings.setSettings(merged);
        }
      } catch {
        /* fallback to defaults */
      } finally {
        setLoading(false);
      }

      try {
        const bootstrapRes = await fetch("/api/bootstrap");
        if (bootstrapRes.ok) {
          const data = await bootstrapRes.json();
          if (data.settings) settings.setSettings(data.settings);
          if (Array.isArray(data.faqs) && data.faqs.length) content.setFaqs(data.faqs);
          if (Array.isArray(data.facultyMembers) && data.facultyMembers.length) content.setFacultyMembers(data.facultyMembers);
          if (Array.isArray(data.courses) && data.courses.length) courses.setCourses(data.courses);
          if (Array.isArray(data.notices)) content.setNotices(data.notices);
          if (Array.isArray(data.testimonials) && data.testimonials.length) content.setTestimonials(data.testimonials);
          if (Array.isArray(data.galleryImages) && data.galleryImages.length) content.setGalleryImages(data.galleryImages);
          if (Array.isArray(data.courseCategories) && data.courseCategories.length) settings.setCourseCategories(data.courseCategories.map((c: { name: string }) => c.name));
          if (Array.isArray(data.noticeCategories) && data.noticeCategories.length) settings.setNoticeCategories(data.noticeCategories);
          if (Array.isArray(data.subcategories) && data.subcategories.length) {
            const items = Array.isArray(data.items) ? data.items : [];
            courses.setSubcategories(data.subcategories.map((s: Subcategory) => ({
              ...s,
              items: items.filter((i: Item) => i.subcategoryId === s.id),
            })));
          }
          if (Array.isArray(data.examCategories) && data.examCategories.length) exams.setExamCategories(data.examCategories);
          if (Array.isArray(data.examSubcategories) && data.examSubcategories.length) exams.setExamSubcategories(data.examSubcategories);
          if (Array.isArray(data.questions) && data.questions.length) exams.setQuestions(data.questions);
          if (Array.isArray(data.qualifications) && data.qualifications.length) {
            settings.setQualifications((data.qualifications as Qualification[]).sort((a, b) => a.sortOrder - b.sortOrder));
          }
        }
      } catch (err) {
        console.log("Bootstrap load failed:", err);
      }

      try {
        const attemptData = await apiList("exam_attempts");
        if (Array.isArray(attemptData) && attemptData.length) exams.setAttempts(attemptData);
      } catch { /* not authenticated or no attempts */ } finally {
        setDataLoading(false);
      }
    }

    loadBootstrap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAdminData = useCallback(async () => {
    try {
      clearCache("students");
      clearCache("enrollments");
      clearCache("exam_attempts");
      const [studentData, enrollmentData, attemptData] = await Promise.all([
        apiList("students").catch(() => []),
        apiList("enrollments").catch(() => []),
        apiList("exam_attempts").catch(() => []),
      ]);
      if (Array.isArray(studentData)) students.setStudents(studentData);
      if (Array.isArray(enrollmentData)) students.setEnrollments(enrollmentData);
      if (Array.isArray(attemptData)) exams.setAttempts(attemptData);
    } catch {
      // admin data unavailable
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: AppContextValue = {
    loading, dataLoading, loadAdminData,

    faqs: content.faqs, facultyMembers: content.facultyMembers,
    notices: content.notices, testimonials: content.testimonials,
    galleryImages: content.galleryImages,
    courses: courses.courses,
    subcategories: courses.subcategories,
    completedItems: courses.completedItems,
    toggleItemComplete: courses.toggleItemComplete,
    addCourse: courses.addCourse, updateCourse: courses.updateCourse, deleteCourse: courses.deleteCourse,
    addSubcategory: courses.addSubcategory, updateSubcategory: courses.updateSubcategory, deleteSubcategory: courses.deleteSubcategory,
    addItem: courses.addItem, updateItem: courses.updateItem, deleteItem: courses.deleteItem,

    students: students.students, enrollments: students.enrollments, setEnrollments,
    addStudent: students.addStudent, updateStudent: students.updateStudent, deleteStudent: students.deleteStudent,
    addEnrollment: students.addEnrollment, updateEnrollment: students.updateEnrollment, deleteEnrollment: students.deleteEnrollment,

    examCategories: exams.examCategories, examSubcategories: exams.examSubcategories, questions: exams.questions, attempts: exams.attempts,
    addExamCategory: exams.addExamCategory, updateExamCategory: exams.updateExamCategory, deleteExamCategory: exams.deleteExamCategory,
    addExamSubcategory: exams.addExamSubcategory, updateExamSubcategory: exams.updateExamSubcategory, deleteExamSubcategory: exams.deleteExamSubcategory,
    addQuestion: exams.addQuestion, updateQuestion: exams.updateQuestion, deleteQuestion: exams.deleteQuestion,
    addAttempt: exams.addAttempt,

    setFaqs: content.setFaqs,
    addFaq: content.addFaq, updateFaq: content.updateFaq, deleteFaq: content.deleteFaq,
    addFacultyMember: content.addFacultyMember, updateFacultyMember: content.updateFacultyMember, deleteFacultyMember: content.deleteFacultyMember,
    addNotice: content.addNotice, updateNotice: content.updateNotice, deleteNotice: content.deleteNotice,
    addTestimonial: content.addTestimonial, updateTestimonial: content.updateTestimonial, deleteTestimonial: content.deleteTestimonial,
    addGalleryImage: content.addGalleryImage, updateGalleryImage: content.updateGalleryImage, deleteGalleryImage: content.deleteGalleryImage,

    courseCategories: settings.courseCategories, setCourseCategories,
    noticeCategories: settings.noticeCategories,
    settings: settings.settings,
    qualifications: settings.qualifications, setQualifications: settings.setQualifications,
    addQualification: settings.addQualification, updateQualification: settings.updateQualification, deleteQualification: settings.deleteQualification,
    addCourseCategory: settings.addCourseCategory, deleteCourseCategory: settings.deleteCourseCategory,
    addNoticeCategory: settings.addNoticeCategory, deleteNoticeCategory: settings.deleteNoticeCategory, updateNoticeCategory: settings.updateNoticeCategory,
    updateSettings: settings.updateSettings,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
