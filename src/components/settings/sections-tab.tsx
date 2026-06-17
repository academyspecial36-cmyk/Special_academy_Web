"use client";

import { ToggleLeft, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

interface SectionsTabProps {
  sectionsForm: Record<string, boolean>;
  setSectionsForm: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  savingSettings: boolean;
  handleSave: () => Promise<void>;
}

const SECTIONS = [
  { key: "hero", label: "Hero", desc: "Main banner with badge, title, CTA" },
  { key: "about", label: "About", desc: "Academy introduction and values" },
  { key: "whyChoose", label: "Why Choose Us", desc: "Reasons to choose the academy" },
  { key: "cadetOverview", label: "Cadet Overview", desc: "Overview of cadet programs" },
  { key: "stats", label: "Stats", desc: "Enrollment, success rate counters" },
  { key: "courses", label: "Courses", desc: "Available courses listing" },
  { key: "freeResources", label: "Free Resources", desc: "Free study materials" },
  { key: "notices", label: "Notices", desc: "Latest announcements" },
  { key: "testimonials", label: "Testimonials", desc: "Student/parent reviews" },
  { key: "faculty", label: "Faculty", desc: "Instructor profiles" },
  { key: "facilities", label: "Facilities", desc: "Academy facilities" },
  { key: "activities", label: "Activities", desc: "Extracurricular activities" },
  { key: "gallery", label: "Gallery", desc: "Photo gallery preview" },
  { key: "enrollmentCta", label: "Enrollment CTA", desc: "Call-to-action for enrollment" },
  { key: "faq", label: "FAQ", desc: "Frequently asked questions" },
  { key: "contact", label: "Contact", desc: "Contact form and info" },
  { key: "blog", label: "Blog", desc: "Latest blog posts" },
] as const;

export function SectionsTab({ sectionsForm, setSectionsForm, savingSettings, handleSave }: SectionsTabProps) {
  return (
    <div>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ToggleLeft className="w-4 h-4 text-secondary" /> Landing Page Sections</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SECTIONS.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-primary/5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{label}</p>
                  <p className="text-xs text-muted truncate">{desc}</p>
                </div>
                <ToggleSwitch
                  checked={sectionsForm[key] ?? true}
                  onChange={() => setSectionsForm((p) => ({ ...p, [key]: !(p[key] ?? true) }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end mt-6">
        <Button size="lg" onClick={handleSave} disabled={savingSettings}>
          {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {savingSettings ? "Saving..." : "Save Section Visibility"}
        </Button>
      </div>
    </div>
  );
}
