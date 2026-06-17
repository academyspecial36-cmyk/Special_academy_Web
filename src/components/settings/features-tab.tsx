"use client";

import { Search, Palette, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

interface FeaturesTabProps {
  seoForm: { metaDescription: string; gaTrackingId: string };
  setSeoForm: (updater: (prev: { metaDescription: string; gaTrackingId: string }) => { metaDescription: string; gaTrackingId: string }) => void;
  pinnedPopupEnabled: boolean;
  setPinnedPopupEnabled: (v: boolean) => void;
  form: Record<string, unknown>;
  setForm: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
  savingSettings: boolean;
  handleSave: () => Promise<void>;
}

export function FeaturesTab({ seoForm, setSeoForm, pinnedPopupEnabled, setPinnedPopupEnabled, form, setForm, savingSettings, handleSave }: FeaturesTabProps) {
  return (
    <div>
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
                  <ToggleSwitch checked={pinnedPopupEnabled} onChange={setPinnedPopupEnabled} />
                ) : (
                  <ToggleSwitch
                    checked={(form)[key] as boolean}
                    onChange={() => setForm((p) => ({ ...p, [key]: !(p)[key] }))}
                  />
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
    </div>
  );
}
