"use client";

import dynamic from "next/dynamic";
import type { AIResponseBlock } from "@/types/ai";

const Loading = () => (
  <div className="p-8 bg-white border border-primary/5 rounded-xl space-y-3">
    <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
    <div className="h-4 w-1/2 bg-primary/10 rounded animate-pulse" />
    <div className="h-4 w-2/3 bg-primary/10 rounded animate-pulse" />
  </div>
);

const KnowledgeAnswerRenderer = dynamic(() => import("./knowledge-answer").then(m => m.KnowledgeAnswerRenderer), { loading: Loading });
const NoticeDraftRenderer = dynamic(() => import("./notice-draft").then(m => m.NoticeDraftRenderer), { loading: Loading });
const BlogDraftRenderer = dynamic(() => import("./blog-draft").then(m => m.BlogDraftRenderer), { loading: Loading });
const FAQDraftRenderer = dynamic(() => import("./faq-draft").then(m => m.FAQDraftRenderer), { loading: Loading });
const CourseDraftRenderer = dynamic(() => import("./course-draft").then(m => m.CourseDraftRenderer), { loading: Loading });
const ExamDraftRenderer = dynamic(() => import("./exam-draft").then(m => m.ExamDraftRenderer), { loading: Loading });
const StudentTableRenderer = dynamic(() => import("./student-table").then(m => m.StudentTableRenderer), { loading: Loading });
const NoticeTableRenderer = dynamic(() => import("./notice-table").then(m => m.NoticeTableRenderer), { loading: Loading });
const EnrollmentTableRenderer = dynamic(() => import("./enrollment-table").then(m => m.EnrollmentTableRenderer), { loading: Loading });
const FAQsTableRenderer = dynamic(() => import("./faq-table").then(m => m.FAQsTableRenderer), { loading: Loading });
const ConfirmationCardRenderer = dynamic(() => import("./confirmation-card").then(m => m.ConfirmationCardRenderer), { loading: Loading });
const ActionResultRenderer = dynamic(() => import("./action-result").then(m => m.ActionResultRenderer), { loading: Loading });
const ErrorCardRenderer = dynamic(() => import("./error-card").then(m => m.ErrorCardRenderer), { loading: Loading });
const AnalyticsCardRenderer = dynamic(() => import("./analytics-card").then(m => m.AnalyticsCardRenderer), { loading: Loading });

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
