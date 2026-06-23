"use client";

export const dynamic = "force-dynamic";

import { useAppContext } from "@/lib/app-context";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  const { settings } = useAppContext();
  const data = settings.config?.privacyPolicy;

  if (!data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <main>
      <section className="bg-primary py-20 md:py-28 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{data.title}</h1>
            <p className="text-lg text-white/70 leading-relaxed">{data.description}</p>
            <p className="text-sm text-white/40 mt-4">Last updated: {data.lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {data.sections.map((section, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 md:p-10 border border-primary/5 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-primary mb-4">{section.title}</h2>
                    <div className="space-y-3">
                      {section.content.map((paragraph, pi) => (
                        <p key={pi} className="text-muted leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted">
            This Privacy Policy may be updated periodically. We encourage you to review this page
            regularly for any changes. Continued use of our services after changes constitutes
            acceptance of the updated policy.
          </p>
        </div>
      </section>
    </main>
  );
}
