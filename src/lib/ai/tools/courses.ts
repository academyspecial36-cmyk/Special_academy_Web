import { z } from "zod";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import type { AIToolDefinition } from "@/types/ai";

const svc = () => createServiceRoleSupabase();

export const createCourseTool: AIToolDefinition = {
  name: "createCourse",
  description: "Create a new course. Generates a draft for the user to review.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Course title" },
      description: { type: "string", description: "Course description" },
      duration: { type: "string", description: "e.g. '3 months', '6 months'" },
      category: { type: "string", description: "Course category" },
      price: { type: "string", description: "e.g. 'Rs.15,000' or 'Free'" },
      qualification: { type: "string", description: "Target qualification: '+2' or 'Bachelor'" },
      features: { type: "array", items: { type: "string" }, description: "List of course features" },
      isPopular: { type: "boolean", description: "Whether to mark as popular" },
    },
    required: ["title", "description", "duration", "category"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const parsed = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        duration: z.string().min(1),
        category: z.string().min(1),
        price: z.string().optional().default("Free"),
        qualification: z.string().optional(),
        features: z.array(z.string()).optional().default([]),
        isPopular: z.boolean().optional().default(false),
      }).parse(args);

      const { data, error } = await svc().from("courses").insert({
        title: parsed.title,
        slug: parsed.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: parsed.description,
        duration: parsed.duration,
        category: parsed.category,
        price: parsed.price,
        class_level: parsed.qualification || null,
        features: parsed.features,
        is_popular: parsed.isPopular,
        image: "",
      }).select().single();

      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create course" };
    }
  },
};

export const updateCourseTool: AIToolDefinition = {
  name: "updateCourse",
  description: "Update an existing course by ID.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Course ID" },
      title: { type: "string" },
      description: { type: "string" },
      duration: { type: "string" },
      price: { type: "string" },
      isPopular: { type: "boolean" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id, isPopular, ...rest } = z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        duration: z.string().optional(),
        price: z.string().optional(),
        isPopular: z.boolean().optional(),
      }).parse(args);

      const updates: Record<string, unknown> = { ...rest };
      if (isPopular !== undefined) updates.is_popular = isPopular;

      const { data, error } = await svc().from("courses").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update course" };
    }
  },
};

export const deleteCourseTool: AIToolDefinition = {
  name: "deleteCourse",
  description: "Permanently delete a course and all its subcategories and items. Requires confirmation.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Course ID" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id } = z.object({ id: z.string() }).parse(args);
      const { error } = await svc().from("courses").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { success: true, data: { id, deleted: true } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete course" };
    }
  },
};
