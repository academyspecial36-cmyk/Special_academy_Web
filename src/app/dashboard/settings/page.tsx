"use client";

import { useState, useEffect, type ComponentType } from "react";
import dynamicImport from "next/dynamic";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";
import { Building2, User, Layout, ToggleLeft, TrendingUp, FileText, Palette, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { apiList } from "@/lib/api-client";
import type { AppSettings } from "@/lib/app-context";

const ProfileTab = dynamicImport(() => import("@/components/settings/profile-tab").then(m => ({ default: m.ProfileTab })), { ssr: false }) as ComponentType<{ user: import("@/lib/auth-context").AuthUser | null }>;
const SiteTab = dynamicImport(() => import("@/components/settings/site-tab").then(m => ({ default: m.SiteTab })), { ssr: false }) as ComponentType<{ form: any; setForm: any; savingSettings: boolean; handleSave: () => Promise<void> }>;
const LandingTab = dynamicImport(() => import("@/components/settings/landing-tab").then(m => ({ default: m.LandingTab })), { ssr: false }) as ComponentType<{ landingForm: any; setLandingForm: any; savingSettings: boolean; handleSave: () => Promise<void> }>;
const SectionsTab = dynamicImport(() => import("@/components/settings/sections-tab").then(m => ({ default: m.SectionsTab })), { ssr: false }) as ComponentType<{ sectionsForm: any; setSectionsForm: any; savingSettings: boolean; handleSave: () => Promise<void> }>;
const FeaturesTab = dynamicImport(() => import("@/components/settings/features-tab").then(m => ({ default: m.FeaturesTab })), { ssr: false }) as ComponentType<any>;
const ContentTab = dynamicImport(() => import("@/components/settings/content-tab").then(m => ({ default: m.ContentTab })), { ssr: false }) as ComponentType<{ contentForm: any; setContentForm: any; savingSettings: boolean; handleSave: () => Promise<void> }>;
const ThemeTab = dynamicImport(() => import("@/components/settings/theme-tab").then(m => ({ default: m.ThemeTab })), { ssr: false }) as ComponentType<{ themeForm: any; setThemeForm: any; savingSettings: boolean; handleSave: () => Promise<void> }>;
const LegalTab = dynamicImport(() => import("@/components/settings/legal-tab").then(m => ({ default: m.LegalTab })), { ssr: false }) as ComponentType<{ legalForm: any; setLegalForm: any; savingSettings: boolean; handleSave: () => Promise<void> }>;
const BackupTab = dynamicImport(() => import("@/components/settings/backup-tab").then(m => ({ default: m.BackupTab })), { ssr: false }) as ComponentType<{ backupConfig: any; setBackupConfig: any; backupHistory: any; setBackupHistory: any; savingSettings: boolean; handleSave: () => Promise<void> }>;

type Tab = "profile" | "site" | "landing" | "sections" | "features" | "content" | "theme" | "legal" | "backup";

export default function SettingsPage() {
  const { settings, updateSettings } = useAppContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [form, setForm] = useState({ ...settings });
  const [savingSettings, setSavingSettings] = useState(false);

  const [landingForm, setLandingForm] = useState(() => ({
    hero: { title: "", subtitle: "", badge: "", image: "" } as { title: string; subtitle: string; badge: string; image: string },
    about: { title: "", description: "", image: "", values: [] as { title: string; description: string }[] },
    stats: [] as { label: string; value: string; suffix?: string; description?: string }[],
    cta: { title: "", subtitle: "", buttonText: "", buttonLink: "" },
    footer: { copyright: "", description: "" },
  }));
  const [seoForm, setSeoForm] = useState({ ...settings.seo });
  const [sectionsForm, setSectionsForm] = useState<Record<string, boolean>>({});
  const [pinnedPopupEnabled, setPinnedPopupEnabled] = useState(true);
  const [admissionBarEnabled, setAdmissionBarEnabled] = useState(true);
  const [contentForm, setContentForm] = useState(() => ({
    whyChoose: [] as { icon: string; title: string; description: string }[],
    cadetOverview: { title: "", description: "", heading: "", steps: [] as string[], images: [] as string[] },
    facilities: [] as { icon: string; title: string; description: string }[],
    activities: [] as { icon: string; title: string; time: string; description: string }[],
    enrollmentCta: { badge: "", heading: "", description: "", offerTitle: "", offerText: "", discount: "", buttonText: "", buttonLink: "" },
    heroCards: [] as { icon: string; value: string; label: string }[],
    trustIndicators: { studentsCount: "", rating: "" },
    sectionLabels: {} as Record<string, { label: string; title: string; description: string }>,
    buttonLabels: {} as Record<string, string>,
    loaderQuotes: [] as string[],
  }));
  const [themeForm, setThemeForm] = useState({ primaryColor: "#07220B", fontFamily: "Inter" });
  const [legalForm, setLegalForm] = useState({ privacyPolicy: { title: "", description: "", lastUpdated: "", sections: [] as { title: string; content: string[] }[] }, terms: { title: "", description: "", lastUpdated: "", sections: [] as { title: string; content: string[] }[] } });
  const [backupConfig, setBackupConfig] = useState({ autoBackup: { enabled: false, frequency: "weekly", lastBackup: null as string | null } });
  const [backupHistory, setBackupHistory] = useState<{ id: string; timestamp: string; type: string; destination: string; status: string; fileSize: number | null; errorMessage: string | null; fileName: string | null }[]>([]);

  useEffect(() => {
    setForm({ ...settings });
    setLandingForm({
      hero: {
        title: settings.config?.hero?.title ?? "",
        subtitle: settings.config?.hero?.subtitle ?? "",
        badge: settings.config?.hero?.badge ?? "",
        image: settings.config?.hero?.image ?? "",
      },
      about: {
        title: settings.config?.about?.title ?? "",
        description: settings.config?.about?.description ?? "",
        image: settings.config?.about?.image ?? "",
        values: settings.config?.about?.values ?? [],
      },
      stats: Array.isArray(settings.config?.stats) ? settings.config.stats : [],
      cta: {
        title: settings.config?.cta?.title ?? "",
        subtitle: settings.config?.cta?.subtitle ?? "",
        buttonText: settings.config?.cta?.buttonText ?? "",
        buttonLink: settings.config?.cta?.buttonLink ?? "",
      },
      footer: {
        copyright: settings.config?.footer?.copyright ?? "",
        description: settings.config?.footer?.description ?? "",
      },
    });
    setSeoForm({ ...settings.seo });
    setSectionsForm({ ...(settings.config?.sections || {}) });
    setPinnedPopupEnabled(settings.config?.enablePinnedPopup !== false);
    setAdmissionBarEnabled(settings.config?.showAdmissionBar !== false);
    setContentForm({
      whyChoose: settings.config?.whyChoose?.length ? settings.config.whyChoose : [],
      cadetOverview: settings.config?.cadetOverview || { title: "", description: "", heading: "", steps: [], images: [] },
      facilities: settings.config?.facilities?.length ? settings.config.facilities : [],
      activities: settings.config?.activities?.length ? settings.config.activities : [],
      enrollmentCta: settings.config?.enrollmentCta || { badge: "", heading: "", description: "", offerTitle: "", offerText: "", discount: "", buttonText: "", buttonLink: "" },
      heroCards: settings.config?.heroCards?.length ? settings.config.heroCards : [],
      trustIndicators: settings.config?.trustIndicators || { studentsCount: "", rating: "" },
      sectionLabels: settings.config?.sectionLabels || {},
      buttonLabels: settings.config?.buttonLabels || {},
      loaderQuotes: settings.config?.loaderQuotes?.length ? settings.config.loaderQuotes : [],
    });
    setThemeForm({
      primaryColor: settings.config?.theme?.primaryColor || "#07220B",
      fontFamily: settings.config?.theme?.fontFamily || "Inter",
    });
    setLegalForm({
      privacyPolicy: settings.config?.privacyPolicy || { title: "", description: "", lastUpdated: "", sections: [] },
      terms: settings.config?.terms || { title: "", description: "", lastUpdated: "", sections: [] },
    });
    const bc = (settings.config as unknown as Record<string, unknown>)?.backup as Record<string, unknown> | undefined;
    setBackupConfig({
      autoBackup: (bc?.autoBackup as { enabled: boolean; frequency: string; lastBackup: string | null }) || { enabled: false, frequency: "weekly", lastBackup: null },
    });
    const bh = (settings.config as unknown as Record<string, unknown>)?.backupHistory as unknown[];
    if (Array.isArray(bh)) setBackupHistory(bh as typeof backupHistory);
  }, [settings]);

  useEffect(() => {
    if (activeTab !== "backup") return;
    fetch("/api/backup?action=check-auto").then((r) => r.json()).then(({ due }) => {
      if (!due) return;
      toast.info("Auto-backup is due — running now...");
      fetch("/api/backup?action=auto", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).then((r) => r.json()).then((res) => {
        if (res.success) {
          toast.success("Auto-backup completed");
          fetch("/api/backup?action=history").then((r) => r.json()).then(setBackupHistory);
        } else if (!res.skipped) {
          toast.error("Auto-backup failed");
        }
      });
    });
  }, [activeTab]);

  async function handleSave() {
    setSavingSettings(true);
    try {
      const { config: _, seo: __, ...baseFields } = form;
      const payload: Record<string, unknown> = { ...baseFields };
      const mergedConfig = { ...form.config };
      if (activeTab === "landing") {
        mergedConfig.hero = landingForm.hero;
        mergedConfig.about = landingForm.about;
        mergedConfig.stats = landingForm.stats;
        mergedConfig.cta = landingForm.cta;
        mergedConfig.footer = landingForm.footer;
      }
      if (activeTab === "sections") {
        mergedConfig.sections = sectionsForm;
      }
      if (activeTab === "features") {
        mergedConfig.seo = seoForm;
        mergedConfig.enablePinnedPopup = pinnedPopupEnabled;
        mergedConfig.showAdmissionBar = admissionBarEnabled;
      }
      if (activeTab === "theme") {
        mergedConfig.theme = themeForm;
      }
      if (activeTab === "content") {
        mergedConfig.whyChoose = contentForm.whyChoose;
        mergedConfig.cadetOverview = contentForm.cadetOverview;
        mergedConfig.facilities = contentForm.facilities;
        mergedConfig.activities = contentForm.activities;
        mergedConfig.enrollmentCta = contentForm.enrollmentCta;
        mergedConfig.heroCards = contentForm.heroCards;
        mergedConfig.trustIndicators = contentForm.trustIndicators;
        mergedConfig.sectionLabels = contentForm.sectionLabels;
        mergedConfig.buttonLabels = contentForm.buttonLabels as typeof mergedConfig.buttonLabels;
        mergedConfig.loaderQuotes = contentForm.loaderQuotes;
      }
      if (activeTab === "legal") {
        mergedConfig.privacyPolicy = legalForm.privacyPolicy;
        mergedConfig.terms = legalForm.terms;
      }
      if (activeTab === "backup") {
        mergedConfig.backup = backupConfig;
      }
      // Preserve backup history from DB (managed by backup API, not context)
      const all = await apiList("settings");
      const sorted = (all as { id: string }[]).sort((a, b) => a.id.localeCompare(b.id));
      if (sorted.length) {
        const res = await fetch(`/api/data/settings/${sorted[0].id}`);
        if (res.ok) {
          const current = await res.json() as Record<string, unknown>;
          const curConfig = current?.config as Record<string, unknown> | undefined;
          const bh = curConfig?.backupHistory;
          if (bh) (mergedConfig as Record<string, unknown>).backupHistory = bh;
        }
      }
      payload.config = mergedConfig;
      await updateSettings(payload as Partial<AppSettings>);
      localStorage.setItem("app-theme", JSON.stringify(mergedConfig.theme));
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { key: "site", label: "Site Settings", icon: <Building2 className="w-4 h-4" /> },
    { key: "landing", label: "Landing Content", icon: <Layout className="w-4 h-4" /> },
    { key: "sections", label: "Sections", icon: <ToggleLeft className="w-4 h-4" /> },
    { key: "features", label: "SEO & Features", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "content", label: "Content", icon: <FileText className="w-4 h-4" /> },
    { key: "theme", label: "Theme", icon: <Palette className="w-4 h-4" /> },
    { key: "legal", label: "Legal", icon: <FileText className="w-4 h-4" /> },
    { key: "backup", label: "Backup", icon: <HardDrive className="w-4 h-4" /> },
  ];

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-muted">
          {activeTab === "profile" && "Manage your profile and password."}
          {activeTab === "site" && "Manage academy information, contact details, and branding."}
          {activeTab === "landing" && "Edit landing page hero, about, stats, CTA, and footer content."}
          {activeTab === "sections" && "Show or hide each section on the landing page."}
          {activeTab === "features" && "SEO, analytics, and feature toggles."}
          {activeTab === "content" && "Edit section labels, button text, Why Choose Us, Facilities, Daily Schedule, and more."}
          {activeTab === "theme" && "Customize your site colors, fonts, and preview changes live."}
          {activeTab === "legal" && "Edit Privacy Policy and Terms of Service pages."}
          {activeTab === "backup" && "Export, import, and configure automatic backups."}
        </p>
      </div>

      <div className="sticky top-16 z-20 bg-white/90 backdrop-blur-lg border-b border-primary/5 -mx-4 lg:-mx-8 px-4 lg:px-8 mb-6">
        <div className="sm:hidden py-3">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="w-full h-10 rounded-lg border border-primary/10 bg-white px-3 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {tabs.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
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

      {activeTab === "profile" && (
        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ProfileTab user={user} />
        </motion.div>
      )}

      {activeTab === "site" && (
        <motion.div key="site" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SiteTab form={form} setForm={setForm} savingSettings={savingSettings} handleSave={handleSave} />
        </motion.div>
      )}

      {activeTab === "landing" && (
        <motion.div key="landing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <LandingTab landingForm={landingForm} setLandingForm={setLandingForm} savingSettings={savingSettings} handleSave={handleSave} />
        </motion.div>
      )}

      {activeTab === "sections" && (
        <motion.div key="sections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SectionsTab sectionsForm={sectionsForm} setSectionsForm={setSectionsForm} savingSettings={savingSettings} handleSave={handleSave} />
        </motion.div>
      )}

      {activeTab === "features" && (
        <motion.div key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <FeaturesTab
            seoForm={seoForm} setSeoForm={setSeoForm}
            pinnedPopupEnabled={pinnedPopupEnabled} setPinnedPopupEnabled={setPinnedPopupEnabled}
            admissionBarEnabled={admissionBarEnabled} setAdmissionBarEnabled={setAdmissionBarEnabled}
            form={form as unknown as Record<string, unknown>}
            setForm={setForm as unknown as (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void}
            savingSettings={savingSettings} handleSave={handleSave}
          />
        </motion.div>
      )}

      {activeTab === "content" && (
        <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ContentTab contentForm={contentForm} setContentForm={setContentForm} savingSettings={savingSettings} handleSave={handleSave} />
        </motion.div>
      )}

      {activeTab === "theme" && (
        <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ThemeTab themeForm={themeForm} setThemeForm={setThemeForm} savingSettings={savingSettings} handleSave={handleSave} />
        </motion.div>
      )}

      {activeTab === "legal" && (
        <motion.div key="legal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <LegalTab legalForm={legalForm} setLegalForm={setLegalForm} savingSettings={savingSettings} handleSave={handleSave} />
        </motion.div>
      )}

      {activeTab === "backup" && (
        <motion.div key="backup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <BackupTab
            backupConfig={backupConfig} setBackupConfig={setBackupConfig}
            backupHistory={backupHistory} setBackupHistory={setBackupHistory}
            savingSettings={savingSettings} handleSave={handleSave}
          />
        </motion.div>
      )}
    </div>
  );
}
