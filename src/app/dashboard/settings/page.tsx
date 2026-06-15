"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Save, Building2, Mail, Globe, Upload, Facebook, Youtube, Instagram,
  User, Lock, Eye, EyeOff, Loader2, Camera, Layout, Search, TrendingUp,
  Palette, ToggleLeft, FileText, BookOpen, Dumbbell, School, Sun,
  Quote, Star, Plus, X, Download, Clock, HardDrive, Cloud, AlertTriangle,
} from "lucide-react";
import { TikTokIcon } from "@/components/shared/tiktok-icon";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";
import { apiUpload } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AppSettings } from "@/lib/app-context";
import { generateShadeCssVars } from "@/lib/theme-utils";

type Tab = "profile" | "site" | "landing" | "sections" | "features" | "content" | "theme" | "legal" | "backup";

export default function SettingsPage() {
  const { settings, updateSettings } = useAppContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [form, setForm] = useState({ ...settings });
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
  const [backingUp, setBackingUp] = useState(false);
  const [importing, setImporting] = useState(false);

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
      if (iconFile) {
        const { url } = await apiUpload(iconFile, "images");
        payload.appIcon = url;
        setIconFile(null);
        setIconPreview(null);
      }
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
        mergedConfig.backupHistory = backupHistory;
      }
      payload.config = mergedConfig;
      updateSettings(payload as Partial<AppSettings>);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const prev = iconPreview;
    if (prev) URL.revokeObjectURL(prev);
    const url = URL.createObjectURL(file);
    setIconFile(file);
    setIconPreview(url);
    setForm((prev) => ({ ...prev, appIcon: url }));
  }

  async function handleSaveName() {
    if (!profileName.trim()) { toast.error("Name cannot be empty"); return; }
    setSavingName(true);
    try {
      if (user?.id) {
        const supabase = getSupabase();
        let avatarUrl = user.avatar_url;
        if (avatarFile) {
          const { url } = await apiUpload(avatarFile, "images");
          avatarUrl = url;
          setAvatarFile(null);
          setAvatarPreview(null);
        }
        await supabase.from("profiles").update({
          name: profileName,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        }).eq("id", user.id);
        user.name = profileName;
        user.avatar_url = avatarUrl;
      }
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingName(false);
    }
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const prev = avatarPreview;
    if (prev) URL.revokeObjectURL(prev);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleChangePassword() {
    if (!currentPassword) { toast.error("Current password is required"); return; }
    if (!newPassword || newPassword.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setChangingPassword(true);
    try {
      const supabase = getSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "", password: currentPassword,
      });
      if (signInError) { toast.error("Current password is incorrect"); setChangingPassword(false); return; }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) toast.error(error.message);
      else {
        toast.success("Password changed");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? "A";

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
          {activeTab === "backup" && "Export, import, and configure automatic backups to Google Drive."}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 bg-primary/5 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
              activeTab === tab.key
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover:text-primary"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-secondary" /> Admin Profile</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-primary/5">
                <div className="relative group">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                    {(avatarPreview || user?.avatar_url) ? (
                      <Image src={avatarPreview || user!.avatar_url!} alt="Avatar" width={56} height={56} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <button onClick={() => avatarRef.current?.click()} className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/30 flex items-center justify-center transition-colors opacity-0 hover:opacity-100">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div>
                  <p className="font-medium text-primary">{user?.name ?? "Admin"}</p>
                  <p className="text-sm text-muted">{user?.email ?? ""}</p>
                  <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Full Name</label>
                <div className="flex gap-2">
                  <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="flex-1" />
                  <Button onClick={handleSaveName} disabled={savingName}><Save className="w-4 h-4 mr-2" />{savingName ? "Saving..." : "Save"}</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Email</label>
                <Input value={user?.email ?? ""} disabled />
                <p className="text-xs text-muted mt-1">Email cannot be changed.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4 text-secondary" /> Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(["current", "new", "confirm"] as const).map((field) => {
                const show = field === "current" ? showCurrent : field === "new" ? showNew : showConfirm;
                const toggle = field === "current" ? setShowCurrent : field === "new" ? setShowNew : setShowConfirm;
                const value = field === "current" ? currentPassword : field === "new" ? newPassword : confirmPassword;
                const setter = field === "current" ? setCurrentPassword : field === "new" ? setNewPassword : setConfirmPassword;
                const label = field === "current" ? "Current Password" : field === "new" ? "New Password" : "Confirm New Password";
                return (
                  <div key={field}>
                    <label className="text-sm font-medium text-primary mb-1.5 block">{label}</label>
                    <div className="relative">
                      <Input type={show ? "text" : "password"} value={value} onChange={(e) => setter(e.target.value)} />
                      <button type="button" onClick={() => toggle(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} disabled={changingPassword}>
                  <Lock className="w-4 h-4 mr-2" />{changingPassword ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "site" && (
        <motion.div key="site" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-secondary" /> Academy Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Academy Name</label><Input value={form.academyName} onChange={(e) => setForm((p) => ({ ...p, academyName: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Tagline</label><Input value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Description</label><Textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Address</label><Textarea rows={2} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
                <div>
                  <label className="text-sm font-medium text-primary mb-1.5 block">App Icon / Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                      {(iconPreview || form.appIcon) ? (
                        <Image src={iconPreview || form.appIcon} alt="App Icon" width={56} height={56} className="w-full h-full object-contain" unoptimized />
                      ) : (
                        <Upload className="w-5 h-5 text-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="w-3.5 h-3.5 mr-2" /> Upload Image</Button>
                      <p className="text-xs text-muted mt-1">Recommended: 192x192 PNG</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4 text-secondary" /> Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Email</label><Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Admission Email</label><Input value={form.admissionEmail} onChange={(e) => setForm((p) => ({ ...p, admissionEmail: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Phone</label><Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Secondary Phone</label><Input value={form.secondaryPhone} onChange={(e) => setForm((p) => ({ ...p, secondaryPhone: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Website</label><Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Office Hours</label><Input value={form.officeHours} onChange={(e) => setForm((p) => ({ ...p, officeHours: e.target.value }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Weekly Holiday</label><Input value={form.holiday} onChange={(e) => setForm((p) => ({ ...p, holiday: e.target.value }))} /></div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-secondary" /> Social Media Links</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {([
                    { key: "facebook", label: "Facebook", icon: <Facebook className="w-3.5 h-3.5 text-blue-600" /> },
                    { key: "instagram", label: "Instagram", icon: <Instagram className="w-3.5 h-3.5 text-pink-600" /> },
                    { key: "tiktok", label: "TikTok", icon: <TikTokIcon className="w-3.5 h-3.5" /> },
                    { key: "youtube", label: "YouTube", icon: <Youtube className="w-3.5 h-3.5 text-red-600" /> },
                  ] as const).map(({ key, label, icon }) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-primary mb-1.5 flex items-center gap-1.5">{icon} {label}</label>
                      <Input value={(form.socialLinks as unknown as Record<string, string>)[key]} onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))} placeholder={`https://${key}.com/...`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleSave} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingSettings ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === "landing" && (
        <motion.div key="landing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Hero Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Badge Text</label><Input value={landingForm.hero?.badge} onChange={(e) => setLandingForm((p) => ({ ...p, hero: { ...p.hero, badge: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Title</label><Textarea rows={2} value={landingForm.hero?.title} onChange={(e) => setLandingForm((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Subtitle</label><Textarea rows={3} value={landingForm.hero?.subtitle} onChange={(e) => setLandingForm((p) => ({ ...p, hero: { ...p.hero, subtitle: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Hero Image URL</label><Input value={landingForm.hero?.image} onChange={(e) => setLandingForm((p) => ({ ...p, hero: { ...p.hero, image: e.target.value } }))} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">About Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Title</label><Input value={landingForm.about.title} onChange={(e) => setLandingForm((p) => ({ ...p, about: { ...p.about, title: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Description</label><Textarea rows={3} value={landingForm.about.description} onChange={(e) => setLandingForm((p) => ({ ...p, about: { ...p.about, description: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">About Image URL</label><Input value={landingForm.about.image} onChange={(e) => setLandingForm((p) => ({ ...p, about: { ...p.about, image: e.target.value } }))} /></div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">About Values</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {landingForm.about.values.map((v, i) => (
                    <div key={i} className="p-4 rounded-lg border border-primary/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted font-medium">Value {i + 1}</span>
                        <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => setLandingForm((p) => ({ ...p, about: { ...p.about, values: p.about.values.filter((_, idx) => idx !== i) } }))}>Remove</Button>
                      </div>
                      <Input value={v.title} onChange={(e) => setLandingForm((p) => ({ ...p, about: { ...p.about, values: p.about.values.map((val, idx) => idx === i ? { ...val, title: e.target.value } : val) } }))} placeholder="Title" />
                      <Textarea rows={2} value={v.description} onChange={(e) => setLandingForm((p) => ({ ...p, about: { ...p.about, values: p.about.values.map((val, idx) => idx === i ? { ...val, description: e.target.value } : val) } }))} placeholder="Description" />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setLandingForm((p) => ({ ...p, about: { ...p.about, values: [...p.about.values, { title: "", description: "" }] } }))}>+ Add Value</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {landingForm.stats.map((s, i) => (
                    <div key={i} className="p-4 rounded-lg border border-primary/5 space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs text-muted font-medium">Stat {i + 1}</span>
                        <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => setLandingForm((p) => ({ ...p, stats: p.stats.filter((_, idx) => idx !== i) }))}>Remove</Button>
                      </div>
                      <Input value={s.label} onChange={(e) => setLandingForm((p) => ({ ...p, stats: p.stats.map((st, idx) => idx === i ? { ...st, label: e.target.value } : st) }))} placeholder="Label" />
                      <Input value={s.value} onChange={(e) => setLandingForm((p) => ({ ...p, stats: p.stats.map((st, idx) => idx === i ? { ...st, value: e.target.value } : st) }))} placeholder="Value" />
                      <Input value={s.suffix || ""} onChange={(e) => setLandingForm((p) => ({ ...p, stats: p.stats.map((st, idx) => idx === i ? { ...st, suffix: e.target.value } : st) }))} placeholder="Suffix (e.g. %)" />
                      <Input value={s.description || ""} onChange={(e) => setLandingForm((p) => ({ ...p, stats: p.stats.map((st, idx) => idx === i ? { ...st, description: e.target.value } : st) }))} placeholder="Description" />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setLandingForm((p) => ({ ...p, stats: [...p.stats, { label: "", value: "", suffix: "", description: "" }] }))}>+ Add Stat</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">CTA Section</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Title</label><Input value={landingForm.cta.title} onChange={(e) => setLandingForm((p) => ({ ...p, cta: { ...p.cta, title: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Subtitle</label><Textarea rows={2} value={landingForm.cta.subtitle} onChange={(e) => setLandingForm((p) => ({ ...p, cta: { ...p.cta, subtitle: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Button Text</label><Input value={landingForm.cta.buttonText} onChange={(e) => setLandingForm((p) => ({ ...p, cta: { ...p.cta, buttonText: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Button Link</label><Input value={landingForm.cta.buttonLink} onChange={(e) => setLandingForm((p) => ({ ...p, cta: { ...p.cta, buttonLink: e.target.value } }))} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Footer</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Copyright Text</label><Input value={landingForm.footer.copyright} onChange={(e) => setLandingForm((p) => ({ ...p, footer: { ...p.footer, copyright: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Description</label><Textarea rows={3} value={landingForm.footer.description} onChange={(e) => setLandingForm((p) => ({ ...p, footer: { ...p.footer, description: e.target.value } }))} /></div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleSave} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingSettings ? "Saving..." : "Save Landing Content"}
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === "sections" && (
        <motion.div key="sections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ToggleLeft className="w-4 h-4 text-secondary" /> Landing Page Sections</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {([
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
                ] as const).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-primary/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{label}</p>
                      <p className="text-xs text-muted truncate">{desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={sectionsForm[key] ?? true}
                      onClick={() => setSectionsForm((p) => ({ ...p, [key]: !(p[key] ?? true) }))}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-3",
                        (sectionsForm[key] ?? true) ? "bg-primary" : "bg-primary/20"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        (sectionsForm[key] ?? true) ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
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
        </motion.div>
      )}

      {activeTab === "features" && (
        <motion.div key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Search className="w-4 h-4 text-secondary" /> SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Meta Description</label><Textarea rows={3} value={seoForm.metaDescription} onChange={(e) => setSeoForm((p) => ({ ...p, metaDescription: e.target.value }))} placeholder="Default meta description for search engines..." /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Google Analytics Tracking ID</label><Input value={seoForm.gaTrackingId} onChange={(e) => setSeoForm((p) => ({ ...p, gaTrackingId: e.target.value }))} placeholder="G-XXXXXXXXXX" /><p className="text-xs text-muted mt-1">Leave empty to disable analytics.</p></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4 text-secondary" /> Feature Toggles</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: "enableBlog", label: "Enable Blog", desc: "Show blog section on landing page" },
                  { key: "maintenanceMode", label: "Maintenance Mode", desc: "Show maintenance page to visitors" },
                  { key: "pinnedPopup", label: "Pinned Notice Popup", desc: "Show pinned notice as popup on landing page" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between pb-4 border-b border-primary/5 last:border-0 last:pb-0">
                    <div>
                      <label className="text-sm font-medium text-primary">{label}</label>
                      <p className="text-xs text-muted">{desc}</p>
                    </div>
                    {key === "pinnedPopup" ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={pinnedPopupEnabled}
                        onClick={() => setPinnedPopupEnabled((p) => !p)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
                          pinnedPopupEnabled ? "bg-primary" : "bg-primary/20"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          pinnedPopupEnabled ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={(form as Record<string, unknown>)[key] as boolean}
                        onClick={() => setForm((p) => ({ ...p, [key]: !(p as Record<string, unknown>)[key] }))}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
                          (form as Record<string, unknown>)[key] ? "bg-primary" : "bg-primary/20"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          (form as Record<string, unknown>)[key] ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleSave} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingSettings ? "Saving..." : "Save SEO & Features"}
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === "content" && (
        <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Why Choose Us */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="w-4 h-4 text-secondary" /> Why Choose Us</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentForm.whyChoose.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border border-primary/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted font-medium">Reason {i + 1}</span>
                      <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => setContentForm((p) => ({ ...p, whyChoose: p.whyChoose.filter((_, idx) => idx !== i) }))}>Remove</Button>
                    </div>
                    <Input value={item.icon} onChange={(e) => setContentForm((p) => ({ ...p, whyChoose: p.whyChoose.map((v, idx) => idx === i ? { ...v, icon: e.target.value } : v) }))} placeholder="Icon name (Users, BookOpen, etc.)" className="text-xs" />
                    <Input value={item.title} onChange={(e) => setContentForm((p) => ({ ...p, whyChoose: p.whyChoose.map((v, idx) => idx === i ? { ...v, title: e.target.value } : v) }))} placeholder="Title" />
                    <Textarea rows={2} value={item.description} onChange={(e) => setContentForm((p) => ({ ...p, whyChoose: p.whyChoose.map((v, idx) => idx === i ? { ...v, description: e.target.value } : v) }))} placeholder="Description" />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setContentForm((p) => ({ ...p, whyChoose: [...p.whyChoose, { icon: "Users", title: "", description: "" }] }))}>+ Add Reason</Button>
              </div>
            </CardContent>
          </Card>

          {/* Cadet Overview */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-secondary" /> Cadet Overview / Preparation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium text-primary mb-1.5 block">Title</label><Input value={contentForm.cadetOverview.title} onChange={(e) => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, title: e.target.value } }))} /></div>
              <div><label className="text-sm font-medium text-primary mb-1.5 block">Description</label><Textarea rows={2} value={contentForm.cadetOverview.description} onChange={(e) => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, description: e.target.value } }))} /></div>
              <div><label className="text-sm font-medium text-primary mb-1.5 block">Heading</label><Input value={contentForm.cadetOverview.heading} onChange={(e) => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, heading: e.target.value } }))} /></div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Preparation Steps</label>
                <div className="space-y-2">
                  {contentForm.cadetOverview.steps.map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={step} onChange={(e) => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, steps: p.cadetOverview.steps.map((s, idx) => idx === i ? e.target.value : s) } }))} placeholder={`Step ${i + 1}`} />
                      <Button variant="ghost" size="sm" className="text-red-500 h-9 text-xs shrink-0" onClick={() => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, steps: p.cadetOverview.steps.filter((_, idx) => idx !== i) } }))}>X</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, steps: [...p.cadetOverview.steps, ""] } }))}>+ Add Step</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Images (URLs)</label>
                <div className="space-y-2">
                  {contentForm.cadetOverview.images.map((img, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={img} onChange={(e) => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, images: p.cadetOverview.images.map((s, idx) => idx === i ? e.target.value : s) } }))} placeholder={`Image ${i + 1} URL`} />
                      <Button variant="ghost" size="sm" className="text-red-500 h-9 text-xs shrink-0" onClick={() => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, images: p.cadetOverview.images.filter((_, idx) => idx !== i) } }))}>X</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, images: [...p.cadetOverview.images, ""] } }))}>+ Add Image</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><School className="w-4 h-4 text-secondary" /> Facilities / Infrastructure</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentForm.facilities.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border border-primary/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted font-medium">Facility {i + 1}</span>
                      <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => setContentForm((p) => ({ ...p, facilities: p.facilities.filter((_, idx) => idx !== i) }))}>Remove</Button>
                    </div>
                    <Input value={item.icon} onChange={(e) => setContentForm((p) => ({ ...p, facilities: p.facilities.map((v, idx) => idx === i ? { ...v, icon: e.target.value } : v) }))} placeholder="Icon (School, BookOpen, etc.)" className="text-xs" />
                    <Input value={item.title} onChange={(e) => setContentForm((p) => ({ ...p, facilities: p.facilities.map((v, idx) => idx === i ? { ...v, title: e.target.value } : v) }))} placeholder="Title" />
                    <Textarea rows={2} value={item.description} onChange={(e) => setContentForm((p) => ({ ...p, facilities: p.facilities.map((v, idx) => idx === i ? { ...v, description: e.target.value } : v) }))} placeholder="Description" />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setContentForm((p) => ({ ...p, facilities: [...p.facilities, { icon: "School", title: "", description: "" }] }))}>+ Add Facility</Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily Schedule */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sun className="w-4 h-4 text-secondary" /> Daily Schedule / Activities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {contentForm.activities.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border border-primary/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted font-medium">Activity {i + 1}</span>
                      <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs" onClick={() => setContentForm((p) => ({ ...p, activities: p.activities.filter((_, idx) => idx !== i) }))}>Remove</Button>
                    </div>
                    <Input value={item.icon} onChange={(e) => setContentForm((p) => ({ ...p, activities: p.activities.map((v, idx) => idx === i ? { ...v, icon: e.target.value } : v) }))} placeholder="Icon (Sunrise, BookOpen, etc.)" className="text-xs" />
                    <Input value={item.title} onChange={(e) => setContentForm((p) => ({ ...p, activities: p.activities.map((v, idx) => idx === i ? { ...v, title: e.target.value } : v) }))} placeholder="Title" />
                    <Input value={item.time} onChange={(e) => setContentForm((p) => ({ ...p, activities: p.activities.map((v, idx) => idx === i ? { ...v, time: e.target.value } : v) }))} placeholder="Time (e.g. 7:30 AM - 8:00 AM)" />
                    <Textarea rows={2} value={item.description} onChange={(e) => setContentForm((p) => ({ ...p, activities: p.activities.map((v, idx) => idx === i ? { ...v, description: e.target.value } : v) }))} placeholder="Description" />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setContentForm((p) => ({ ...p, activities: [...p.activities, { icon: "Sunrise", title: "", time: "", description: "" }] }))}>+ Add Activity</Button>
              </div>
            </CardContent>
          </Card>

          {/* Enrollment CTA */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-secondary" /> Enrollment Call-to-Action</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Badge Text</label><Input value={contentForm.enrollmentCta.badge} onChange={(e) => setContentForm((p) => ({ ...p, enrollmentCta: { ...p.enrollmentCta, badge: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Discount</label><Input value={contentForm.enrollmentCta.discount} onChange={(e) => setContentForm((p) => ({ ...p, enrollmentCta: { ...p.enrollmentCta, discount: e.target.value } }))} /></div>
                <div className="sm:col-span-2"><label className="text-sm font-medium text-primary mb-1.5 block">Heading</label><Textarea rows={2} value={contentForm.enrollmentCta.heading} onChange={(e) => setContentForm((p) => ({ ...p, enrollmentCta: { ...p.enrollmentCta, heading: e.target.value } }))} /></div>
                <div className="sm:col-span-2"><label className="text-sm font-medium text-primary mb-1.5 block">Description</label><Textarea rows={3} value={contentForm.enrollmentCta.description} onChange={(e) => setContentForm((p) => ({ ...p, enrollmentCta: { ...p.enrollmentCta, description: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Offer Title</label><Input value={contentForm.enrollmentCta.offerTitle} onChange={(e) => setContentForm((p) => ({ ...p, enrollmentCta: { ...p.enrollmentCta, offerTitle: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Offer Text</label><Input value={contentForm.enrollmentCta.offerText} onChange={(e) => setContentForm((p) => ({ ...p, enrollmentCta: { ...p.enrollmentCta, offerText: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Button Text</label><Input value={contentForm.enrollmentCta.buttonText} onChange={(e) => setContentForm((p) => ({ ...p, enrollmentCta: { ...p.enrollmentCta, buttonText: e.target.value } }))} /></div>
                <div><label className="text-sm font-medium text-primary mb-1.5 block">Button Link</label><Input value={contentForm.enrollmentCta.buttonLink} onChange={(e) => setContentForm((p) => ({ ...p, enrollmentCta: { ...p.enrollmentCta, buttonLink: e.target.value } }))} /></div>
              </div>
            </CardContent>
          </Card>

          {/* Hero Cards */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="w-4 h-4 text-secondary" /> Hero Floating Cards</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {contentForm.heroCards.map((card, i) => (
                  <div key={i} className="p-4 rounded-lg border border-primary/5 space-y-2">
                    <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs float-right" onClick={() => setContentForm((p) => ({ ...p, heroCards: p.heroCards.filter((_, idx) => idx !== i) }))}>Remove</Button>
                    <Input value={card.icon} onChange={(e) => setContentForm((p) => ({ ...p, heroCards: p.heroCards.map((v, idx) => idx === i ? { ...v, icon: e.target.value } : v) }))} placeholder="Icon (Trophy, Users, etc.)" className="text-xs" />
                    <Input value={card.value} onChange={(e) => setContentForm((p) => ({ ...p, heroCards: p.heroCards.map((v, idx) => idx === i ? { ...v, value: e.target.value } : v) }))} placeholder="Value (94%, 35+, etc.)" />
                    <Input value={card.label} onChange={(e) => setContentForm((p) => ({ ...p, heroCards: p.heroCards.map((v, idx) => idx === i ? { ...v, label: e.target.value } : v) }))} placeholder="Label (Success Rate)" />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setContentForm((p) => ({ ...p, heroCards: [...p.heroCards, { icon: "Trophy", value: "", label: "" }] }))}>+ Add Card</Button>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Quote className="w-4 h-4 text-secondary" /> Trust Indicators</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-primary mb-1.5 block">Students Count Text</label><Input value={contentForm.trustIndicators.studentsCount} onChange={(e) => setContentForm((p) => ({ ...p, trustIndicators: { ...p.trustIndicators, studentsCount: e.target.value } }))} placeholder="2,500+" /></div>
              <div><label className="text-sm font-medium text-primary mb-1.5 block">Rating Text</label><Input value={contentForm.trustIndicators.rating} onChange={(e) => setContentForm((p) => ({ ...p, trustIndicators: { ...p.trustIndicators, rating: e.target.value } }))} placeholder="4.9" /></div>
            </CardContent>
          </Card>

          {/* Section Labels */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-secondary" /> Section Labels & Headers</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(contentForm.sectionLabels).map(([key, val], i) => (
                  <div key={key} className="p-4 rounded-lg border border-primary/5 space-y-2">
                    <p className="text-xs font-semibold text-primary uppercase mb-1">{key}</p>
                    <Input value={val.label} onChange={(e) => setContentForm((p) => ({ ...p, sectionLabels: { ...p.sectionLabels, [key]: { ...p.sectionLabels[key], label: e.target.value } } }))} placeholder="Label" />
                    <Input value={val.title} onChange={(e) => setContentForm((p) => ({ ...p, sectionLabels: { ...p.sectionLabels, [key]: { ...p.sectionLabels[key], title: e.target.value } } }))} placeholder="Title" />
                    <Textarea rows={2} value={val.description} onChange={(e) => setContentForm((p) => ({ ...p, sectionLabels: { ...p.sectionLabels, [key]: { ...p.sectionLabels[key], description: e.target.value } } }))} placeholder="Description" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Button Labels */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-secondary" /> Button Labels</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(contentForm.buttonLabels).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-primary mb-1 block capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <Input value={val} onChange={(e) => setContentForm((p) => ({ ...p, buttonLabels: { ...p.buttonLabels, [key]: e.target.value } }))} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loader Quotes */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Quote className="w-4 h-4 text-secondary" /> Loading Screen Quotes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contentForm.loaderQuotes.map((quote, i) => (
                  <div key={i} className="flex gap-2">
                    <Textarea rows={1} value={quote} onChange={(e) => setContentForm((p) => ({ ...p, loaderQuotes: p.loaderQuotes.map((q, idx) => idx === i ? e.target.value : q) }))} placeholder={`Quote ${i + 1}`} className="min-h-[40px]" />
                    <Button variant="ghost" size="sm" className="text-red-500 h-9 text-xs shrink-0" onClick={() => setContentForm((p) => ({ ...p, loaderQuotes: p.loaderQuotes.filter((_, idx) => idx !== i) }))}>X</Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setContentForm((p) => ({ ...p, loaderQuotes: [...p.loaderQuotes, ""] }))}>+ Add Quote</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleSave} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingSettings ? "Saving..." : "Save Content"}
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === "theme" && (
        <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Theme Controls */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4 text-secondary" /> Colors & Fonts</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Primary Color</label>
                    <div className="flex gap-3 items-center">
                      <input type="color" value={themeForm.primaryColor} onChange={(e) => setThemeForm((p) => ({ ...p, primaryColor: e.target.value }))} className="w-10 h-10 rounded-md border border-primary/20 cursor-pointer bg-transparent p-0.5" />
                      <Input value={themeForm.primaryColor} onChange={(e) => setThemeForm((p) => ({ ...p, primaryColor: e.target.value }))} placeholder="#07220B" className="font-mono flex-1" />
                    </div>
                    <p className="text-xs text-muted mt-1">Pick a color or enter a hex code.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Font Family</label>
                    <select value={themeForm.fontFamily} onChange={(e) => setThemeForm((p) => ({ ...p, fontFamily: e.target.value }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      {["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito", "Raleway", "Playfair Display", "Merriweather"].map((f) => (
                        <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4 text-secondary" /> Preview</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4 rounded-xl border border-primary/10 p-5" style={{ fontFamily: themeForm.fontFamily }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: themeForm.primaryColor }} />
                      <div>
                        <p className="text-sm font-semibold text-primary">Primary Color Sample</p>
                        <p className="text-xs text-muted">{themeForm.primaryColor}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 rounded-md text-sm font-medium text-white shadow-soft transition-all hover:opacity-90" style={{ backgroundColor: themeForm.primaryColor }}>Primary Button</button>
                      <button className="px-4 py-2 rounded-md text-sm font-medium border transition-all hover:bg-primary/5" style={{ borderColor: `${themeForm.primaryColor}33`, color: themeForm.primaryColor }}>Outline Button</button>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: `${themeForm.primaryColor}15` }}>
                      <div className="h-2 rounded-full w-3/5" style={{ backgroundColor: themeForm.primaryColor }} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: themeForm.primaryColor }}>Badge</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${themeForm.primaryColor}15`, color: themeForm.primaryColor }}>Light Badge</span>
                    </div>
                    <div className="p-3 rounded-lg border" style={{ borderColor: `${themeForm.primaryColor}15` }}>
                      <p className="text-sm font-medium" style={{ color: themeForm.primaryColor }}>Sample Card Title</p>
                      <p className="text-xs text-muted mt-1">This is how a card body text appears with the current font selection.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview of landing components */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layout className="w-4 h-4 text-secondary" /> Page Preview</CardTitle></CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-primary/10 overflow-hidden" style={{ fontFamily: themeForm.fontFamily }}>
                    {/* Hero mockup */}
                    <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${themeForm.primaryColor}, ${themeForm.primaryColor}dd` }}>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">Admission Open</span>
                      <h2 className="text-xl font-bold mt-3" style={{ fontFamily: themeForm.fontFamily }}>Preparing Future Leaders</h2>
                      <p className="text-sm mt-1 text-white/80">Through discipline & excellence</p>
                      <div className="flex gap-2 mt-4">
                        <span className="px-4 py-2 rounded-md text-sm font-medium bg-white" style={{ color: themeForm.primaryColor }}>Get Started</span>
                        <span className="px-4 py-2 rounded-md text-sm font-medium border border-white/30 text-white">Learn More</span>
                      </div>
                    </div>
                    {/* Stats mockup */}
                    <div className="grid grid-cols-3 gap-4 p-5 bg-accent">
                      {["2500+", "94%", "35+"].map((stat, i) => (
                        <div key={i} className="text-center">
                          <p className="text-lg font-bold" style={{ color: themeForm.primaryColor }}>{stat}</p>
                          <p className="text-xs text-muted">Stat {i + 1}</p>
                        </div>
                      ))}
                    </div>
                    {/* Course card mockup */}
                    <div className="p-5">
                      <div className="rounded-lg border p-4" style={{ borderColor: `${themeForm.primaryColor}15` }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: themeForm.primaryColor }}>C</div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: themeForm.primaryColor }}>Cadet Preparation</p>
                            <p className="text-xs text-muted">Comprehensive course</p>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full w-full bg-primary/5">
                          <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: themeForm.primaryColor }} />
                        </div>
                      </div>
                    </div>
                    {/* Footer mockup */}
                    <div className="p-4 text-center text-xs text-white" style={{ backgroundColor: themeForm.primaryColor }}>
                      &copy; 2026 Special Academy. All rights reserved.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleSave} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingSettings ? "Saving..." : "Save Theme"}
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === "legal" && (
        <motion.div key="legal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-secondary" /> Privacy Policy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Title</label>
                <Input value={legalForm.privacyPolicy.title} onChange={(e) => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, title: e.target.value } }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Description</label>
                <Input value={legalForm.privacyPolicy.description} onChange={(e) => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, description: e.target.value } }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Last Updated</label>
                <Input value={legalForm.privacyPolicy.lastUpdated} onChange={(e) => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, lastUpdated: e.target.value } }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-primary">Sections</label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, sections: [...p.privacyPolicy.sections, { title: "", content: [""] }] } }))}><Plus className="w-3.5 h-3.5 mr-1" /> Add Section</Button>
                </div>
                <div className="space-y-4">
                  {legalForm.privacyPolicy.sections.map((section, si) => (
                    <div key={si} className="border border-primary/10 rounded-lg p-4 space-y-3 relative">
                      <div className="flex items-start justify-between gap-2">
                        <Input value={section.title} onChange={(e) => { const s = [...legalForm.privacyPolicy.sections]; s[si] = { ...s[si], title: e.target.value }; setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, sections: s } })); }} placeholder="Section title" className="flex-1" />
                        <button onClick={() => setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, sections: p.privacyPolicy.sections.filter((_, i) => i !== si) } }))} className="p-1 text-muted hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                      {section.content.map((para, pi) => (
                        <div key={pi} className="flex items-start gap-2">
                          <Textarea value={para} onChange={(e) => { const s = [...legalForm.privacyPolicy.sections]; s[si] = { ...s[si], content: s[si].content.map((c, i) => i === pi ? e.target.value : c) }; setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, sections: s } })); }} placeholder={`Paragraph ${pi + 1}`} className="flex-1 min-h-[60px]" />
                          {section.content.length > 1 && (
                            <button onClick={() => { const s = [...legalForm.privacyPolicy.sections]; s[si] = { ...s[si], content: s[si].content.filter((_, i) => i !== pi) }; setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, sections: s } })); }} className="p-1 text-muted hover:text-red-500 transition-colors shrink-0 mt-1"><X className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="ghost" size="sm" onClick={() => { const s = [...legalForm.privacyPolicy.sections]; s[si] = { ...s[si], content: [...s[si].content, ""] }; setLegalForm((p) => ({ ...p, privacyPolicy: { ...p.privacyPolicy, sections: s } })); }}><Plus className="w-3 h-3 mr-1" /> Add Paragraph</Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-secondary" /> Terms of Service</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Title</label>
                <Input value={legalForm.terms.title} onChange={(e) => setLegalForm((p) => ({ ...p, terms: { ...p.terms, title: e.target.value } }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Description</label>
                <Input value={legalForm.terms.description} onChange={(e) => setLegalForm((p) => ({ ...p, terms: { ...p.terms, description: e.target.value } }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Last Updated</label>
                <Input value={legalForm.terms.lastUpdated} onChange={(e) => setLegalForm((p) => ({ ...p, terms: { ...p.terms, lastUpdated: e.target.value } }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-primary">Sections</label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setLegalForm((p) => ({ ...p, terms: { ...p.terms, sections: [...p.terms.sections, { title: "", content: [""] }] } }))}><Plus className="w-3.5 h-3.5 mr-1" /> Add Section</Button>
                </div>
                <div className="space-y-4">
                  {legalForm.terms.sections.map((section, si) => (
                    <div key={si} className="border border-primary/10 rounded-lg p-4 space-y-3 relative">
                      <div className="flex items-start justify-between gap-2">
                        <Input value={section.title} onChange={(e) => { const s = [...legalForm.terms.sections]; s[si] = { ...s[si], title: e.target.value }; setLegalForm((p) => ({ ...p, terms: { ...p.terms, sections: s } })); }} placeholder="Section title" className="flex-1" />
                        <button onClick={() => setLegalForm((p) => ({ ...p, terms: { ...p.terms, sections: p.terms.sections.filter((_, i) => i !== si) } }))} className="p-1 text-muted hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                      {section.content.map((para, pi) => (
                        <div key={pi} className="flex items-start gap-2">
                          <Textarea value={para} onChange={(e) => { const s = [...legalForm.terms.sections]; s[si] = { ...s[si], content: s[si].content.map((c, i) => i === pi ? e.target.value : c) }; setLegalForm((p) => ({ ...p, terms: { ...p.terms, sections: s } })); }} placeholder={`Paragraph ${pi + 1}`} className="flex-1 min-h-[60px]" />
                          {section.content.length > 1 && (
                            <button onClick={() => { const s = [...legalForm.terms.sections]; s[si] = { ...s[si], content: s[si].content.filter((_, i) => i !== pi) }; setLegalForm((p) => ({ ...p, terms: { ...p.terms, sections: s } })); }} className="p-1 text-muted hover:text-red-500 transition-colors shrink-0 mt-1"><X className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="ghost" size="sm" onClick={() => { const s = [...legalForm.terms.sections]; s[si] = { ...s[si], content: [...s[si].content, ""] }; setLegalForm((p) => ({ ...p, terms: { ...p.terms, sections: s } })); }}><Plus className="w-3 h-3 mr-1" /> Add Paragraph</Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleSave} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingSettings ? "Saving..." : "Save Legal Pages"}
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === "backup" && (
        <motion.div key="backup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="w-4 h-4 text-secondary" /> Export / Import</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={async () => {
                  setBackingUp(true);
                  try {
                    const res = await fetch("/api/backup?action=export");
                    const data = await res.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("Data exported successfully");
                  } catch { toast.error("Export failed"); }
                  finally { setBackingUp(false); }
                }} disabled={backingUp}>
                  {backingUp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Export JSON
                </Button>
                <input type="file" accept=".json" id="import-json" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImporting(true);
                  try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    const res = await fetch("/api/backup?action=import", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ data }),
                    });
                    const result = await res.json();
                    toast.success("Data imported successfully");
                  } catch { toast.error("Import failed - invalid file"); }
                  finally { setImporting(false); e.target.value = ""; }
                }} />
                <Button variant="outline" disabled={importing} onClick={() => document.getElementById("import-json")?.click()}>
                  {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Import JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cloud className="w-4 h-4 text-secondary" /> Cloud Backup (Supabase Storage)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Important</p>
                  <p>Cloud backups may not be 100% reliable — they depend on your Supabase project&apos;s storage availability. Always use <strong>Export JSON</strong> above to save a copy to your computer or external device as a secondary safety measure.</p>
                </div>
              </div>
              <p className="text-xs text-muted">Backups are stored in your Supabase project&apos;s storage bucket. No external credentials needed.</p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                <div>
                  <p className="text-sm font-medium text-primary">Backup to Cloud Now</p>
                  <p className="text-xs text-muted">Export all data and save to Supabase Storage</p>
                </div>
                <Button size="sm" onClick={async () => {
                  setBackingUp(true);
                  try {
                    const exp = await fetch("/api/backup?action=export");
                    const data = await exp.json();
                    const storageRes = await fetch("/api/backup?action=supabase-storage", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ data }),
                    });
                    if (!storageRes.ok) throw new Error((await storageRes.json()).error || "Upload failed");
                    const storageResult = await storageRes.json();
                    const entry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: "manual", destination: "cloud", status: "success", fileSize: storageResult.fileSize, errorMessage: null, fileName: storageResult.fileName };
                    setBackupHistory((p) => [entry, ...p].slice(0, 50));
                    await fetch("/api/backup?action=history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
                    await fetch("/api/backup?action=update-last-backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
                    toast.success("Backup saved to cloud storage");
                  } catch (e) {
                    const entry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: "manual", destination: "cloud", status: "failed", fileSize: null, errorMessage: String(e), fileName: null };
                    setBackupHistory((p) => [entry, ...p].slice(0, 50));
                    await fetch("/api/backup?action=history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
                    toast.error("Cloud backup failed");
                  } finally { setBackingUp(false); }
                }} disabled={backingUp}>
                  {backingUp ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                  Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> Automatic Backup</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Weekly Automatic Backup</p>
                  <p className="text-xs text-muted">Automatically backup data to cloud storage every week</p>
                </div>
                <button
                  type="button" role="switch"
                  aria-checked={backupConfig.autoBackup.enabled}
                  onClick={() => setBackupConfig((p) => ({ ...p, autoBackup: { ...p.autoBackup, enabled: !p.autoBackup.enabled } }))}
                  className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0", backupConfig.autoBackup.enabled ? "bg-primary" : "bg-primary/20")}
                >
                  <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", backupConfig.autoBackup.enabled ? "translate-x-6" : "translate-x-1")} />
                </button>
              </div>
              {backupConfig.autoBackup.lastBackup && (
                <p className="text-xs text-muted">Last automatic backup: {new Date(backupConfig.autoBackup.lastBackup).toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> Backup History</CardTitle></CardHeader>
            <CardContent>
              {backupHistory.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No backups recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary/5">
                        <th className="text-left py-2 px-2 font-medium text-muted">Date</th>
                        <th className="text-left py-2 px-2 font-medium text-muted">Type</th>
                        <th className="text-left py-2 px-2 font-medium text-muted">Destination</th>
                        <th className="text-left py-2 px-2 font-medium text-muted">Status</th>
                        <th className="text-left py-2 px-2 font-medium text-muted">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupHistory.map((h) => (
                        <tr key={h.id} className="border-b border-primary/5 last:border-0">
                          <td className="py-2 px-2 text-primary">{new Date(h.timestamp).toLocaleString()}</td>
                          <td className="py-2 px-2"><span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary/5 text-primary capitalize">{h.type}</span></td>
                          <td className="py-2 px-2 text-muted capitalize">{h.destination}</td>
                          <td className="py-2 px-2">
                            <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", h.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{h.status}</span>
                          </td>
                          <td className="py-2 px-2 text-muted">{h.fileSize ? `${(h.fileSize / 1024).toFixed(1)} KB` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleSave} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingSettings ? "Saving..." : "Save Backup Settings"}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
