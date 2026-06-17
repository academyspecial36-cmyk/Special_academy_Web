"use client";

import { useState, useCallback, type Dispatch, type SetStateAction } from "react";
import type { Student } from "@/types";
import { apiCreate, apiUpdate, apiDelete } from "@/lib/api-client";
import { generateId, initialEnrollments } from "./seed-data";

export interface Enrollment {
  id: string; fullName: string; email: string; interestedCourse: string;
  qualificationId: string; createdAt: string; status: "unverified" | "pending" | "approved" | "rejected"; rejectionMessage?: string;
}

export function useStudentsState() {
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);

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

  return {
    students, setStudents,
    enrollments, setEnrollments,
    addStudent, updateStudent, deleteStudent,
    addEnrollment, updateEnrollment, deleteEnrollment,
  };
}
