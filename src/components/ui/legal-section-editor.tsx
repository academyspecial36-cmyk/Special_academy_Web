import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LegalSection {
  title: string;
  content: string[];
}

interface LegalSectionEditorProps {
  sections: LegalSection[];
  onChange: (sections: LegalSection[]) => void;
}

export function LegalSectionEditor({ sections, onChange }: LegalSectionEditorProps) {
  return (
    <div className="space-y-4">
      {sections.map((section, si) => (
        <div key={si} className="border border-primary/10 rounded-lg p-4 space-y-3 relative">
          <div className="flex items-start justify-between gap-2">
            <Input
              value={section.title}
              onChange={(e) => {
                const s = [...sections];
                s[si] = { ...s[si], title: e.target.value };
                onChange(s);
              }}
              placeholder="Section title"
              className="flex-1"
            />
            <button onClick={() => onChange(sections.filter((_, i) => i !== si))} className="p-1 text-muted hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {section.content.map((para, pi) => (
            <div key={pi} className="flex items-start gap-2">
              <Textarea
                value={para}
                onChange={(e) => {
                  const s = [...sections];
                  s[si] = { ...s[si], content: s[si].content.map((c, i) => i === pi ? e.target.value : c) };
                  onChange(s);
                }}
                placeholder={`Paragraph ${pi + 1}`}
                className="flex-1 min-h-[60px]"
              />
              {section.content.length > 1 && (
                <button
                  onClick={() => {
                    const s = [...sections];
                    s[si] = { ...s[si], content: s[si].content.filter((_, i) => i !== pi) };
                    onChange(s);
                  }}
                  className="p-1 text-muted hover:text-red-500 transition-colors shrink-0 mt-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const s = [...sections];
              s[si] = { ...s[si], content: [...s[si].content, ""] };
              onChange(s);
            }}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Paragraph
          </Button>
        </div>
      ))}
    </div>
  );
}
