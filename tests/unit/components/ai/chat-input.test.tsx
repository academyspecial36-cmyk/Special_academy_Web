import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ChatInput } from "@/components/ai/chat-input";

function renderChatInput(overrides: Record<string, unknown> = {}) {
  const props = {
    input: "",
    setInput: vi.fn(),
    isStreaming: false,
    error: null,
    onSend: vi.fn(),
    onDismissError: vi.fn(),
    textareaRef: { current: null },
    ...overrides,
  };
  return { ...render(<ChatInput {...props as any} />), props };
}

describe("ChatInput", () => {
  it("renders textarea with placeholder", () => {
    renderChatInput();
    expect(screen.getByPlaceholderText("Type your command...")).toBeInTheDocument();
  });

  it("renders send button", () => {
    renderChatInput();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    renderChatInput({ input: "" });
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("send button is enabled when input has text", () => {
    renderChatInput({ input: "Hello" });
    expect(screen.getByRole("button", { name: /send/i })).toBeEnabled();
  });

  it("calls onSend when send button clicked", async () => {
    const onSend = vi.fn();
    renderChatInput({ input: "Hello", onSend });
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("calls onSend when Enter pressed", async () => {
    const onSend = vi.fn();
    const setInput = vi.fn();
    renderChatInput({ input: "Hello", onSend, setInput });
    const textarea = screen.getByPlaceholderText("Type your command...");
    await userEvent.type(textarea, "{enter}");
    expect(onSend).toHaveBeenCalledOnce();
  });

  it("does not call onSend on Shift+Enter", async () => {
    const onSend = vi.fn();
    renderChatInput({ input: "Hello", onSend });
    const textarea = screen.getByPlaceholderText("Type your command...");
    await userEvent.type(textarea, "{Shift>}{enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows loading spinner when streaming", () => {
    renderChatInput({ isStreaming: true });
    expect(screen.getByRole("button")).toBeDisabled();
    // Look for the spinner element
    const svg = document.querySelector(".animate-spin");
    expect(svg).toBeInTheDocument();
  });

  it("shows error message when error is set", () => {
    renderChatInput({ error: "Something went wrong" });
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });

  it("calls onDismissError when dismiss clicked", async () => {
    const onDismissError = vi.fn();
    renderChatInput({ error: "Error!", onDismissError });
    await userEvent.click(screen.getByText("Dismiss"));
    expect(onDismissError).toHaveBeenCalledOnce();
  });

  it("disables send button when over hard limit", () => {
    const longText = "a".repeat(8001);
    renderChatInput({ input: longText });
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("shows character count for non-empty input", () => {
    renderChatInput({ input: "Hello" });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows limit exceeded message when over hard limit", () => {
    const longText = "a".repeat(8001);
    renderChatInput({ input: longText });
    expect(screen.getByText(/limit exceeded/)).toBeInTheDocument();
  });

  it("applies warning border when over soft limit", () => {
    const text = "a".repeat(4001);
    renderChatInput({ input: text });
    const textarea = screen.getByPlaceholderText("Type your command...");
    expect(textarea.className).toContain("border-amber-400");
  });

  it("applies error border when over hard limit", () => {
    const text = "a".repeat(8001);
    renderChatInput({ input: text });
    const textarea = screen.getByPlaceholderText("Type your command...");
    expect(textarea.className).toContain("border-red-400");
  });

  it("does not show character count for empty input", () => {
    renderChatInput({ input: "" });
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("disables textarea when streaming", () => {
    renderChatInput({ isStreaming: true });
    expect(screen.getByPlaceholderText("Type your command...")).toBeDisabled();
  });

  it("calls setInput on textarea change", async () => {
    const setInput = vi.fn();
    renderChatInput({ setInput });
    const textarea = screen.getByPlaceholderText("Type your command...");
    await userEvent.type(textarea, "a");
    expect(setInput).toHaveBeenCalled();
  });
});
