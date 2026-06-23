"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send, Mail, Plus, Pencil, Trash2, Copy, Clock,
  CheckCircle, XCircle, AlertCircle, Loader2, Eye, EyeOff, Archive,
  Download, Users, BookOpen, ChevronDown, Info,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DeleteModal } from "@/components/ui/delete-modal";
import { cn, formatShortDate } from "@/lib/utils";
import { generateEmailHtml, DEFAULT_CONFIG, type TemplateConfig } from "@/lib/email-template-builder";

type Tab = "compose" | "templates" | "history";

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

interface Communication {
  id: string;
  type: "email";
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

const defaultVars = ["name", "email", "phone", "academyName", "website", "verificationCode", "message"];

const STARTER_CONFIGS: Record<string, Partial<TemplateConfig>> = {
  enrollment: {
    badgeText: "ACTION REQUIRED",
    badgeColor: "#d97706",
    heading: "Welcome, {{name}}!",
    message: "Thank you for choosing {{academyName}}. Use the code below to verify your email and activate your enrollment.\n\nOnce verified, our team will review your application and notify you of the status.\n\nIf you did not create this account, please ignore this email.",
    showButton: false,
  },
  approval: {
    badgeText: "CONGRATULATIONS",
    badgeColor: "#16a34a",
    heading: "Congratulations, {{name}}!",
    message: "We are delighted to welcome you to {{academyName}}.\n\nYou are now officially a student. Log in to access course materials, track your progress, and begin your cadet preparation journey.",
    showButton: true,
    buttonText: "Access Your Dashboard",
    buttonUrl: "{{website}}/login",
    buttonColor: "#07220B",
  },
  rejection: {
    badgeText: "APPLICATION UPDATE",
    badgeColor: "#dc2626",
    heading: "Application Update",
    message: "Dear {{name}},\n\nAfter careful review, we regret to inform you that your enrollment application has been rejected.\n\n{{message}}\n\nYou may reapply in the future if your circumstances change. If you have any questions, please contact our admissions team.",
    showButton: false,
  },
  password_reset: {
    badgeText: "SECURITY ALERT",
    badgeColor: "#d97706",
    heading: "Reset Your Password",
    message: "Hi {{name}}, we received a request to reset your {{academyName}} account password.\n\nYour password reset code is: {{verificationCode}}\n\nThis code expires in 15 minutes.\n\nIf you did not request a password reset, please ignore this email or contact support immediately.",
    showButton: false,
  },
};

const STARTER_TEMPLATES: Record<string, { name: string; subject: string; body: string }> = {
  enrollment: {
    name: "Enrollment Verification",
    subject: "Verify Your {{academyName}} Enrollment",
    body: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
  <tr>
    <td style="background-color:#d9770615;color:#d97706;font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;font-family:Arial,sans-serif;">ACTION REQUIRED</td>
  </tr>
</table>
<h2 style="color:#07220B;font-size:22px;margin:0 0 4px;">Welcome, {{name}}!</h2>
<p style="margin:0 0 16px;color:#444;">Thank you for choosing {{academyName}}. Use the code below to verify your email and activate your enrollment.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#07220B15;border-radius:12px;padding:24px;margin:0 0 20px;">
  <tr>
    <td align="center">
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#888;margin:0 0 12px;">Your Verification Code</p>
      <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#07220B;font-family:'Courier New',monospace;background:#ffffff;padding:12px 24px;border-radius:8px;display:inline-block;">{{verificationCode}}</div>
      <p style="font-family:Arial,sans-serif;font-size:12px;color:#888;margin:12px 0 0;">This code expires in 15 minutes</p>
    </td>
  </tr>
</table>
<p style="color:#444;font-size:14px;">Once verified, our team will review your application and notify you of the status.</p>
<hr style="border:none;border-top:1px solid #eef0f5;margin:20px 0;" />
<p style="font-size:13px;color:#888;margin:0;">If you did not create this account, please ignore this email.</p>`,
  },
  approval: {
    name: "Enrollment Approved",
    subject: "Welcome to {{academyName}} - Application Approved!",
    body: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
  <tr>
    <td style="background-color:#16a34a15;color:#16a34a;font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;font-family:Arial,sans-serif;">CONGRATULATIONS</td>
  </tr>
</table>
<h2 style="color:#07220B;font-size:22px;margin:0 0 4px;">Congratulations, {{name}}!</h2>
<p style="color:#444;margin:0 0 16px;">We are delighted to welcome you to <strong>{{academyName}}</strong>.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f0fdf4;border-radius:12px;padding:20px;margin:0 0 20px;border-left:4px solid #16a34a;">
  <tr>
    <td>
      <p style="font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#166534;margin:0 0 8px;">Your application has been approved!</p>
      <p style="font-family:Arial,sans-serif;font-size:14px;color:#166534;margin:0;">You are now officially a student. Log in to access course materials, track your progress, and begin your cadet preparation journey.</p>
    </td>
  </tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
  <tr>
    <td align="center" style="background-color:#07220B;border-radius:8px;">
      <a href="{{website}}/login" target="_blank" style="display:inline-block;padding:12px 32px;font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Access Your Dashboard</a>
    </td>
  </tr>
</table>
<h3 style="color:#07220B;font-size:15px;margin:0 0 8px;">What's Next?</h3>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 16px;">
  <tr><td style="padding:6px 0;font-size:14px;color:#444;font-family:Arial,sans-serif;">Explore your enrolled courses</td></tr>
  <tr><td style="padding:6px 0;font-size:14px;color:#444;font-family:Arial,sans-serif;">Take practice exams</td></tr>
  <tr><td style="padding:6px 0;font-size:14px;color:#444;font-family:Arial,sans-serif;">Check live class schedules</td></tr>
  <tr><td style="padding:6px 0;font-size:14px;color:#444;font-family:Arial,sans-serif;">Stay updated with notices</td></tr>
</table>
<hr style="border:none;border-top:1px solid #eef0f5;margin:20px 0;" />
<p style="font-size:14px;color:#444;margin:0;">Best regards,<br/><strong style="color:#07220B;">Admissions Team</strong><br/>{{academyName}}</p>`,
  },
  rejection: {
    name: "Enrollment Rejected",
    subject: "Application Status Update - {{academyName}}",
    body: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
  <tr>
    <td style="background-color:#dc262615;color:#dc2626;font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;font-family:Arial,sans-serif;">APPLICATION UPDATE</td>
  </tr>
</table>
<h2 style="color:#07220B;font-size:22px;margin:0 0 4px;">Application Update</h2>
<p style="margin:0 0 16px;color:#444;">Dear {{name}},</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#fef2f2;border-radius:12px;padding:20px;margin:0 0 20px;border-left:4px solid #dc2626;">
  <tr>
    <td>
      <p style="font-family:Arial,sans-serif;font-size:14px;font-weight:600;color:#991b1b;margin:0 0 4px;">Not Approved This Time</p>
      <p style="font-family:Arial,sans-serif;font-size:14px;color:#991b1b;margin:0;">{{message}}</p>
    </td>
  </tr>
</table>
<p style="color:#444;">After careful review, we regret to inform you that your enrollment application has been <strong style="color:#dc2626;">rejected</strong>.</p>
<p style="color:#444;">You may reapply in the future if your circumstances change. If you have any questions, please contact our admissions team.</p>
<hr style="border:none;border-top:1px solid #eef0f5;margin:20px 0;" />
<p style="font-size:14px;color:#444;margin:0;">Best regards,<br/><strong style="color:#07220B;">Admissions Team</strong><br/>{{academyName}}</p>`,
  },
  password_reset: {
    name: "Password Reset",
    subject: "Reset Your {{academyName}} Password",
    body: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
  <tr>
    <td style="background-color:#d9770615;color:#d97706;font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;font-family:Arial,sans-serif;">SECURITY ALERT</td>
  </tr>
</table>
<h2 style="color:#07220B;font-size:22px;margin:0 0 4px;">Reset Your Password</h2>
<p style="margin:0 0 16px;color:#444;">Hi <strong>{{name}}</strong>, we received a request to reset your <strong>{{academyName}}</strong> account password.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#07220B15;border-radius:12px;padding:24px;margin:0 0 20px;">
  <tr>
    <td align="center">
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#888;margin:0 0 12px;">Your Password Reset Code</p>
      <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#07220B;font-family:'Courier New',monospace;background:#ffffff;padding:12px 24px;border-radius:8px;display:inline-block;">{{verificationCode}}</div>
      <p style="font-family:Arial,sans-serif;font-size:12px;color:#888;margin:12px 0 0;">This code expires in 15 minutes</p>
    </td>
  </tr>
</table>
<p style="color:#444;font-size:14px;">If you did not request a password reset, please ignore this email or contact support immediately.</p>
<hr style="border:none;border-top:1px solid #eef0f5;margin:20px 0;" />
<p style="font-size:13px;color:#888;margin:0;">For security, this link can only be used once. If you need to reset your password again, please request a new code.</p>`,
  },
};

const sampleTemplates: Partial<Template>[] = [
  { name: "Welcome to Special Academy", type: "email", subject: "Welcome to Special Academy, {{name}}!", body: "<h2>Dear {{name}},</h2><p>Welcome to Special Academy! We are excited to have you on board.</p><p>Your journey to excellence starts here.</p><p>Best regards,<br/><strong>{{academyName}}</strong></p>", variables: ["name", "academyName"], category: "custom" },
  { name: "Enrollment Confirmation", type: "email", subject: "Enrollment Confirmed - {{name}}", body: "<h2>Enrollment Confirmed</h2><p>Dear {{name}},</p><p>Your enrollment at {{academyName}} has been confirmed.</p><p>We look forward to seeing you.</p>", variables: ["name", "academyName"], category: "custom" },
  { name: "Notice Broadcast", type: "email", subject: "Important Notice from {{academyName}}", body: "<h2>Important Notice</h2><p>Dear {{name}},</p><p>Please find below an important notice from {{academyName}}:</p><hr/><p>{{message}}</p>", variables: ["name", "academyName", "message"], category: "custom" },
];

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("compose");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);
  const [templateFilter, setTemplateFilter] = useState<string>("");

  const [type, setType] = useState<"email">("email");
  const [recipientType, setRecipientType] = useState("all");
  const [classFilter, setClassFilter] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", type: "email" as "email", subject: "", body: "", category: "custom", config: { ...DEFAULT_CONFIG } });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showSamplePicker, setShowSamplePicker] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null);
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
    if (!subject.trim()) { toast.error("Subject is required"); return; }
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
    if (!templateForm.name.trim()) {
      toast.error("Template name is required"); return;
    }
    setSavingTemplate(true);
    const body = templateForm.config
      ? generateEmailHtml(templateForm.config as TemplateConfig, MOCK_ACADEMY)
      : templateForm.body;
    try {
      const url = editingTemplate
        ? `/api/communications/templates/${editingTemplate.id}`
        : "/api/communications/templates";
      const method = editingTemplate ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...templateForm, body }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error("Save template error:", res.status, errBody);
        throw new Error(errBody);
      }
      const saved = await res.json();
      if (editingTemplate) {
        setTemplates((p) => p.map((t) => (t.id === editingTemplate.id ? saved : t)));
      } else {
        setTemplates((p) => [saved, ...p]);
      }
      toast.success(editingTemplate ? "Template updated" : "Template created");
      setEditingTemplate(null);
      setTemplateForm({ name: "", type: "email", subject: "", body: "", category: "custom", config: { ...DEFAULT_CONFIG } });
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function confirmDeleteTemplate() {
    if (!deletingTemplate) return;
    try {
      const res = await fetch(`/api/communications/templates/${deletingTemplate}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTemplates((p) => p.filter((t) => t.id !== deletingTemplate));
      setDeletingTemplate(null);
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
      setDeletingTemplate(null);
    }
  }

  function applyTemplate(t: Template) {
    setSelectedTemplate(t.id);
    setType(t.type);
    if (t.subject) setSubject(t.subject);
    setBody(t.body);
    setShowSamplePicker(false);
  }

  const MOCK_ACADEMY = { name: "Special Academy", logo: "/icon-image.png", website: "https://specialacademy.com.np", email: "info@specialacademy.com.np", phone: "986-0302036" };

  function fillStarter(category: string) {
    const starter = STARTER_TEMPLATES[category];
    const starterConfig = STARTER_CONFIGS[category];
    if (!starter) return;
    const config = { ...DEFAULT_CONFIG, ...(starterConfig || {}) };
    const body = generateEmailHtml(config, MOCK_ACADEMY);
    setTemplateForm((p) => ({
      ...p,
      name: starter.name,
      subject: starter.subject,
      body,
      category,
      config,
    }));
  }

  function handleCategoryChange(category: string) {
    const starter = STARTER_TEMPLATES[category];
    const starterConfig = STARTER_CONFIGS[category];
    if (starter && starterConfig) {
      const config = { ...DEFAULT_CONFIG, ...starterConfig };
      const body = generateEmailHtml(config, MOCK_ACADEMY);
      setTemplateForm((p) => ({
        ...p,
        name: starter.name,
        subject: starter.subject,
        body,
        category,
        config,
      }));
    } else {
      setTemplateForm((p) => ({ ...p, category }));
    }
  }

  function loadSampleTemplate(sample: Partial<Template>) {
    setType("email");
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

  const sampleData: Record<string, string> = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 890",
    academyName: "Special Academy",
    website: "https://specialacademy.com.np",
    message: "Your attention is required.",
    verificationCode: "482916",
  };

  function renderPreviewBody() {
    let rendered = body;
    for (const [key, val] of Object.entries(sampleData)) {
      rendered = rendered.replace(new RegExp(`\\\{\\\{${key}\\\}\\\}`, "g"), val);
    }
    return rendered;
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
          {activeTab === "compose" && "Send bulk emails to students and parents."}
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
              {/* How-to-Use Guide */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors w-full"
                >
                  <Info className="w-4 h-4" />
                  How to use templates
                  <ChevronDown className={cn("w-3.5 h-3.5 ml-auto transition-transform", showGuide && "rotate-180")} />
                </button>
                {showGuide && (
                  <div className="mt-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-sm space-y-3">
                    <div>
                      <p className="font-medium text-primary mb-1">Using Variables</p>
                      <p className="text-muted text-xs leading-relaxed">
                        Click any variable chip (e.g. <code className="text-secondary bg-blue-100 px-1 rounded text-[11px]">{'{{name}}'}</code>) to insert it into your message. Variables are replaced with real student data when sent.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-primary mb-1">Templates</p>
                      <p className="text-muted text-xs leading-relaxed">
                        Save reusable messages in the <strong>Templates</strong> tab. Use the <strong>Templates</strong> button above to load a saved template, or pick a quick template to jump-start your message.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-primary mb-1">Preview</p>
                      <p className="text-muted text-xs leading-relaxed">
                        Toggle <strong>Preview</strong> to see how your message will look. For emails, HTML is rendered. Variable placeholders are shown as-is in preview.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-primary mb-1">Recipients</p>
                      <p className="text-muted text-xs leading-relaxed">
                        Send to <strong>All Students &amp; Parents</strong>, filter by <strong>Qualification</strong>, or target <strong>Specific Students</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Type */}
              <div className="hidden">
                <input type="hidden" value={type} />
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
                  <div>
                    <div className="min-h-[200px] rounded-lg border border-primary/10 p-4 bg-white prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: renderPreviewBody() }} />
                    </div>
                    <p className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Preview uses sample data. Variables are replaced with mock values for illustration.
                    </p>
                  </div>
                ) : (
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your email HTML or plain text here..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-primary/5">
                <Button size="lg" onClick={handleSend} disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {sending ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-5 gap-6">
          {/* Visual Editor */}
          <Card className="lg:col-span-2 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {editingTemplate ? <Pencil className="w-4 h-4 text-secondary" /> : <Plus className="w-4 h-4 text-secondary" />}
                {editingTemplate ? "Edit Template" : "New Template"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-primary/5">
              {/* ⚙️ Basic Info */}
              <details open className="py-4 group">
                <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs">⚙️</span>
                  Basic Info
                  <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Template Name</label>
                    <Input value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Welcome Email" />
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
                    <p className="text-[11px] text-muted mt-1.5">Pick a type and we'll auto-fill a template. Customize any section below.</p>
                  </div>
                </div>
              </details>

              {/* 🎨 Header Design */}
              <details className="py-4 group">
                <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs">🎨</span>
                  Header Design
                  <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Header Background Color</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={(templateForm.config as TemplateConfig).headerColor}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, headerColor: e.target.value } }))}
                        className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5"
                      />
                      <Input
                        value={(templateForm.config as TemplateConfig).headerColor}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, headerColor: e.target.value } }))}
                        className="font-mono flex-1"
                        placeholder="#07220B"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Tagline</label>
                    <Input
                      value={(templateForm.config as TemplateConfig).tagline}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, tagline: e.target.value } }))}
                      placeholder="Preparing Future Leaders..."
                    />
                  </div>
                  <label className="flex items-center gap-2.5 text-sm text-primary">
                    <input
                      type="checkbox"
                      checked={(templateForm.config as TemplateConfig).showLogo}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, showLogo: e.target.checked } }))}
                      className="rounded border-primary/20 text-primary focus:ring-primary"
                    />
                    Show academy logo in header
                  </label>
                </div>
              </details>

              {/* 📝 Content */}
              <details className="py-4 group">
                <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs">📝</span>
                  Content
                  <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180" />
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
                    <Input value={templateForm.subject} onChange={(e) => setTemplateForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Email subject" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Badge Text</label>
                      <Input value={(templateForm.config as TemplateConfig).badgeText} onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, badgeText: e.target.value } }))} placeholder="e.g. ACTION REQUIRED" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 block">Badge Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={(templateForm.config as TemplateConfig).badgeColor}
                          onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, badgeColor: e.target.value } }))}
                          className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5 shrink-0" />
                        <Input value={(templateForm.config as TemplateConfig).badgeColor}
                          onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, badgeColor: e.target.value } }))}
                          className="font-mono" placeholder="#d97706" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Main Heading</label>
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {defaultVars.map((v) => (
                        <button key={v} type="button" onClick={() => setTemplateForm((p) => ({ ...p, config: { ...p.config, heading: (p.config as TemplateConfig).heading + `{{${v}}}` } }))}
                          className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                          {'{{' + v + '}}'}
                        </button>
                      ))}
                    </div>
                    <Textarea value={(templateForm.config as TemplateConfig).heading}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, heading: e.target.value } }))}
                      placeholder="Welcome, {{name}}!" rows={2} className="text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Message Body</label>
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {defaultVars.map((v) => (
                        <button key={v} type="button" onClick={() => setTemplateForm((p) => ({ ...p, config: { ...p.config, message: (p.config as TemplateConfig).message + `{{${v}}}` } }))}
                          className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                          {'{{' + v + '}}'}
                        </button>
                      ))}
                    </div>
                    <Textarea value={(templateForm.config as TemplateConfig).message}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, message: e.target.value } }))}
                      placeholder="Write your message here... Use {{name}}, {{academyName}} etc. as placeholders." rows={5} className="text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Text Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={(templateForm.config as TemplateConfig).messageColor}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, messageColor: e.target.value } }))}
                        className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5 shrink-0" />
                      <Input value={(templateForm.config as TemplateConfig).messageColor}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, messageColor: e.target.value } }))}
                        className="font-mono flex-1" placeholder="#444444" />
                    </div>
                  </div>
                </div>
              </details>

              {/* 🔘 Button */}
              <details className="py-4 group">
                <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs">🔘</span>
                  Call-to-Action Button
                  <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-4">
                  <label className="flex items-center gap-2.5 text-sm text-primary">
                    <input type="checkbox" checked={(templateForm.config as TemplateConfig).showButton}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, showButton: e.target.checked } }))}
                      className="rounded border-primary/20 text-primary focus:ring-primary" />
                    Show a call-to-action button
                  </label>
                  {(templateForm.config as TemplateConfig).showButton && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/10">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-primary mb-1.5 block">Button Text</label>
                          <Input value={(templateForm.config as TemplateConfig).buttonText}
                            onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, buttonText: e.target.value } }))}
                            placeholder="Get Started" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-primary mb-1.5 block">Button URL</label>
                          <Input value={(templateForm.config as TemplateConfig).buttonUrl}
                            onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, buttonUrl: e.target.value } }))}
                            placeholder="{{website}}/login" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-primary mb-1.5 block">Button Color</label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={(templateForm.config as TemplateConfig).buttonColor}
                            onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, buttonColor: e.target.value } }))}
                            className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5 shrink-0" />
                          <Input value={(templateForm.config as TemplateConfig).buttonColor}
                            onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, buttonColor: e.target.value } }))}
                            className="font-mono flex-1" placeholder="#07220B" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </details>

              {/* 📋 Footer */}
              <details className="py-4 group">
                <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs">📋</span>
                  Footer
                  <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Footer Background Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={(templateForm.config as TemplateConfig).footerColor}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, footerColor: e.target.value } }))}
                        className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5 shrink-0" />
                      <Input value={(templateForm.config as TemplateConfig).footerColor}
                        onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, footerColor: e.target.value } }))}
                        className="font-mono flex-1" placeholder="#f8f9fc" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 text-sm text-primary">
                    <input type="checkbox" checked={(templateForm.config as TemplateConfig).showContact}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, showContact: e.target.checked } }))}
                      className="rounded border-primary/20 text-primary focus:ring-primary" />
                    Show contact info (email & phone)
                  </label>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Custom Footer Text</label>
                    <Textarea value={(templateForm.config as TemplateConfig).footerText}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, config: { ...p.config, footerText: e.target.value } }))}
                      placeholder="Additional footer text (optional)" rows={2} className="text-sm" />
                  </div>
                </div>
              </details>

              {/* 👁️ Preview */}
              <details open className="py-4 group">
                <summary className="text-sm font-semibold text-primary cursor-pointer list-none flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center text-xs">👁️</span>
                  Preview
                  <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4">
                  <div className="min-h-[300px] rounded-lg border border-primary/10 bg-white overflow-auto">
                    <div className="p-3 bg-[#f4f6f9] border-b border-primary/5 text-[11px] text-muted flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      To: {`{{name}} <{{email}}>`}
                    </div>
                    <div className="p-3 bg-white border-b border-primary/5 text-xs text-muted">
                      <strong>Subject:</strong> {templateForm.subject || "(no subject)"}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: generateEmailHtml(templateForm.config as TemplateConfig, MOCK_ACADEMY) }} />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Preview uses sample data. Variables like <code className="text-[10px] bg-primary/5 px-1 rounded">{'{{name}}'}</code> are shown as-is in preview.
                  </p>
                </div>
              </details>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveTemplate} disabled={savingTemplate} className="flex-1">
                  {savingTemplate ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
                  {editingTemplate ? "Update Template" : "Save Template"}
                </Button>
                {editingTemplate && (
                  <Button variant="outline" onClick={() => { setEditingTemplate(null); setTemplateForm({ name: "", type: "email", subject: "", body: "", category: "custom", config: { ...DEFAULT_CONFIG } }); }}>
                    Cancel
                  </Button>
                )}
                {templateForm.category !== "custom" && (
                  <Button variant="outline" onClick={() => fillStarter(templateForm.category)} title="Reset to default">
                    <Archive className="w-4 h-4" />
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
                <CardContent className="py-12 text-center">
                  <Archive className="w-8 h-8 text-muted mx-auto mb-3" />
                  <p className="text-sm text-muted">No templates yet. Create your first one.</p>
                </CardContent>
              </Card>
            ) : (
              templates
                .filter((t) => !templateFilter || t.type === templateFilter)
                .map((t) => {
                  const cat = CATEGORIES.find((c) => c.value === t.category);
                  const catColor = t.category === "custom" ? "bg-slate-100 text-slate-600" :
                    t.category === "enrollment" ? "bg-blue-100 text-blue-700" :
                    t.category === "approval" ? "bg-emerald-100 text-emerald-700" :
                    t.category === "rejection" ? "bg-red-100 text-red-700" :
                    t.category === "password_reset" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
                  return (
                    <Card key={t.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-primary text-sm truncate">{t.name}</h3>
                              <Badge variant="outline" className="text-[10px] shrink-0">{t.type}</Badge>
                              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0", catColor)}>
                                {cat?.label || t.category}
                              </span>
                            </div>
                            {t.subject && <p className="text-xs text-muted truncate mb-1">Subject: {t.subject}</p>}
                            <p className="text-xs text-muted line-clamp-2 font-mono">{t.body}</p>
                            <p className="text-[11px] text-muted mt-1.5">Updated {formatShortDate(t.updated_at)}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
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

      <DeleteModal
        open={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        title="Delete Template"
        message="Delete this template?"
        onConfirm={confirmDeleteTemplate}
      />
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
