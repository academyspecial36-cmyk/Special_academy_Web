"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Mail, Plus, Pencil, Trash2, Copy, Send, Archive, ChevronDown, Loader2, Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn, formatShortDate } from "@/lib/utils";
import { generateEmailHtml, DEFAULT_CONFIG, type TemplateConfig } from "@/lib/email-template-builder";
import { sanitizeHtml } from "@/lib/sanitize";

interface Template {
  id: string;
  name: string;
  type: "email";
  subject: string;
  body: string;
  variables: string[];
  category: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "custom", label: "Custom" },
  { value: "enrollment", label: "Enrollment Verification" },
  { value: "approval", label: "Enrollment Approved" },
  { value: "rejection", label: "Enrollment Rejected" },
  { value: "password_reset", label: "Password Reset" },
] as const;

const defaultVars = ["name", "email", "phone", "academyName", "website", "verificationCode", "message"];

const MOCK_ACADEMY = { name: "Special Academy", logo: "/icon-image.png", website: "https://specialacademy.com.np", email: "info@specialacademy.com.np", phone: "986-0302036" };

interface TemplatesTabProps {
  templates: Template[];
  loading: boolean;
  editingTemplate: Template | null;
  setEditingTemplate: React.Dispatch<React.SetStateAction<Template | null>>;
  templateForm: { name: string; type: "email"; subject: string; body: string; category: string; config: TemplateConfig };
  setTemplateForm: React.Dispatch<React.SetStateAction<{ name: string; type: "email"; subject: string; body: string; category: string; config: TemplateConfig }>>;
  savingTemplate: boolean;
  deletingTemplate: string | null;
  setDeletingTemplate: (id: string | null) => void;
  templateFilter: string;
  setTemplateFilter: (f: string) => void;
  handleSaveTemplate: () => void;
  confirmDeleteTemplate: () => void;
  applyTemplate: (t: Template) => void;
  fillStarter: (category: string) => void;
  handleCategoryChange: (category: string) => void;
}

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export default function TemplatesTab({
  templates,
  loading,
  editingTemplate,
  setEditingTemplate,
  templateForm,
  setTemplateForm,
  savingTemplate,
  deletingTemplate,
  setDeletingTemplate,
  templateFilter,
  setTemplateFilter,
  handleSaveTemplate,
  confirmDeleteTemplate,
  applyTemplate,
  fillStarter,
  handleCategoryChange,
}: TemplatesTabProps) {
  const templatePreviewHtml = useMemo(
    () => generateEmailHtml(templateForm.config as TemplateConfig, MOCK_ACADEMY),
    [templateForm.config]
  );

  const visibleTemplates = useMemo(
    () => templates.filter((t) => !templateFilter || t.type === templateFilter),
    [templates, templateFilter]
  );

  return (
    <motion.div 
      key="templates" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 w-full min-w-0"
    >
      {/* LEFT COLUMN: Editor */}
      <Card className="lg:col-span-2 h-fit w-full min-w-0">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-base flex items-center gap-2 min-w-0">
            {editingTemplate ? <Pencil className="w-4 h-4 text-secondary shrink-0" /> : <Plus className="w-4 h-4 text-secondary shrink-0" />}
            <span className="truncate">{editingTemplate ? "Edit Template" : "New Template"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-primary/5 p-4 sm:p-6">
          
          {/* BASIC INFO */}
          <details open className="py-4 group">
            <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2 pr-2">
              <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs shrink-0">⚙️</span>
              <span className="truncate">Basic Info</span>
              <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Template Name</label>
                <Input 
                  value={templateForm.name} 
                  onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} 
                  placeholder="e.g. Welcome Email" 
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">What type of email is this?</label>
                <select
                  value={templateForm.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-muted mt-1.5">Pick a type and we&apos;ll auto-fill a template. Customize any section below.</p>
              </div>
            </div>
          </details>

          {/* HEADER DESIGN */}
          <details className="py-4 group">
            <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2 pr-2">
              <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs shrink-0">🎨</span>
              <span className="truncate">Header Design</span>
              <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Header Background Color</label>
                <div className="flex gap-3 items-center min-w-0 w-full">
                  <input
                    type="color"
                    value={templateForm.config.headerColor as string}
                    onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, headerColor: e.target.value } }))}
                    className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5 shrink-0"
                  />
                  <Input
                    value={templateForm.config.headerColor as string}
                    onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, headerColor: e.target.value } }))}
                    className="font-mono flex-1 min-w-0"
                    placeholder="#07220B"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Tagline</label>
                <Input
                  value={templateForm.config.tagline as string}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, tagline: e.target.value } }))}
                  placeholder="Preparing Future Leaders..."
                  className="w-full"
                />
              </div>
              <label className="flex items-center gap-2.5 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={templateForm.config.showLogo as boolean}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, showLogo: e.target.checked } }))}
                  className="rounded border-primary/20 text-primary focus:ring-primary shrink-0"
                />
                <span className="truncate">Show academy logo in header</span>
              </label>
            </div>
          </details>

          {/* CONTENT */}
          <details className="py-4 group">
            <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2 pr-2">
              <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs shrink-0">📝</span>
              <span className="truncate">Content</span>
              <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Subject Line</label>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {defaultVars.map((v) => (
                    <button key={v} type="button" onClick={() => setTemplateForm((p) => ({ ...p, subject: p.subject + `{{${v}}}` }))}
                      className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                      {'{{' + v + '}}'}
                    </button>
                  ))}
                </div>
                <Input value={templateForm.subject} onChange={(e) => setTemplateForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Email subject" className="w-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Badge Text</label>
                  <Input value={templateForm.config.badgeText as string} onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, badgeText: e.target.value } }))} placeholder="e.g. ACTION REQUIRED" className="w-full" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Badge Color</label>
                  <div className="flex gap-2 items-center min-w-0 w-full">
                    <input type="color" value={templateForm.config.badgeColor as string}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, badgeColor: e.target.value } }))}
                      className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5 shrink-0" />
                    <Input value={templateForm.config.badgeColor as string}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, badgeColor: e.target.value } }))}
                      className="font-mono min-w-0 flex-1" placeholder="#d97706" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Main Heading</label>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {defaultVars.map((v) => (
                    <button key={v} type="button" onClick={() => setTemplateForm((p) => ({ ...p, config: { ...p.config, heading: (p.config.heading as string) + `{{${v}}}` } }))}
                      className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                      {'{{' + v + '}}'}
                    </button>
                  ))}
                </div>
                <Textarea value={templateForm.config.heading as string}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, heading: e.target.value } }))}
                  placeholder="Welcome, {{name}}!" rows={2} className="text-sm w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Message Body</label>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {defaultVars.map((v) => (
                    <button key={v} type="button" onClick={() => setTemplateForm((p) => ({ ...p, config: { ...p.config, message: (p.config.message as string) + `{{${v}}}` } }))}
                      className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                      {'{{' + v + '}}'}
                    </button>
                  ))}
                </div>
                <Textarea value={templateForm.config.message as string}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, message: e.target.value } }))}
                  placeholder="Write your message here... Use {{name}}, {{academyName}} etc. as placeholders." rows={5} className="text-sm w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Text Color</label>
                <div className="flex gap-2 items-center min-w-0 w-full">
                  <input type="color" value={templateForm.config.messageColor as string}
                    onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, messageColor: e.target.value } }))}
                    className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5 shrink-0" />
                  <Input value={templateForm.config.messageColor as string}
                    onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, messageColor: e.target.value } }))}
                    className="font-mono flex-1 min-w-0" placeholder="#444444" />
                </div>
              </div>
            </div>
          </details>

          {/* CTA BUTTON */}
          <details className="py-4 group">
            <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2 pr-2">
              <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs shrink-0">🔘</span>
              <span className="truncate">Call-to-Action Button</span>
              <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-2.5 text-sm text-primary">
                <input type="checkbox" checked={templateForm.config.showButton as boolean}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, showButton: e.target.checked } }))}
                  className="rounded border-primary/20 text-primary focus:ring-primary shrink-0" />
                <span className="truncate">Show a call-to-action button</span>
              </label>
              {templateForm.config.showButton && (
                <div className="space-y-4 pl-4 sm:pl-6 border-l-2 border-primary/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Button Text</label>
                      <Input value={templateForm.config.buttonText as string}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, buttonText: e.target.value } }))}
                        placeholder="Get Started" className="w-full" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Button URL</label>
                      <Input value={templateForm.config.buttonUrl as string}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, buttonUrl: e.target.value } }))}
                        placeholder="{{website}}/login" className="w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Button Color</label>
                    <div className="flex gap-2 items-center min-w-0 w-full">
                      <input type="color" value={templateForm.config.buttonColor as string}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, buttonColor: e.target.value } }))}
                        className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5 shrink-0" />
                      <Input value={templateForm.config.buttonColor as string}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, buttonColor: e.target.value } }))}
                        className="font-mono flex-1 min-w-0" placeholder="#07220B" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </details>

          {/* FOOTER */}
          <details className="py-4 group">
            <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2 pr-2">
              <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs shrink-0">📋</span>
              <span className="truncate">Footer</span>
              <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Footer Background Color</label>
                <div className="flex gap-2 items-center min-w-0 w-full">
                  <input type="color" value={templateForm.config.footerColor as string}
                    onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, footerColor: e.target.value } }))}
                    className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5 shrink-0" />
                  <Input value={templateForm.config.footerColor as string}
                    onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, footerColor: e.target.value } }))}
                    className="font-mono flex-1 min-w-0" placeholder="#f8f9fc" />
                </div>
              </div>
              <label className="flex items-center gap-2.5 text-sm text-primary">
                <input type="checkbox" checked={templateForm.config.showContact as boolean}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, showContact: e.target.checked } }))}
                  className="rounded border-primary/20 text-primary focus:ring-primary shrink-0" />
                <span className="truncate">Show contact info (email & phone)</span>
              </label>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Custom Footer Text</label>
                <Textarea value={templateForm.config.footerText as string}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, footerText: e.target.value } }))}
                  placeholder="Additional footer text (optional)" rows={2} className="text-sm w-full" />
              </div>
            </div>
          </details>

          {/* PREVIEW */}
          <details open className="py-4 group">
            <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2 pr-2">
              <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs shrink-0">👁️</span>
              <span className="truncate">Preview</span>
              <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180 shrink-0" />
            </summary>
            <div className="mt-4">
              <div className="min-h-[200px] sm:min-h-[300px] rounded-lg border border-primary/10 bg-white overflow-hidden">
                <div className="p-3 bg-[#f4f6f9] border-b border-primary/5 text-[11px] text-muted flex items-center gap-2 min-w-0">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">To: {'{{name}} <{{email}}>'}</span>
                </div>
                <div className="p-3 bg-white border-b border-primary/5 text-xs text-muted min-w-0">
                  <strong>Subject:</strong> <span className="truncate">{templateForm.subject || "(no subject)"}</span>
                </div>
                <div className="prose prose-sm max-w-none overflow-x-auto">
                  <div 
                    className="[&_img]:max-w-full [&_img]:h-auto [&_table]:max-w-full [&_table]:block [&_table]:overflow-x-auto" 
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(templatePreviewHtml) }} 
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted mt-1.5 flex items-start gap-1">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Preview uses sample data. Variables like <code className="text-[10px] bg-primary/5 px-1 rounded">{'{{name}}'}</code> are shown as-is in preview.</span>
              </p>
            </div>
          </details>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-4">
            <Button onClick={handleSaveTemplate} disabled={savingTemplate} className="w-full sm:w-auto min-w-[140px]">
              {savingTemplate ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
              {editingTemplate ? "Update Template" : "Save Template"}
            </Button>
            {editingTemplate && (
              <Button variant="outline" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: "", type: "email", subject: "", body: "", category: "custom", config: { ...DEFAULT_CONFIG } }); }} className="w-full sm:w-auto">
                Cancel
              </Button>
            )}
            {templateForm.category !== "custom" && (
              <Button variant="outline" onClick={() => fillStarter(templateForm.category)} title="Reset to default" className="w-full sm:w-auto">
                <Archive className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RIGHT COLUMN: Template List */}
      <div className="lg:col-span-3 space-y-3 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted">{templates.length} template{templates.length !== 1 ? "s" : ""}</p>
          <div className="flex gap-1 ml-auto">
            {(["all", "email"] as const).map((f) => (
              <button key={f} onClick={() => setTemplateFilter(f === "all" ? "" : f)}
                className={cn("px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                  (f === "all" && !templateFilter) || templateFilter === f ? "bg-primary text-white" : "text-muted hover:text-primary"
                )}>
                {f === "all" ? "All" : "Email"}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-primary/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center p-4 sm:p-6">
              <Archive className="w-8 h-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No templates yet. Create your first one.</p>
            </CardContent>
          </Card>
        ) : (
          visibleTemplates.map((t) => {
            const cat = CATEGORIES.find((c) => c.value === t.category);
            const catColor = t.category === "custom" ? "bg-slate-100 text-slate-600" :
              t.category === "enrollment" ? "bg-blue-100 text-blue-700" :
              t.category === "approval" ? "bg-emerald-100 text-emerald-700" :
              t.category === "rejection" ? "bg-red-100 text-red-700" :
              t.category === "password_reset" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow w-full">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1 w-full">
                      <div className="flex items-center gap-2 min-w-0 mb-1 flex-wrap">
                        <h3 className="font-medium text-primary text-sm truncate">{t.name}</h3>
                        <Badge variant="outline" className="text-[10px] shrink-0">{t.type}</Badge>
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0", catColor)}>
                          {cat?.label || t.category}
                        </span>
                      </div>
                      {t.subject && <p className="text-xs text-muted truncate mb-1">Subject: {t.subject}</p>}
                      <p className="text-xs text-muted line-clamp-2 font-mono break-all">{t.body}</p>
                      <p className="text-[11px] text-muted mt-1.5">Updated {formatShortDate(t.updated_at)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 self-end sm:self-start">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyTemplate(t)} title="Use in Compose">
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingTemplate(t); setTemplateForm({ name: t.name, type: t.type, subject: t.subject || "", body: t.body, category: t.category || "custom", config: (t.config && Object.keys(t.config).length ? (t.config as unknown as TemplateConfig) : { ...DEFAULT_CONFIG }) }); }} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => setDeletingTemplate(t.id)} title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </motion.div>
  );
}