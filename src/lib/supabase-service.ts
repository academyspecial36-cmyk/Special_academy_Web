import { getSupabase } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteStorageFile } from "./storage-cleanup";

let _client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!_client) {
    const s = getSupabase();
    if (!s) throw new Error("Supabase not configured");
    _client = s;
  }
  return _client!;
}
import type {
  Course, Facility, Item, Subcategory, Notice, Testimonial,
  GalleryImage, EnrollmentFormData, Student, FacultyMember,
  ExamCategory, Question, ExamAttempt,
} from "@/types";

// ==================== Settings ====================
export async function fetchSettings() {
  const { data } = await sb().from("settings").select("*").single();
  return data;
}

export async function updateSettings(values: Record<string, unknown>) {
  const { data } = await sb().from("settings").update(values).eq("id", (await fetchSettings())?.id).select().single();
  return data;
}

// ==================== Course Categories ====================
export async function fetchCourseCategories() {
  const { data } = await sb().from("course_categories").select("*");
  return (data ?? []).map((c: { name: string }) => c.name);
}

export async function addCourseCategory(name: string) {
  return sb().from("course_categories").insert({ name });
}

export async function deleteCourseCategory(name: string) {
  return sb().from("course_categories").delete().eq("name", name);
}

// ==================== Notice Categories ====================
export async function fetchNoticeCategories() {
  const { data } = await sb().from("notice_categories").select("*");
  return data ?? [];
}

// ==================== Courses ====================
export async function fetchCourses(): Promise<Course[]> {
  const { data } = await sb().from("courses").select("*");
  return (data ?? []).map(mapCourse);
}

function mapCourse(c: Record<string, unknown>): Course {
  return {
    id: String(c.id),
    title: String(c.title),
    slug: String(c.slug),
    description: String(c.description ?? ""),
    duration: String(c.duration ?? ""),
    qualification: String(c.class_level ?? ""),
    features: (c.features as string[]) ?? [],
    image: String(c.image ?? ""),
    category: String(c.category ?? ""),
    price: String(c.price ?? ""),
    isPopular: Boolean(c.is_popular),
  };
}

// ==================== Subcategories ====================
export async function fetchSubcategories(): Promise<Subcategory[]> {
  const { data } = await sb().from("subcategories").select("*");
  return (data ?? []).map(mapSubcategory);
}

function mapSubcategory(s: Record<string, unknown>): Subcategory {
  return {
    id: String(s.id),
    courseId: String(s.course_id),
    title: String(s.title),
    thumbnail: String(s.thumbnail ?? ""),
    shortDescription: String(s.short_description ?? ""),
    createdAt: String(s.created_at),
    status: s.status as "paid" | "free",
    hidden: Boolean(s.hidden),
    items: [],
  };
}

export async function addSubcategory(sub: Partial<Subcategory>) {
  return sb().from("subcategories").insert({
    course_id: sub.courseId,
    title: sub.title,
    thumbnail: sub.thumbnail,
    short_description: sub.shortDescription,
    status: sub.status,
    hidden: sub.hidden,
  });
}

export async function updateSubcategory(id: string, data: Partial<Subcategory>) {
  return sb().from("subcategories").update({
    title: data.title,
    thumbnail: data.thumbnail,
    short_description: data.shortDescription,
    status: data.status,
    hidden: data.hidden,
  }).eq("id", id);
}

export async function deleteSubcategory(id: string) {
  const { data: sub } = await sb().from("subcategories").select("thumbnail").eq("id", id).maybeSingle();
  if (sub?.thumbnail) await deleteStorageFile(sub.thumbnail);
  return sb().from("subcategories").delete().eq("id", id);
}

// ==================== Items ====================
export async function fetchItemsBySubcategory(subcategoryId: string): Promise<Item[]> {
  const { data } = await sb().from("items").select("*").eq("subcategory_id", subcategoryId);
  return (data ?? []).map(mapItem);
}

