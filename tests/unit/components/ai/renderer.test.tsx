import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ResponseRenderer } from "@/components/ai/response-renderers/renderer";
import type { AIResponseBlock } from "@/types/ai";

describe("ResponseRenderer", () => {
  afterEach(cleanup);

  it("renders knowledge_answer block", async () => {
    const block: AIResponseBlock = {
      type: "knowledge_answer",
      data: { title: "Test", content: "Answer content", sources: [] },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByText("Test")).toBeInTheDocument();
    expect(await screen.findByText("Answer content")).toBeInTheDocument();
  });

  it("renders notice_draft block", async () => {
    const block: AIResponseBlock = {
      type: "notice_draft",
      data: { title: "Notice Title", content: "Notice content" },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByDisplayValue("Notice Title")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Notice content")).toBeInTheDocument();
  });

  it("renders course_draft block", async () => {
    const block: AIResponseBlock = {
      type: "course_draft",
      data: { title: "Course Title", features: [] },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByDisplayValue("Course Title")).toBeInTheDocument();
  });

  it("renders student_table block with students", async () => {
    const block: AIResponseBlock = {
      type: "student_table",
      data: { title: "Students", students: [{ name: "John Doe", email: "john@test.com" }] },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(await screen.findByText("john@test.com")).toBeInTheDocument();
  });

  it("renders empty student_table gracefully", async () => {
    const block: AIResponseBlock = {
      type: "student_table",
      data: { title: "Students", students: [] },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByText("No students found")).toBeInTheDocument();
  });

  it("renders enrollment_table block", async () => {
    const block: AIResponseBlock = {
      type: "enrollment_table",
      data: { title: "Enrollments", enrollments: [{ fullName: "Jane Doe", status: "pending" }] },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders faq_table block", async () => {
    const block: AIResponseBlock = {
      type: "faq_table",
      data: { title: "FAQs", faqs: [{ id: "1", question: "Q1", answer: "A1" }] },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByText("Q1")).toBeInTheDocument();
  });

  it("renders notice_table block", async () => {
    const block: AIResponseBlock = {
      type: "notice_table",
      data: { title: "Notices", notices: [{ id: "1", title: "Notice 1", category: "General" }] },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByText("Notice 1")).toBeInTheDocument();
    expect(await screen.findByText("General")).toBeInTheDocument();
  });

  it("renders action_result block", async () => {
    const block: AIResponseBlock = {
      type: "action_result",
      data: { success: true, title: "Done", message: "Action completed" },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByText("Done")).toBeInTheDocument();
    expect(await screen.findByText("Action completed")).toBeInTheDocument();
  });

  it("renders error_card block", async () => {
    const block: AIResponseBlock = {
      type: "error_card",
      data: { title: "Error", message: "Something failed", suggestion: "Try again" },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(await screen.findByText("Something failed")).toBeInTheDocument();
  });

  it("renders analytics_card block", async () => {
    const block: AIResponseBlock = {
      type: "analytics_card",
      data: { title: "Stats", metrics: [{ label: "Users", value: 100 }] },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByText("Stats")).toBeInTheDocument();
    expect(await screen.findByText("Users")).toBeInTheDocument();
    expect(await screen.findByText("100")).toBeInTheDocument();
  });

  it("renders blog_draft block", async () => {
    const block: AIResponseBlock = {
      type: "blog_draft",
      data: { title: "Blog Post", content: "Blog content" },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByDisplayValue("Blog Post")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Blog content")).toBeInTheDocument();
  });

  it("renders faq_draft block", async () => {
    const block: AIResponseBlock = {
      type: "faq_draft",
      data: { question: "FAQ Question", answer: "FAQ Answer" },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByDisplayValue("FAQ Question")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("FAQ Answer")).toBeInTheDocument();
  });

  it("renders exam_draft block", async () => {
    const block: AIResponseBlock = {
      type: "exam_draft",
      data: { title: "Exam Title" },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByDisplayValue("Exam Title")).toBeInTheDocument();
  });

  it("renders confirmation_card block requiring confirmation", async () => {
    const block: AIResponseBlock = {
      type: "confirmation_card",
      data: { title: "Confirm", message: "Are you sure?" },
    };
    render(<ResponseRenderer block={block} />);
    expect(await screen.findByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(await screen.findByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls onConfirmTool when confirmation is confirmed", async () => {
    const onConfirmTool = vi.fn();
    const block: AIResponseBlock = {
      type: "confirmation_card",
      data: { title: "Confirm", _toolName: "test_tool", _conversationId: "conv-1" },
    };
    render(<ResponseRenderer block={block} onConfirmTool={onConfirmTool} />);
    expect(await screen.findByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("returns null for an unrecognized block type", () => {
    const block = { type: "nonexistent_type", data: {} } as unknown as AIResponseBlock;
    const { container } = render(<ResponseRenderer block={block} />);
    expect(container.innerHTML).toBe("");
  });
});
