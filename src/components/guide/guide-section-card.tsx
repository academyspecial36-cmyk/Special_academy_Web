import { ArrowRight } from "lucide-react";
import type { GuideSection } from "@/app/dashboard/guide/guide-data";

interface GuideSectionCardProps {
  section: GuideSection;
}

export function GuideSectionCard({ section }: GuideSectionCardProps) {
  return (
    <div id={section.id} className="bg-white rounded-xl border border-primary/5 p-6 scroll-mt-20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
          <section.icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-primary">{section.title}</h2>
      </div>

      {section.steps ? (
        <div className="space-y-4">
          {section.steps.map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-primary text-sm mb-0.5">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {section.items ? (
        <ul className="space-y-2 mt-4">
          {section.items.map((item, i) => (
            <li key={i} className={`flex items-start gap-2.5 text-sm leading-relaxed ${item === "" ? "h-2" : "text-muted"}`}>
              {item ? <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> : null}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {section.tips ? (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">Tips</p>
          <ul className="space-y-1">
            {section.tips.map((tip, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                <span>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {section.warns ? (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-800 mb-1">Warnings</p>
          <ul className="space-y-1">
            {section.warns.map((warn, i) => (
              <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                <span>⚠️</span>
                <span>{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
