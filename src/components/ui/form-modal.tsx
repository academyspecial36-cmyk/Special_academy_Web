"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "./modal";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Upload, Loader2 } from "lucide-react";
import { apiUpload } from "@/lib/api-client";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "number" | "url" | "image";
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
  const [uploadingImg, setUploadingImg] = useState<Record<string, boolean>>({});
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
  const previewRefs = useRef<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
      Object.values(previewRefs.current).forEach((p) => URL.revokeObjectURL(p));
      previewRefs.current = {};
      setLocalPreviews({});
      setUploadingImg({});
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
            ) : field.type === "image" ? (
              <div className="space-y-2">
                <input
                  ref={(el) => { fileInputRefs.current[field.name] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImg((p) => ({ ...p, [field.name]: true }));
                    const prev = previewRefs.current[field.name];
                    if (prev) URL.revokeObjectURL(prev);
                    const blobUrl = URL.createObjectURL(file);
                    previewRefs.current[field.name] = blobUrl;
                    setLocalPreviews((p) => ({ ...p, [field.name]: blobUrl }));
                    try {
                      const { url } = await apiUpload(file, "images");
                      updateField(field.name, url);
                    } catch {
                      setLocalPreviews((p) => {
                        const next = { ...p };
                        delete next[field.name];
                        return next;
                      });
                    } finally {
                      setUploadingImg((p) => ({ ...p, [field.name]: false }));
                    }
                    if (e.target) e.target.value = "";
                  }}
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImg[field.name]}
                    onClick={() => fileInputRefs.current[field.name]?.click()}
                  >
                    {uploadingImg[field.name] ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-3.5 h-3.5 mr-2" /> Upload Image</>
                    )}
                  </Button>
                  <span className="text-xs text-muted">or paste a URL</span>
                </div>
                <Input
                  type="url"
                  placeholder={field.placeholder || "https://..."}
                  value={form[field.name] || ""}
                  onChange={(e) => {
                    updateField(field.name, e.target.value);
                    setLocalPreviews((p) => {
                      const next = { ...p };
                      delete next[field.name];
                      return next;
                    });
                  }}
                />
                {(localPreviews[field.name] || form[field.name]) && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-[image:repeating-conic-gradient(#e5e5e5_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={localPreviews[field.name] || form[field.name]}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
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
