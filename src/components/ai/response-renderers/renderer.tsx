"use client";

import type { AIResponseBlock } from "@/types/ai";
import { KnowledgeAnswerRenderer } from "./knowledge-answer";
import { NoticeDraftRenderer } from "./notice-draft";
import { BlogDraftRenderer } from "./blog-draft";
import { FAQDraftRenderer } from "./faq-draft";
import { CourseDraftRenderer } from "./course-draft";
import { ExamDraftRenderer } from "./exam-draft";
import { StudentTableRenderer } from "./student-table";
import { NoticeTableRenderer } from "./notice-table";
import { EnrollmentTableRenderer } from "./enrollment-table";
import { FAQsTableRenderer } from "./faq-table";
import { ConfirmationCardRenderer } from "./confirmation-card";
import { ActionResultRenderer } from "./action-result";
import { ErrorCardRenderer } from "./error-card";
import { AnalyticsCardRenderer } from "./analytics-card";

interface RendererProps {
  block: AIResponseBlock;
  onConfirmTool?: (result: { success: boolean; message: string; result?: unknown }) => void;
}

export function ResponseRenderer({ block, onConfirmTool }: RendererProps) {
  switch (block.type) {
    case "notice_draft":
      return <NoticeDraftRenderer data={block.data as any} />;
    case "course_draft":
      return <CourseDraftRenderer data={block.data as any} />;
    case "exam_draft":
      return <ExamDraftRenderer data={block.data as any} />;
    case "student_table":
      return <StudentTableRenderer data={block.data as any} />;
    case "enrollment_table":
      return <EnrollmentTableRenderer data={block.data as any} />;
    case "faq_table":
      return <FAQsTableRenderer data={block.data as any} />;
    case "notice_table":
      return <NoticeTableRenderer data={block.data as any} />;
    case "confirmation_card":
      return <ConfirmationCardRenderer data={block.data as any} onConfirmTool={onConfirmTool} />;
    case "action_result":
      return <ActionResultRenderer data={block.data as any} />;
    case "error_card":
      return <ErrorCardRenderer data={block.data as any} />;
    case "analytics_card":
      return <AnalyticsCardRenderer data={block.data as any} />;
    case "knowledge_answer":
      return <KnowledgeAnswerRenderer data={block.data as any} />;
    case "faq_draft":
      return <FAQDraftRenderer data={block.data as any} />;
    case "blog_draft":
      return <BlogDraftRenderer data={block.data as any} />;
    default:
      return null;
  }
}
