import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ArrayEditor } from "@/components/ui/array-editor";

const defaultItem = { label: "", value: "" };
const fields = [
  { key: "label", label: "Label" },
  { key: "value", label: "Value" },
];

describe("ArrayEditor", () => {
  it("renders empty state with add button", () => {
    render(
      <ArrayEditor
        items={[]}
        onChange={() => {}}
        fields={fields}
        defaultItem={defaultItem}
        itemLabel="Item"
      />
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("renders existing items", () => {
    render(
      <ArrayEditor
        items={[{ label: "Foo", value: "Bar" }]}
        onChange={() => {}}
        fields={fields}
        defaultItem={defaultItem}
        itemLabel="Item"
      />
    );
    expect(screen.getByDisplayValue("Foo")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Bar")).toBeInTheDocument();
  });

  it("calls onChange with new item when add is clicked", async () => {
    const onChange = vi.fn();
    render(
      <ArrayEditor
        items={[]}
        onChange={onChange}
        fields={fields}
        defaultItem={defaultItem}
        itemLabel="Item"
      />
    );
    await userEvent.click(screen.getByText("Add Item"));
    expect(onChange).toHaveBeenCalledWith([{ label: "", value: "" }]);
  });

  it("calls onChange with item removed", async () => {
    const onChange = vi.fn();
    render(
      <ArrayEditor
        items={[{ label: "Foo", value: "Bar" }, { label: "Baz", value: "Qux" }]}
        onChange={onChange}
        fields={fields}
        defaultItem={defaultItem}
        itemLabel="Item"
      />
    );
    const removeButtons = screen.getAllByText(/remove/i);
    expect(removeButtons).toHaveLength(2);
    await userEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith([{ label: "Baz", value: "Qux" }]);
  });

  it("updates item field value via onChange", () => {
    const onChange = vi.fn();
    render(
      <ArrayEditor
        items={[{ label: "Foo", value: "" }]}
        onChange={onChange}
        fields={fields}
        defaultItem={defaultItem}
        itemLabel="Item"
      />
    );
    const input = screen.getByDisplayValue("Foo");
    fireEvent.change(input, { target: { value: "Updated" } });
    expect(onChange).toHaveBeenCalled();
    const lastCallArgs = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCallArgs[0].label).toBe("Updated");
  });

  it("renders items with correct numbering", () => {
    render(
      <ArrayEditor
        items={[{ label: "A" }, { label: "B" }]}
        onChange={() => {}}
        fields={[{ key: "label", label: "Label" }]}
        defaultItem={{ label: "" }}
        itemLabel="Item"
      />
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("renders textarea for textarea type fields", () => {
    render(
      <ArrayEditor
        items={[{ description: "Long text" }]}
        onChange={() => {}}
        fields={[{ key: "description", label: "Description", type: "textarea" }]}
        defaultItem={{ description: "" }}
        itemLabel="Item"
      />
    );
    const textarea = screen.getByDisplayValue("Long text");
    expect(textarea.tagName.toLowerCase()).toBe("textarea");
  });

  it("renders with custom gridCols class", () => {
    const { container } = render(
      <ArrayEditor
        items={[]}
        onChange={() => {}}
        fields={fields}
        defaultItem={defaultItem}
        itemLabel="Item"
        gridCols={3}
      />
    );
    expect((container.firstChild as HTMLElement).className).toContain("grid");
  });

  it("uses placeholder map", () => {
    render(
      <ArrayEditor
        items={[{ label: "", value: "" }]}
        onChange={() => {}}
        fields={fields}
        defaultItem={defaultItem}
        itemLabel="Item"
        placeholder={{ label: "Enter label here" }}
      />
    );
    expect(screen.getByPlaceholderText("Enter label here")).toBeInTheDocument();
  });

  it("falls back to field label when no placeholder", () => {
    render(
      <ArrayEditor
        items={[{ label: "", value: "" }]}
        onChange={() => {}}
        fields={fields}
        defaultItem={defaultItem}
        itemLabel="Item"
      />
    );
    expect(screen.getByPlaceholderText("Label")).toBeInTheDocument();
  });
});
