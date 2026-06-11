"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Save, Building2, Mail, Phone, Globe, Upload, Facebook, Youtube, Instagram, User, Lock, Eye, EyeOff, Loader2, Camera } from "lucide-react";
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

type Tab = "profile" | "site";

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
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSave() {
    setSavingSettings(true);
    try {
      const payload = { ...form };
      if (iconFile) {
        const { url } = await apiUpload(iconFile, "images");
        payload.appIcon = url;
        setIconFile(null);
        setIconPreview(null);
      }
      updateSettings(payload);
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
    if (!profileName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
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
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = getSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "",
        password: currentPassword,
      });
      if (signInError) {
        toast.error("Current password is incorrect");
        setChangingPassword(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "site", label: "Site Settings" },
  ];

  return (
    <div>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-muted">Manage your profile and academy settings.</p>
      </div>

      <div className="flex gap-1 mb-6 bg-primary/5 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === tab.key
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover:text-primary"
            )}
          >
            {tab.key === "profile" ? (
              <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            ) : (
              <Building2 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" ? (
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-secondary" />
                Admin Profile
              </CardTitle>
            </CardHeader>
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
                    <button
                      onClick={() => avatarRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/30 flex items-center justify-center transition-colors opacity-0 hover:opacity-100"
                    >
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
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveName} disabled={savingName}>
                    <Save className="w-4 h-4 mr-2" />
                    {savingName ? "Saving..." : "Save"}
                  </Button>
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
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">New Password</label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-primary mb-1.5 block">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} disabled={changingPassword}>
                  <Lock className="w-4 h-4 mr-2" />
                  {changingPassword ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="site"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-secondary" />
                    Academy Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Academy Name</label>
                    <Input value={form.academyName} onChange={(e) => setForm((p) => ({ ...p, academyName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Tagline</label>
                    <Input value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Description</label>
                    <Textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Address</label>
                    <Textarea rows={2} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">App Icon / Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                        {(iconPreview || form.appIcon) ? (
                          <Image src={iconPreview || form.appIcon} alt="App Icon" width={56} height={56} className="w-full h-full object-contain" />
                        ) : (
                          <Upload className="w-5 h-5 text-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                          <Upload className="w-3.5 h-3.5 mr-2" />
                          Upload Image
                        </Button>
                        <p className="text-xs text-muted mt-1">Recommended: 192×192 PNG</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4 text-secondary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Email</label>
                    <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Admission Email</label>
                    <Input value={form.admissionEmail} onChange={(e) => setForm((p) => ({ ...p, admissionEmail: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Phone</label>
                    <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Secondary Phone</label>
                    <Input value={form.secondaryPhone} onChange={(e) => setForm((p) => ({ ...p, secondaryPhone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Website</label>
                    <Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Office Hours</label>
                    <Input value={form.officeHours} onChange={(e) => setForm((p) => ({ ...p, officeHours: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary mb-1.5 block">Weekly Holiday</label>
                    <Input value={form.holiday} onChange={(e) => setForm((p) => ({ ...p, holiday: e.target.value }))} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                    <div>
                      <label className="text-sm font-medium text-primary">Enable Blog</label>
                      <p className="text-xs text-muted">Show blog section on landing page</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.enableBlog !== false}
                      onClick={() => setForm((p) => ({ ...p, enableBlog: p.enableBlog === false ? true : false }))}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        form.enableBlog !== false ? "bg-primary" : "bg-primary/20"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        form.enableBlog !== false ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-secondary" />
                    Social Media Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 flex items-center gap-1.5">
                        <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
                      </label>
                      <Input value={form.socialLinks.facebook} onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, facebook: e.target.value } }))} placeholder="https://facebook.com/..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
                      </label>
                      <Input value={form.socialLinks.instagram} onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, instagram: e.target.value } }))} placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 flex items-center gap-1.5">
                        <TikTokIcon className="w-3.5 h-3.5" /> TikTok
                      </label>
                      <Input value={form.socialLinks.tiktok} onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, tiktok: e.target.value } }))} placeholder="https://tiktok.com/@..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary mb-1.5 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube
                      </label>
                      <Input value={form.socialLinks.youtube} onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, youtube: e.target.value } }))} placeholder="https://youtube.com/@..." />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleSave} disabled={savingSettings}>
              {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingSettings ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
