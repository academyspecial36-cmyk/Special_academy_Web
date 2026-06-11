"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Save, Building2, Mail, Globe, Upload, Facebook, Youtube, Instagram,
  User, Lock, Eye, EyeOff, Loader2, Camera, Layout, Search, TrendingUp,
  Palette, ToggleLeft,
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

type Tab = "profile" | "site" | "landing" | "sections" | "features";

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
  }, [settings]);

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
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between pb-4 border-b border-primary/5 last:border-0 last:pb-0">
                    <div>
                      <label className="text-sm font-medium text-primary">{label}</label>
                      <p className="text-xs text-muted">{desc}</p>
                    </div>
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
    </div>
  );
}
