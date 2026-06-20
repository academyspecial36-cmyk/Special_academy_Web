import { z } from "zod";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import type { AIToolDefinition } from "@/types/ai";

function define<T extends z.ZodTypeAny>(
  name: string,
  description: string,
  schema: T,
  handler: (args: z.infer<T>) => Promise<unknown>,
  requiresConfirmation = false
): AIToolDefinition {
  return {
    name,
    description,
    parameters: schema as unknown as Record<string, unknown>,
    requiresConfirmation,
    handler: async (args: Record<string, unknown>, _userId: string) => {
      try {
        const parsed = schema.parse(args);
        const data = await handler(parsed);
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    },
  };
}

const svc = () => createServiceRoleSupabase();

export const getStudentsTool = define(
  "getStudents",
  "Call this when the user asks to see/list/show/display/find students or wants student data/reports. Returns id, name, email, phone, qualification, status, enrolled courses.",
  z.object({
    status: z.enum(["active", "inactive"]).optional().describe("Filter by student status"),
    search: z.string().optional().describe("Search by name or email"),
    limit: z.number().optional().default(50),
  }),
  async ({ status, search, limit }) => {
    let query = svc().from("students").select("*").limit(limit);
    if (status) query = query.eq("status", status);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  }
);

export const getCoursesTool = define(
  "getCourses",
  "Call this when the user asks to see/list/show/display courses or wants course information. Returns id, title, description, duration, qualification, price, category, features.",
  z.object({
    category: z.string().optional().describe("Filter by course category"),
    search: z.string().optional().describe("Search by title"),
    limit: z.number().optional().default(50),
  }),
  async ({ category, search, limit }) => {
    let query = svc().from("courses").select("*, qualification:qualifications(name)").limit(limit);
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map((c: Record<string, unknown>) => ({
      ...c,
      qualification: typeof c.qualification === "object" && c.qualification
        ? (c.qualification as Record<string, unknown>).name ?? ""
        : "",
    }));
  }
);

export const getNoticesTool = define(
  "getNotices",
  "Call this when the user asks to see/list/show/display notices or wants notice/announcement information. Returns id, title, content, category, date, is_pinned, author.",
  z.object({
    category: z.string().optional().describe("Filter by notice category"),
    pinned: z.boolean().optional().describe("Filter pinned notices"),
    outdated: z.boolean().optional().describe("Show only outdated notices"),
    search: z.string().optional().describe("Search by title"),
    limit: z.number().optional().default(50),
  }),
  async ({ category, pinned, outdated, search, limit }) => {
    let query = svc().from("notices").select("*").limit(limit);
    if (category) query = query.eq("category", category);
    if (pinned !== undefined) query = query.eq("is_pinned", pinned);
    if (outdated) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      query = query.lt("date", threeMonthsAgo.toISOString());
    }
    if (search) query = query.ilike("title", `%${search}%`);
    query = query.order("date", { ascending: false });
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  }
);

export const getEnrollmentsTool = define(
  "getEnrollments",
  "Call this when the user asks to see/list/show/display enrollment applications or wants enrollment data. Returns id, full_name, email, phone, interested_course, qualification, status, created_at.",
  z.object({
    status: z.enum(["unverified", "pending", "approved", "rejected"]).optional().describe("Filter by enrollment status"),
    limit: z.number().optional().default(50),
  }),
  async ({ status, limit }) => {
    let query = svc().from("enrollments").select("*").limit(limit);
    if (status) query = query.eq("status", status);
    query = query.order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  }
);

export const getFAQsTool = define(
  "getFAQs",
  "Call this when the user asks to see/list/show/display FAQs, frequently asked questions, or wants FAQ data. Returns id, question, answer, sort_order.",
  z.object({
    limit: z.number().optional().default(50),
  }),
  async ({ limit }) => {
    const { data, error } = await svc().from("faqs").select("*").limit(limit).order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }
);

export const getBlogsTool = define(
  "getBlogs",
  "Call this when the user asks to see/list/show/display blog posts or wants blog data. Returns id, title, content, excerpt, author, published_at, status.",
  z.object({
    status: z.string().optional().describe("Filter by status: draft or published"),
    limit: z.number().optional().default(50),
  }),
  async ({ status, limit }) => {
    let query = svc().from("blog_posts").select("*").limit(limit);
    if (status) query = query.eq("status", status);
    query = query.order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  }
);

export const getExamResultsTool = define(
  "getExamResults",
  "Call this when the user asks to see/list/show results for a specific exam, or wants exam performance data. Returns student name, email, score, total marks, percentage, and pass/fail status.",
  z.object({
    examId: z.string().describe("The exam/category ID to get results for"),
    limit: z.number().optional().default(50),
  }),
  async ({ examId, limit }) => {
    const { data, error } = await svc()
      .from("exam_results")
      .select("*, students(name, email)")
      .eq("exam_id", examId)
      .limit(limit)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: Record<string, unknown>) => ({
      studentName: (r.students as Record<string, unknown> | null)?.name ?? "Unknown",
      email: (r.students as Record<string, unknown> | null)?.email ?? "",
      score: r.score,
      totalMarks: r.total_marks,
      percentage: r.total_marks ? Math.round(((r.score as number) / (r.total_marks as number)) * 1000) / 10 : undefined,
      status: r.status,
    }));
  }
);

export const getStatsTool = define(
  "getStats",
  "Call this when the user asks for statistics, analytics, dashboard summary, counts, or 'how many' students/courses/etc. Returns counts of students, courses, enrollments, notices, FAQs, and blog posts.",
  z.object({
    period: z.string().optional().describe("Time period: 'all' or 'this_month'"),
  }),
  async ({ period }) => {
    const svc = createServiceRoleSupabase();

    const tables = ["students", "courses", "enrollments", "notices", "faqs", "blog_posts"] as const;
    const counts: Record<string, number> = {};

    for (const table of tables) {
      let query = svc.from(table).select("*", { count: "exact", head: true });
      if (period === "this_month") {
        const firstOfMonth = new Date();
        firstOfMonth.setDate(1);
        firstOfMonth.setHours(0, 0, 0, 0);
        query = query.gte("created_at", firstOfMonth.toISOString());
      }
      const { count } = await query;
      counts[table] = count ?? 0;
    }

    return {
      metrics: [
        { label: "Students", value: counts.students },
        { label: "Courses", value: counts.courses },
        { label: "Enrollments", value: counts.enrollments },
        { label: "Notices", value: counts.notices },
        { label: "FAQs", value: counts.faqs },
        { label: "Blog Posts", value: counts.blog_posts },
      ],
    };
  }
);
