import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

describe("ToggleSwitch", () => {
  it("renders with unchecked state", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    const btn = screen.getByRole("switch");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-checked", "false");
  });

  it("renders with checked state", () => {
    render(<ToggleSwitch checked={true} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with true when unchecked and clicked", async () => {
    const onChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when checked and clicked", async () => {
    const onChange = vi.fn();
    render(<ToggleSwitch checked={true} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={onChange} disabled />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies disabled styling", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("renders with correct visual classes for checked state", () => {
    const { container } = render(<ToggleSwitch checked={true} onChange={() => {}} />);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("bg-primary");
  });

  it("renders with correct visual classes for unchecked state", () => {
    const { container } = render(<ToggleSwitch checked={false} onChange={() => {}} />);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("bg-primary/20");
  });

  it("renders toggle knob that moves on checked", () => {
    const { container } = render(<ToggleSwitch checked={true} onChange={() => {}} />);
    const knob = container.querySelector("span");
    expect(knob?.className).toContain("translate-x-6");
  });

  it("renders toggle knob in start position when unchecked", () => {
    const { container } = render(<ToggleSwitch checked={false} onChange={() => {}} />);
    const knob = container.querySelector("span");
    expect(knob?.className).toContain("translate-x-1");
  });
});