function mapItem(i: Record<string, unknown>): Item {
  return {
    id: String(i.id),
    subcategoryId: String(i.subcategory_id),
    type: i.type as "video" | "pdf",
    title: String(i.title),
    description: String(i.description ?? ""),
    url: String(i.url),
    duration: i.duration ? String(i.duration) : undefined,
    createdAt: String(i.created_at),
    status: i.status as "paid" | "free",
    hidden: Boolean(i.hidden),
  };
}

export async function addItem(subcategoryId: string, item: Partial<Item>) {
  return sb().from("items").insert({
    subcategory_id: subcategoryId,
    type: item.type,
    title: item.title,
    description: item.description,
    url: item.url,
    duration: item.duration,
    status: item.status,
    hidden: item.hidden,
  });
}

export async function updateItem(id: string, data: Partial<Item>) {
  return sb().from("items").update({
    type: data.type,
    title: data.title,
    description: data.description,
    url: data.url,
    duration: data.duration,
    status: data.status,
    hidden: data.hidden,
  }).eq("id", id);
}

export async function deleteItem(id: string) {
  const { data: item } = await sb().from("items").select("url").eq("id", id).maybeSingle();
  if (item?.url) await deleteStorageFile(item.url);
  return sb().from("items").delete().eq("id", id);
}

// ==================== FAQs ====================
export async function fetchFaqs(): Promise<{ id: string; question: string; answer: string }[]> {
  const { data } = await sb().from("faqs").select("*").order("sort_order");
  return (data ?? []).map((f: Record<string, unknown>) => ({
    id: String(f.id),
    question: String(f.question),
    answer: String(f.answer),
  }));
}

export async function addFaq(faq: { question: string; answer: string }, sortOrder?: number) {
  return sb().from("faqs").insert({ question: faq.question, answer: faq.answer, sort_order: sortOrder ?? 0 });
}

export async function updateFaq(id: string, data: { question?: string; answer?: string; sort_order?: number }) {
  return sb().from("faqs").update(data).eq("id", id);
}

export async function deleteFaq(id: string) {
  return sb().from("faqs").delete().eq("id", id);
}

export async function reorderFaqs(faqs: { id: string; sort_order: number }[]) {
  for (const f of faqs) {
    await sb().from("faqs").update({ sort_order: f.sort_order }).eq("id", f.id);
  }
}

// ==================== Faculty ====================
export async function fetchFaculty(): Promise<FacultyMember[]> {
  const { data } = await sb().from("faculty_members").select("*");
  return (data ?? []).map((f: Record<string, unknown>) => ({
    id: String(f.id),
    name: String(f.name),
    role: String(f.role ?? ""),
    qualification: String(f.qualification ?? ""),
    experience: String(f.experience ?? ""),
    image: String(f.image ?? ""),
    subjects: (f.subjects as string[]) ?? [],
  }));
}

// ==================== Notices ====================
export async function fetchNotices(): Promise<Notice[]> {
  const { data } = await sb().from("notices").select("*").order("date", { ascending: false });
  return (data ?? []).map((n: Record<string, unknown>) => ({
    id: String(n.id),
    title: String(n.title),
    content: String(n.content),
    category: n.category as Notice["category"],
    date: String(n.date),
    isPinned: Boolean(n.is_pinned),
    author: String(n.author ?? ""),
    image: n.image ? String(n.image) : undefined,
  }));
}

// ==================== Testimonials ====================
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data } = await sb().from("testimonials").select("*");
  return (data ?? []).map((t: Record<string, unknown>) => ({
    id: String(t.id),
    name: String(t.name),
    role: t.role as Testimonial["role"],
    content: String(t.content),
    rating: Number(t.rating),
    image: t.image ? String(t.image) : undefined,
    achievement: t.achievement ? String(t.achievement) : undefined,
    qualification: t.class ? String(t.class) : undefined,
  }));
}

// ==================== Gallery ====================
export async function fetchGallery(): Promise<GalleryImage[]> {
  const { data } = await sb().from("gallery_images").select("*");
  return (data ?? []).map((g: Record<string, unknown>) => ({
    id: String(g.id),
    src: String(g.src),
    alt: String(g.alt ?? ""),
    category: String(g.category ?? ""),
  }));
}

