import { z } from "zod";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import type { AIToolDefinition } from "@/types/ai";

const svc = () => createServiceRoleSupabase();

export const createExamTool: AIToolDefinition = {
  name: "createExam",
  description: "Create a new exam with questions. Generates a draft for review.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Exam title" },
      category_id: { type: "string", description: "Exam category ID" },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
            correct_answer: { type: "string" },
            marks: { type: "number", default: 1 },
          },
          required: ["question", "options", "correct_answer"],
        },
      },
      time_limit_minutes: { type: "number", description: "Time limit in minutes" },
    },
    required: ["title"],
  },
  requiresConfirmation: false,
  handler: async (args, _userId) => {
    try {
      const parsed = z.object({
        title: z.string().min(1),
        category_id: z.string().optional(),
        questions: z.array(z.object({
          question: z.string(),
          options: z.array(z.string()).min(2).max(6),
          correct_answer: z.string(),
          marks: z.number().optional().default(1),
        })).optional().default([]),
        time_limit_minutes: z.number().optional(),
      }).parse(args);

      const { data: exam, error } = await svc().from("exam_categories").insert({
        name: parsed.title,
        description: "",
      }).select().single();

      if (error) throw new Error(error.message);

      if (parsed.questions.length > 0) {
        const questionInserts = parsed.questions.map((q) => ({
          category_id: exam.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          marks: q.marks,
        }));
        const { error: qError } = await svc().from("questions").insert(questionInserts);
        if (qError) throw new Error(qError.message);
      }

      return { success: true, data: { ...exam, questionsCount: parsed.questions.length } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create exam" };
    }
  },
};

export const updateExamTool: AIToolDefinition = {
  name: "updateExam",
  description: "Update exam details.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Exam category ID" },
      name: { type: "string" },
      description: { type: "string" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id, ...updates } = z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      }).parse(args);
      const { data, error } = await svc().from("exam_categories").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update exam" };
    }
  },
};

export const deleteExamTool: AIToolDefinition = {
  name: "deleteExam",
  description: "Permanently delete an exam and all its questions. Requires confirmation.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Exam category ID" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { id } = z.object({ id: z.string() }).parse(args);
      await svc().from("questions").delete().eq("category_id", id);
      const { error } = await svc().from("exam_categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { success: true, data: { id, deleted: true } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete exam" };
    }
  },
};
