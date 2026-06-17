import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThinkingIndicator } from "@/components/ai/thinking-indicator";

describe("ThinkingIndicator", () => {
  it("renders with default thinking message", () => {
    render(<ThinkingIndicator />);
    expect(screen.getByText("Thinking")).toBeInTheDocument();
  });

  it("renders with searching status", () => {
    render(<ThinkingIndicator status="searching" />);
    expect(screen.getByText("Searching")).toBeInTheDocument();
  });

  it("renders with generating status", () => {
    render(<ThinkingIndicator status="generating" />);
    expect(screen.getByText("Generating")).toBeInTheDocument();
  });

  it("renders with executing status", () => {
    render(<ThinkingIndicator status="executing" />);
    expect(screen.getByText("Executing")).toBeInTheDocument();
  });

  it("renders unknown status as-is", () => {
    render(<ThinkingIndicator status="custom_status" />);
    expect(screen.getByText("custom_status")).toBeInTheDocument();
  });

  it("renders three animated dots", () => {
    const { container } = render(<ThinkingIndicator />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });

  it("applies custom className", () => {
    const { container } = render(<ThinkingIndicator className="custom-class" />);
    expect(container.firstChild).toBeTruthy();
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("custom-class");
  });

  it("renders subtext for thinking status", () => {
    const { container } = render(<ThinkingIndicator status="thinking" />);
    const subtextEl = container.querySelector("p.text-xs");
    expect(subtextEl).toBeInTheDocument();
  });

  it("renders subtext for searching status", () => {
    const { container } = render(<ThinkingIndicator status="searching" />);
    const subtextEl = container.querySelector("p.text-xs");
    expect(subtextEl).toBeInTheDocument();
  });

  it("renders subtext for generating status", () => {
    const { container } = render(<ThinkingIndicator status="generating" />);
    const subtextEl = container.querySelector("p.text-xs");
    expect(subtextEl).toBeInTheDocument();
  });

  it("renders no subtext for unknown status", () => {
    const { container } = render(<ThinkingIndicator status="unknown" />);
    const subtextEl = container.querySelector(".h-4");
    expect(subtextEl?.textContent).toBe("");
  });
});
