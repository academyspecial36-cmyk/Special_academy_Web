export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string | null;
  tool_calls?: AIToolCall[];
  tool_name?: string;
  tool_args?: Record<string, unknown>;
  tool_result?: unknown;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AIToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export type ResponseType =
  | "knowledge_answer"
  | "notice_draft"
  | "blog_draft"
  | "faq_draft"
  | "course_draft"
  | "exam_draft"
  | "student_table"
  | "notice_table"
  | "enrollment_table"
  | "faq_table"
  | "confirmation_card"
  | "action_result"
  | "error_card"
  | "analytics_card";

export interface AIResponseBlock {
  type: ResponseType;
  data: Record<string, unknown>;
  title?: string;
}

export interface AIStreamChunk {
  type: "token" | "block" | "tool_call" | "tool_result" | "error" | "done" | "status";
  content?: string;
  block?: AIResponseBlock;
  toolCall?: AIToolCall;
  toolResult?: { name: string; result: unknown };
  error?: string;
  status?: "thinking" | "searching" | "generating" | "executing" | "completed";
}

export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiresConfirmation: boolean;
  handler: (args: Record<string, unknown>, userId: string) => Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    requiresConfirmation?: boolean;
    confirmationData?: Record<string, unknown>;
  }>;
}

export interface AIActionLog {
  id: string;
  user_id: string;
  action: string;
  tool_name: string;
  payload: Record<string, unknown>;
  status: "pending" | "success" | "error" | "cancelled";
  error?: string;
  duration_ms?: number;
  created_at: string;
}

export interface AIDocument {
  id: string;
  title: string;
  content: string;
  source_type: "guide" | "faq" | "course" | "notice" | "blog" | "settings" | "legal" | "upload";
  source_id?: string;
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface PageContext {
  route: string;
  pageName: string;
  search?: string;
  filters?: Record<string, string>;
  entityId?: string;
  entityType?: string;
}
