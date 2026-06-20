"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Plus, X } from "lucide-react";
import { ImageInput } from "@/components/shared/image-input";
import { AssetPicker } from "@/components/shared/asset-picker";

interface LandingForm {
  hero: { title: string; subtitle: string; badge: string; image: string };
  about: { title: string; description: string; image: string; values: { title: string; description: string }[] };
  stats: { label: string; value: string; suffix?: string; description?: string }[];
  cta: { title: string; subtitle: string; buttonText: string; buttonLink: string };
  footer: { copyright: string; description: string };
}

interface LandingTabProps {
  landingForm: LandingForm;
  setLandingForm: (updater: (prev: LandingForm) => LandingForm) => void;
  savingSettings: boolean;
  handleSave: () => Promise<void>;
}

export function LandingTab({ landingForm, setLandingForm, savingSettings, handleSave }: LandingTabProps) {
  const [assetPickerField, setAssetPickerField] = useState<string | null>(null);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  function openAssetPicker(field: string) {
    setAssetPickerField(field);
    setAssetPickerOpen(true);
  }

  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium text-primary mb-1.5 block">Badge Text</label><Input value={landingForm.hero?.badge} onChange={(e) => setLandingForm((p) => ({ ...p, hero: { ...p.hero, badge: e.target.value } }))} /></div>
            <div><label className="text-sm font-medium text-primary mb-1.5 block">Title</label><Textarea rows={2} value={landingForm.hero?.title} onChange={(e) => setLandingForm((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} /></div>
            <div><label className="text-sm font-medium text-primary mb-1.5 block">Subtitle</label><Textarea rows={3} value={landingForm.hero?.subtitle} onChange={(e) => setLandingForm((p) => ({ ...p, hero: { ...p.hero, subtitle: e.target.value } }))} /></div>
            <div>
              <label className="text-sm font-medium text-primary mb-1.5 block">Hero Image</label>
              <ImageInput
                value={landingForm.hero?.image}
                onChange={(url) => setLandingForm((p) => ({ ...p, hero: { ...p.hero, image: url } }))}
                onBrowseMedia={() => openAssetPicker("hero.image")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">About Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium text-primary mb-1.5 block">Title</label><Input value={landingForm.about.title} onChange={(e) => setLandingForm((p) => ({ ...p, about: { ...p.about, title: e.target.value } }))} /></div>
            <div><label className="text-sm font-medium text-primary mb-1.5 block">Description</label><Textarea rows={3} value={landingForm.about.description} onChange={(e) => setLandingForm((p) => ({ ...p, about: { ...p.about, description: e.target.value } }))} /></div>
            <div>
              <label className="text-sm font-medium text-primary mb-1.5 block">About Image</label>
              <ImageInput
                value={landingForm.about.image}
                onChange={(url) => setLandingForm((p) => ({ ...p, about: { ...p.about, image: url } }))}
                onBrowseMedia={() => openAssetPicker("about.image")}
              />
            </div>
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
              <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setLandingForm((p) => ({ ...p, about: { ...p.about, values: [...p.about.values, { title: "", description: "" }] } }))}><Plus className="w-4 h-4 mr-2" /> Add Value</Button>
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
              <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setLandingForm((p) => ({ ...p, stats: [...p.stats, { label: "", value: "", suffix: "", description: "" }] }))}><Plus className="w-4 h-4 mr-2" /> Add Stat</Button>
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
      <AssetPicker
        open={assetPickerOpen}
        onClose={() => { setAssetPickerOpen(false); setAssetPickerField(null); }}
        onSelect={(file) => {
          if (assetPickerField) {
            const [section, field] = assetPickerField.split(".");
            if (section === "hero" && field === "image") {
              setLandingForm((p) => ({ ...p, hero: { ...p.hero, image: file.url } }));
            } else if (section === "about" && field === "image") {
              setLandingForm((p) => ({ ...p, about: { ...p.about, image: file.url } }));
            }
          }
          setAssetPickerOpen(false);
          setAssetPickerField(null);
        }}
        filterMime="image/"
      />
      <div className="flex justify-end mt-6">
        <Button size="lg" onClick={handleSave} disabled={savingSettings}>
          {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {savingSettings ? "Saving..." : "Save Landing Content"}
        </Button>
      </div>
    </div>
  );
}
