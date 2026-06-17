"use client";

import { useMemo } from "react";
import {
  Navigation, Bell, BookPlus, ClipboardPlus, HelpCircle, FileText,
  Users, BookOpen, ScrollText, UserCheck, Search,
  Edit, Trash2, CheckCircle, XCircle, SendHorizonal, Pin,
  Shield, ShieldOff, Database, Zap,
} from "lucide-react";
import type { PageContext } from "@/types/ai";

interface ContextPanelProps {
  pathname: string;
  context: PageContext;
  onCommand?: (prompt: string) => void;
}

interface QuickAction {
  label: string;
  prompt: string;
  icon: React.ElementType;
}

const ACTION_SECTIONS: { title: string; icon: React.ElementType; actions: QuickAction[] }[] = [
  {
    title: "Create",
    icon: Zap,
    actions: [
      { label: "Notice", prompt: "Create a new notice", icon: Bell },
      { label: "Course", prompt: "Create a new course", icon: BookPlus },
      { label: "Exam", prompt: "Create a new exam with questions", icon: ClipboardPlus },
      { label: "FAQ", prompt: "Create a new FAQ entry", icon: HelpCircle },
      { label: "Blog Draft", prompt: "Create a new blog post draft", icon: FileText },
    ],
  },
  {
    title: "View",
    icon: Search,
    actions: [
      { label: "Students", prompt: "Show me the students list", icon: Users },
      { label: "Courses", prompt: "Show me all courses", icon: BookOpen },
      { label: "Notices", prompt: "Show me notices", icon: Bell },
      { label: "Enrollments", prompt: "Show pending enrollment applications", icon: UserCheck },
      { label: "FAQs", prompt: "Show FAQ entries", icon: HelpCircle },
      { label: "Blogs", prompt: "Show blog posts", icon: ScrollText },
    ],
  },
  {
    title: "Modify",
    icon: Edit,
    actions: [
      { label: "Update Notice", prompt: "Update a notice", icon: Edit },
      { label: "Update Course", prompt: "Update a course", icon: Edit },
      { label: "Update Exam", prompt: "Update an exam", icon: Edit },
      { label: "Update FAQ", prompt: "Update an FAQ", icon: Edit },
      { label: "Delete Notice", prompt: "Delete a notice", icon: Trash2 },
      { label: "Delete Course", prompt: "Delete a course", icon: Trash2 },
      { label: "Delete Exam", prompt: "Delete an exam", icon: Trash2 },
      { label: "Delete FAQ", prompt: "Delete an FAQ", icon: Trash2 },
    ],
  },
  {
    title: "Manage",
    icon: CheckCircle,
    actions: [
      { label: "Approve Enrollment", prompt: "Approve a pending enrollment", icon: CheckCircle },
      { label: "Reject Enrollment", prompt: "Reject a pending enrollment", icon: XCircle },
      { label: "Publish Blog", prompt: "Publish a blog post", icon: SendHorizonal },
      { label: "Pin Notice", prompt: "Pin or unpin a notice", icon: Pin },
    ],
  },
  {
    title: "System",
    icon: Shield,
    actions: [
      { label: "Enable Maintenance", prompt: "Enable maintenance mode", icon: Shield },
      { label: "Disable Maintenance", prompt: "Disable maintenance mode", icon: ShieldOff },
      { label: "Backup System", prompt: "Create a system backup", icon: Database },
    ],
  },
];

export function ContextPanel({ pathname, context, onCommand }: ContextPanelProps) {
  const currentPageActions = useMemo(() => {
    if (pathname.includes("students")) return ["Show inactive students", "Generate student report"];
    if (pathname.includes("courses")) return ["Create a new course", "Generate MCQs for exam"];
    if (pathname.includes("enrollments")) return ["Approve pending enrollments", "Export enrollment list"];
    if (pathname.includes("notices")) return ["Create a holiday notice", "Publish pending notices"];
    if (pathname.includes("blog") || pathname.includes("blogs")) return ["Publish blog post", "Draft new article"];
    return [];
  }, [pathname]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {/* Current Page Card */}
        <div className="rounded-xl border border-primary/10 bg-primary/[0.02] p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5" />
            Current Page
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted text-xs w-10 shrink-0">Route</span>
            <span className="text-foreground text-xs truncate">{pathname}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted text-xs w-10 shrink-0">Page</span>
            <span className="text-foreground text-xs truncate">{context.pageName}</span>
          </div>
          {currentPageActions.length > 0 && (
            <div className="pt-1.5 space-y-1">
              {currentPageActions.map((action) => (
                <button
                  key={action}
                  onClick={() => onCommand?.(action)}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/5 transition-colors"
                >
                  <Zap className="w-3 h-3 shrink-0" />
                  <span className="truncate">{action}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Sections */}
        {ACTION_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
              <section.icon className="w-3 h-3" />
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.prompt}
                    onClick={() => onCommand?.(action.prompt)}
                    className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
