import { z } from "zod";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import type { AIToolDefinition } from "@/types/ai";

const svc = () => createServiceRoleSupabase();

export const createNoticeTool: AIToolDefinition = {
  name: "createNotice",
  description: "Create a new notice. Generates the content and returns a draft for the user to review before publishing.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Notice title" },
      content: { type: "string", description: "Notice body content" },
      category: { type: "string", enum: ["admission", "exam", "holiday", "event", "announcement"], description: "Notice category" },
      is_pinned: { type: "boolean", description: "Whether to pin this notice" },
      image: { type: "string", description: "Optional image URL" },
    },
    required: ["title", "content", "category"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const parsed = z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.enum(["admission", "exam", "holiday", "event", "announcement"]),
        is_pinned: z.boolean().optional().default(false),
        image: z.string().optional(),
      }).parse(args);

      const { data, error } = await svc().from("notices").insert({
        title: parsed.title,
        content: parsed.content,
        category: parsed.category,
        is_pinned: parsed.is_pinned,
        image: parsed.image || null,
        date: new Date().toISOString(),
        author: "AI Command Center",
      }).select().single();

      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create notice" };
    }
  },
};

export const updateNoticeTool: AIToolDefinition = {
  name: "updateNotice",
  description: "Update an existing notice by ID. Only provide fields that should change.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Notice ID" },
      title: { type: "string", description: "New title" },
      content: { type: "string", description: "New content" },
      category: { type: "string", enum: ["admission", "exam", "holiday", "event", "announcement"] },
      is_pinned: { type: "boolean" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id, ...updates } = z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        category: z.enum(["admission", "exam", "holiday", "event", "announcement"]).optional(),
        is_pinned: z.boolean().optional(),
      }).parse(args);

      const { data, error } = await svc().from("notices").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update notice" };
    }
  },
};

export const deleteNoticeTool: AIToolDefinition = {
  name: "deleteNotice",
  description: "Permanently delete a notice. Requires confirmation.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Notice ID to delete" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id } = z.object({ id: z.string() }).parse(args);
      const { error } = await svc().from("notices").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { success: true, data: { id, deleted: true } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete notice" };
    }
  },
};

export const pinNoticeTool: AIToolDefinition = {
  name: "pinNotice",
  description: "Toggle pin status of a notice. When pinning a notice, all other notices are automatically unpinned.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Notice ID" },
      pinned: { type: "boolean", description: "True to pin, false to unpin" },
    },
    required: ["id", "pinned"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const { id, pinned } = z.object({ id: z.string(), pinned: z.boolean() }).parse(args);

      if (pinned) {
        await svc().from("notices").update({ is_pinned: false }).neq("id", id);
      }

      const { data, error } = await svc().from("notices").update({ is_pinned: pinned }).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to pin notice" };
    }
  },
};
