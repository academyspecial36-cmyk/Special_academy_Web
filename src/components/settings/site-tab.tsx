"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Building2, Mail, Globe, Upload, Facebook, Youtube, Instagram, Save, Loader2 } from "lucide-react";
import { TikTokIcon } from "@/components/shared/tiktok-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { AppSettings } from "@/lib/app-context";

interface SiteTabProps {
  form: AppSettings;
  setForm: (updater: (prev: AppSettings) => AppSettings) => void;
  savingSettings: boolean;
  handleSave: () => Promise<void>;
}

export function SiteTab({ form, setForm, savingSettings, handleSave }: SiteTabProps) {
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  return (
    <div>
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
                    <Image src={iconPreview || form.appIcon} alt="App Icon" width={56} height={56} className="w-full h-full object-contain" />
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
    </div>
  );
}
