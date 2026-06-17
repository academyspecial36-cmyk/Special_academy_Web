import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ChatEmptyState } from "@/components/ai/chat-empty-state";

describe("ChatEmptyState", () => {
  it("renders heading and description", () => {
    render(<ChatEmptyState sendMessage={() => {}} />);
    expect(screen.getByText("How can I help you today?")).toBeInTheDocument();
    expect(
      screen.getByText(/Try a suggestion below/)
    ).toBeInTheDocument();
  });

  it("renders all starter suggestions", () => {
    render(<ChatEmptyState sendMessage={() => {}} />);
    expect(screen.getByText("Create a holiday notice")).toBeInTheDocument();
    expect(screen.getByText("Show active students")).toBeInTheDocument();
    expect(screen.getByText("Generate MCQs")).toBeInTheDocument();
    expect(screen.getByText("Approve pending enrollments")).toBeInTheDocument();
  });

  it("calls sendMessage with starter text when clicked", async () => {
    const sendMessage = vi.fn();
    render(<ChatEmptyState sendMessage={sendMessage} />);
    await userEvent.click(screen.getByText("Create a holiday notice"));
    expect(sendMessage).toHaveBeenCalledWith("Create a holiday notice");
  });

  it("calls sendMessage for each starter", async () => {
    const sendMessage = vi.fn();
    render(<ChatEmptyState sendMessage={sendMessage} />);
    await userEvent.click(screen.getByText("Show active students"));
    expect(sendMessage).toHaveBeenCalledWith("Show active students");
  });

  it("renders sparkles icon", () => {
    const { container } = render(<ChatEmptyState sendMessage={() => {}} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders 4 starter buttons", () => {
    render(<ChatEmptyState sendMessage={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });
});
