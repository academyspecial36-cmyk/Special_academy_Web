"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Send, Archive, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateEmailHtml, DEFAULT_CONFIG, type TemplateConfig } from "@/lib/email-template-builder";
import { DeleteModal } from "@/components/ui/delete-modal";

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

const MOCK_ACADEMY = { name: "Special Academy", logo: "/icon-image.png", website: "https://specialacademy.com.np", email: "info@specialacademy.com.np", phone: "986-0302036" };

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "compose", label: "Compose", icon: <Send className="w-4 h-4" /> },
  { key: "templates", label: "Templates", icon: <Archive className="w-4 h-4" /> },
  { key: "history", label: "History", icon: <Clock className="w-4 h-4" /> },
];

const ComposeTab = dynamic(() => import("./compose-tab"), { ssr: false });
const TemplatesTab = dynamic(() => import("./templates-tab"), { ssr: false });
const HistoryTab = dynamic(() => import("./history-tab"), { ssr: false });

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

  const handleSend = useCallback(async () => {
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
  }, [body, subject, type, selectedTemplate, recipientType, classFilter, setSending, setBody, setSubject, setHistory]);

  const handleSaveTemplate = useCallback(async () => {
    if (!templateForm.name.trim()) {
      toast.error("Template name is required"); return;
    }
    setSavingTemplate(true);
    const body = templateForm.config
      ? generateEmailHtml(templateForm.config, MOCK_ACADEMY)
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
  }, [templateForm, editingTemplate, setSavingTemplate, setTemplates, setEditingTemplate, setTemplateForm]);

  const confirmDeleteTemplate = useCallback(async () => {
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
  }, [deletingTemplate, setTemplates, setDeletingTemplate]);

  const applyTemplate = useCallback((t: Template) => {
    setSelectedTemplate(t.id);
    setType(t.type);
    if (t.subject) setSubject(t.subject);
    setBody(t.body);
    setShowSamplePicker(false);
  }, [setSelectedTemplate, setType, setSubject, setBody, setShowSamplePicker]);

  const fillStarter = useCallback((category: string) => {
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
  }, [setTemplateForm]);

  const handleCategoryChange = useCallback((category: string) => {
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
  }, [setTemplateForm]);

  const loadSampleTemplate = useCallback((sample: Partial<Template>) => {
    setType("email");
    if (sample.subject) setSubject(sample.subject);
    setBody(sample.body ?? "");
    setSelectedTemplate("");
    setShowSamplePicker(false);
  }, [setType, setSubject, setBody, setSelectedTemplate, setShowSamplePicker]);

  const loadHistoryDetails = useCallback(async (id: string) => {
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
  }, [setLoadingDetails, setSelectedComm]);

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

      {activeTab === "compose" && (
        <ComposeTab
          type={type}
          recipientType={recipientType}
          setRecipientType={setRecipientType}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          classes={classes}
          subject={subject}
          setSubject={setSubject}
          body={body}
          setBody={setBody}
          sending={sending}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          showGuide={showGuide}
          setShowGuide={setShowGuide}
          showSamplePicker={showSamplePicker}
          setShowSamplePicker={setShowSamplePicker}
          templates={templates}
          handleSend={handleSend}
          applyTemplate={applyTemplate}
          loadSampleTemplate={loadSampleTemplate}
        />
      )}

      {activeTab === "templates" && (
        <TemplatesTab
          templates={templates}
          loading={loading}
          editingTemplate={editingTemplate}
          setEditingTemplate={setEditingTemplate}
          templateForm={templateForm}
          setTemplateForm={setTemplateForm}
          savingTemplate={savingTemplate}
          deletingTemplate={deletingTemplate}
          setDeletingTemplate={setDeletingTemplate}
          templateFilter={templateFilter}
          setTemplateFilter={setTemplateFilter}
          handleSaveTemplate={handleSaveTemplate}
          confirmDeleteTemplate={confirmDeleteTemplate}
          applyTemplate={applyTemplate}
          fillStarter={fillStarter}
          handleCategoryChange={handleCategoryChange}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab
          history={history}
          loading={loading}
          selectedComm={selectedComm}
          setSelectedComm={setSelectedComm}
          loadingDetails={loadingDetails}
          loadHistoryDetails={loadHistoryDetails}
        />
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
