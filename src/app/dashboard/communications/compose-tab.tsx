"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Send, Eye, EyeOff, Copy, Info, ChevronDown, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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

interface ComposeTabProps {
  type: "email";
  recipientType: string;
  setRecipientType: (v: string) => void;
  classFilter: string;
  setClassFilter: (v: string) => void;
  classes: string[];
  subject: string;
  setSubject: React.Dispatch<React.SetStateAction<string>>;
  body: string;
  setBody: React.Dispatch<React.SetStateAction<string>>;
  sending: boolean;
  showPreview: boolean;
  setShowPreview: (v: boolean) => void;
  showGuide: boolean;
  setShowGuide: (v: boolean) => void;
  showSamplePicker: boolean;
  setShowSamplePicker: (v: boolean) => void;
  templates: Template[];
  handleSend: () => void;
  applyTemplate: (t: Template) => void;
  loadSampleTemplate: (sample: Partial<Template>) => void;
}

const defaultVars = ["name", "email", "phone", "academyName", "website", "verificationCode", "message"];

const sampleTemplates: Partial<Template>[] = [
  { name: "Welcome to Special Academy", type: "email", subject: "Welcome to Special Academy, {{name}}!", body: "<h2>Dear {{name}},</h2><p>Welcome to Special Academy! We are excited to have you on board.</p><p>Your journey to excellence starts here.</p><p>Best regards,<br/><strong>{{academyName}}</strong></p>", variables: ["name", "academyName"], category: "custom" },
  { name: "Enrollment Confirmation", type: "email", subject: "Enrollment Confirmed - {{name}}", body: "<h2>Enrollment Confirmed</h2><p>Dear {{name}},</p><p>Your enrollment at {{academyName}} has been confirmed.</p><p>We look forward to seeing you.</p>", variables: ["name", "academyName"], category: "custom" },
  { name: "Notice Broadcast", type: "email", subject: "Important Notice from {{academyName}}", body: "<h2>Important Notice</h2><p>Dear {{name}},</p><p>Please find below an important notice from {{academyName}}:</p><hr/><p>{{message}}</p>", variables: ["name", "academyName", "message"], category: "custom" },
];

const sampleData: Record<string, string> = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 234 567 890",
  academyName: "Special Academy",
  website: "https://specialacademy.com.np",
  message: "Your attention is required.",
  verificationCode: "482916",
};

export default function ComposeTab({
  type,
  recipientType,
  setRecipientType,
  classFilter,
  setClassFilter,
  classes,
  subject,
  setSubject,
  body,
  setBody,
  sending,
  showPreview,
  setShowPreview,
  showGuide,
  setShowGuide,
  showSamplePicker,
  setShowSamplePicker,
  templates,
  handleSend,
  applyTemplate,
  loadSampleTemplate,
}: ComposeTabProps) {
  const filteredTemplates = useMemo(
    () => templates.filter((t) => t.type === type),
    [templates, type]
  );

  const previewBody = useMemo(() => {
    let rendered = body;
    for (const [key, val] of Object.entries(sampleData)) {
      rendered = rendered.replace(new RegExp(`\\\{\\\{${key}\\\}\\\}`, "g"), val);
    }
    return rendered;
  }, [body]);

  const variableChips = useMemo(() => (
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
  ), [setBody]);

  return (
    <motion.div key="compose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Send className="w-4 h-4 text-secondary" /> New Broadcast</CardTitle></CardHeader>
        <CardContent className="space-y-5">
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
          <div className="hidden">
            <input type="hidden" value={type} />
          </div>
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
                  {filteredTemplates.length === 0 && (
                    <p className="text-xs text-muted">No templates for {type}. Create some in the Templates tab.</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {filteredTemplates.map((t) => (
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
            {variableChips}
            {showPreview ? (
              <div>
                <div className="min-h-[200px] rounded-lg border border-primary/10 p-4 bg-white prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewBody) }} />
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
  );
}
