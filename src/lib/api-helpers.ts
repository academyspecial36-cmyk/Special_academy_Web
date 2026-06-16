import { NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleSupabase } from "./supabase-server";
import { createNotificationForRole } from "./notifications";
import { clearBootstrapCache } from "./bootstrap-cache";

type Entity = string;

const ALLOWED_TABLES: Entity[] = [
  "settings", "courses", "subcategories", "items",
  "faqs", "faculty_members", "notices", "testimonials",
  "gallery_images", "enrollments",
  "exam_categories", "questions", "exam_attempts", "exam_answers",
  "course_categories", "notice_categories", "progress", "profiles",
  "students",
  "blog_posts",
  "contact_submissions",
  "ai_conversations",
  "qualifications",
];

const RESTRICTED_TABLES: Entity[] = [
  "enrollments", "students", "exam_answers", "progress", "profiles", "contact_submissions",
];

const COLUMN_MAP: Record<string, Record<string, string>> = {
  courses: { qualification: "class_level", isPopular: "is_popular" },
  subcategories: { courseId: "course_id", shortDescription: "short_description", createdAt: "created_at" },
  items: { subcategoryId: "subcategory_id", createdAt: "created_at" },
  faculty_members: {},
  faqs: { sortOrder: "sort_order" },
  notices: { isPinned: "is_pinned", qualification: "class_level" },
  testimonials: {},
  gallery_images: {},
  students: { enrolledCourses: "enrolled_courses", joinDate: "join_date", qualificationId: "qualification_id", qualification: "class" },
  exam_categories: { createdAt: "created_at" },
  questions: { categoryId: "category_id", createdAt: "created_at" },
  exam_attempts: { studentName: "student_name", categoryId: "category_id", completedAt: "completed_at", answers: "answers", studentId: "student_id" },
  course_categories: {},
  enrollments: { fullName: "full_name", interestedCourse: "interested_course", qualificationId: "qualification_id", guardianName: "guardian_name", guardianContact: "guardian_contact", createdAt: "created_at", rejectionMessage: "rejection_message", authUserId: "auth_user_id" },
  notice_categories: {},
  settings: { academyName: "academy_name", admissionEmail: "admission_email", secondaryPhone: "secondary_phone", officeHours: "office_hours", appIcon: "app_icon", socialLinks: "social_links", enableBlog: "enable_blog", maintenanceMode: "maintenance_mode" },
  progress: { studentId: "student_id", itemId: "item_id", completedAt: "completed_at" },
  blog_posts: { createdAt: "created_at", updatedAt: "updated_at", publishedAt: "published_at" },
  contact_submissions: { isRead: "is_read" },
  qualifications: { sortOrder: "sort_order" },
};

function toDbColumn(table: string, key: string): string {
  return COLUMN_MAP[table]?.[key] ?? key;
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformKeys(obj: Record<string, unknown>, table: string, toDb: boolean): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = toDb ? toDbColumn(table, key) : toCamelCase(key);
    result[newKey] = value;
  }
  return result;
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
  }

  return null;
}

export async function handleGet(table: string, id?: string) {
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const supabase = await createServerSupabase();

  if (RESTRICTED_TABLES.includes(table)) {
    const authError = await requireAdmin(supabase);
    if (authError) return authError;
  }

  const svc = RESTRICTED_TABLES.includes(table) ? createServiceRoleSupabase() : supabase;

  const { data, error } = id
    ? await svc.from(table).select("*").eq("id", id).maybeSingle()
    : await svc.from(table).select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = Array.isArray(data) ? data.map((d: Record<string, unknown>) => transformKeys(d, table, false)) : data ? transformKeys(data as Record<string, unknown>, table, false) : null;
  return NextResponse.json(result);
}

export async function handlePost(table: string, body: Record<string, unknown>) {
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  clearBootstrapCache();
  const supabase = await createServerSupabase();

  if (RESTRICTED_TABLES.includes(table)) {
    const authError = await requireAdmin(supabase);
    if (authError) return authError;
  }

  const dbBody = transformKeys(body, table, true);
  const svc = RESTRICTED_TABLES.includes(table) ? createServiceRoleSupabase() : supabase;

  const { data, error } = await svc.from(table).insert(dbBody).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (table === "notices" && data) {
    const d = data as Record<string, unknown>;
    await createNotificationForRole(
      "student",
      "notice",
      "New Notice",
      (d.title as string) || "A new notice has been published.",
      "/student/notices",
    );
  }

  if (table === "items" && data) {
    const d = data as Record<string, unknown>;
    await createNotificationForRole(
      "student",
      "course_item",
      "New Course Material",
      `New ${d.type as string}: ${(d.title as string) || "A new item has been added to your course."}`,
      "/student/courses",
    );
  }

  return NextResponse.json(transformKeys(data as Record<string, unknown>, table, false), { status: 201 });
}

export async function handlePut(table: string, id: string, body: Record<string, unknown>) {
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  clearBootstrapCache();
  const supabase = await createServerSupabase();

  if (RESTRICTED_TABLES.includes(table)) {
    const authError = await requireAdmin(supabase);
    if (authError) return authError;
  }

  const dbBody = transformKeys(body, table, true);
  const svc = RESTRICTED_TABLES.includes(table) ? createServiceRoleSupabase() : supabase;

  const { data, error } = await svc.from(table).update(dbBody).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(transformKeys(data as Record<string, unknown>, table, false));
}

export async function handleDelete(table: string, id: string) {
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  clearBootstrapCache();
  const supabase = await createServerSupabase();

  if (RESTRICTED_TABLES.includes(table)) {
    const authError = await requireAdmin(supabase);
    if (authError) return authError;
  }

  const svc = RESTRICTED_TABLES.includes(table) ? createServiceRoleSupabase() : supabase;

  const { error } = await svc.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export function getIdFromUrl(request: Request): string | undefined {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const idIndex = pathParts.indexOf("data") + 2;
  return pathParts[idIndex] ?? undefined;
}
