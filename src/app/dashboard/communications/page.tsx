"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send, Mail, MessageSquare, Plus, Pencil, Trash2, Copy, Clock,
  CheckCircle, XCircle, AlertCircle, Loader2, Eye, EyeOff, Archive,
  Download, Users, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/utils";

type Tab = "compose" | "templates" | "history";

interface Template {
  id: string;
  name: string;
  type: "email" | "sms";
  subject: string;
  body: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

interface Communication {
  id: string;
  type: "email" | "sms";
  template_id: string | null;
  subject: string | null;
  body: string;
  recipient_type: string;
  class_filter: string | null;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  status: "pending" | "sending" | "completed" | "partial" | "failed";
  created_at: string;
  sent_at: string | null;
}

const statusIcon: Record<string, React.ElementType> = {
  completed: CheckCircle,
  partial: AlertCircle,
  failed: XCircle,
  pending: Clock,
  sending: Loader2,
};

const statusColor: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-slate-100 text-slate-700",
  sending: "bg-blue-100 text-blue-700",
};

const defaultVars = ["name", "email", "phone", "academyName"];

const sampleTemplates: Partial<Template>[] = [
  { name: "Welcome to Cadet Academy", type: "email", subject: "Welcome to Cadet Academy, {{name}}!", body: "<h2>Dear {{name}},</h2><p>Welcome to Cadet Academy! We are excited to have you on board.</p><p>Your journey to excellence starts here.</p><p>Best regards,<br/><strong>{{academyName}}</strong></p>", variables: ["name", "academyName"] },
  { name: "Enrollment Confirmation", type: "email", subject: "Enrollment Confirmed - {{name}}", body: "<h2>Enrollment Confirmed</h2><p>Dear {{name}},</p><p>Your enrollment at {{academyName}} has been confirmed.</p><p>We look forward to seeing you.</p>", variables: ["name", "academyName"] },
  { name: "Exam Reminder", type: "sms", subject: "", body: "Dear {{name}}, this is a reminder about your upcoming exam at {{academyName}}. Please be prepared. - Academy", variables: ["name", "academyName"] },
  { name: "Notice Broadcast", type: "email", subject: "Important Notice from {{academyName}}", body: "<h2>Important Notice</h2><p>Dear {{name}},</p><p>Please find below an important notice from {{academyName}}:</p><hr/><p>{{message}}</p>", variables: ["name", "academyName", "message"] },
];

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("compose");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);
  const [templateFilter, setTemplateFilter] = useState<string>("");

  const [type, setType] = useState<"email" | "sms">("email");
  const [recipientType, setRecipientType] = useState("all");
  const [classFilter, setClassFilter] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", type: "email" as "email" | "sms", subject: "", body: "" });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showSamplePicker, setShowSamplePicker] = useState(false);

  const [selectedComm, setSelectedComm] = useState<Communication & { recipients?: { id: string; recipient_name: string; recipient_email: string; status: string; error_message: string | null }[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/communications/templates").then((r) => r.json()),
      fetch("/api/communications/history").then((r) => r.json()),
      fetch("/api/analytics").then((r) => r.json()).then((d) => {
        const classNames = (d.studentsByClass as { name: string }[] ?? []).map((c: { name: string }) => c.name);
        setClasses(classNames);
      }),
    ]).then(([t, h]) => {
      setTemplates(t);
      setHistory(h);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleSend() {
    if (!body.trim()) { toast.error("Message body is required"); return; }
    if (type === "email" && !subject.trim()) { toast.error("Subject is required for emails"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/communications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          templateId: selectedTemplate || null,
          subject,
          body,
          recipientType,
          classFilter: recipientType === "class" ? classFilter : null,
          recipientIds: [],
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Message sent to ${result.sent} recipients`);
        setBody("");
        setSubject("");
        fetch("/api/communications/history").then((r) => r.json()).then(setHistory);
      } else {
        toast.error(result.error || "Failed to send");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function handleSaveTemplate() {
    if (!templateForm.name.trim() || !templateForm.body.trim()) {
      toast.error("Name and body are required"); return;
    }
    setSavingTemplate(true);
    try {
      const url = editingTemplate
        ? `/api/communications/templates/${editingTemplate.id}`
        : "/api/communications/templates";
      const method = editingTemplate ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      if (editingTemplate) {
        setTemplates((p) => p.map((t) => (t.id === editingTemplate.id ? saved : t)));
      } else {
        setTemplates((p) => [saved, ...p]);
      }
      toast.success(editingTemplate ? "Template updated" : "Template created");
      setEditingTemplate(null);
      setTemplateForm({ name: "", type: "email", subject: "", body: "" });
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/communications/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTemplates((p) => p.filter((t) => t.id !== id));
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  }

  function applyTemplate(t: Template) {
    setSelectedTemplate(t.id);
    setType(t.type);
    if (t.subject) setSubject(t.subject);
    setBody(t.body);
    setShowSamplePicker(false);
  }

  function loadSampleTemplate(sample: Partial<Template>) {
    setType(sample.type as "email" | "sms");
    if (sample.subject) setSubject(sample.subject);
    setBody(sample.body ?? "");
    setSelectedTemplate("");
    setShowSamplePicker(false);
  }

  async function loadHistoryDetails(id: string) {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/communications/history/${id}`);
      const data = await res.json();
      setSelectedComm(data);
    } catch {
      toast.error("Failed to load details");
    } finally {
      setLoadingDetails(false);
    }
  }

  function renderVariableChips() {
    return (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {defaultVars.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setBody((prev) => prev + `{{${v}}}`)}
            className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
          >
            {'{{' + v + '}}'}
          </button>
        ))}
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "compose", label: "Compose", icon: <Send className="w-4 h-4" /> },
    { key: "templates", label: "Templates", icon: <Archive className="w-4 h-4" /> },
    { key: "history", label: "History", icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl font-bold text-primary">Communications</h1>
        <p className="text-sm text-muted">
          {activeTab === "compose" && "Send bulk emails or SMS to students and parents."}
          {activeTab === "templates" && "Create and manage message templates."}
          {activeTab === "history" && "Track delivery status of sent communications."}
        </p>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-16 z-20 bg-white/90 backdrop-blur-lg border-b border-primary/5 -mx-4 lg:-mx-8 px-4 lg:px-8 mb-6">
        <div className="sm:hidden py-3">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="w-full h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {tabs.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div className="hidden sm:flex gap-0.5 overflow-x-auto flex-nowrap py-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all shrink-0",
                activeTab === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-primary hover:bg-primary/5"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compose Tab */}
      {activeTab === "compose" && (
        <motion.div key="compose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Send className="w-4 h-4 text-secondary" /> New Broadcast</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {/* Type Selector */}
              <div>
                <label className="text-sm font-medium text-primary mb-2 block">Channel</label>
                <div className="flex gap-2">
                  {(["email", "sms"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setType(t); if (t === "sms") setSubject(""); }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border",
                        type === t
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-muted border-primary/10 hover:border-primary/30"
                      )}
                    >
                      {t === "email" ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      {t === "email" ? "Email" : "SMS"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="text-sm font-medium text-primary mb-2 block">Recipients</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { value: "all", label: "All Students & Parents" },
                    { value: "class", label: "By Qualification" },
                    { value: "specific", label: "Specific Students" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRecipientType(opt.value)}
                      className={cn(
                        "px-3.5 py-2 rounded-lg text-sm font-medium transition-all border",
                        recipientType === opt.value
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-muted border-primary/10 hover:border-primary/30"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {recipientType === "class" && (
                  <div className="flex flex-wrap gap-2">
                    {classes.length > 0 ? classes.map((c) => (
                      <button
                        key={c}
                        onClick={() => setClassFilter(c === classFilter ? "" : c)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                          classFilter === c
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-muted border-primary/10 hover:border-primary/30"
                        )}
                      >
                        {c}
                      </button>
                    )) : (
                      <p className="text-xs text-muted">No classes found. Add students first.</p>
                    )}
                  </div>
                )}
                {recipientType === "specific" && (
                  <p className="text-xs text-muted">Student selection coming soon. Use class filter for now.</p>
                )}
              </div>

              {/* Template / Compose */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-primary">Message</label>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                      {showPreview ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                      {showPreview ? "Edit" : "Preview"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowSamplePicker(!showSamplePicker)}>
                      <Copy className="w-3.5 h-3.5 mr-1" /> Templates
                    </Button>
                  </div>
                </div>

                {showSamplePicker && (
                  <Card className="mb-3 border-dashed">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-xs font-medium text-muted">Saved Templates</p>
                      {templates.filter((t) => t.type === type).length === 0 && (
                        <p className="text-xs text-muted">No templates for {type}. Create some in the Templates tab.</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {templates.filter((t) => t.type === type).map((t) => (
                          <button key={t.id} onClick={() => applyTemplate(t)} className="px-2.5 py-1 text-xs rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors">{t.name}</button>
                        ))}
                      </div>
                      <p className="text-xs font-medium text-muted pt-1 border-t border-primary/5">Quick Templates</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sampleTemplates.filter((t) => t.type === type).map((t, i) => (
                          <button key={i} onClick={() => loadSampleTemplate(t)} className="px-2.5 py-1 text-xs rounded-md bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors">{t.name}</button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {type === "email" && (
                  <div className="mb-3">
                    <label className="text-xs font-medium text-primary mb-1 block">Subject</label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter email subject..." />
                  </div>
                )}

                {renderVariableChips()}

                {showPreview ? (
                  <div className="min-h-[200px] rounded-lg border border-primary/10 p-4 bg-white prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: type === "email" ? body : body.replace(/\n/g, "<br/>") }} />
                  </div>
                ) : (
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={type === "email" ? "Write your email HTML or plain text here..." : "Write your SMS message here..."}
                    rows={8}
                    className="font-mono text-sm"
                  />
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-primary/5">
                <Button size="lg" onClick={handleSend} disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {sending ? "Sending..." : `Send ${type === "email" ? "Email" : "SMS"}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2 h-fit">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {editingTemplate ? <Pencil className="w-4 h-4 text-secondary" /> : <Plus className="w-4 h-4 text-secondary" />}
                {editingTemplate ? "Edit Template" : "New Template"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Template Name</label>
                <Input value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Welcome Email" />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Type</label>
                <div className="flex gap-2">
                  {(["email", "sms"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTemplateForm((p) => ({ ...p, type: t, subject: t === "sms" ? "" : p.subject }))}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                        templateForm.type === t
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-muted border-primary/10"
                      )}
                    >
                      {t === "email" ? "Email" : "SMS"}
                    </button>
                  ))}
                </div>
              </div>
              {templateForm.type === "email" && (
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">Subject</label>
                  <Input value={templateForm.subject} onChange={(e) => setTemplateForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Email subject line" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Body</label>
                {renderVariableChips()}
                <Textarea
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, body: e.target.value }))}
                  placeholder={templateForm.type === "email" ? "HTML or plain text..." : "SMS message text..."}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveTemplate} disabled={savingTemplate} className="flex-1">
                  {savingTemplate ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
                  {editingTemplate ? "Update" : "Create"}
                </Button>
                {editingTemplate && (
                  <Button variant="outline" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: "", type: "email", subject: "", body: "" }); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* List */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{templates.length} template{templates.length !== 1 ? "s" : ""}</p>
              <div className="flex gap-1">
                {(["all", "email", "sms"] as const).map((f) => (
                  <button key={f} onClick={() => setTemplateFilter(f === "all" ? "" : f)}
                    className={cn("px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                      (f === "all" && !templateFilter) || templateFilter === f ? "bg-primary text-white" : "text-muted hover:text-primary"
                    )}>
                    {f === "all" ? "All" : f === "email" ? "Email" : "SMS"}
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
                <CardContent className="py-12 text-center">
                  <Archive className="w-8 h-8 text-muted mx-auto mb-3" />
                  <p className="text-sm text-muted">No templates yet. Create your first one.</p>
                </CardContent>
              </Card>
            ) : (
              templates
                .filter((t) => !templateFilter || t.type === templateFilter)
                .map((t) => (
                  <Card key={t.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-primary text-sm truncate">{t.name}</h3>
                            <Badge variant="outline" className="text-[10px] shrink-0">{t.type}</Badge>
                          </div>
                          {t.subject && <p className="text-xs text-muted truncate mb-1">Subject: {t.subject}</p>}
                          <p className="text-xs text-muted line-clamp-2 font-mono">{t.body}</p>
                          <p className="text-[11px] text-muted mt-1.5">Updated {formatShortDate(t.updated_at)}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyTemplate(t)} title="Use in Compose">
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingTemplate(t); setTemplateForm({ name: t.name, type: t.type, subject: t.subject || "", body: t.body }); }} title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDeleteTemplate(t.id)} title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> Delivery History</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-primary/5 rounded-lg animate-pulse" />)}
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="w-8 h-8 text-muted mx-auto mb-3" />
                  <p className="text-sm text-muted">No communications sent yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((comm) => {
                    const StatusIcon = statusIcon[comm.status] || Clock;
                    return (
                      <div
                        key={comm.id}
                        onClick={() => loadHistoryDetails(comm.id)}
                        className="flex items-center gap-4 p-4 rounded-xl border border-primary/5 hover:bg-accent/50 cursor-pointer transition-all"
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", statusColor[comm.status])}>
                          <StatusIcon className={cn("w-5 h-5", comm.status === "sending" && "animate-spin")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-primary truncate">{comm.subject || comm.type + " broadcast"}</p>
                            <Badge variant="outline" className="text-[10px] shrink-0">{comm.type}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                            <span>{formatShortDate(comm.created_at)}</span>
                            <span>{comm.recipient_count} recipients</span>
                            {comm.sent_count > 0 && <span className="text-emerald-600">{comm.sent_count} sent</span>}
                            {comm.failed_count > 0 && <span className="text-red-600">{comm.failed_count} failed</span>}
                            <Badge className={cn("text-[10px]", statusColor[comm.status])}>{comm.status}</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detail Modal */}
          {selectedComm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Delivery Details</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedComm(null)}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingDetails ? (
                  <div className="h-32 bg-primary/5 rounded-lg animate-pulse" />
                ) : (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs text-muted">Type</p>
                        <p className="text-sm font-medium text-primary capitalize">{selectedComm.type}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs text-muted">Status</p>
                        <Badge className={cn("mt-0.5", statusColor[selectedComm.status])}>{selectedComm.status}</Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs text-muted">Recipients</p>
                        <p className="text-sm font-medium text-primary">{selectedComm.recipient_count}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs text-muted">Sent</p>
                        <p className="text-sm font-medium text-emerald-600">{selectedComm.sent_count}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs text-muted">Failed</p>
                        <p className="text-sm font-medium text-red-600">{selectedComm.failed_count}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs text-muted">Date</p>
                        <p className="text-sm font-medium text-primary">{formatShortDate(selectedComm.created_at)}</p>
                      </div>
                    </div>

                    {selectedComm.recipients && selectedComm.recipients.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-primary mb-2">Recipient Details</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-primary/5">
                                <th className="text-left py-2 px-2 font-medium text-muted text-xs">Name</th>
                                <th className="text-left py-2 px-2 font-medium text-muted text-xs">Email</th>
                                <th className="text-left py-2 px-2 font-medium text-muted text-xs">Status</th>
                                <th className="text-left py-2 px-2 font-medium text-muted text-xs">Error</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedComm.recipients.map((r) => (
                                <tr key={r.id} className="border-b border-primary/5 last:border-0">
                                  <td className="py-2 px-2 text-primary">{r.recipient_name}</td>
                                  <td className="py-2 px-2 text-muted">{r.recipient_email || "-"}</td>
                                  <td className="py-2 px-2">
                                    <Badge className={cn("text-[10px]", r.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                      {r.status}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-2 text-red-500 text-xs">{r.error_message || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
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
