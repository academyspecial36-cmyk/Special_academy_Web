import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChatMessage } from "@/components/ai/chat-message";

describe("ChatMessage", () => {
  it("renders user message right-aligned", () => {
    const { container } = render(
      <ChatMessage message={{ role: "user", content: "Hello" }} />
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("justify-end");
  });

  it("renders assistant message left-aligned", () => {
    const { container } = render(
      <ChatMessage message={{ role: "assistant", content: "Hi there" }} />
    );
    expect(screen.getByText("Hi there")).toBeInTheDocument();
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("justify-start");
  });

  it("shows loading spinner when isLoading is true", () => {
    render(
      <ChatMessage message={{ role: "assistant", content: "" }} isLoading />
    );
    expect(screen.getByText("Generating...")).toBeInTheDocument();
  });

  it("does not show loading when isLoading is false", () => {
    render(
      <ChatMessage message={{ role: "assistant", content: "Done" }} />
    );
    expect(screen.queryByText("Generating...")).not.toBeInTheDocument();
  });

  it("displays tool name badge when provided", () => {
    render(
      <ChatMessage message={{ role: "assistant", content: "Result", tool_name: "searchKnowledge" }} />
    );
    expect(screen.getByText("Used: searchKnowledge")).toBeInTheDocument();
  });

  it("does not show tool badge when no tool_name", () => {
    render(
      <ChatMessage message={{ role: "assistant", content: "Result" }} />
    );
    expect(screen.queryByText(/Used:/)).not.toBeInTheDocument();
  });

  it("renders user message with primary background", () => {
    render(
      <ChatMessage message={{ role: "user", content: "Test" }} />
    );
    const msgDiv = screen.getByText("Test").parentElement;
    expect(msgDiv?.className).toContain("bg-primary");
  });

  it("renders assistant message with accent background", () => {
    render(
      <ChatMessage message={{ role: "assistant", content: "Test" }} />
    );
    const msgDiv = screen.getByText("Test").parentElement;
    expect(msgDiv?.className).toContain("bg-accent");
  });

  it("renders null content gracefully", () => {
    const { container } = render(
      <ChatMessage message={{ role: "assistant", content: null }} />
    );
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("renders empty content gracefully", () => {
    render(
      <ChatMessage message={{ role: "assistant", content: "" }} />
    );
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("preserves whitespace in content", () => {
    render(
      <ChatMessage message={{ role: "assistant", content: "Line 1\nLine 2" }} />
    );
    const p = screen.getByText(/Line 1/);
    expect(p.className).toContain("whitespace-pre-wrap");
  });
});
