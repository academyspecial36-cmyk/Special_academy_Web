type Entity = string;

export const ALLOWED_TABLES: Entity[] = [
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

export const RESTRICTED_TABLES: Entity[] = [
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

export function toDbColumn(table: string, key: string): string {
  return COLUMN_MAP[table]?.[key] ?? key;
}

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function transformKeys(obj: Record<string, unknown>, table: string, toDb: boolean): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = toDb ? toDbColumn(table, key) : toCamelCase(key);
    result[newKey] = value;
  }
  return result;
}
