"use client";

import { Star, BookOpen, School, Sun, FileText, Quote, Save, Loader2, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ContentForm {
  whyChoose: { icon: string; title: string; description: string }[];
  cadetOverview: { title: string; description: string; heading: string; steps: string[]; images: string[] };
  facilities: { icon: string; title: string; description: string }[];
  activities: { icon: string; title: string; time: string; description: string }[];
  enrollmentCta: { badge: string; heading: string; description: string; offerTitle: string; offerText: string; discount: string; buttonText: string; buttonLink: string };
  heroCards: { icon: string; value: string; label: string }[];
  trustIndicators: { studentsCount: string; rating: string };
  sectionLabels: Record<string, { label: string; title: string; description: string }>;
  buttonLabels: Record<string, string>;
  loaderQuotes: string[];
}

interface ContentTabProps {
  contentForm: ContentForm;
  setContentForm: (updater: (prev: ContentForm) => ContentForm) => void;
  savingSettings: boolean;
  handleSave: () => Promise<void>;
}

const NAV_ITEMS = [
  "why-choose", "cadet-overview", "facilities", "activities",
  "enrollment-cta", "hero-cards", "trust-indicators",
  "section-labels", "button-labels", "loader-quotes",
];

export function ContentTab({ contentForm, setContentForm, savingSettings, handleSave }: ContentTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        {NAV_ITEMS.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/5 text-muted hover:bg-primary hover:text-white transition-all"
          >
            {id.replace(/-/g, " ")}
          </a>
        ))}
      </div>

      <Card id="why-choose" className="scroll-mt-24">
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
            <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setContentForm((p) => ({ ...p, whyChoose: [...p.whyChoose, { icon: "Users", title: "", description: "" }] }))}><Plus className="w-4 h-4 mr-2" /> Add Reason</Button>
          </div>
        </CardContent>
      </Card>

      <Card id="cadet-overview" className="scroll-mt-24">
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
              <Button variant="outline" size="sm" onClick={() => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, steps: [...p.cadetOverview.steps, ""] } }))}><Plus className="w-3 h-3 mr-1" /> Add Step</Button>
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
              <Button variant="outline" size="sm" onClick={() => setContentForm((p) => ({ ...p, cadetOverview: { ...p.cadetOverview, images: [...p.cadetOverview.images, ""] } }))}><Plus className="w-3 h-3 mr-1" /> Add Image</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="facilities" className="scroll-mt-24">
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
            <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setContentForm((p) => ({ ...p, facilities: [...p.facilities, { icon: "School", title: "", description: "" }] }))}><Plus className="w-4 h-4 mr-2" /> Add Facility</Button>
          </div>
        </CardContent>
      </Card>

      <Card id="activities" className="scroll-mt-24">
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
            <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setContentForm((p) => ({ ...p, activities: [...p.activities, { icon: "Sunrise", title: "", time: "", description: "" }] }))}><Plus className="w-4 h-4 mr-2" /> Add Activity</Button>
          </div>
        </CardContent>
      </Card>

      <Card id="enrollment-cta" className="scroll-mt-24">
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

      <Card id="hero-cards" className="scroll-mt-24">
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
            <Button variant="outline" size="sm" className="h-20 border-dashed" onClick={() => setContentForm((p) => ({ ...p, heroCards: [...p.heroCards, { icon: "Trophy", value: "", label: "" }] }))}><Plus className="w-4 h-4 mr-2" /> Add Card</Button>
          </div>
        </CardContent>
      </Card>

      <Card id="trust-indicators" className="scroll-mt-24">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Quote className="w-4 h-4 text-secondary" /> Trust Indicators</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-primary mb-1.5 block">Students Count Text</label><Input value={contentForm.trustIndicators.studentsCount} onChange={(e) => setContentForm((p) => ({ ...p, trustIndicators: { ...p.trustIndicators, studentsCount: e.target.value } }))} placeholder="2,500+" /></div>
          <div><label className="text-sm font-medium text-primary mb-1.5 block">Rating Text</label><Input value={contentForm.trustIndicators.rating} onChange={(e) => setContentForm((p) => ({ ...p, trustIndicators: { ...p.trustIndicators, rating: e.target.value } }))} placeholder="4.9" /></div>
        </CardContent>
      </Card>

      <Card id="section-labels" className="scroll-mt-24">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-secondary" /> Section Labels & Headers</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(contentForm.sectionLabels).map(([key, val]) => (
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

      <Card id="button-labels" className="scroll-mt-24">
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

      <Card id="loader-quotes" className="scroll-mt-24">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Quote className="w-4 h-4 text-secondary" /> Loading Screen Quotes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {contentForm.loaderQuotes.map((quote, i) => (
              <div key={i} className="flex gap-2">
                <Textarea rows={1} value={quote} onChange={(e) => setContentForm((p) => ({ ...p, loaderQuotes: p.loaderQuotes.map((q, idx) => idx === i ? e.target.value : q) }))} placeholder={`Quote ${i + 1}`} className="min-h-[40px]" />
                <Button variant="ghost" size="sm" className="text-red-500 h-9 text-xs shrink-0" onClick={() => setContentForm((p) => ({ ...p, loaderQuotes: p.loaderQuotes.filter((_, idx) => idx !== i) }))}>X</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setContentForm((p) => ({ ...p, loaderQuotes: [...p.loaderQuotes, ""] }))}><Plus className="w-3 h-3 mr-1" /> Add Quote</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={savingSettings}>
          {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {savingSettings ? "Saving..." : "Save Content"}
        </Button>
      </div>
    </div>
  );
}
