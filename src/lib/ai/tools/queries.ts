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
    let query = svc().from("courses").select("*").limit(limit);
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
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
