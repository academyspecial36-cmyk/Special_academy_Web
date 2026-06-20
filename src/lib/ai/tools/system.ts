import { z } from "zod";
import { createServiceRoleSupabase } from "@/lib/supabase-server";
import type { AIToolDefinition } from "@/types/ai";

const svc = () => createServiceRoleSupabase();

export const logoutTool: AIToolDefinition = {
  name: "logout",
  description: "Log the current admin out of the system. Call this when the user says 'logout', 'sign out', or 'log me out'.",
  parameters: { type: "object", properties: {}, required: [] },
  requiresConfirmation: false,
  handler: async (_args, _userId) => {
    return { success: true, data: { logout: true, redirectTo: "/login" } };
  },
};

export const enableMaintenanceTool: AIToolDefinition = {
  name: "enableMaintenance",
  description: "Enable maintenance mode. Shows maintenance page to visitors.",
  parameters: { type: "object", properties: {}, required: [] },
  requiresConfirmation: false,
  handler: async (_args, _userId) => {
    try {
      const { error } = await svc().from("settings").update({ value: "true" }).eq("key", "maintenance_mode");
      if (error) throw new Error(error.message);
      return { success: true, data: { maintenance_mode: true } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to enable maintenance mode" };
    }
  },
};

export const disableMaintenanceTool: AIToolDefinition = {
  name: "disableMaintenance",
  description: "Disable maintenance mode. Requires confirmation.",
  parameters: { type: "object", properties: {}, required: [] },
  requiresConfirmation: true,
  handler: async (_args, _userId) => {
    try {
      const { error } = await svc().from("settings").update({ value: "false" }).eq("key", "maintenance_mode");
      if (error) throw new Error(error.message);
      return { success: true, data: { maintenance_mode: false } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to disable maintenance mode" };
    }
  },
};

export const backupSystemTool: AIToolDefinition = {
  name: "backupSystem",
  description: "Create a system backup of all academy data. Requires confirmation.",
  parameters: { type: "object", properties: { type: { type: "string", enum: ["full", "students", "courses"], default: "full" } }, required: [] },
  requiresConfirmation: true,
  handler: async (args, _userId) => {
    try {
      const { type } = z.object({ type: z.string().optional().default("full") }).parse(args);
      const tables: Record<string, string[]> = {
        full: ["students", "courses", "enrollments", "notices", "blog_posts", "faqs", "settings"],
        students: ["students", "enrollments"],
        courses: ["courses"],
      };
      const backup: Record<string, unknown> = {};
      for (const table of (tables[type] || tables.full)) {
        const { data } = await svc().from(table).select("*");
        backup[table] = data ?? [];
      }
      return { success: true, data: { type, timestamp: new Date().toISOString(), tables: Object.keys(backup), recordCount: Object.values(backup).reduce((a: number, b) => a + ((b as unknown[]).length || 0), 0) } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to create backup" };
    }
  },
};
