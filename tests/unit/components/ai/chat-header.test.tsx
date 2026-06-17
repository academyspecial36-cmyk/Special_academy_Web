import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ChatHeader } from "@/components/ai/chat-header";

describe("ChatHeader", () => {
  it("renders title and subtitle", () => {
    render(<ChatHeader />);
    expect(screen.getByText("AI Command Center")).toBeInTheDocument();
    expect(screen.getByText("Ask me anything about managing your academy")).toBeInTheDocument();
  });

  it("does not show export button when hasConversation is false", () => {
    render(<ChatHeader hasConversation={false} />);
    expect(screen.queryByTitle("Export conversation")).not.toBeInTheDocument();
  });

  it("shows export button when hasConversation is true", () => {
    render(<ChatHeader hasConversation={true} onExport={() => {}} />);
    expect(screen.getByTitle("Export conversation")).toBeInTheDocument();
  });

  it("calls onExport when export button clicked", async () => {
    const onExport = vi.fn();
    render(<ChatHeader hasConversation={true} onExport={onExport} />);
    await userEvent.click(screen.getByTitle("Export conversation"));
    expect(onExport).toHaveBeenCalledOnce();
  });

  it("does not show export button when onExport is not provided", () => {
    render(<ChatHeader hasConversation={true} />);
    expect(screen.queryByTitle("Export conversation")).not.toBeInTheDocument();
  });

  it("renders sparkles icon", () => {
    const { container } = render(<ChatHeader />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
