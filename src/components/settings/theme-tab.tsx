"use client";

import { Palette, Eye, Layout, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ThemeForm {
  primaryColor: string;
  fontFamily: string;
}

interface ThemeTabProps {
  themeForm: ThemeForm;
  setThemeForm: (updater: (prev: ThemeForm) => ThemeForm) => void;
  savingSettings: boolean;
  handleSave: () => Promise<void>;
}

const FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito", "Raleway", "Playfair Display", "Merriweather"];

export function ThemeTab({ themeForm, setThemeForm, savingSettings, handleSave }: ThemeTabProps) {
  return (
    <div>
      <div className="grid lg:grid-cols-5 gap-6">
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
                  {FONTS.map((f) => (
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

        <div className="lg:col-span-3">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layout className="w-4 h-4 text-secondary" /> Page Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl border border-primary/10 overflow-hidden" style={{ fontFamily: themeForm.fontFamily }}>
                <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${themeForm.primaryColor}, ${themeForm.primaryColor}dd` }}>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">Admission Open</span>
                  <h2 className="text-xl font-bold mt-3" style={{ fontFamily: themeForm.fontFamily }}>Preparing Future Leaders</h2>
                  <p className="text-sm mt-1 text-white/80">Through discipline & excellence</p>
                  <div className="flex gap-2 mt-4">
                    <span className="px-4 py-2 rounded-md text-sm font-medium bg-white" style={{ color: themeForm.primaryColor }}>Get Started</span>
                    <span className="px-4 py-2 rounded-md text-sm font-medium border border-white/30 text-white">Learn More</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-5 bg-accent">
                  {["2500+", "94%", "35+"].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-lg font-bold" style={{ color: themeForm.primaryColor }}>{stat}</p>
                      <p className="text-xs text-muted">Stat {i + 1}</p>
                    </div>
                  ))}
                </div>
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
    </div>
  );
}
