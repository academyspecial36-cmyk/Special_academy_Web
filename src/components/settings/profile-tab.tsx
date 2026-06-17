"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { User, Lock, Eye, EyeOff, Camera, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase";
import { apiUpload } from "@/lib/api-client";

interface ProfileTabProps {
  user: { id?: string; name?: string; email?: string; role?: string; avatar_url?: string | null } | null;
}

export function ProfileTab({ user }: ProfileTabProps) {
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

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? "A";

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

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="h-fit">
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

      <Card className="h-fit">
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
    </div>
  );
}
