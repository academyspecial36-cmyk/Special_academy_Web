import { z } from "zod";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import type { AIToolDefinition } from "@/types/ai";

const svc = () => createServiceRoleSupabase();

export const createStudentTool: AIToolDefinition = {
  name: "createStudent",
  description: "Create a new student record.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Student full name" },
      email: { type: "string", description: "Student email address" },
      phone: { type: "string", description: "Student phone number" },
      qualification: { type: "string", description: "Student qualification level" },
      status: { type: "string", enum: ["active", "inactive"], description: "Student status" },
    },
    required: ["name", "email", "phone"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const parsed = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        qualification: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional().default("active"),
      }).parse(args);

      const { data, error } = await svc().from("students").insert(parsed).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create student" };
    }
  },
};

export const updateStudentTool: AIToolDefinition = {
  name: "updateStudent",
  description: "Update an existing student record.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Student ID to update" },
      name: { type: "string", description: "New name" },
      email: { type: "string", description: "New email" },
      phone: { type: "string", description: "New phone" },
      qualification: { type: "string", description: "New qualification" },
      status: { type: "string", enum: ["active", "inactive"], description: "New status" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id, ...updates } = z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        qualification: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      }).parse(args);

      const { data, error } = await svc().from("students").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update student" };
    }
  },
};

export const deleteStudentTool: AIToolDefinition = {
  name: "deleteStudent",
  description: "Permanently delete a student record. Requires confirmation.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Student ID to delete" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id } = z.object({ id: z.string() }).parse(args);
      const { error } = await svc().from("students").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { success: true, data: { id, deleted: true } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete student" };
    }
  },
};
