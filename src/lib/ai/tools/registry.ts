import { createNoticeTool, updateNoticeTool, deleteNoticeTool, pinNoticeTool } from "./notices";
import { createCourseTool, updateCourseTool, deleteCourseTool } from "./courses";
import { createExamTool, updateExamTool, deleteExamTool } from "./exams";
import { approveEnrollmentTool, rejectEnrollmentTool } from "./enrollments";
import { createFAQTool, updateFAQTool, deleteFAQTool } from "./faqs";
import { createBlogTool, publishBlogTool } from "./blogs";
import { enableMaintenanceTool, disableMaintenanceTool, backupSystemTool } from "./system";
import { createStudentTool, updateStudentTool, deleteStudentTool } from "./students";
import { searchKnowledgeTool } from "./knowledge";
import { getStudentsTool, getCoursesTool, getNoticesTool, getEnrollmentsTool, getFAQsTool, getBlogsTool } from "./queries";
import type { AIToolDefinition } from "@/types/ai";

const toolRegistry: Map<string, AIToolDefinition> = new Map();

function register(tool: AIToolDefinition) {
  toolRegistry.set(tool.name, tool);
}

register(createNoticeTool);
register(updateNoticeTool);
register(deleteNoticeTool);
register(pinNoticeTool);
register(createCourseTool);
register(updateCourseTool);
register(deleteCourseTool);
register(createExamTool);
register(updateExamTool);
register(deleteExamTool);
register(approveEnrollmentTool);
register(rejectEnrollmentTool);
register(createFAQTool);
register(updateFAQTool);
register(deleteFAQTool);
register(createStudentTool);
register(updateStudentTool);
register(deleteStudentTool);
register(searchKnowledgeTool);
register(createBlogTool);
register(publishBlogTool);
register(enableMaintenanceTool);
register(disableMaintenanceTool);
register(backupSystemTool);
register(getStudentsTool);
register(getCoursesTool);
register(getNoticesTool);
register(getEnrollmentsTool);
register(getFAQsTool);
register(getBlogsTool);

export function getAllTools(): AIToolDefinition[] {
  return Array.from(toolRegistry.values());
}

export function getTool(name: string): AIToolDefinition | undefined {
  return toolRegistry.get(name);
}

export function getToolsForModel() {
  return getAllTools().map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  userId: string
): Promise<{ success: boolean; data?: unknown; error?: string; requiresConfirmation?: boolean; confirmationData?: Record<string, unknown> }> {
  const tool = getTool(name);
  if (!tool) return { success: false, error: `Tool "${name}" not found` };

  const start = Date.now();
  let status = "pending";
  let error: string | undefined;

  try {
    const result = await tool.handler(args, userId);
    status = result.success ? "success" : "error";
    if (result.error) error = result.error;

    await logAction(userId, name, args, status, error, Date.now() - start);

    return result;
  } catch (err) {
    status = "error";
    error = err instanceof Error ? err.message : "Unknown error";
    await logAction(userId, name, args, status, error, Date.now() - start);
    return { success: false, error };
  }
}

async function logAction(
  userId: string,
  toolName: string,
  payload: Record<string, unknown>,
  status: string,
  error?: string,
  durationMs?: number
) {
  try {
    const { createServiceRoleSupabase } = await import("@/lib/supabase-server");
    const svc = createServiceRoleSupabase();
    await svc.from("ai_action_logs").insert({
      user_id: userId,
      action: toolName,
      tool_name: toolName,
      payload,
      status,
      error,
      duration_ms: durationMs,
    });
  } catch {
    // Logging failure should never crash the main action
  }
}