// ==================== Enrollments ====================
export async function addEnrollment(data: EnrollmentFormData) {
  return sb().from("enrollments").insert({
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    qualification_id: data.qualificationId,
    interested_course: data.interestedCourse,
    guardian_name: data.guardianName,
    guardian_contact: data.guardianContact,
    address: data.address,
    message: data.message,
  });
}

// ==================== Exams ====================
export async function fetchExamCategories(): Promise<ExamCategory[]> {
  const { data } = await sb().from("exam_categories").select("*");
  return (data ?? []).map((e: Record<string, unknown>) => ({
    id: String(e.id),
    name: String(e.name),
    description: String(e.description ?? ""),
    color: String(e.color),
    createdAt: String(e.created_at),
  }));
}

export async function fetchQuestions(categoryId: string): Promise<Question[]> {
  const { data } = await sb().from("questions").select("*").eq("category_id", categoryId);
  return (data ?? []).map((q: Record<string, unknown>) => ({
    id: String(q.id),
    categoryId: String(q.category_id),
    type: q.type as "mcq" | "subjective",
    question: String(q.question),
    options: (q.options as string[]) ?? [],
    answer: String(q.answer),
    explanation: String(q.explanation ?? ""),
    createdAt: String(q.created_at),
  }));
}

export async function addExamAttempt(studentId: string, categoryId: string, studentName: string, score: number, total: number, answers: { questionId: string; answer: string; correct: boolean }[]) {
  const { data: attempt } = await sb().from("exam_attempts").insert({
    student_id: studentId,
    category_id: categoryId,
    student_name: studentName,
    score,
    total,
  }).select().single();

  if (attempt) {
    await sb().from("exam_answers").insert(
      answers.map((a) => ({
        attempt_id: attempt.id,
        question_id: a.questionId,
        answer: a.answer,
        correct: a.correct,
      }))
    );
  }

  return attempt;
}

export async function fetchAttempts(categoryId: string): Promise<ExamAttempt[]> {
  const { data } = await sb().from("exam_attempts").select("*").eq("category_id", categoryId).order("completed_at", { ascending: false });
  return (data ?? []).map((a: Record<string, unknown>) => ({
    id: String(a.id),
    categoryId: String(a.category_id),
    studentName: String(a.student_name),
    score: Number(a.score),
    total: Number(a.total),
    completedAt: String(a.completed_at),
    answers: [],
  }));
}

// ==================== Progress ====================
export async function fetchProgress(studentId: string): Promise<string[]> {
  const { data } = await sb().from("progress").select("item_id").eq("student_id", studentId);
  return (data ?? []).map((p: Record<string, unknown>) => String(p.item_id));
}

export async function toggleProgress(studentId: string, itemId: string, completed: boolean) {
  if (completed) {
    return sb().from("progress").delete().eq("student_id", studentId).eq("item_id", itemId);
  } else {
    return sb().from("progress").insert({ student_id: studentId, item_id: itemId });
  }
}

// ==================== Auth ====================
export async function signIn(email: string, password: string) {
  return sb().auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, name: string, role: "admin" | "student" = "student") {
  const { data: authData, error } = await sb().auth.signUp({ email, password });
  if (error) throw error;
  if (authData.user) {
    await sb().from("profiles").insert({
      id: authData.user.id,
      name,
      email,
      role,
    });
  }
  return authData;
}

export async function signOut() {
  return sb().auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await sb().auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb().from("profiles").select("*").eq("id", user.id).single();
  return profile;
}

// ==================== Storage ====================
export async function uploadFile(bucket: "images" | "pdfs", file: File) {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const { error } = await sb().storage.from(bucket).upload(path, file);
  if (error) throw error;
  const { data: urlData } = sb().storage.from(bucket).getPublicUrl(path);
  return urlData?.publicUrl ?? path;
}
