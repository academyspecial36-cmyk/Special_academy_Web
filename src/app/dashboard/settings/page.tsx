"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Save, Building2, Mail, Phone, Globe, Upload, Facebook, Youtube, Instagram, Music2 } from "lucide-react";
import { TikTokIcon } from "@/components/shared/tiktok-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/app-context";

export default function SettingsPage() {
  const { settings, updateSettings } = useAppContext();
  const [form, setForm] = useState({ ...settings });
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    updateSettings(form);
  }

  function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setIconPreview(url);
    setForm((prev) => ({ ...prev, appIcon: url }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-muted">Manage academy settings and configurations.</p>
      </div>

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

              {/* App Icon */}
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
            </CardContent>
          </Card>
        </motion.div>
        {/* Social Links */}
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
        <Button size="lg" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
