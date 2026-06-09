"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Select } from "./select";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "number" | "url";
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  initialValues?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
  submitLabel?: string;
  loading?: boolean;
}

export function FormModal({
  open,
  onClose,
  title,
  fields,
  initialValues,
  onSubmit,
  submitLabel = "Save",
  loading,
}: FormModalProps) {
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setForm({ ...initialValues });
      } else {
        const defaults: Record<string, string> = {};
        fields.forEach((f) => {
          defaults[f.name] = "";
        });
        setForm(defaults);
      }
    }
  }, [open, initialValues, fields]);

  function updateField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="text-sm font-medium text-primary mb-1 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {field.type === "textarea" ? (
              <Textarea
                placeholder={field.placeholder}
                value={form[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                rows={3}
                required={field.required}
              />
            ) : field.type === "select" ? (
              <select
                value={form[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="flex h-10 w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm text-primary outline-none focus:border-primary/30 focus:ring-0 placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50"
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
              />
            )}
          </div>
        ))}
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
