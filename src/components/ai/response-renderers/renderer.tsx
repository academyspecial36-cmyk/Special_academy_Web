"use client";

import dynamic from "next/dynamic";
import type { AIResponseBlock, BlockDataMap } from "@/types/ai";

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
const CourseTableRenderer = dynamic(() => import("./course-table").then(m => m.CourseTableRenderer), { loading: Loading });
const ExamResultsTableRenderer = dynamic(() => import("./exam-results-table").then(m => m.ExamResultsTableRenderer), { loading: Loading });

interface RendererProps {
  block: AIResponseBlock;
  onConfirmTool?: (result: { success: boolean; message: string; result?: unknown }) => void;
}

export function ResponseRenderer({ block, onConfirmTool }: RendererProps) {
  switch (block.type) {
    case "notice_draft":
      return <NoticeDraftRenderer data={block.data as unknown as BlockDataMap["notice_draft"]} />;
    case "course_draft":
      return <CourseDraftRenderer data={block.data as unknown as BlockDataMap["course_draft"]} />;
    case "exam_draft":
      return <ExamDraftRenderer data={block.data as unknown as BlockDataMap["exam_draft"]} />;
    case "student_table":
      return <StudentTableRenderer data={block.data as unknown as BlockDataMap["student_table"]} />;
    case "enrollment_table":
      return <EnrollmentTableRenderer data={block.data as unknown as BlockDataMap["enrollment_table"]} />;
    case "faq_table":
      return <FAQsTableRenderer data={block.data as unknown as BlockDataMap["faq_table"]} />;
    case "notice_table":
      return <NoticeTableRenderer data={block.data as unknown as BlockDataMap["notice_table"]} />;
    case "confirmation_card":
      return <ConfirmationCardRenderer data={block.data as unknown as BlockDataMap["confirmation_card"]} onConfirmTool={onConfirmTool} />;
    case "action_result":
      return <ActionResultRenderer data={block.data as unknown as BlockDataMap["action_result"]} />;
    case "error_card":
      return <ErrorCardRenderer data={block.data as unknown as BlockDataMap["error_card"]} />;
    case "analytics_card":
      return <AnalyticsCardRenderer data={block.data as unknown as BlockDataMap["analytics_card"]} />;
    case "course_table":
      return <CourseTableRenderer data={block.data as unknown as BlockDataMap["course_table"]} />;
    case "exam_results_table":
      return <ExamResultsTableRenderer data={block.data as unknown as BlockDataMap["exam_results_table"]} />;
    case "knowledge_answer":
      return <KnowledgeAnswerRenderer data={block.data as unknown as BlockDataMap["knowledge_answer"]} />;
    case "faq_draft":
      return <FAQDraftRenderer data={block.data as unknown as BlockDataMap["faq_draft"]} />;
    case "blog_draft":
      return <BlogDraftRenderer data={block.data as unknown as BlockDataMap["blog_draft"]} />;
    default:
      return null;
  }
}
