import { z } from "zod";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import type { AIToolDefinition } from "@/types/ai";

const svc = () => createServiceRoleSupabase();

export const createBlogTool: AIToolDefinition = {
  name: "createBlog",
  description: "Create a new blog post draft.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      content: { type: "string" },
      excerpt: { type: "string", description: "Short summary" },
      category: { type: "string" },
    },
    required: ["title", "content"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const parsed = z.object({
        title: z.string(), content: z.string(), excerpt: z.string().optional(), category: z.string().optional(),
      }).parse(args);
      const { data, error } = await svc().from("blog_posts").insert({
        ...parsed,
        author: "AI Command Center",
        status: "draft",
        slug: parsed.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create blog post" };
    }
  },
};

export const publishBlogTool: AIToolDefinition = {
  name: "publishBlog",
  description: "Publish a blog post (change status from draft to published).",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Blog post ID" },
    },
    required: ["id"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const { id } = z.object({ id: z.string() }).parse(args);
      const { data, error } = await svc().from("blog_posts").update({
        status: "published",
        published_at: new Date().toISOString(),
      }).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to publish blog" };
    }
  },
};
