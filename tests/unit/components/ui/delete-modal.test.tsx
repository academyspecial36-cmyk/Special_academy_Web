import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DeleteModal } from "@/components/ui/delete-modal";

describe("DeleteModal", () => {
  it("renders when open", () => {
    render(
      <DeleteModal
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete Course"
        message="Are you sure you want to delete this course?"
      />
    );
    expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    expect(screen.getByText("Delete Course")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete this course?")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <DeleteModal
        open={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete Course"
        message="Are you sure?"
      />
    );
    expect(screen.queryByText("Confirm Delete")).not.toBeInTheDocument();
  });

  it("calls onConfirm when delete is clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <DeleteModal
        open={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Delete"
        message="Sure?"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onClose when cancel is clicked", async () => {
    const onClose = vi.fn();
    render(
      <DeleteModal
        open={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="Delete"
        message="Sure?"
      />
    );
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows loading state on confirm button", () => {
    render(
      <DeleteModal
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete"
        message="Sure?"
        loading={true}
      />
    );
    expect(screen.getByText("Deleting...")).toBeInTheDocument();
    expect(screen.getByText("Deleting...")).toBeDisabled();
    expect(screen.getByText("Cancel")).toBeDisabled();
  });

  it("shows danger icon", () => {
    render(
      <DeleteModal
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete"
        message="Sure?"
      />
    );
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not call onConfirm when loading and delete clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <DeleteModal
        open={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Delete"
        message="Sure?"
        loading={true}
      />
    );
    await userEvent.click(screen.getByText("Deleting..."));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("does not call onClose when loading and cancel clicked", async () => {
    const onClose = vi.fn();
    render(
      <DeleteModal
        open={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="Delete"
        message="Sure?"
        loading={true}
      />
    );
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
