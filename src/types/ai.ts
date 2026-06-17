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

// ---- Block data shapes for typed renderers ----

export interface KnowledgeAnswerData {
  title?: string;
  content?: string;
  sources?: { title: string; url: string }[];
}

export interface NoticeDraftData {
  title?: string;
  content?: string;
  category?: string;
  is_pinned?: boolean;
  image?: string;
}

export interface BlogDraftData {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
}

export interface FAQDraftData {
  question?: string;
  answer?: string;
}

export interface CourseDraftData {
  title?: string;
  description?: string;
  duration?: string;
  category?: string;
  price?: number;
  qualification?: string;
  features?: string[];
}

export interface ExamDraftData {
  title?: string;
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer?: number;
  }>;
}

export interface StudentItem {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  qualification?: string;
  status?: string;
}

export interface StudentTableData {
  title?: string;
  students: StudentItem[];
}

export interface NoticeTableData {
  title?: string;
  notices: Array<{
    id?: string;
    title?: string;
    category?: string;
    date?: string;
    createdAt?: string;
    isPinned?: boolean;
  }>;
}

export interface EnrollmentTableData {
  title?: string;
  enrollments: Array<{
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
    course?: string;
    interestedCourse?: string;
    qualification?: string;
    currentClass?: string;
    status?: string;
    date?: string;
    createdAt?: string;
  }>;
}

export interface FAQsTableData {
  title?: string;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

export interface ConfirmationCardData {
  title?: string;
  message?: string;
  item?: string;
  action?: string;
  payload?: Record<string, unknown>;
  destructive?: boolean;
  _toolName?: string;
  _toolArgs?: Record<string, unknown>;
  _conversationId?: string;
}

export interface ActionResultData {
  success?: boolean;
  title?: string;
  message?: string;
  error?: string;
}

export interface ErrorCardData {
  title?: string;
  message?: string;
  suggestion?: string;
}

export interface AnalyticsCardData {
  title?: string;
  metrics: Array<{
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
  }>;
}

export type BlockDataMap = {
  notice_draft: NoticeDraftData;
  course_draft: CourseDraftData;
  exam_draft: ExamDraftData;
  student_table: StudentTableData;
  enrollment_table: EnrollmentTableData;
  faq_table: FAQsTableData;
  notice_table: NoticeTableData;
  confirmation_card: ConfirmationCardData;
  action_result: ActionResultData;
  error_card: ErrorCardData;
  analytics_card: AnalyticsCardData;
  knowledge_answer: KnowledgeAnswerData;
  faq_draft: FAQDraftData;
  blog_draft: BlogDraftData;
};
