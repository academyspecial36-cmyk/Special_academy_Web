import { z } from "zod";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import type { AIToolDefinition } from "@/types/ai";

const svc = () => createServiceRoleSupabase();

export const createFAQTool: AIToolDefinition = {
  name: "createFAQ",
  description: "Create a new FAQ entry.",
  parameters: {
    type: "object",
    properties: {
      question: { type: "string" },
      answer: { type: "string" },
    },
    required: ["question", "answer"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const parsed = z.object({ question: z.string(), answer: z.string() }).parse(args);
      const { data, error } = await svc().from("faqs").insert(parsed).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create FAQ" };
    }
  },
};

export const updateFAQTool: AIToolDefinition = {
  name: "updateFAQ",
  description: "Update an existing FAQ.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string" },
      question: { type: "string" },
      answer: { type: "string" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id, ...updates } = z.object({ id: z.string(), question: z.string().optional(), answer: z.string().optional() }).parse(args);
      const { data, error } = await svc().from("faqs").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update FAQ" };
    }
  },
};

export const deleteFAQTool: AIToolDefinition = {
  name: "deleteFAQ",
  description: "Permanently delete an FAQ. Requires confirmation.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id } = z.object({ id: z.string() }).parse(args);
      const { error } = await svc().from("faqs").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { success: true, data: { id, deleted: true } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete FAQ" };
    }
  },
};
