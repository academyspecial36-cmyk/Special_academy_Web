"use client";

import { useState, useEffect, useRef } from "react";
import { sections } from "./guide-data";
import { GuideSectionCard } from "@/components/guide/guide-section-card";

export default function AdminGuidePage() {
  const [activeSection, setActiveSection] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    observerRef.current = observer;

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const settingsSections = sections.filter((s) => s.id.startsWith("settings-"));
  const otherSections = sections.filter((s) => !s.id.startsWith("settings-") && s.id !== "tips");
  const tipsSection = sections.find((s) => s.id === "tips");

  return (
    <div className="relative flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Admin Guide</h1>
          <p className="text-muted text-sm">
            Complete walkthrough of every feature, setting, and management tool in the admin dashboard.
          </p>
        </div>

        <div className="space-y-6">
          {otherSections.map((section) => (
            <GuideSectionCard key={section.id} section={section} />
          ))}

          {settingsSections.length > 0 && (
            <div className="bg-white rounded-xl border border-primary/5 p-6">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-bold text-primary">Settings</h2>
              </div>
              <div className="space-y-6">
                {settingsSections.map((section) => (
                  <GuideSectionCard key={section.id} section={section} />
                ))}
              </div>
            </div>
          )}

          {tipsSection && <GuideSectionCard section={tipsSection} />}
        </div>
      </div>

      {/* Right sidebar TOC */}
      <div className={`hidden lg:block transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}>
        <div className="sticky top-6 w-64">
          <div className="bg-white rounded-xl border border-primary/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-primary">On this page</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-xs text-muted hover:text-primary"
              >
                Hide
              </button>
            </div>
            <nav className="space-y-0.5 max-h-[calc(100vh-180px)] overflow-y-auto">
              {otherSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`block w-full text-left text-xs py-1 px-2 rounded transition-colors ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {s.title.length > 28 ? s.title.slice(0, 28) + "…" : s.title}
                </button>
              ))}
              {settingsSections.length > 0 && (
                <>
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="block w-full text-left text-xs py-1 px-2 rounded font-medium text-primary mt-2"
                  >
                    {settingsOpen ? "▼" : "▶"} Settings ({settingsSections.length} tabs)
                  </button>
                  {settingsOpen && settingsSections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`block w-full text-left text-xs py-1 px-2 pl-5 rounded transition-colors ${
                        activeSection === s.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      {s.title.replace("Settings — Tab", "Tab")}
                    </button>
                  ))}
                </>
              )}
              {tipsSection && (
                <button
                  onClick={() => scrollTo("tips")}
                  className={`block w-full text-left text-xs py-1 px-2 rounded transition-colors mt-2 ${
                    activeSection === "tips"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  General Tips
                </button>
              )}
            </nav>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="mt-2 text-xs text-muted hover:text-primary w-full text-center"
          >
            Show sidebar
          </button>
        </div>
      </div>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden lg:flex fixed right-4 top-24 z-10 w-8 h-8 rounded-full bg-white border border-primary/10 shadow-sm items-center justify-center text-xs text-muted hover:text-primary"
        >
          ☰
        </button>
      )}
    </div>
  );
}
