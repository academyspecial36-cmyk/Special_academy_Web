import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const ThrowComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error("Test error message");
  return <div>Normal render</div>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders default fallback on error", () => {
    render(
      <ErrorBoundary>
        <ThrowComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("renders generic message when error has no message", () => {
    const ErrorWithNoMessage = () => {
      throw new Error();
    };
    render(
      <ErrorBoundary>
        <ErrorWithNoMessage />
      </ErrorBoundary>
    );
    expect(screen.getByText("An unexpected error occurred. Please try again.")).toBeInTheDocument();
  });

  it("calls onError when error is caught", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it("recovery via state reset allows re-render", () => {
    const onError = vi.fn();
    const { rerender } = render(
      <ErrorBoundary onError={onError}>
        <ThrowComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    rerender(
      <ErrorBoundary onError={onError}>
        <ThrowComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    // Still shows error until user clicks reload
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders error icon", () => {
    render(
      <ErrorBoundary>
        <ThrowComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not interfere when child updates without error", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <div>Version 1</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Version 1")).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <div>Version 2</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Version 2")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });
});
