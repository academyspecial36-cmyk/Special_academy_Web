"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Modal } from "./modal";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { apiUpload } from "@/lib/api-client";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "multi-select" | "number" | "url" | "image";
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  browseMedia?: boolean;
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
  onBrowseMedia?: (fieldName: string) => void;
  externalFieldValues?: Record<string, string>;
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
  onBrowseMedia,
  externalFieldValues,
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

  useEffect(() => {
    if (externalFieldValues) {
      setForm((prev) => ({ ...prev, ...externalFieldValues }));
    }
  }, [externalFieldValues]);

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
            ) : field.type === "multi-select" ? (
              <div className="space-y-2">
                {(() => {
                  const vals = (form[field.name] || "").split(",").filter(Boolean);
                  function isSelected(opt: { value: string; label: string }) {
                    return vals.some((v) => v === opt.value || v === opt.label);
                  }
                  function toggle(opt: { value: string; label: string }) {
                    const on = isSelected(opt);
                    let next = on
                      ? vals.filter((v) => v !== opt.value && v !== opt.label)
                      : [...vals.filter((v) => v !== opt.label), opt.value];
                    updateField(field.name, next.join(","));
                  }
                  return (
                    <>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {vals.map((val) => {
                          const match = field.options?.find((o) => o.value === val || o.label === val);
                          return (
                            <span key={val} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                              {match?.label ?? val}
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = (form[field.name] || "").split(",").filter(Boolean);
                                  const labelMatch = field.options?.find((o) => o.label === val);
                                  updateField(field.name, cur.filter((v) => v !== val && v !== labelMatch?.value).join(","));
                                }}
                                className="hover:text-red-500 transition-colors"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                      <div className="max-h-40 overflow-y-auto border border-primary/10 rounded-lg divide-y divide-primary/5">
                        {field.options?.map((opt) => {
                          const on = isSelected(opt);
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => toggle(opt)}
                              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                                on ? "bg-secondary/5 text-secondary font-medium" : "text-primary hover:bg-accent"
                              }`}
                            >
                              <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${
                                on ? "bg-secondary border-secondary text-white" : "border-primary/20"
                              }`}>
                                {on ? "✓" : ""}
                              </span>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
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
                <div className="flex items-center gap-2 flex-wrap">
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
                      <><Upload className="w-3.5 h-3.5 mr-2" /> Upload</>
                    )}
                  </Button>
                  {field.browseMedia && onBrowseMedia && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onBrowseMedia(field.name)}
                    >
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Browse Media
                    </Button>
                  )}
                  <span className="text-xs text-muted">or paste URL</span>
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
                  <div className="relative w-full h-32 rounded-lg overflow-hidden" style={{ backgroundImage: "repeating-conic-gradient(hsl(var(--primary) / 0.08) 0% 25%, transparent 0% 50%)", backgroundSize: "16px 16px" }}>
                    <Image
                      src={localPreviews[field.name] || form[field.name]}
                      alt="Preview"
                      fill
                      className="object-contain"
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
